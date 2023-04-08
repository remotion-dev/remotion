use remotionffmepg::media::Type;

use crate::errors;
use remotionffmepg::format::Pixel;
use remotionffmepg::frame::Video;
use remotionffmepg::software::scaling::Context;
use remotionffmepg::software::scaling::Flags;
use std::io::{Error, ErrorKind};
extern crate ffmpeg_next as remotionffmepg;

pub fn extract_frame(src: String) -> Result<Vec<u8>, std::io::Error> {
    remotionffmepg::init()?;

    // Don't read twice
    let mut input = remotionffmepg::format::input(&src)?;
    let mut stream_input = remotionffmepg::format::input(&src)?;

    // TODO: Hardcoded
    let first_frame = 0;

    let stream = match stream_input
        .streams_mut()
        .find(|s| s.parameters().medium() == Type::Video)
    {
        Some(content) => content,
        None => Err(Error::new(ErrorKind::Other, "No video stream found"))?,
    };

    let time_base = stream.time_base();
    let position = (first_frame as f64 * time_base.1 as f64 / time_base.0 as f64) as i64;

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
            let mut rgb_frame = Video::empty();
            scaler.run(&input, &mut rgb_frame)?;

            let new_data = turn_frame_into_bitmap(rgb_frame)?;

            Ok(new_data)
        };

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
                    return Ok(rgb_frame.unwrap());
                }
            }
        }
    }
    Err(Error::new(ErrorKind::Other, "No frame found"))?
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
        new_data.append(&mut rgb_frame.data(0)[begin..end].to_vec());
    }

    Ok(new_data)
}
