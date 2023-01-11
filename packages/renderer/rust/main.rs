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
use std::time::Instant;
use threadpool::ThreadPool;
use x264::{Encoder, Param, Picture};

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
    const FPS: u32 = 30;

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
            match data {
                Some(d) => {
                    let rgb = colorspaces::rgba8_to_rgb8(d, WIDTH, HEIGHT);
                    match sender.send(NewFrame { data: rgb, nonce }) {
                        Ok(_) => {}
                        Err(err) => errors::handle_error(&err),
                    };
                }
                None => {}
            };
        });
    });

    let mut par = Param::default_preset("medium", "zerolatency").unwrap();

    par = par.set_dimension(HEIGHT, WIDTH);
    par = par.apply_profile("high").unwrap();
    par = par.param_parse("repeat_headers", "1").unwrap();
    par = par.param_parse("annexb", "1").unwrap();

    par.par.i_fps_num = FPS;
    par.par.i_fps_den = 1;
    par.par.i_log_level = 0;

    let mut output = File::create("fade.h264").unwrap();

    let mut pic = Picture::from_param(&par).unwrap();

    let mut enc = Encoder::open(&mut par).unwrap();

    let h = enc.get_headers().unwrap();
    let headers = h.as_bytes();
    output.write_all(headers).unwrap();

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
                    let frame = to_i420(&frames_found[f].data, WIDTH, HEIGHT);

                    pic.as_mut_slice(0).unwrap().copy_from_slice(&frame.0);
                    pic.as_mut_slice(1).unwrap().copy_from_slice(&frame.1);
                    pic.as_mut_slice(2).unwrap().copy_from_slice(&frame.2);

                    pic = pic.set_timestamp(frames_found[f].nonce as i64);

                    let time = Instant::now();
                    if let Some((nal, _, _)) = enc.encode(&pic).unwrap() {
                        let buf = nal.as_bytes();
                        output.write_all(buf).unwrap();
                    }
                    println!("time to convert yuv {}", time.elapsed().as_millis());
                    handle_finish(frames_found[f].nonce);
                    frames_found.remove(f);

                    next_frame += 1;
                }
                None => {
                    break;
                }
            }
        }
    }
    while enc.delayed_frames() {
        if let Some((nal, _, _)) = enc.encode(None).unwrap() {
            let buf = nal.as_bytes();
            output.write(buf).unwrap();
        }
    }

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

fn to_i420(frame: &[u8], width: usize, height: usize) -> (Vec<u8>, Vec<u8>, Vec<u8>) {
    let mut y_plane: Vec<u8> = vec![0; width * height];
    let mut u_plane: Vec<u8> = vec![0; width * height / 4];
    let mut v_plane: Vec<u8> = vec![0; width * height / 4];

    for i in 0..width * height {
        let red = frame[i * 3] as f64;
        let green = frame[i * 3 + 1] as f64;
        let blue = frame[i * 3 + 2] as f64;

        let y = (0.257 * red) + (0.504 * green) + (0.098 * blue) + 16.0;
        let u = -(0.148 * red) - (0.291 * green) + (0.439 * blue) + 128.0;
        let v = (0.439 * red) - (0.368 * green) - (0.071 * blue) + 128.0;

        let y = if y < 0.0 {
            0.0
        } else if y > 255.0 {
            255.0
        } else {
            y
        };
        let u = if u < 0.0 {
            0.0
        } else if u > 255.0 {
            255.0
        } else {
            u
        };
        let v = if v < 0.0 {
            0.0
        } else if v > 255.0 {
            255.0
        } else {
            v
        };

        let y = y as u8;
        let u = u as u8;
        let v = v as u8;
        y_plane[i] = y;

        let row = i % width;
        let col = i / width;

        u_plane[(row / 2) + (col / 2) * width / 2] += u / 4;
        v_plane[(row / 2) + (col / 2) * width / 2] += v / 4;
    }

    (y_plane, u_plane, v_plane)
}
