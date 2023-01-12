extern crate ffmpeg_next as ffmpeg;

use std::io;

use ffmpeg::{
    format::Pixel,
    frame::Video,
    media::Type,
    software::scaling::{Context, Flags},
};

use crate::payloads::payloads::VideoLayer;

pub fn get_video_frame(layer: VideoLayer, video_fps: u32) -> Result<Vec<u8>, std::io::Error> {
    ffmpeg::init().unwrap();
    let time: f64 = (layer.frame as f64) / (video_fps as f64);
    let position = (time * 1000000.0) as i64;

    let mut input = ffmpeg::format::input(&layer.src)?;
    input.seek(position, ..position)?;

    let stream = input
        .streams()
        .best(Type::Video)
        .ok_or(ffmpeg::Error::StreamNotFound)?;

    let stream_index = stream.index();
    let context_decoder = ffmpeg::codec::context::Context::from_parameters(stream.parameters())?;

    let mut decoder = context_decoder.decoder().video()?;

    let mut scaler = Context::get(
        decoder.format(),
        decoder.width(),
        decoder.height(),
        Pixel::RGB24,
        layer.width,
        layer.height,
        Flags::BILINEAR,
    )?;

    let mut process_frame =
        |decoder: &mut ffmpeg::decoder::Video| -> Result<Vec<u8>, ffmpeg::Error> {
            let mut input = Video::empty();
            decoder.receive_frame(&mut input)?;
            let mut rgb_frame = Video::empty();
            scaler.run(&input, &mut rgb_frame)?;

            let data = rgb_frame.data(0).clone();

            Ok(data.to_vec())
        };

    let mut frame = Vec::new();

    for (stream, packet) in input.packets() {
        if stream.index() == stream_index {
            decoder.send_packet(&packet)?;
            let rgb_frame = process_frame(&mut decoder)?;
            frame = rgb_frame;
        }
    }

    let res = match frame.len() {
        0 => Err(io::Error::new(
            io::ErrorKind::Other,
            "Could not create pixmap",
        )),
        _ => Ok(frame),
    };

    return res;
}
