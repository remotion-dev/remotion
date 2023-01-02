mod compositor;
mod errors;
mod finish;
mod payloads;
mod save;
use compositor::draw_layer;

use payloads::payloads::{parse_command, CliInput};
use std::io::{self};
use std::sync::{Arc, Mutex};
use std::thread;
use threadpool::ThreadPool;

use crate::finish::handle_finish;

extern crate png;

fn process_command_line(opts: CliInput) {
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
            Ok(_) => (),
            Err(err) => errors::handle_error(&err),
        }
    } else if matches!(opts.output_format, payloads::payloads::ImageFormat::Bmp) {
        match save::save_as_bmp(opts.width, opts.height, &mut data, opts.output) {
            Ok(_) => (),
            Err(err) => errors::handle_error(&err),
        }
    } else if matches!(opts.output_format, payloads::payloads::ImageFormat::Tiff) {
        match save::save_as_tiff(opts.width, opts.height, &mut data, opts.output) {
            Ok(_) => (),
            Err(err) => errors::handle_error(&err),
        }
    } else {
        match save::save_as_png(opts.width, opts.height, &mut data, opts.output) {
            Ok(_) => (),
            Err(err) => errors::handle_error(&err),
        };
    }
}

fn main() -> Result<(), std::io::Error> {
    let pool = ThreadPool::new(4); // Create a thread pool with 4 threads
    let mutex = Arc::new(Mutex::new(vec![]));

    // Read messages from stdin in a separate thread
    let mutex_clone = mutex.clone();
    thread::spawn(move || loop {
        let mut input = String::new();
        io::stdin().read_line(&mut input).unwrap();
        input = input.trim().to_string();

        let mut messages = mutex_clone.lock().unwrap();
        messages.push(input);
    });

    // Process the messages in the thread pool
    loop {
        let mut messages = mutex.lock().unwrap();
        for message in messages.drain(..) {
            let mutex_clone = mutex.clone();
            pool.execute(move || {
                // Process the message here
                let command = parse_command(&message);
                println!("Processing message: {}", command.nonce);
                let nonce = command.nonce;
                process_command_line(command);
                handle_finish(nonce);

                let mut messages = mutex_clone.lock().unwrap();

                match messages.iter().position(|m| m == &message) {
                    Some(index) => {
                        messages.remove(index);
                    }
                    None => {}
                }
            });
        }
    }
}
