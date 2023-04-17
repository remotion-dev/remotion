use std::io::ErrorKind;

use ffmpeg_next::Rational;
use remotionffmpeg::{
    format::Pixel,
    frame::Video,
    media::Type,
    software::scaling::{Context, Flags},
    Dictionary,
};
extern crate ffmpeg_next as remotionffmpeg;

use crate::{
    errors::PossibleErrors,
    frame_cache::{get_frame_cache_id, FrameCache, FrameCacheItem, NotRgbFrame},
    global_printer::_print_debug,
};

pub struct LastSeek {
    resolved_pts: i64,
    resolved_dts: i64,
}

pub struct OpenedVideo {
    pub stream_index: usize,
    pub time_base: Rational,
    pub width: u32,
    pub height: u32,
    pub format: Pixel,
    pub video: remotionffmpeg::codec::decoder::Video,
    pub src: String,
    pub input: remotionffmpeg::format::context::Input,
    pub last_position: LastSeek,
    pub frame_cache: FrameCache,
    pub duration: i64,
}

impl OpenedVideo {
    pub fn receive_frame(&mut self) -> Result<Option<Video>, PossibleErrors> {
        let mut frame = Video::empty();

        let res = self.video.receive_frame(&mut frame);

        match res {
            Err(err) => {
                if err.to_string().contains("Resource temporarily unavailable") {
                    Ok(None)
                } else if err.to_string().contains("End of file") {
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

    pub fn handle_eof(&mut self, position: i64) -> Result<Option<usize>, PossibleErrors> {
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
                    };

                    let item = FrameCacheItem {
                        resolved_pts: self.last_position.resolved_pts,
                        resolved_dts: self.last_position.resolved_dts,
                        frame,
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

    pub fn get_frame(&mut self, time: f64) -> Result<Vec<u8>, PossibleErrors> {
        let position = self.calc_position(time);

        let cache_item = self.frame_cache.get_item(position);
        if cache_item.is_some() {
            return scale_and_make_bitmap(
                &cache_item.unwrap().frame,
                self.format,
                self.width,
                self.height,
            );
        }

        let mut freshly_seeked = false;
        let mut last_position = self.duration.min(position);

        if position < self.last_position.resolved_pts
            || self.last_position.resolved_pts < self.calc_position(time - 1.0)
        {
            _print_debug(&format!(
                "Seeking to {} from resolved_pts = {}, pts = {} and dts = {}, duration = {}",
                position,
                self.last_position.resolved_pts,
                self.last_position.resolved_pts,
                self.last_position.resolved_dts,
                self.duration
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
                    let data = self.handle_eof(position)?;

                    match data {
                        Some(data) => last_frame = Some(data),

                        None => {}
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
                    last_position = last_position + self.calc_position(-1.0);

                    _print_debug(&format!(
                        "Seeking to {} because we are not at a keyframe",
                        last_position
                    ))?;
                    self.input.seek(
                        self.stream_index as i32,
                        0,
                        last_position,
                        last_position,
                        0,
                    )?;
                    continue;
                }
            }

            loop {
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
                        };

                        let item = FrameCacheItem {
                            resolved_pts: self.last_position.resolved_pts,
                            resolved_dts: self.last_position.resolved_dts,
                            frame,
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
        if from_cache.is_none() {
            return Err(std::io::Error::new(
                ErrorKind::Other,
                "Frame evicted from cache",
            ))?;
        }

        Ok(scale_and_make_bitmap(
            &from_cache.unwrap().frame,
            self.format,
            self.width,
            self.height,
        )?)
    }
}

pub fn scale_and_make_bitmap(
    video: &NotRgbFrame,
    format: Pixel,
    width: u32,
    height: u32,
) -> Result<Vec<u8>, PossibleErrors> {
    let mut scaler = Context::get(
        format,
        width,
        height,
        Pixel::BGR24,
        width,
        height,
        Flags::BILINEAR,
    )?;

    let mut data: Vec<*const u8> = Vec::with_capacity(video.planes.len());

    for inner in video.planes.clone() {
        let ptr: *const u8 = inner.as_ptr();
        data.push(ptr);
    }

    let mut scaled = Video::empty();
    scaler.run(
        format,
        width,
        height,
        data.as_ptr(),
        video.linesizes.as_ptr(),
        &mut scaled,
    )?;

    Ok(create_bmp_image_from_frame(&mut scaled))
}

pub fn open_video(src: &str) -> Result<OpenedVideo, PossibleErrors> {
    let mut dictionary = Dictionary::new();
    dictionary.set("fflags", "+genpts");
    let mut input = remotionffmpeg::format::input_with_dictionary(&src, dictionary)?;
    let stream = input
        .streams()
        .find(|s| s.parameters().medium() == Type::Video)
        .unwrap();
    let stream_index = stream.index();

    let duration = stream.duration();

    let mut_stream = input.stream_mut(stream_index).unwrap();
    let time_base = mut_stream.time_base();
    let parameters = mut_stream.parameters();

    let context_decoder = remotionffmpeg::codec::context::Context::from_parameters(parameters)?;
    let video = context_decoder.decoder().video()?;

    let format = video.format();
    let width = video.width();
    let height = video.height();

    let opened_video = OpenedVideo {
        stream_index,
        time_base,
        width,
        height,
        format,
        video,
        src: src.to_string(),
        input,
        last_position: LastSeek {
            resolved_pts: 0,
            resolved_dts: 0,
        },
        frame_cache: FrameCache::new(),
        duration,
    };

    Ok(opened_video)
}

fn create_bmp_image_from_frame(rgb_frame: &mut Video) -> Vec<u8> {
    let width = rgb_frame.width() as u32;
    let height = rgb_frame.height() as u32;
    let row_size = (width * 3 + 3) & !3;
    let row_padding = row_size - width * 3;
    let image_size = row_size * height;
    let header_size = 54;
    let stride = rgb_frame.stride(0);

    let mut bmp_data = Vec::with_capacity(header_size as usize + image_size as usize);

    bmp_data.extend_from_slice(b"BM");
    bmp_data.extend(&(header_size + image_size).to_le_bytes());
    bmp_data.extend(&0u16.to_le_bytes());
    bmp_data.extend(&0u16.to_le_bytes());
    bmp_data.extend(&header_size.to_le_bytes());

    bmp_data.extend(&40u32.to_le_bytes());
    bmp_data.extend(&width.to_le_bytes());
    bmp_data.extend(&height.to_le_bytes());
    bmp_data.extend(&1u16.to_le_bytes());
    bmp_data.extend(&24u16.to_le_bytes());
    bmp_data.extend(&0u32.to_le_bytes());
    bmp_data.extend(&image_size.to_le_bytes());
    bmp_data.extend(&2835u32.to_le_bytes());
    bmp_data.extend(&2835u32.to_le_bytes());
    bmp_data.extend(&0u32.to_le_bytes());
    bmp_data.extend(&0u32.to_le_bytes());

    for y in (0..height).rev() {
        let row_start = (y as usize) * stride;
        let row_end = row_start + (width * 3) as usize;
        bmp_data.extend_from_slice(&rgb_frame.data(0)[row_start..row_end]);
        for _ in 0..row_padding {
            bmp_data.push(0);
        }
    }

    bmp_data
}
