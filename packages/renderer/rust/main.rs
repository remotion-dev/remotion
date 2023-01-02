mod compositor;
mod errors;
mod finish;
mod payloads;
mod save;
use compositor::draw_layer;

use payloads::payloads::{parse_command, CliInput};
use std::io::{stdin, BufRead};

use crate::errors::handle_error;
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
    loop {
        let mut input = String::new();
        let mut handle = stdin().lock();
        match handle.read_line(&mut input) {
            Ok(_) => {
                let command = parse_command(&input);
                let nonce = command.nonce;
                process_command_line(command);
                handle_finish(nonce);
            }
            Err(err) => {
                handle_error(&err);
            }
        };
    }
}
