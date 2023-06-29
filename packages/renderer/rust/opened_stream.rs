use std::{
    io::ErrorKind,
    sync::{Arc, Mutex},
    time::SystemTime,
};

use ffmpeg_next::Rational;
use remotionffmpeg::{codec::Id, format::Pixel, frame::Video, media::Type, Dictionary, StreamMut};
extern crate ffmpeg_next as remotionffmpeg;
use std::time::UNIX_EPOCH;

use crate::{
    errors::ErrorWithBacktrace,
    frame_cache::{get_frame_cache_id, FrameCache, FrameCacheItem},
    global_printer::_print_verbose,
    scalable_frame::{NotRgbFrame, ScalableFrame},
};

pub struct OpenedStream {
    pub stream_index: usize,
    pub original_width: u32,
    pub original_height: u32,
    pub scaled_width: u32,
    pub scaled_height: u32,
    pub format: Pixel,
    pub video: remotionffmpeg::codec::decoder::Video,
    pub src: String,
    pub input: remotionffmpeg::format::context::Input,
    pub last_position: i64,
    pub duration_or_zero: i64,
    pub reached_eof: bool,
    pub transparent: bool,
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
        frame_cache: &Arc<Mutex<FrameCache>>,
        one_frame_in_time_base: i64,
    ) -> Result<Option<usize>, ErrorWithBacktrace> {
        self.video.send_eof()?;

        let mut latest_frame: Option<usize> = None;
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
                        format: self.format,
                        original_width: self.original_width,
                        original_height: self.original_height,
                        scaled_height: self.scaled_height,
                        scaled_width: self.scaled_width,
                    };

                    offset = offset + one_frame_in_time_base;

                    let item = FrameCacheItem {
                        resolved_pts: video.pts().expect("pts"),
                        frame: ScalableFrame::new(frame, self.transparent),
                        id: frame_cache_id,
                        asked_time: position,
                        last_used: get_time(),
                    };

                    frame_cache.lock()?.add_item(item);
                    latest_frame = Some(frame_cache_id);
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
        frame_cache: &Arc<Mutex<FrameCache>>,
        position: i64,
        time_base: Rational,
        one_frame_in_time_base: i64,
    ) -> Result<usize, ErrorWithBacktrace> {
        let mut freshly_seeked = false;
        let mut last_seek_position = self.duration_or_zero.min(position);
        _print_verbose(&format!(
            "last seek {} position {}",
            last_seek_position, position
        ))?;

        if position < self.last_position
            || self.last_position < calc_position(time - 1.0, time_base)
        {
            _print_verbose(&format!(
                "Seeking to {} from dts = {}, duration = {}",
                position, self.last_position, self.duration_or_zero
            ))?;
            self.input
                .seek(self.stream_index as i32, 0, position, last_seek_position, 0)?;
            freshly_seeked = true
        }

        let mut last_frame_received: Option<usize> = None;
        let mut break_on_next_keyframe = false;
        let mut last_was_keyframe = false;

        loop {
            if break_on_next_keyframe && last_was_keyframe {
                break;
            }
            if last_frame_received.is_some() {
                let matching = frame_cache.lock().unwrap().get_item_id(position, false)?;
                if matching.is_some() {
                    // Often times there is another package coming with a lower DTS,
                    // so we receive one more packet
                    break_on_next_keyframe = true;
                }
            }

            let (stream, packet) = match self.input.get_next_packet() {
                Err(remotionffmpeg::Error::Eof) => {
                    _print_verbose("Got EOF")?;
                    let data = self.handle_eof(position, frame_cache, one_frame_in_time_base)?;
                    if data.is_some() {
                        last_frame_received = data;
                        _print_verbose("last frame received ABC")?;

                        frame_cache
                            .lock()?
                            .set_last_frame(last_frame_received.unwrap());
                    } else {
                        frame_cache.lock()?.set_biggest_frame_as_last_frame();
                    }

                    break;
                }
                Ok(packet) => packet,
                Err(err) => Err(std::io::Error::new(ErrorKind::Other, err.to_string()))?,
            };

            if stream.parameters().medium() != Type::Video {
                continue;
            }
            _print_verbose(&format!(
                "Got packet dts = {} pts ={} key = {}",
                packet.pts().unwrap(),
                packet.pts().unwrap(),
                packet.is_key()
            ))?;
            last_was_keyframe = packet.is_key();
            if freshly_seeked {
                if packet.is_key() {
                    freshly_seeked = false
                } else {
                    match packet.pts() {
                        Some(pts) => {
                            last_seek_position = pts - 1;

                            _print_verbose("seeking back")?;
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

            loop {
                self.video.send_packet(&packet)?;
                let result = self.receive_frame();

                self.last_position = packet.pts().expect("expected pts");

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
                            resolved_pts: video.pts().expect("expected pts"),
                            frame: ScalableFrame::new(frame, self.transparent),
                            id: frame_cache_id,
                            asked_time: position,
                            last_used: get_time(),
                        };

                        frame_cache.lock().unwrap().add_item(item);

                        _print_verbose(&format!(
                            "received {} {}",
                            video.pts().expect("pts"),
                            packet.pts().expect("pts")
                        ))?;
                        last_frame_received = Some(frame_cache_id);

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

        let final_frame = frame_cache.lock().unwrap().get_item_id(position, false)?;

        if final_frame.is_none() {
            return Err(std::io::Error::new(ErrorKind::Other, "No frame found"))?;
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
        original_height,
        original_width,
        scaled_height,
        scaled_width,
        format,
        video: decoder,
        src: src.to_string(),
        input,
        last_position: 0,
        duration_or_zero,
        reached_eof: false,
        transparent,
    };

    Ok((opened_stream, fps, time_base))
}
