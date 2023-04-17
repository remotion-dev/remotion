use std::io::ErrorKind;

use ffmpeg_next::Rational;
use remotionffmpeg::{
    format::Pixel,
    frame::Video,
    media::Type,
    software::scaling::{Context, Flags},
};
extern crate ffmpeg_next as remotionffmpeg;

use crate::{
    errors::PossibleErrors,
    frame_cache::{FrameCache, FrameCacheItem},
    global_printer::_print_debug,
};

pub struct LastSeek {
    asked_time: i64,
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
}

impl OpenedVideo {
    pub fn receive_frame(&mut self) -> Result<Option<Vec<u8>>, PossibleErrors> {
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
            Ok(_) => {
                let new_bitmap =
                    scale_and_make_bitmap(frame, self.format, self.width, self.height)?;

                Ok(Some(new_bitmap))
            }
        }
    }

    pub fn get_frame(&mut self, time: f64) -> Result<Vec<u8>, PossibleErrors> {
        let position = (time as f64 * self.time_base.1 as f64 / self.time_base.0 as f64) as i64;
        let min_position =
            ((time as f64 - 1.0) * self.time_base.1 as f64 / self.time_base.0 as f64) as i64;

        let cache_item = self.frame_cache.get_item(position);
        if cache_item.is_some() {
            return Ok(cache_item.unwrap());
        }

        if position < self.last_position.asked_time || self.last_position.asked_time < min_position
        {
            _print_debug(&format!(
                "Seeking to {} from asked_time = {}, pts = {} and dts = {}",
                position,
                self.last_position.asked_time,
                self.last_position.resolved_pts,
                self.last_position.resolved_dts
            ));
            self.input
                .seek(self.stream_index as i32, 0, position, position, 0)?;
        }

        let mut bitmap: Vec<u8> = Vec::new();

        loop {
            let (stream, packet) = match self.input.get_next_packet() {
                Err(remotionffmpeg::Error::Eof) => {
                    self.video.send_eof()?;

                    loop {
                        let result = self.receive_frame();

                        match result {
                            Ok(Some(data)) => {
                                bitmap = data;
                                self.frame_cache.add_item(FrameCacheItem {
                                    asked_time: position,
                                    resolved_pts: self.last_position.resolved_pts,
                                    resolved_dts: self.last_position.resolved_dts,
                                    bitmap: bitmap.clone(),
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
                    break;
                }
                Ok(packet) => packet,
                Err(err) => Err(std::io::Error::new(ErrorKind::Other, err.to_string()))?,
            };
            if stream.parameters().medium() != Type::Video {
                continue;
            }

            // -1 because uf 67 and we want to process 66.66 -> rounding error
            if (packet.pts().unwrap() - 1) > position && bitmap.len() > 0 {
                break;
            }

            loop {
                self.video.send_packet(&packet)?;
                let result = self.receive_frame();

                self.last_position = LastSeek {
                    asked_time: position,
                    resolved_pts: packet.pts().unwrap(),
                    resolved_dts: packet.dts().unwrap(),
                };

                match result {
                    Ok(Some(data)) => {
                        bitmap = data;
                        self.frame_cache.add_item(FrameCacheItem {
                            asked_time: position,
                            resolved_pts: packet.pts().unwrap(),
                            resolved_dts: packet.dts().unwrap(),
                            bitmap: bitmap.clone(),
                        });

                        break;
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
        if bitmap.len() == 0 {
            return Err(std::io::Error::new(ErrorKind::Other, "No frame found"))?;
        }
        Ok(bitmap)
    }
}

pub fn scale_and_make_bitmap(
    frame: Video,
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
        Flags::BICUBIC,
    )?;

    let mut scaled = Video::empty();
    scaler.run(&frame, &mut scaled)?;

    let bmp = create_bmp_image_from_frame(&mut scaled);
    return Ok(bmp);
}

pub fn open_video(src: &str) -> Result<OpenedVideo, PossibleErrors> {
    let mut input = remotionffmpeg::format::input(&src)?;
    let stream_index = input
        .streams_mut()
        .find(|s| s.parameters().medium() == Type::Video)
        .unwrap()
        .index();

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
            asked_time: 0,
            resolved_pts: 0,
            resolved_dts: 0,
        },
        frame_cache: FrameCache::new(),
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
