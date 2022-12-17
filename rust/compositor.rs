use std::fs::File;

use image::{ImageBuffer, Rgba};

use crate::{
    errors,
    payloads::payloads::{ImageLayer, Layer, SolidLayer},
};

fn draw_solid_layer(img: &mut ImageBuffer<image::Rgba<u8>, Vec<u8>>, layer: SolidLayer) {
    for y in layer.y..(layer.height + layer.y) {
        for x in layer.x..(layer.width + layer.x) {
            let px: Rgba<u8> = Rgba(layer.fill);
            img.put_pixel(x, y, px)
        }
    }
}

fn alpha_compositing(color1: &Rgba<u8>, color2: Rgba<u8>) -> Rgba<u8> {
    let alpha1 = color1[3] as f32 / 255.0;
    let alpha2 = color2[3] as f32 / 255.0;

    let r = (alpha1 * color1[0] as f32 + alpha2 * (1.0 - alpha1) * color2[0] as f32) as u8;
    let g = (alpha1 * color1[1] as f32 + alpha2 * (1.0 - alpha1) * color2[1] as f32) as u8;
    let b = (alpha1 * color1[2] as f32 + alpha2 * (1.0 - alpha1) * color2[2] as f32) as u8;
    let a = ((alpha1 + alpha2 * (1.0 - alpha1)) * 255.0) as u8;

    let blended_color = Rgba([r, g, b, a]);
    return blended_color;
}

fn draw_image_layer(img: &mut ImageBuffer<image::Rgba<u8>, Vec<u8>>, layer: ImageLayer) {
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
    for y in layer.y..(layer.height + layer.y) {
        for x in layer.x..(layer.width + layer.x) {
            let r = bytes[((y * info.width + x) * 4) as usize];
            let g = bytes[((y * info.width + x) * 4 + 1) as usize];
            let b = bytes[((y * info.width + x) * 4 + 2) as usize];
            let a = bytes[((y * info.width + x) * 4 + 3) as usize];

            let px: Rgba<u8> = Rgba([r, g, b, a]);
            let prev_pixel = img.get_pixel(x, y);

            img.put_pixel(x, y, alpha_compositing(prev_pixel, px))
        }
    }
}

pub fn draw_layer(img: &mut ImageBuffer<image::Rgba<u8>, Vec<u8>>, layer: Layer) {
    match layer {
        Layer::Image(layer) => {
            draw_image_layer(img, layer);
        }
        Layer::Solid(layer) => {
            draw_solid_layer(img, layer);
        }
    }
}
