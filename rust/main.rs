mod compositor;
mod errors;
mod payloads;
use compositor::draw_layer;
use image::{ImageBuffer, RgbaImage};
use payloads::payloads::parse_cli;
use std::io::Read;

extern crate png;

fn read_stdin_to_string() -> Result<String, std::io::Error> {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input)?;
    Ok(input)
}

fn main() -> Result<(), std::io::Error> {
    let input = match read_stdin_to_string() {
        Ok(content) => content,
        Err(err) => errors::handle_error(&err),
    };

    let opts = parse_cli(&input);
    let mut img: RgbaImage = ImageBuffer::new(opts.width, opts.height);

    for layer in opts.layers {
        draw_layer(&mut img, layer)
    }

    match img.save(opts.output) {
        Ok(content) => content,
        Err(err) => errors::handle_error(&err),
    };

    Ok(())
}
