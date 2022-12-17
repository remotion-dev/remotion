use std::fs::File;

use image::{ImageBuffer, Rgba};

use crate::{errors, payloads::payloads::ImageLayer};

pub fn draw_layer(img: &mut ImageBuffer<image::Rgba<u8>, Vec<u8>>, layer: ImageLayer) {
    let file = match File::open(layer.src) {
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
}
