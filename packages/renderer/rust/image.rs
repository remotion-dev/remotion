use std::{fs::File, io::BufWriter, path::Path};

use jpeg_encoder::{ColorType, Encoder};

use crate::errors::ErrorWithBacktrace;

pub fn save_as_jpeg(
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

pub fn get_png_data(
    rgba_data: &[u8],
    width: u32,
    height: u32,
) -> Result<Vec<u8>, ErrorWithBacktrace> {
    let mut png_data = Vec::new();

    {
        let mut encoder = png::Encoder::new(&mut png_data, width, height);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        encoder.set_source_gamma(png::ScaledFloat::from_scaled(45455)); // 1.0 / 2.2, scaled by 100000
        encoder.set_source_gamma(png::ScaledFloat::new(1.0 / 2.2)); // 1.0 / 2.2, unscaled, but rounded
        let source_chromaticities = png::SourceChromaticities::new(
            // Using unscaled instantiation here
            // Why those values, explained here https://www.canva.dev/blog/engineering/a-journey-through-colour-space-with-ffmpeg/
            (0.31270, 0.32900),
            (0.64000, 0.33000),
            (0.30000, 0.60000),
            (0.15000, 0.06000),
        );
        encoder.set_source_chromaticities(source_chromaticities);

        let mut writer = encoder.write_header()?;
        writer.write_image_data(&rgba_data)?;
    }
    Ok(png_data.clone())
}

pub fn save_as_png(
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
