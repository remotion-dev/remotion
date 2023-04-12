use lazy_static::lazy_static;
use remotionffmepg::media::Type;
use remotionffmepg::Rational;

use crate::errors::PossibleErrors;
use crate::global_printer::_print_debug;
use remotionffmepg::format::Pixel;
use remotionffmepg::frame::Video;
use remotionffmepg::software::scaling::Context;
use remotionffmepg::software::scaling::Flags;
use std::collections::HashMap;
use std::io::ErrorKind;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::RwLock;
use std::time::Instant;
extern crate ffmpeg_next as remotionffmepg;

pub struct OpenedVideo {
    pub stream_index: usize,
    pub time_base: Rational,
    pub width: u32,
    pub height: u32,
    pub format: Pixel,
    pub video: remotionffmepg::codec::decoder::Video,
    pub src: String,
    pub input: remotionffmepg::format::context::Input,
}

pub fn extract_frame(src: String, time: f64) -> Result<Vec<u8>, PossibleErrors> {
    let manager = OpenedVideoManager::get_instance();
    let video_locked = manager.get_video(&src)?;
    let mut vid = video_locked.lock().unwrap();
    vid.get_frame(time)
}

impl OpenedVideo {
    pub fn get_frame(&mut self, time: f64) -> Result<Vec<u8>, PossibleErrors> {
        let mut scaler = Context::get(
            self.format,
            self.width,
            self.height,
            Pixel::RGB24,
            self.width,
            self.height,
            Flags::BILINEAR,
        )?;

        let position = (time as f64 * self.time_base.1 as f64 / self.time_base.0 as f64) as i64;

        let stream_index = self.stream_index.clone();

        self.input
            .seek(stream_index as i32, position - 1000, position, position, 0)?;

        _print_debug(&format!("position {}", position))?;

        let mut frame = Video::empty();

        let packets = self.input.packets();

        for (stream, packet) in packets {
            if stream.parameters().medium() != Type::Video {
                continue;
            }

            // -1 because uf 67 and we want to process 66.66 -> rounding error
            if (packet.dts().unwrap() - 1) > position {
                break;
            }
            loop {
                self.video.send_packet(&packet)?;
                let res = self.video.receive_frame(&mut frame);

                match res {
                    Err(err) => {
                        if err.to_string().contains("Resource temporarily unavailable") {
                            // Need to send another packet
                        } else {
                            Err(std::io::Error::new(ErrorKind::Other, err.to_string()))?
                        }
                    }
                    Ok(_) => {
                        break;
                    }
                }
            }
        }
        if is_frame_empty(&frame) {
            Err(std::io::Error::new(ErrorKind::Other, "No frame found"))?
        } else {
            let mut scaled = Video::empty();
            let scale_start = Instant::now();
            scaler.run(&frame, &mut scaled)?;
            let elapsed = scale_start.elapsed();
            _print_debug(&format!("Scaling: {:?}", elapsed)).unwrap();

            let bitmap = turn_frame_into_bitmap(scaled);

            return Ok(create_bmp_image(bitmap, self.width, self.height));
        }
    }
}

pub struct OpenedVideoManager {
    videos: RwLock<HashMap<String, Arc<Mutex<OpenedVideo>>>>,
}

impl OpenedVideoManager {
    pub fn get_instance() -> &'static OpenedVideoManager {
        lazy_static! {
            static ref INSTANCE: OpenedVideoManager = OpenedVideoManager {
                videos: RwLock::new(HashMap::new()),
            };
        }
        &INSTANCE
    }

    pub fn get_video(&self, src: &str) -> Result<Arc<Mutex<OpenedVideo>>, PossibleErrors> {
        // Adding a block scope because of the RwLock,
        // preventing a deadlock
        {
            let videos_read = self.videos.try_read();
            if (videos_read.is_err()) {
                return Err(std::io::Error::new(ErrorKind::Other, "Deadlock").into());
            }
            let videos = videos_read.unwrap();
            if videos.contains_key(src) {
                return Ok(videos.get(src).unwrap().clone());
            }
        }

        let video = open_video(src)?;
        let videos_write = self.videos.write();

        videos_write
            .unwrap()
            .insert(src.to_string(), Arc::new(Mutex::new(video)));

        return Ok(self.videos.read().unwrap().get(src).unwrap().clone());
    }

    pub fn remove_video(&self, src: String) {
        let videos = self.videos.write();
        videos.unwrap().remove(&src);
    }
}

pub fn open_video(src: &str) -> Result<OpenedVideo, PossibleErrors> {
    remotionffmepg::init()?;

    let mut input = remotionffmepg::format::input(&src)?;
    let stream_index = input
        .streams_mut()
        .find(|s| s.parameters().medium() == Type::Video)
        .unwrap()
        .index();

    let mut_stream = input.stream_mut(stream_index).unwrap();
    let time_base = mut_stream.time_base();
    let parameters = mut_stream.parameters();

    let context_decoder = remotionffmepg::codec::context::Context::from_parameters(parameters)?;
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
    };

    Ok(opened_video)
}

fn is_frame_empty(frame: &Video) -> bool {
    unsafe {
        if frame.is_empty() {
            return true;
        }
    }
    return false;
}

fn turn_frame_into_bitmap(rgb_frame: Video) -> Vec<u8> {
    // https://github.com/zmwangx/rust-ffmpeg/issues/64
    let stride = rgb_frame.stride(0);
    let byte_width: usize = 3 * rgb_frame.width() as usize;
    let height: usize = rgb_frame.height() as usize;
    let mut new_data: Vec<u8> = Vec::with_capacity(byte_width * height);
    for line in 0..height {
        let begin = line * stride;
        let end = begin + byte_width;
        new_data.extend_from_slice(&rgb_frame.data(0)[begin..end]);
    }

    return new_data;
}

fn create_bmp_image(rgb_data: Vec<u8>, width: u32, height: u32) -> Vec<u8> {
    let row_size = (width * 3 + 3) & !3; // Each row is 4-byte aligned
    let row_padding = row_size - width * 3;
    let image_size = row_size * height;
    let header_size = 54;

    let mut bmp_data: Vec<u8> = Vec::new();

    // BMP file header
    bmp_data.extend_from_slice(b"BM"); // Magic identifier (2 bytes)
    bmp_data.extend(&((header_size + image_size) as u32).to_le_bytes()); // File size (4 bytes)
    bmp_data.extend(&0u16.to_le_bytes()); // Reserved (2 bytes)
    bmp_data.extend(&0u16.to_le_bytes()); // Reserved (2 bytes)
    bmp_data.extend(&(header_size as u32).to_le_bytes()); // Offset to pixel array (4 bytes)

    // DIB header
    bmp_data.extend(&(40u32.to_le_bytes())); // Header size (4 bytes)
    bmp_data.extend(&width.to_le_bytes()); // Image width (4 bytes)
    bmp_data.extend(&height.to_le_bytes()); // Image height (4 bytes)
    bmp_data.extend(&1u16.to_le_bytes()); // Color planes (2 bytes)
    bmp_data.extend(&24u16.to_le_bytes()); // Bits per pixel (2 bytes)
    bmp_data.extend(&0u32.to_le_bytes()); // Compression method (4 bytes)
    bmp_data.extend(&image_size.to_le_bytes()); // Image data size (4 bytes)
    bmp_data.extend(&2835u32.to_le_bytes()); // Horizontal resolution (4 bytes, 72 DPI * 39.3701)
    bmp_data.extend(&2835u32.to_le_bytes()); // Vertical resolution (4 bytes, 72 DPI * 39.3701)
    bmp_data.extend(&0u32.to_le_bytes()); // Number of colors (4 bytes)
    bmp_data.extend(&0u32.to_le_bytes()); // Number of important colors (4 bytes)

    // Image data
    for y in (0..height).rev() {
        let row_start = y * width * 3;
        let row_end = row_start + width * 3;
        let row = &rgb_data[row_start as usize..row_end as usize];

        // Reverse the order of RGB values to BGR
        for i in (0..row.len()).step_by(3) {
            bmp_data.push(row[i + 2]);
            bmp_data.push(row[i + 1]);
            bmp_data.push(row[i]);
        }

        // Add padding to the row if necessary
        for _ in 0..row_padding {
            bmp_data.push(0);
        }
    }

    bmp_data
}
