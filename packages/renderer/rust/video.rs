extern crate ffmpeg_next as ffmpeg;
use std::arch::aarch64::int32x2_t;
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
    video_signals: HashMap<String, HashMap<u16, u8, RandomState>, RandomState>,
) -> (
    Sender<std::string::String>,
    std::sync::mpsc::Receiver<std::string::String>,
) {
    ffmpeg::init().unwrap();

    let mut videos: HashMap<String, ffmpeg::format::context::Input> = HashMap::new();
    for command in video_signals {
        let src = command.0;
        let map = command.1;

        let mut frames = map.keys();
        // TODO: Might be out of order;
        // TODO: remove unwrap
        let first_frame = *frames.next().unwrap();

        let mut stream_input = ffmpeg::format::input(&src).unwrap();
        let stream = stream_input
            .streams_mut()
            .find(|s| s.parameters().medium() == Type::Video)
            .unwrap();
        let time_base = stream.time_base();

        let position = (first_frame as f64 * time_base.1 as f64 / time_base.0 as f64) as i64;

        stream_input.seek(position, ..position).unwrap();

        print_debug(format!("Seeked to frame ({}): {}", src, first_frame));

        videos.insert(src, stream_input);
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
            print_debug(format!("getting frame {}", layer.frame));
            decoder.receive_frame(&mut input)?;
            print_debug(format!("receiving frame {}", layer.frame));
            let mut rgb_frame = Video::empty();
            scaler.run(&input, &mut rgb_frame)?;

            let data = rgb_frame.data(0).clone();

            Ok(data.to_vec())
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
                    frame = rgb_frame.unwrap();
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
