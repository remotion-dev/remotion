mod errors;
use image::{ImageBuffer, Rgba, RgbaImage};
use std::env;
use std::fs::File;

extern crate png;

fn main() -> Result<(), std::io::Error> {
    let args: Vec<String> = env::args().collect();

    if args.len() < 3 {
        errors::handle_error(&std::io::Error::new(
            std::io::ErrorKind::Other,
            "not enough arguments",
        ));
    }

    let query = &args[1];
    let canvas_width = match args[2].parse::<u32>() {
        Ok(content) => content,
        Err(error) => {
            errors::handle_error(&error);
        }
    };
    let canvas_height = match args[3].parse::<u32>() {
        Ok(content) => content,
        Err(err) => {
            errors::handle_error(&err);
        }
    };

    let mut img: RgbaImage = ImageBuffer::new(canvas_width, canvas_height);

    let file = match File::open(query) {
        Ok(content) => content,
        Err(err) => {
            errors::handle_error(&err);
        }
    };

    let decoder = png::Decoder::new(file);
    let mut reader = match decoder.read_info() {
        Ok(content) => content,
        Err(err) => errors::handle_error(&err),
    };

    let mut buf = vec![0; reader.output_buffer_size()];
    let info = match reader.next_frame(&mut buf) {
        Ok(content) => content,
        Err(err) => errors::handle_error(&err),
    };

    let bytes = &buf[..info.buffer_size()];

    for y in 0..info.height {
        for x in 0..info.width {
            let r = bytes[((y * info.width + x) * 4) as usize];
            let g = bytes[((y * info.width + x) * 4 + 1) as usize];
            let b = bytes[((y * info.width + x) * 4 + 2) as usize];
            let a = bytes[((y * info.width + x) * 4 + 3) as usize];

            let array: [u8; 4] = [r, g, b, a];
            let px: Rgba<u8> = Rgba(array);
            img.put_pixel(x, y, px)
        }
    }

    match img.save("img.png") {
        Ok(content) => content,
        Err(err) => errors::handle_error(&err),
    };

    Ok(())
}
