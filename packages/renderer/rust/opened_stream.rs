use std::{
    io::ErrorKind,
    sync::{Arc, Mutex},
};

use ffmpeg_next::Rational;
use remotionffmpeg::{codec::Id, format::Pixel, frame::Video, media::Type, Dictionary, StreamMut};
extern crate ffmpeg_next as remotionffmpeg;

use crate::{
    errors::PossibleErrors,
    frame_cache::{get_frame_cache_id, FrameCache, FrameCacheItem},
    global_printer::_print_debug,
    opened_video::OpenedVideo,
    scalable_frame::{NotRgbFrame, ScalableFrame},
};

pub struct LastSeek {
    resolved_pts: i64,
    resolved_dts: i64,
}

pub struct OpenedStream {
    pub stream_index: usize,
    pub time_base: Rational,
    pub original_width: u32,
    pub original_height: u32,
    pub scaled_width: u32,
    pub scaled_height: u32,
    pub format: Pixel,
    pub video: remotionffmpeg::codec::decoder::Video,
    pub src: String,
    pub input: remotionffmpeg::format::context::Input,
    pub last_position: LastSeek,
    pub frame_cache: FrameCache,
    pub duration_or_zero: i64,
    pub fps: Rational,
    pub reached_eof: bool,
}

impl OpenedStream {
    pub fn receive_frame(&mut self) -> Result<Option<Video>, PossibleErrors> {
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

    pub fn calc_position(&self, time: f64) -> i64 {
        (time * self.time_base.1 as f64 / self.time_base.0 as f64) as i64
    }

    pub fn handle_eof(
        &mut self,
        position: i64,
        transparent: bool,
    ) -> Result<Option<usize>, PossibleErrors> {
        self.video.send_eof()?;

        let mut latest_frame: Option<usize> = None;

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
                        format: self.format,
                        original_width: self.original_width,
                        original_height: self.original_height,
                        scaled_height: self.scaled_height,
                        scaled_width: self.scaled_width,
                    };

                    let item = FrameCacheItem {
                        resolved_pts: self.last_position.resolved_pts,
                        resolved_dts: self.last_position.resolved_dts,
                        frame: ScalableFrame::new(frame, transparent),
                        id: frame_cache_id,
                        asked_time: position,
                    };

                    self.frame_cache.add_item(item);
                    latest_frame = Some(frame_cache_id);
                },
                Ok(None) => {
                    break;
                }
                Err(err) => {
                    return Err(err);
                }
            }
        }
        Ok(latest_frame)
    }

    pub fn get_frame(&mut self, time: f64, transparent: bool) -> Result<Vec<u8>, PossibleErrors> {
        let position = self.calc_position(time);
        let one_frame_after = self.calc_position(
            time + (1.0 / (self.fps.numerator() as f64 / self.fps.denominator() as f64)),
        );
        let threshold = one_frame_after - position;
        let cache_item = self.frame_cache.get_item(position, threshold);
        match cache_item {
            Ok(Some(item)) => {
                return Ok(item);
            }
            Ok(None) => {}
            Err(err) => {
                return Err(err);
            }
        }

        let mut freshly_seeked = false;
        let mut last_position = self.duration_or_zero.min(position);

        if position < self.last_position.resolved_pts
            || self.last_position.resolved_pts < self.calc_position(time - 1.0)
        {
            _print_debug(&format!(
                "Seeking to {} from resolved_pts = {}, and dts = {}, duration = {}",
                position,
                self.last_position.resolved_pts,
                self.last_position.resolved_dts,
                self.duration_or_zero
            ))?;
            self.input
                .seek(self.stream_index as i32, 0, position, last_position, 0)?;
            freshly_seeked = true
        }

        let mut last_frame: Option<usize> = None;

        loop {
            // -1 because uf 67 and we want to process 66.66 -> rounding error
            if (self.last_position.resolved_pts - 1) > position && last_frame.is_some() {
                break;
            }

            let (stream, packet) = match self.input.get_next_packet() {
                Err(remotionffmpeg::Error::Eof) => {
                    let data = self.handle_eof(position, transparent)?;
                    if data.is_some() {
                        last_frame = data;
                        self.frame_cache.set_last_frame(data.unwrap())
                    }
                    break;
                }
                Ok(packet) => packet,
                Err(err) => Err(std::io::Error::new(ErrorKind::Other, err.to_string()))?,
            };

            if stream.parameters().medium() != Type::Video {
                continue;
            }
            if freshly_seeked {
                if packet.is_key() {
                    freshly_seeked = false
                } else {
                    last_position = packet.pts().unwrap() - 1;

                    _print_debug("seeking again");
                    self.input.seek(
                        self.stream_index as i32,
                        0,
                        packet.pts().unwrap(),
                        last_position,
                        0,
                    )?;
                    continue;
                }
            }

            loop {
                _print_debug("asking for frame");
                self.video.send_packet(&packet)?;
                let result = self.receive_frame();

                self.last_position = LastSeek {
                    resolved_pts: packet.pts().unwrap(),
                    resolved_dts: packet.dts().unwrap(),
                };

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
                            format: self.format,
                            original_height: self.original_height,
                            original_width: self.original_width,
                            scaled_height: self.scaled_height,
                            scaled_width: self.scaled_width,
                        };

                        let item = FrameCacheItem {
                            resolved_pts: self.last_position.resolved_pts,
                            resolved_dts: self.last_position.resolved_dts,
                            frame: ScalableFrame::new(frame, transparent),
                            id: frame_cache_id,
                            asked_time: position,
                        };

                        self.frame_cache.add_item(item);

                        last_frame = Some(frame_cache_id);

                        break;
                    },
                    Ok(None) => {
                        break;
                    }
                    Err(err) => {
                        return Err(err);
                    }
                }
            }
        }
        if last_frame.is_none() {
            return Err(std::io::Error::new(ErrorKind::Other, "No frame found"))?;
        }

        let from_cache = self.frame_cache.get_item_from_id(last_frame.unwrap());
        match from_cache {
            Ok(Some(data)) => Ok(data),
            Ok(None) => Err(std::io::Error::new(
                ErrorKind::Other,
                "Frame evicted from cache",
            ))?,
            Err(err) => Err(err),
        }
    }
}

fn calculate_display_video_size(dar_x: i32, dar_y: i32, x: u32, y: u32) -> (u32, u32) {
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

pub fn open_video(src: &str, transparent: bool) -> Result<OpenedVideo, PossibleErrors> {
    let mut dictionary = Dictionary::new();
    dictionary.set("fflags", "+genpts");
    let mut input = remotionffmpeg::format::input_with_dictionary(&src, dictionary)?;

    // TODO: Don't open stream and stream_mut, might need to adapt rust-ffmpeg for it
    let stream = input
        .streams()
        .find(|s| s.parameters().medium() == Type::Video)
        .unwrap();
    let stream_index = stream.index();

    drop(stream);

    let mut_stream = input.stream_mut(stream_index).unwrap();
    let duration_or_zero = mut_stream.duration().max(0);

    let time_base = mut_stream.time_base();
    let parameters = mut_stream.parameters();

    let mut parameters_cloned = parameters.clone();
    let is_vp8_or_vp9_and_transparent = match transparent {
        true => unsafe {
            let codec_id = (*(*(mut_stream).as_ptr()).codecpar).codec_id;
            let is_vp8 = codec_id == remotionffmpeg::codec::id::get_av_codec_id(Id::VP8);
            let is_vp9 = codec_id == remotionffmpeg::codec::id::get_av_codec_id(Id::VP9);

            if is_vp8 || is_vp9 {
                (*parameters_cloned.as_mut_ptr()).format =
                    remotionffmpeg::util::format::pixel::to_av_pixel_format(Pixel::YUVA420P) as i32;
            }

            if is_vp8 {
                Some("vp8")
            } else if is_vp9 {
                Some("vp9")
            } else {
                None
            }
        },
        false => None,
    };

    let video = remotionffmpeg::codec::context::Context::from_parameters(parameters_cloned)?;

    let decoder = match is_vp8_or_vp9_and_transparent {
        Some("vp8") => video.decoder().video_with_codec("libvpx")?,
        Some("vp9") => video.decoder().video_with_codec("libvpx-vp9")?,
        Some(_) => unreachable!(),
        None => video.decoder().video()?,
    };

    let format = decoder.format();

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

    let opened_stream = OpenedStream {
        stream_index,
        time_base,
        original_height,
        original_width,
        scaled_height,
        scaled_width,
        format,
        video: decoder,
        src: src.to_string(),
        input,
        last_position: LastSeek {
            resolved_pts: 0,
            resolved_dts: 0,
        },
        frame_cache: FrameCache::new(),
        duration_or_zero,
        fps,
        reached_eof: false,
    };

    let opened_video = OpenedVideo {
        opened_streams: vec![(Arc::new(Mutex::new(opened_stream)))],
    };

    Ok(opened_video)
}
