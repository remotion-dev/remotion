use std::{io::ErrorKind, time::SystemTime};

use ffmpeg_next::Rational;
use remotionffmpeg::{
    codec::Id,
    frame::{self, Video},
    media::Type,
    Dictionary, StreamMut,
};
extern crate ffmpeg_next as remotionffmpeg;
use std::time::UNIX_EPOCH;

use crate::{
    errors::ErrorWithBacktrace,
    ffmpeg,
    frame_cache::{get_frame_cache_id, FrameCacheItem},
    frame_cache_manager::FrameCacheManager,
    global_printer::_print_verbose,
    rotation,
    scalable_frame::{NotRgbFrame, Rotate, ScalableFrame},
    tone_map::make_tone_map_filtergraph,
};

pub struct OpenedStream {
    pub stream_index: usize,
    pub original_width: u32,
    pub original_height: u32,
    pub scaled_width: u32,
    pub scaled_height: u32,
    pub video: remotionffmpeg::codec::decoder::Video,
    pub filter: remotionffmpeg::filter::Graph,
    pub should_filter: bool,
    pub src: String,
    pub original_src: String,
    pub input: remotionffmpeg::format::context::Input,
    pub last_position: Option<i64>,
    pub duration_or_zero: i64,
    pub reached_eof: bool,
    pub transparent: bool,
    pub rotation: Rotate,
}

#[derive(Clone, Copy)]
pub struct LastFrameInfo {
    index: usize,
    pts: i64,
}

pub fn calc_position(time: f64, time_base: Rational) -> i64 {
    (time * time_base.1 as f64 / time_base.0 as f64) as i64
}

pub fn get_time() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("time went backwards")
        .as_millis()
}

const MAX_DIVERGING_SEEK: u8 = 3;

impl OpenedStream {
    pub fn receive_frame(&mut self) -> Result<Option<Video>, ErrorWithBacktrace> {
        let mut frame = Video::empty();

        let res = self.video.receive_frame(&mut frame);

        match res {
            Err(err) => {
                if err.to_string().contains("Resource temporarily unavailable") {
                    Ok(None)
                } else if err.to_string().contains("End of file") {
                    self.reached_eof = true;
                    Ok(None)
                } else {
                    Err(std::io::Error::new(ErrorKind::Other, err.to_string()))?
                }
            }
            Ok(_) => Ok(Some(frame)),
        }
    }

    pub fn handle_eof(
        &mut self,
        position: i64,
        one_frame_in_time_base: i64,
        previous_pts: Option<i64>,
        tone_mapped: bool,
    ) -> Result<Option<LastFrameInfo>, ErrorWithBacktrace> {
        self.video.send_eof()?;

        let mut latest_frame: Option<LastFrameInfo> = None;
        let mut looped_pts = previous_pts;
        let mut offset = 0;

        loop {
            let result = self.receive_frame();

            match result {
                Ok(Some(video)) => unsafe {
                    let linesize = (*video.as_ptr()).linesize;

                    let frame_cache_id = get_frame_cache_id();

                    let amount_of_planes = video.planes();
                    let mut planes = Vec::with_capacity(amount_of_planes);
                    for i in 0..amount_of_planes {
                        planes.push(video.data(i).to_vec());
                    }

                    let frame = NotRgbFrame {
                        linesizes: linesize,
                        planes,
                        format: video.format(),
                        original_width: self.original_width,
                        original_height: self.original_height,
                        scaled_height: self.scaled_height,
                        scaled_width: self.scaled_width,
                        rotate: self.rotation,
                        original_src: self.original_src.clone(),
                    };

                    offset = offset + one_frame_in_time_base;

                    let item = FrameCacheItem {
                        resolved_pts: video.pts().expect("pts"),
                        frame: ScalableFrame::new(frame, self.transparent),
                        id: frame_cache_id,
                        asked_time: position,
                        last_used: get_time(),
                        previous_pts: looped_pts,
                    };

                    looped_pts = video.pts();
                    FrameCacheManager::get_instance()
                        .get_frame_cache(
                            &self.src,
                            &self.original_src,
                            self.transparent,
                            tone_mapped,
                        )
                        .lock()?
                        .add_item(item);
                    latest_frame = Some(LastFrameInfo {
                        index: frame_cache_id,
                        pts: video.pts().expect("pts"),
                    });
                },
                Ok(None) => {
                    if self.reached_eof {
                        break;
                    }
                }
                Err(err) => {
                    return Err(err);
                }
            }
        }
        Ok(latest_frame)
    }

    pub fn get_frame(
        &mut self,
        time: f64,
        position: i64,
        time_base: Rational,
        one_frame_in_time_base: i64,
        threshold: i64,
        maximum_frame_cache_size_in_bytes: Option<u128>,
        tone_mapped: bool,
    ) -> Result<usize, ErrorWithBacktrace> {
        let mut freshly_seeked = false;
        let mut last_seek_position = match self.duration_or_zero {
            0 => position,
            _ => self.duration_or_zero.min(position),
        };

        let should_seek = position < self.last_position.unwrap_or(0)
            || self.last_position.unwrap_or(0) < calc_position(time - 3.0, time_base);

        if should_seek {
            _print_verbose(&format!(
                "Seeking to {} from dts = {:?}, duration = {}",
                position, self.last_position, self.duration_or_zero
            ))?;
            self.video.flush();
            self.input
                .seek(self.stream_index as i32, 0, position, last_seek_position, 0)?;
            freshly_seeked = true
        }

        let mut last_frame_received: Option<LastFrameInfo> = None;
        let mut stop_after_n_diverging_pts: Option<u8> = None;

        let mut items_in_loop = 0;

        loop {
            if stop_after_n_diverging_pts.is_some() && stop_after_n_diverging_pts.unwrap() == 0 {
                break;
            }
            match last_frame_received {
                Some(_) => {
                    if stop_after_n_diverging_pts.is_none() {
                        stop_after_n_diverging_pts = Some(MAX_DIVERGING_SEEK);
                    }
                }
                None => {}
            }

            let (stream, packet) = match self.input.get_next_packet() {
                Err(remotionffmpeg::Error::Eof) => {
                    let data = self.handle_eof(
                        position,
                        one_frame_in_time_base,
                        match freshly_seeked || self.last_position.is_none() {
                            true => None,
                            false => Some(self.last_position.unwrap()),
                        },
                        tone_mapped,
                    )?;
                    if data.is_some() {
                        last_frame_received = data;
                        FrameCacheManager::get_instance()
                            .get_frame_cache(
                                &self.src,
                                &self.original_src,
                                self.transparent,
                                tone_mapped,
                            )
                            .lock()?
                            .set_last_frame(last_frame_received.unwrap().index);
                    } else {
                        FrameCacheManager::get_instance()
                            .get_frame_cache(
                                &self.src,
                                &self.original_src,
                                self.transparent,
                                tone_mapped,
                            )
                            .lock()?
                            .set_biggest_frame_as_last_frame();
                    }

                    break;
                }
                Ok(packet) => packet,
                Err(err) => Err(std::io::Error::new(ErrorKind::Other, err.to_string()))?,
            };

            if stream.parameters().medium() != Type::Video {
                continue;
            }
            if stream.index() != self.stream_index {
                continue;
            }

            _print_verbose(&format!(
                "Got packet dts = {:?} pts = {:?} key = {}",
                packet.dts(),
                packet.pts(),
                packet.is_key()
            ))?;
            if freshly_seeked {
                if packet.is_key() {
                    freshly_seeked = false
                } else {
                    match packet.pts() {
                        Some(pts) => {
                            last_seek_position = pts - 1;
                            stop_after_n_diverging_pts = None;

                            self.input.seek(
                                self.stream_index as i32,
                                0,
                                pts,
                                last_seek_position,
                                0,
                            )?;
                        }
                        None => {}
                    }
                    continue;
                }
            }

            self.video.send_packet(&packet)?;

            let result = self.receive_frame();

            match result {
                Ok(Some(unfiltered)) => unsafe {
                    let mut video: Video;
                    _print_verbose(&format!("received frame {}", tone_mapped))?;
                    if tone_mapped && self.should_filter {
                        video = frame::Video::empty();
                        self.filter.get("in").unwrap().source().add(&unfiltered)?;
                        self.filter.get("out").unwrap().sink().frame(&mut video)?;
                    } else {
                        video = unfiltered;
                    }

                    let linesize = (*video.as_ptr()).linesize;
                    let frame_cache_id = get_frame_cache_id();

                    let amount_of_planes = video.planes();
                    let mut planes = Vec::with_capacity(amount_of_planes);
                    for i in 0..amount_of_planes {
                        planes.push(video.data(i).to_vec());
                    }

                    let frame = NotRgbFrame {
                        linesizes: linesize,
                        planes,
                        format: video.format(),
                        original_height: self.original_height,
                        original_width: self.original_width,
                        scaled_height: self.scaled_height,
                        scaled_width: self.scaled_width,
                        rotate: self.rotation,
                        original_src: self.original_src.clone(),
                    };

                    let item = FrameCacheItem {
                        resolved_pts: video.pts().expect("expected pts"),
                        frame: ScalableFrame::new(frame, self.transparent),
                        id: frame_cache_id,
                        asked_time: position,
                        last_used: get_time(),
                        previous_pts: match freshly_seeked || self.last_position.is_none() {
                            true => None,
                            false => Some(self.last_position.unwrap()),
                        },
                    };

                    self.last_position = Some(video.pts().expect("expected pts"));
                    freshly_seeked = false;
                    FrameCacheManager::get_instance()
                        .get_frame_cache(
                            &self.src,
                            &self.original_src,
                            self.transparent,
                            tone_mapped,
                        )
                        .lock()?
                        .add_item(item);

                    items_in_loop += 1;

                    if items_in_loop % 10 == 0 {
                        match maximum_frame_cache_size_in_bytes {
                            Some(cache_size) => {
                                ffmpeg::keep_only_latest_frames(cache_size)?;
                            }
                            None => {}
                        }
                    }

                    match stop_after_n_diverging_pts {
                        Some(stop) => match last_frame_received {
                            Some(last_frame) => {
                                let prev_difference = (last_frame.pts - position).abs();
                                let new_difference = (video.pts().expect("pts") - position).abs();

                                if new_difference > prev_difference {
                                    stop_after_n_diverging_pts = Some(stop - 1);
                                } else if prev_difference > new_difference {
                                    // Fixing test video crazy1.mp4, frames 240-259
                                    stop_after_n_diverging_pts =
                                        Some((stop + 1).min(MAX_DIVERGING_SEEK));
                                }
                            }
                            None => {}
                        },
                        None => {}
                    }

                    last_frame_received = Some(LastFrameInfo {
                        index: frame_cache_id,
                        pts: video.pts().expect("pts"),
                    });
                },
                Ok(None) => {}
                Err(err) => {
                    return Err(err);
                }
            }
        }

        let final_frame = FrameCacheManager::get_instance()
            .get_frame_cache(&self.src, &self.original_src, self.transparent, tone_mapped)
            .lock()?
            .get_item_id(position, threshold)?;

        if final_frame.is_none() {
            return Err(std::io::Error::new(
                ErrorKind::Other,
                format!(
                    "No frame found at position {} for source {} (original source = {}). If you think this should work, file an issue at https://remotion.dev/issue or post it in https://remotion.dev/discord. Post the problematic video and the output of `npx remotion versions`.",
                    position, self.src, self.original_src
                ),
            ))?;
        }

        return Ok(final_frame.unwrap());
    }
}

pub fn calculate_display_video_size(dar_x: i32, dar_y: i32, x: u32, y: u32) -> (u32, u32) {
    if dar_x == 0 || dar_y == 0 {
        return (x, y);
    }

    let dimensions = (x * y) as f64;
    let new_width = (dimensions * (dar_x as f64 / dar_y as f64) as f64).sqrt();
    let new_height = dimensions / new_width;
    let height = new_height.round() as u32;
    let width = new_width.round() as u32;
    (width, height)
}

pub fn get_display_aspect_ratio(mut_stream: &StreamMut) -> Rational {
    unsafe {
        let asp = mut_stream.get_display_aspect_ratio();
        return Rational::new(asp.numerator(), asp.denominator());
    }
}

pub fn open_stream(
    src: &str,
    original_src: &str,
    transparent: bool,
) -> Result<(OpenedStream, Rational, Rational), ErrorWithBacktrace> {
    let mut dictionary = Dictionary::new();
    dictionary.set("fflags", "+genpts");
    let mut input = remotionffmpeg::format::input_with_dictionary(&src, dictionary)?;

    let mut_stream = match input
        .streams_mut()
        .find(|s| s.parameters().medium() == Type::Video)
    {
        Some(stream) => stream,
        None => {
            return Err(ErrorWithBacktrace::from(
                "No video stream found in input file",
            ));
        }
    };

    let stream_index = mut_stream.index();

    let duration_or_zero = mut_stream.duration().max(0);

    let time_base = mut_stream.time_base();
    let parameters = mut_stream.parameters();
    let side_data = mut_stream.side_data();

    let mut rotate = Rotate::Rotate0;

    for data in side_data {
        if data.kind() == remotionffmpeg::codec::packet::side_data::Type::DisplayMatrix {
            let value = data.data();
            let rotate_value = rotation::get_from_side_data(value)?;
            if rotate_value != 0.0 {
                _print_verbose(&format!("Detected rotation in {}: {}", src, rotate_value))?;
                if rotate_value == 90.0 {
                    rotate = Rotate::Rotate90;
                } else if rotate_value == 180.0 {
                    rotate = Rotate::Rotate180;
                } else if rotate_value == 270.0 || rotate_value == -90.0 {
                    rotate = Rotate::Rotate270;
                } else {
                    return Err(ErrorWithBacktrace::from(format!(
                        "Unsupported rotation value {}",
                        rotate_value
                    )));
                }
            }
        }
    }

    let is_vp8_or_vp9 = match transparent {
        true => unsafe {
            let codec_id = (*(*(mut_stream).as_ptr()).codecpar).codec_id;

            if codec_id == remotionffmpeg::codec::id::get_av_codec_id(Id::VP8) {
                Some("vp8")
            } else if codec_id == remotionffmpeg::codec::id::get_av_codec_id(Id::VP9) {
                Some("vp9")
            } else {
                None
            }
        },
        false => None,
    };

    let video = remotionffmpeg::codec::context::Context::from_parameters(parameters.clone())?;

    let decoder = match is_vp8_or_vp9 {
        Some("vp8") => video.decoder().video_with_codec("libvpx")?,
        Some("vp9") => video.decoder().video_with_codec("libvpx-vp9")?,
        Some(_) => unreachable!(),
        None => video.decoder().video()?,
    };

    let original_width = decoder.width();
    let original_height = decoder.height();
    let fps = mut_stream.avg_frame_rate();

    let aspect_ratio = get_display_aspect_ratio(&mut_stream);

    let (scaled_width, scaled_height) = calculate_display_video_size(
        aspect_ratio.0,
        aspect_ratio.1,
        original_width,
        original_height,
    );

    let (filter, should_filter) = make_tone_map_filtergraph(
        original_width,
        original_height,
        &format!("{:?}", decoder.format()).to_lowercase(),
        time_base,
        decoder.color_primaries(),
        decoder.color_transfer_characteristic(),
        decoder.color_space(),
        decoder.color_range(),
        decoder.aspect_ratio(),
    )?;

    let opened_stream = OpenedStream {
        stream_index,
        original_height,
        original_width,
        scaled_height,
        scaled_width,
        video: decoder,
        src: src.to_string(),
        input,
        last_position: None,
        duration_or_zero,
        reached_eof: false,
        transparent,
        rotation: rotate,
        original_src: original_src.to_string(),
        filter,
        should_filter,
    };

    Ok((opened_stream, fps, time_base))
}
