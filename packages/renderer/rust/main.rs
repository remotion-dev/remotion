mod colorspaces;
mod compositor;
mod errors;
mod finish;
mod payloads;
mod save;
use compositor::draw_layer;

use payloads::payloads::{parse_command, CliInput};
use std::fs::File;
use std::io::{self, Write};
use std::sync::mpsc;
use std::thread;
use threadpool::ThreadPool;

use crate::finish::handle_finish;

extern crate png;

struct NewFrame {
    data: Vec<u8>,
    nonce: u32,
}

fn process_command_line(opts: CliInput) -> Option<Vec<u8>> {
    let len: usize = match (opts.width * opts.height).try_into() {
        Ok(content) => content,
        Err(err) => errors::handle_error(&err),
    };

    let mut data = vec![0; len * 4];

    let size = opts.layers.len();
    for layer in opts.layers {
        draw_layer(&mut data, opts.width, layer, size)
    }

    if matches!(opts.output_format, payloads::payloads::ImageFormat::Jpeg) {
        match save::save_as_jpeg(opts.width, opts.height, &mut data, opts.output) {
            Ok(_) => None,
            Err(err) => errors::handle_error(&err),
        }
    } else if matches!(opts.output_format, payloads::payloads::ImageFormat::Bmp) {
        match save::save_as_bmp(opts.width, opts.height, &mut data, opts.output) {
            Ok(_) => None,
            Err(err) => errors::handle_error(&err),
        }
    } else if matches!(opts.output_format, payloads::payloads::ImageFormat::Tiff) {
        match save::save_as_tiff(opts.width, opts.height, &mut data, opts.output) {
            Ok(_) => None,
            Err(err) => errors::handle_error(&err),
        }
    } else if matches!(
        opts.output_format,
        payloads::payloads::ImageFormat::AddToH264
    ) {
        Some(data)
    } else {
        match save::save_as_png(opts.width, opts.height, &mut data, opts.output) {
            Ok(_) => None,
            Err(err) => errors::handle_error(&err),
        }
    }
}

fn main() -> Result<(), std::io::Error> {
    const WIDTH: usize = 1920;
    const HEIGHT: usize = 1080;
    const FPS: u32 = 60;

    // Initialize things.

    // TODO: Dimensions and FPS via

    let (tx, rx) = mpsc::channel::<NewFrame>();
    let (command_tx, command_rx) = mpsc::channel::<String>();

    let pool = ThreadPool::new(4); // Create a thread pool with 4 threads

    // Read messages from stdin in a separate thread

    let thread_handle = thread::spawn(move || loop {
        let mut input = String::new();
        match io::stdin().read_line(&mut input) {
            Ok(_) => {
                input = input.trim().to_string();
                if input == "EOF" {
                    break;
                }
                command_tx.send(input).unwrap();
            }
            Err(err) => errors::handle_error(&err),
        };
    });

    // Process the messages in the thread pool

    let another = thread::spawn(move || loop {
        let message = match command_rx.recv() {
            Ok(message) => message,
            Err(_) => {
                break;
            }
        };
        if message == "EOF" {
            break;
        }

        let sender = tx.clone();
        pool.execute(move || {
            // Process the message here
            let command = parse_command(&message);
            let nonce = command.nonce;
            let data = process_command_line(command);
            let rgb = colorspaces::rgba8_to_rgb8(data.unwrap(), WIDTH, HEIGHT);
            match sender.send(NewFrame { data: rgb, nonce }) {
                Ok(_) => {}
                Err(err) => errors::handle_error(&err),
            };
        });
    });

    let mut x264_encoder = x264::Encoder::builder()
        .fps(FPS, 1)
        .build(x264::Colorspace::RGB, WIDTH as _, HEIGHT as _)
        .unwrap();

    let mut file = File::create("fade.h264").unwrap();

    {
        let headers = x264_encoder.headers().unwrap();
        file.write_all(headers.entirety()).unwrap();
    }

    let mut next_frame = 0;
    let mut frames_found: Vec<NewFrame> = Vec::new();
    loop {
        if next_frame == 300 {
            break;
        }
        let frame = match rx.recv() {
            Ok(frame) => frame,
            Err(_) => {
                break;
            }
        };

        frames_found.push(frame);

        loop {
            let index = frames_found.iter().position(|x| x.nonce == next_frame);
            match index {
                Some(f) => {
                    let image = x264::Image::rgb(WIDTH as _, HEIGHT as _, &frames_found[f].data);

                    let (frame, _) =
                        match x264_encoder.encode((FPS * frames_found[f].nonce).into(), image) {
                            Ok(frame) => frame,
                            Err(err) => {
                                println!("Error: {:#?}", err);
                                errors::handle_error(&io::Error::new(
                                    io::ErrorKind::Other,
                                    "Could not encode frame",
                                ))
                            }
                        };

                    file.write_all(frame.entirety()).unwrap();
                    handle_finish(frames_found[f].nonce);
                    frames_found.remove(f);
                    println!("flushed {}", next_frame);

                    next_frame += 1;
                }
                None => {
                    break;
                }
            }
        }
    }
    let mut flush = x264_encoder.flush();
    while let Some(result) = flush.next() {
        let (data, _) = result.unwrap();
        file.write_all(data.entirety()).unwrap();
    }
    println!("proper flush");

    another.join().unwrap();
    match thread_handle.join() {
        Ok(_) => {}
        Err(_) => errors::handle_error(&io::Error::new(
            io::ErrorKind::Other,
            "Could not create pixmap",
        )),
    };

    Ok(())
}
