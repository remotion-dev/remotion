mod compositor;
mod errors;
mod payloads;
use compositor::draw_layer;
use jpeg_encoder::{ColorType, Encoder};

use payloads::payloads::{parse_cli, CliInput};
use std::{
    fs::File,
    io::{BufWriter, Read},
    path::Path,
};

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

    let opts: CliInput = parse_cli(&input);
    let len: usize = match (opts.width * opts.height).try_into() {
        Ok(content) => content,
        Err(err) => errors::handle_error(&err),
    };
    let mut data: Vec<u8> = vec![0; len * 4];

    for layer in opts.layers {
        draw_layer(&mut data, opts.width, layer)
    }

    if matches!(opts.output_format, payloads::payloads::ImageFormat::Jpeg) {
        match save_as_jpeg(opts.width, opts.height, data, opts.output) {
            Ok(_) => (),
            Err(err) => errors::handle_error(&err),
        }
    } else {
        match save_as_png(opts.width, opts.height, data, opts.output) {
            Ok(_) => (),
            Err(err) => errors::handle_error(&err),
        };
    }

    Ok(())
}

fn save_as_jpeg(
    width: u32,
    height: u32,
    data: Vec<u8>,
    output: String,
) -> Result<(), std::io::Error> {
    let encoder = match Encoder::new_file(output, 100) {
        Ok(content) => content,
        Err(_) => {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "could not create JPEG encoder",
            ))
        }
    };

    let width_u16: u16 = match width.try_into() {
        Ok(content) => content,
        Err(_) => {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "could not convert width to u16",
            ))
        }
    };
    let height_u16: u16 = match height.try_into() {
        Ok(content) => content,
        Err(_) => {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "could not convert height to u16",
            ))
        }
    };

    match encoder.encode(&data, width_u16, height_u16, ColorType::Rgba) {
        Ok(_) => (),
        Err(_) => {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "could not encode into JPEG",
            ))
        }
    };

    Ok(())
}

fn save_as_png(
    width: u32,
    height: u32,
    data: Vec<u8>,
    output: String,
) -> Result<(), std::io::Error> {
    let path = Path::new(&output);
    let file = match File::create(path) {
        Ok(content) => content,
        Err(err) => return Err(err),
    };
    let ref mut w = BufWriter::new(file);

    let mut encoder = png::Encoder::new(w, width, height);
    encoder.set_color(png::ColorType::Rgba);
    encoder.set_depth(png::BitDepth::Eight);
    encoder.set_source_gamma(png::ScaledFloat::from_scaled(45455)); // 1.0 / 2.2, scaled by 100000
    encoder.set_source_gamma(png::ScaledFloat::new(1.0 / 2.2)); // 1.0 / 2.2, unscaled, but rounded
    let source_chromaticities = png::SourceChromaticities::new(
        // Using unscaled instantiation here
        (0.31270, 0.32900),
        (0.64000, 0.33000),
        (0.30000, 0.60000),
        (0.15000, 0.06000),
    );
    encoder.set_source_chromaticities(source_chromaticities);
    let mut writer = match encoder.write_header() {
        Ok(content) => content,
        Err(err) => return Err(err.into()),
    };

    match writer.write_image_data(&data) {
        Ok(_) => (),
        Err(err) => return Err(err.into()),
    };
    Ok(())
}
