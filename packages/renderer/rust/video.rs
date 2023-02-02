extern crate ffmpeg_next as ffmpeg;
use std::future::IntoFuture;
use std::hash::Hash;
use std::sync::mpsc::{self, Sender};

use std::thread;
use std::{
    collections::{hash_map::RandomState, HashMap},
    io,
};

use ffmpeg::{
    format::Pixel,
    frame::Video,
    media::Type,
    software::scaling::{Context, Flags},
};

use crate::errors::{handle_error, print_debug};
use crate::payloads::payloads::VideoLayer;

pub fn process_frames(
    video_signals: HashMap<String, HashMap<u16, u8>>,
) -> (
    Sender<std::string::String>,
    std::sync::mpsc::Receiver<std::string::String>,
) {
    ffmpeg::init().unwrap();

    let frames_map: HashMap<String, HashMap<u16, Vec<u8>>>;

    for command in video_signals {
        let src = command.0;
        let map = command.1;

        let mut frames = map.keys();
        // TODO: Might be out of order;
        // TODO: remove unwrap
        let first_frame = *frames.next().unwrap();

        // TODO: Try to only open it once
        let mut input = ffmpeg::format::input(&src).unwrap();
        let mut stream_input = ffmpeg::format::input(&src).unwrap();
        let stream = stream_input
            .streams_mut()
            .find(|s| s.parameters().medium() == Type::Video)
            .unwrap();
        let time_base = stream.time_base();

        let position = (first_frame as f64 * time_base.1 as f64 / time_base.0 as f64) as i64;

        input.seek(position, ..position).unwrap();

        print_debug(format!("Seeked to frame ({}): {}", src, first_frame));

        let stream_index = stream.index();
        let context_decoder =
            ffmpeg::codec::context::Context::from_parameters(stream.parameters()).unwrap();

        let mut decoder = context_decoder.decoder().video().unwrap();

        let mut scaler = Context::get(
            decoder.format(),
            decoder.width(),
            decoder.height(),
            Pixel::RGB24,
            // TODO: Hardcoded from decoder
            decoder.width(),
            decoder.height(),
            Flags::BILINEAR,
        )
        .unwrap();

        let mut process_frame =
            |decoder: &mut ffmpeg::decoder::Video| -> Result<Vec<u8>, ffmpeg::Error> {
                let mut input = Video::empty();
                decoder.receive_frame(&mut input)?;
                let mut rgb_frame = Video::empty();
                scaler.run(&input, &mut rgb_frame).unwrap();

                let new_data = turn_frame_into_bitmap(rgb_frame).unwrap();

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
                            handle_error(&err);
                        }
                    } else {
                        frame = rgb_frame.unwrap();
                        // TODO: Insert into frame here
                        frames_map[&src][&first_frame] = frame;
                        break;
                    }
                }
            }
        }
    }

    let (send_input, receive_input) = mpsc::channel::<String>();
    let (send_output, receive_output) = mpsc::channel::<String>();

    thread::spawn(move || loop {
        let message = match receive_input.recv() {
            Ok(message) => message,
            Err(_) => {
                break;
            }
        };
        println!("Got message from main thread: {}", message);
        send_output.send(message).unwrap();
        break;
    });

    return (send_input, receive_output);
}

pub fn turn_frame_into_bitmap(rgb_frame: Video) -> Result<Vec<u8>, ffmpeg::Error> {
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

pub fn get_video_frame(layer: VideoLayer, video_fps: u32) -> Result<Vec<u8>, std::io::Error> {
    ffmpeg::init().unwrap();

    let time: f64 = (layer.frame as f64) / (video_fps as f64);

    // TODO: Improve so only needs to open once
    let mut stream_input = ffmpeg::format::input(&layer.src)?;
    let mut input = ffmpeg::format::input(&layer.src)?;

    let stream = stream_input
        .streams_mut()
        .find(|s| s.parameters().medium() == Type::Video)
        .ok_or(ffmpeg::Error::StreamNotFound)?;
    let time_base = stream.time_base();
    let position = (time * time_base.1 as f64 / time_base.0 as f64) as i64;

    input.seek(position, ..position)?;

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
                decoder.send_packet(&packet)?;
                let rgb_frame = process_frame(&mut decoder);

                if rgb_frame.is_err() {
                    let err = rgb_frame.err().unwrap();
                    if err.to_string().contains("Resource temporarily unavailable") {
                        // Need to send another packet
                    } else {
                        handle_error(&err);
                    }
                } else {
                    frame = rgb_frame?;
                    break;
                }
            }
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
