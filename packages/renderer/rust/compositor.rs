use std::fs::File;

use crate::{
    errors::ErrorWithBacktrace,
    payloads::payloads::{ImageLayer, Layer, SolidLayer},
};

fn draw_solid_layer(img: &mut Vec<u8>, canvas_width: u32, layer: SolidLayer) {
    for y in layer.y..(layer.height + layer.y) {
        for x in layer.x..(layer.width + layer.x) {
            let r_index = ((y * canvas_width + x) * 4) as usize;
            let g_index = ((y * canvas_width + x) * 4 + 1) as usize;
            let b_index = ((y * canvas_width + x) * 4 + 2) as usize;
            let a_index = ((y * canvas_width + x) * 4 + 3) as usize;

            let new_pixel = alpha_compositing(
                img[r_index],
                img[g_index],
                img[b_index],
                img[a_index],
                layer.fill[0],
                layer.fill[1],
                layer.fill[2],
                layer.fill[3],
            );

            img[r_index] = new_pixel.0;
            img[g_index] = new_pixel.1;
            img[b_index] = new_pixel.2;
            img[a_index] = new_pixel.3;
        }
    }
}

fn alpha_compositing(
    prev_r: u8,
    prev_g: u8,
    prev_b: u8,
    prev_a: u8,
    new_r: u8,
    new_g: u8,
    new_b: u8,
    new_a: u8,
) -> (u8, u8, u8, u8) {
    if new_a == 0 {
        return (prev_r, prev_g, prev_b, prev_a);
    }

    if prev_a == 0 {
        return (new_r, new_g, new_b, new_a);
    }

    if new_a == 255 {
        return (new_r, new_g, new_b, new_a);
    }

    let alpha1 = new_a as f32 / 255.0;
    let alpha2 = prev_a as f32 / 255.0;

    let r = (alpha1 * new_r as f32 + alpha2 * (1.0 - alpha1) * prev_r as f32) as u8;
    let g = (alpha1 * new_g as f32 + alpha2 * (1.0 - alpha1) * prev_g as f32) as u8;
    let b = (alpha1 * new_b as f32 + alpha2 * (1.0 - alpha1) * prev_b as f32) as u8;
    let a = ((alpha1 * 255.0 + alpha2 * (1.0 - alpha1)) * 255.0) as u8;

    return (r, g, b, a);
}

fn draw_png_image_layer(
    img: &mut Vec<u8>,
    canvas_width: u32,
    layer: ImageLayer,
) -> Result<(), ErrorWithBacktrace> {
    let file = File::open(layer.src)?;

    let decoder = png::Decoder::new(file);
    let mut reader = decoder.read_info()?;

    let size = reader.output_buffer_size();
    let mut buf = vec![0; size];
    let info = reader.next_frame(&mut buf)?;

    let bytes = &buf[..info.buffer_size()];
    for y in 0..(layer.height) {
        for x in 0..(layer.width) {
            let r = bytes[((y * layer.width + x) * 4) as usize];
            let g = bytes[((y * layer.width + x) * 4 + 1) as usize];
            let b = bytes[((y * layer.width + x) * 4 + 2) as usize];
            let a = bytes[((y * layer.width + x) * 4 + 3) as usize];

            let r_index = (((y + layer.y) * canvas_width + (x + layer.x)) * 4) as usize;
            let g_index = (((y + layer.y) * canvas_width + (x + layer.x)) * 4 + 1) as usize;
            let b_index = (((y + layer.y) * canvas_width + (x + layer.x)) * 4 + 2) as usize;
            let a_index = (((y + layer.y) * canvas_width + (x + layer.x)) * 4 + 3) as usize;

            let new_pixel = alpha_compositing(
                img[r_index],
                img[g_index],
                img[b_index],
                img[a_index],
                r,
                g,
                b,
                a,
            );

            img[r_index] = new_pixel.0;
            img[g_index] = new_pixel.1;
            img[b_index] = new_pixel.2;
            img[a_index] = new_pixel.3;
        }
    }
    Ok(())
}

fn draw_jpg_image_layer(
    img: &mut Vec<u8>,
    canvas_width: u32,
    layer: ImageLayer,
) -> Result<(), ErrorWithBacktrace> {
    let file = File::open(layer.src)?;

    let mut decoder = jpeg_decoder::Decoder::new(file);

    let pixels = decoder.decode()?;

    for y in 0..(layer.height) {
        for x in 0..(layer.width) {
            let r_index = (((y + layer.y) * canvas_width + (x + layer.x)) * 4) as usize;
            let g_index = (((y + layer.y) * canvas_width + (x + layer.x)) * 4 + 1) as usize;
            let b_index = (((y + layer.y) * canvas_width + (x + layer.x)) * 4 + 2) as usize;
            let a_index = (((y + layer.y) * canvas_width + (x + layer.x)) * 4 + 3) as usize;

            let prev_r = img[r_index];
            let prev_g = img[g_index];
            let prev_b = img[b_index];
            let prev_a = img[a_index];

            let layer_r_index = ((y * layer.width + x) * 3) as usize;
            let layer_g_index = ((y * layer.width + x) * 3 + 1) as usize;
            let layer_b_index = ((y * layer.width + x) * 3 + 2) as usize;

            let r = pixels[layer_r_index];
            let g = pixels[layer_g_index];
            let b = pixels[layer_b_index];

            let new_pixel = alpha_compositing(prev_r, prev_g, prev_b, prev_a, r, g, b, 255);

            img[r_index] = new_pixel.0;
            img[g_index] = new_pixel.1;
            img[b_index] = new_pixel.2;
            img[a_index] = new_pixel.3;
        }
    }
    Ok(())
}

pub fn draw_layer(
    img: &mut Vec<u8>,
    canvas_width: u32,
    layer: Layer,
) -> Result<(), ErrorWithBacktrace> {
    match layer {
        Layer::PngImage(layer) => draw_png_image_layer(img, canvas_width, layer),
        Layer::JpgImage(layer) => draw_jpg_image_layer(img, canvas_width, layer),
        Layer::Solid(layer) => Ok(draw_solid_layer(img, canvas_width, layer)),
    }
}
