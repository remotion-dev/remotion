use remotionffmepg::media::Type;

use crate::errors;
use remotionffmepg::format::Pixel;
use remotionffmepg::frame::Video;
use remotionffmepg::software::scaling::Context;
use remotionffmepg::software::scaling::Flags;
use std::io::{Error, ErrorKind};
extern crate ffmpeg_next as remotionffmepg;

pub fn extract_frame(src: String, time: f64) -> Result<Vec<u8>, std::io::Error> {
    remotionffmepg::init()?;

    // Don't read twice
    let mut input = remotionffmepg::format::input(&src)?;
    let mut stream_input = remotionffmepg::format::input(&src)?;

    let stream = match stream_input
        .streams_mut()
        .find(|s| s.parameters().medium() == Type::Video)
    {
        Some(content) => content,
        None => Err(Error::new(ErrorKind::Other, "No video stream found"))?,
    };

    let time_base = stream.time_base();
    let position = (time as f64 * time_base.1 as f64 / time_base.0 as f64) as i64;

    input.seek(position, ..position)?;

    let stream_index = stream.index();
    let context_decoder =
        remotionffmepg::codec::context::Context::from_parameters(stream.parameters())?;

    let mut decoder = context_decoder.decoder().video()?;

    let mut scaler = Context::get(
        decoder.format(),
        decoder.width(),
        decoder.height(),
        Pixel::RGB24,
        // TODO: Hardcoded from decoder
        decoder.width(),
        decoder.height(),
        Flags::BILINEAR,
    )?;

    let mut process_frame =
        |decoder: &mut remotionffmepg::decoder::Video| -> Result<Vec<u8>, remotionffmepg::Error> {
            let mut input = Video::empty();
            decoder.receive_frame(&mut input)?;
            input.data(0);
            let mut rgb_frame = Video::empty();
            scaler.run(&input, &mut rgb_frame)?;

            let new_data = turn_frame_into_bitmap(rgb_frame)?;

            Ok(new_data)
        };

    let mut frame = Vec::new();

    for (stream, packet) in input.packets() {
        if stream.index() == stream_index {
            // -1 because uf 67 and we want to process 66.66 -> rounding error
            if (packet.dts().unwrap() - 1) > position {
                break;
            }
            loop {
                decoder.send_packet(&packet).unwrap();
                let rgb_frame = process_frame(&mut decoder);

                if rgb_frame.is_err() {
                    let err = rgb_frame.err().unwrap();
                    if err.to_string().contains("Resource temporarily unavailable") {
                        // Need to send another packet
                    } else {
                        errors::handle_error(&err);
                    }
                } else {
                    frame = rgb_frame.unwrap();
                    break;
                }
            }
        }
    }
    if frame.len() > 0 {
        return Ok(create_bmp_image(frame, decoder.width(), decoder.height()));
    } else {
        Err(Error::new(ErrorKind::Other, "No frame found"))?
    }
}

fn turn_frame_into_bitmap(rgb_frame: Video) -> Result<Vec<u8>, remotionffmepg::Error> {
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

    Ok(new_data)
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
