use crate::errors::ErrorWithBacktrace;

pub fn get_png_data(
    rgba_data: &[u8],
    width: u32,
    height: u32,
) -> Result<Vec<u8>, ErrorWithBacktrace> {
    let mut png_data = Vec::new();

    {
        let mut encoder = png::Encoder::new(&mut png_data, width, height);
        encoder.set_compression(png::Compression::Fast);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        encoder.set_source_gamma(png::ScaledFloat::from_scaled(45455)); // 1.0 / 2.2, scaled by 100000
        encoder.set_source_gamma(png::ScaledFloat::new(1.0 / 2.2)); // 1.0 / 2.2, unscaled, but rounded
        let source_chromaticities = png::SourceChromaticities::new(
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
