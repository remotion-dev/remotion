use lazy_static::lazy_static;
use resvg::usvg_text_layout::fontdb;
use resvg::usvg_text_layout::TreeTextToPath;
use std::{fs::File, io};

lazy_static! {
    static ref FONT_DB_SINGLETON: SingletonFontDb = SingletonFontDb::new();
}

struct SingletonFontDb {
    fontdb: fontdb::Database,
}

impl SingletonFontDb {
    pub fn new() -> SingletonFontDb {
        let mut fontdb = fontdb::Database::new();
        fontdb.load_system_fonts();
        SingletonFontDb { fontdb }
    }
}

use crate::payloads::payloads::VideoLayer;
use crate::video::get_video_frame;
use crate::{
    errors,
    payloads::payloads::{ImageLayer, Layer, SolidLayer, SvgLayer},
};

fn draw_solid_layer(img: &mut [u8], canvas_width: u32, layer: SolidLayer) {
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

fn draw_png_image_layer(img: &mut [u8], canvas_width: u32, layer: ImageLayer) {
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

    let size = reader.output_buffer_size();
    let mut buf = vec![0; size];
    let info = match reader.next_frame(&mut buf) {
        Ok(content) => content,
        Err(err) => errors::handle_error(&err),
    };

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
}

fn draw_svg_image_layer(img: &mut [u8], canvas_width: u32, layer: SvgLayer, is_only_layer: bool) {
    let opt = usvg::Options::default();

    let mut tree = match usvg::Tree::from_data(layer.markup.as_bytes(), &opt) {
        Ok(content) => content,
        Err(err) => {
            errors::handle_error(&err);
        }
    };

    tree.convert_text(&FONT_DB_SINGLETON.fontdb, opt.keep_named_groups);

    let mut pixmap = match tiny_skia::Pixmap::new(layer.width, layer.height) {
        Some(content) => content,
        None => errors::handle_error(&io::Error::new(
            io::ErrorKind::Other,
            "Could not create pixmap",
        )),
    };

    resvg::render(
        &tree,
        // TODO: Should it be fitto?
        usvg::FitTo::Original,
        tiny_skia::Transform::identity(),
        pixmap.as_mut(),
    )
    .unwrap();

    if is_only_layer {
        img.copy_from_slice(pixmap.data().clone());
    } else {
        let bytes = pixmap.data();
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
    }
}

fn draw_bitmap(
    img: &mut [u8],
    canvas_width: u32,
    layer_width: u32,
    layer_height: u32,
    layer_x: u32,
    layer_y: u32,
    pixels: &[u8],
    channels: u32,
) {
    for y in 0..(layer_height) {
        for x in 0..(layer_width) {
            let r_index = (((y + layer_y) * canvas_width + (x + layer_x)) * 4) as usize;
            let g_index = (((y + layer_y) * canvas_width + (x + layer_x)) * 4 + 1) as usize;
            let b_index = (((y + layer_y) * canvas_width + (x + layer_x)) * 4 + 2) as usize;
            let a_index = (((y + layer_y) * canvas_width + (x + layer_x)) * 4 + 3) as usize;

            let prev_r = img[r_index];
            let prev_g = img[g_index];
            let prev_b = img[b_index];
            let prev_a = img[a_index];

            let layer_r_index = ((y * layer_width + x) * channels) as usize;
            let layer_g_index = ((y * layer_width + x) * channels + 1) as usize;
            let layer_b_index = ((y * layer_width + x) * channels + 2) as usize;
            let layer_a_index = ((y * layer_width + x) * channels + 2) as usize;

            let r = pixels[layer_r_index];
            let g = pixels[layer_g_index];
            let b = pixels[layer_b_index];
            let a = match channels {
                4 => pixels[layer_a_index],
                _ => 255,
            };

            let new_pixel = alpha_compositing(prev_r, prev_g, prev_b, prev_a, r, g, b, a);

            img[r_index] = new_pixel.0;
            img[g_index] = new_pixel.1;
            img[b_index] = new_pixel.2;
            img[a_index] = new_pixel.3;
        }
    }
}

fn draw_jpg_image_layer(img: &mut [u8], canvas_width: u32, layer: ImageLayer) {
    let file = match File::open(layer.src) {
        Ok(content) => content,
        Err(err) => {
            errors::handle_error(&err);
        }
    };

    let mut decoder = jpeg_decoder::Decoder::new(file);

    let pixels = match decoder.decode() {
        Ok(content) => content,
        Err(err) => errors::handle_error(&err),
    };

    draw_bitmap(
        img,
        canvas_width,
        layer.width,
        layer.height,
        layer.x,
        layer.y,
        &pixels,
        3,
    );
}

pub fn draw_video_layer(img: &mut [u8], canvas_width: u32, fps: u32, layer: VideoLayer) {
    let layer_width = layer.width;
    let layer_height = layer.height;
    let layer_x = layer.x;
    let layer_y = layer.y;
    let buffer = match get_video_frame(layer, fps) {
        Ok(content) => content,
        Err(err) => {
            errors::handle_error(&err);
        }
    };
    draw_bitmap(
        img,
        canvas_width,
        layer_width,
        layer_height,
        layer_x,
        layer_y,
        &buffer,
        3,
    )
}

pub fn draw_layer(img: &mut [u8], canvas_width: u32, layer: Layer, layer_count: usize, fps: u32) {
    match layer {
        Layer::PngImage(layer) => {
            draw_png_image_layer(img, canvas_width, layer);
        }
        Layer::JpgImage(layer) => {
            draw_jpg_image_layer(img, canvas_width, layer);
        }
        Layer::Solid(layer) => {
            draw_solid_layer(img, canvas_width, layer);
        }
        Layer::SvgImage(layer) => {
            draw_svg_image_layer(img, canvas_width, layer, layer_count == 1);
        }
        Layer::VideoFrame(layer) => {
            draw_video_layer(img, canvas_width, fps, layer);
        }
    }
}
