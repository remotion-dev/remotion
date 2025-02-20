use std::{io::ErrorKind, time::SystemTime};

use ffmpeg_next:: Rational;
use remotionffmpeg::{codec::Id, frame::Video, media::Type, Dictionary, StreamMut};
extern crate ffmpeg_next as remotionffmpeg;
use std::time::UNIX_EPOCH;

use crate::{
    errors::ErrorWithBacktrace, frame_cache::{get_frame_cache_id, FrameCacheItem}, frame_cache_manager::FrameCacheManager, global_printer::_print_verbose,  rotation, scalable_frame::{NotRgbFrame, Rotate, ScalableFrame}, tone_map::FilterGraph
};

pub struct OpenedStream {
    pub stream_index: usize,
    pub original_width: u32,
    pub original_height: u32,
    pub scaled_width: u32,
    pub scaled_height: u32,
    pub video: remotionffmpeg::codec::decoder::Video,
    pub src: String,
    pub original_src: String,
    pub input: remotionffmpeg::format::context::Input,
    pub last_position: Option<i64>,
    pub duration_or_zero: i64,
    pub duration_in_seconds: Option<f64>,
    pub reached_eof: bool,
    pub transparent: bool,
    pub rotation: Rotate,
    pub filter_graph: FilterGraph,
    pub time_base: Rational,
    pub fps: Rational
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
        frame_cache_manager: &mut FrameCacheManager,
        thread_index: usize
    ) -> Result<Option<LastFrameInfo>, ErrorWithBacktrace> {
        self.video.send_eof()?;

        let mut latest_frame: Option<LastFrameInfo> = None;
        let mut looped_pts = previous_pts;
        let mut offset = 0;

        loop {
            let result = self.receive_frame();

            match result {
                Ok(Some(video)) => {
                    let frame_cache_id = get_frame_cache_id();

                    let mut size: u64 = 0;

                    let amount_of_planes = video.planes();
                    for i in 0..amount_of_planes {
                        size += video.data(i).len() as u64;
                    }

                    let frame = NotRgbFrame {
                        original_width: self.original_width,
                        original_height: self.original_height,
                        scaled_height: self.scaled_height,
                        scaled_width: self.scaled_width,
                        rotate: self.rotation,
                        original_src: self.original_src.clone(),
                        size,
                        unscaled_frame: video.clone(),
                        tone_mapped,
                        filter_graph: self.filter_graph,
                        colorspace: video.color_space(),
                        src_range: video.color_range(),
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
                    frame_cache_manager
                        .add_to_cache(
                            &self.src,
                            &self.original_src,
                            self.transparent,
                            tone_mapped,
                            item,
                            thread_index
                        );
                    latest_frame = Some(LastFrameInfo {
                        index: frame_cache_id,
                        pts: video.pts().expect("pts"),
                    });

                }
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
        stream_index: usize,
        time: f64,
        target_position: i64,
        time_base: Rational,
        one_frame_in_time_base: i64,
        threshold: i64,
        tone_mapped: bool,
        frame_cache_manager: &mut FrameCacheManager,
        thread_index: usize,
        max_cache_size_in_bytes: u64
    ) -> Result<usize, ErrorWithBacktrace> {
        let mut freshly_seeked = false;
        let position_to_seek_to = match self.duration_or_zero {
            0 => target_position,
            _ => self.duration_or_zero.min(target_position),
        };


        let should_seek =
        // Beyond the position in the video
         target_position < self.last_position.unwrap_or(0)
            || 
            // Less than 3 seconds before the position we want to be
            self.last_position.unwrap_or(0) < calc_position(time - 1.0, time_base)
            
            ;

        if should_seek {
            _print_verbose(&format!(
                "Seeking to {} from dts = {:?}, duration = {}, target position = {}",
                position_to_seek_to, self.last_position, self.duration_or_zero, target_position
            ))?;
            self.video.flush();
            match self.input.seek(
                self.stream_index as i32,
                0,
                target_position,
                position_to_seek_to,
                0,
            ) {
                Ok(_) => Ok(()),
                Err(err) => {
                    if err.to_string().contains("Operation not permitted") {
                        _print_verbose(&format!(
                            "Seeking into a part of the file that contains executable code."
                        ))?;
                        _print_verbose(&format!("FFmpeg is unwilling to execute it."))?;

                        Ok(())
                    } else {
                        Err(err)
                    }
                }
            }?;

            freshly_seeked = true;
            self.last_position = None
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
                        target_position,
                        one_frame_in_time_base,
                        match freshly_seeked || self.last_position.is_none() {
                            true => None,
                            false => Some(self.last_position.unwrap_or(0)),
                        },
                        tone_mapped,
                        frame_cache_manager,
                        thread_index
                    )?;
                    if data.is_some() {
                        last_frame_received = data;
                     frame_cache_manager
                            .set_last_frame(
                                &self.src,
                                &self.original_src,
                                self.transparent,
                                tone_mapped,
                                last_frame_received.unwrap().index
                            );
                    } else {
                        frame_cache_manager
                            .set_biggest_frame_as_last_frame(
                                &self.src,
                                &self.original_src,
                                self.transparent,
                                tone_mapped,
                            );
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
                "Thread {}, stream {} - got packet, dts = {:?} pts = {:?} key = {}",
                thread_index,
                stream_index,
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
                            let new_position_to_seek_to = pts - 1;
                            stop_after_n_diverging_pts = None;

                            self.input.seek(
                                self.stream_index as i32,
                                0,
                                pts,
                                new_position_to_seek_to,
                                0,
                            )?;
                        }
                        None => {}
                    }
                    continue;
                }
            }

            // Don't throw an error here, sometimes it will still work!
            // For example, loop melting-0.5x.webm from <AnimatedEmoji /> component
            // and we will get the error "Invalid data found when processing input"
            // but it'll still work!
            let res = self.video.send_packet(&packet);
            if res.is_err() {
                if res.err().unwrap().to_string().contains("Resource temporarily unavailable") {
                    _print_verbose(&format!("Need to send another packet"))?;

                }
                _print_verbose(&format!("Error sending packet: {}", res.err().unwrap()))?;
            }

            loop {
                let result = self.receive_frame();

                match result {
                    Ok(Some(unfiltered)) => {
                        _print_verbose(&format!("Thread {}, stream {} - received frame, tone_mapped = {}", thread_index, stream_index, tone_mapped))?;

                        let frame_cache_id = get_frame_cache_id();

                        let mut size: u64 = 0;

                        let amount_of_planes = unfiltered.planes();
                        for i in 0..amount_of_planes {
                            size += unfiltered.data(i).len() as u64;
                        }

                        let frame = NotRgbFrame {
                            original_height: self.original_height,
                            original_width: self.original_width,
                            scaled_height: self.scaled_height,
                            scaled_width: self.scaled_width,
                            rotate: self.rotation,
                            original_src: self.original_src.clone(),
                            size,
                            unscaled_frame: unfiltered.clone(),
                            tone_mapped,
                            filter_graph: self.filter_graph,
                            colorspace: unfiltered.color_space(),
                            src_range: unfiltered.color_range(),
                        };

                        let previous_pts = match freshly_seeked || self.last_position.is_none() {
                            true => None,
                            false => Some(self.last_position.unwrap_or(0)),
                        };
                        let item = FrameCacheItem {
                            resolved_pts: unfiltered.pts().expect("expected pts"),
                            frame: ScalableFrame::new(frame, self.transparent),
                            id: frame_cache_id,
                            asked_time: target_position,
                            last_used: get_time(),
                            previous_pts,
                        };

                        self.last_position = Some(unfiltered.pts().expect("expected pts"));
                        freshly_seeked = false;
                        frame_cache_manager
                            .add_to_cache(
                                &self.src,
                                &self.original_src,
                                self.transparent,
                                tone_mapped,
                                item,
                                thread_index
                            );


                        items_in_loop += 1;
                        
                        if items_in_loop % 5 == 0 {
                            frame_cache_manager.prune_on_thread(max_cache_size_in_bytes)?;                            
                        }

                        match stop_after_n_diverging_pts {
                            Some(stop) => match last_frame_received {
                                Some(last_frame) => {
                                    let prev_difference = (last_frame.pts - target_position).abs();
                                    let new_difference =
                                        (unfiltered.pts().expect("pts") - target_position).abs();

                                    if new_difference >= prev_difference {
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
                            pts: unfiltered.pts().expect("pts"),
                        });
                    }
                    Ok(None) => {
                        break;
                    }
                    Err(err) => {
                        return Err(err);
                    }
                }
            }
        }

        let final_frame = frame_cache_manager
            .get_cache_item_id(&self.src, &self.original_src, self.transparent, tone_mapped, target_position, threshold)?;

        if final_frame.is_none() {
            return Err(std::io::Error::new(
                ErrorKind::Other,
                format!(
                    "No frame found at position {} for source {} (original source = {}). If you think this should work, file an issue at https://remotion.dev/report or post it in https://remotion.dev/discord. Post the problematic video and the output of `npx remotion versions`.",
                    target_position, self.src, self.original_src
                ),
            ))?;
        }

        return Ok(final_frame.unwrap());
    }
}

pub fn calculate_display_video_size(
    dar_x: i32,
    dar_y: i32,
    sar_x: i32,
    sar_y: i32,
    x: u32,
    y: u32,
) -> (u32, u32) {
    if dar_x == 0 || dar_y == 0 {
        return (x, y);
    }

    let new_width = ((x as f64 * sar_x as f64 / sar_y as f64).round()).max(x as f64);
    let new_height = (new_width / (dar_x as f64 / dar_y as f64)).ceil();

    (new_width as u32, new_height as u32)
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
) -> Result<OpenedStream, ErrorWithBacktrace> {
    let mut dictionary = Dictionary::new();
    dictionary.set("fflags", "+genpts");
    let mut input = remotionffmpeg::format::input_with_dictionary(&src, dictionary)?;

    let mut_stream = match input
        .streams_mut()
        .find(|s| s.parameters().medium() == Type::Video)
    {
        Some(stream) => stream,
        None => {
            return Err(ErrorWithBacktrace::from(format!(
                "No video stream found in input file {}. Is this a video file?",
                original_src
            )));
        }
    };

    let stream_index = mut_stream.index();

    let duration_or_zero = mut_stream.duration().max(0);
    
    let time_base = mut_stream.time_base();
    let duration_in_seconds = match duration_or_zero {
        0 => None,
        _ => Some(duration_or_zero as f64 * time_base.1 as f64 / time_base.0 as f64)
    };
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

    let sar_x;
    let sar_y;
    unsafe {
        sar_x = (*mut_stream.as_ptr()).sample_aspect_ratio.num;
        sar_y = (*mut_stream.as_ptr()).sample_aspect_ratio.den;
    }

    let fps = mut_stream.avg_frame_rate();

    let display_aspect_ratio = get_display_aspect_ratio(&mut_stream);

    _print_verbose(&format!("Display aspect ratio: {:?}", display_aspect_ratio))?;
    _print_verbose(&format!("Sample aspect ratio: {} {}", sar_x, sar_y))?;
    _print_verbose(&format!("Original width: {}, original height: {}", original_width, original_height))?;

    let (scaled_width, scaled_height) = calculate_display_video_size(
        display_aspect_ratio.0,
        display_aspect_ratio.1,
        sar_x,
        sar_y,
        original_width,
        original_height,
    );
    _print_verbose(&format!("new width: {}, new height: {}", scaled_width, scaled_height))?;


    let filter_graph = FilterGraph {
        original_width,
        original_height,
        format: decoder.format(),
        time_base,
        video_primaries: decoder.color_primaries(),
        transfer_characteristic: decoder.color_transfer_characteristic(),
        color_space: decoder.color_space(),
        color_range: decoder.color_range(),
        aspect_ratio: decoder.aspect_ratio(),
    };

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
        duration_in_seconds,
        reached_eof: false,
        transparent,
        rotation: rotate,
        original_src: original_src.to_string(),
        filter_graph,
        fps,
        time_base
    };

    Ok(opened_stream)
}
