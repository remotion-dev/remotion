use std::io::ErrorKind;

use ffmpeg_next::format::Pixel;

// Calculate dimensions based on linesize, not based on metadata
pub fn get_dimensions_from_planes(
    pixel_format: Pixel,
    planes: &[Vec<u8>],
    linesizes: &[i32; 8],
    original_width: u32,
    original_height: u32,
) -> Result<(u32, u32), std::io::Error> {
    if pixel_format != Pixel::YUV420P {
        return Ok((original_width, original_height));
    }

    if planes.len() < 3 || linesizes.len() < 3 {
        return Err(std::io::Error::new(
            ErrorKind::Other,
            "Not enough planes or linesizes",
        ));
    }

    // Calculate dimensions for each plane based on linesizes
    let y_height = planes[0].len() as u32 / linesizes[0] as u32;
    let y_width = linesizes[0] as u32;

    // Believe the original width, but do not allow overflow
    Ok((y_width.min(original_width), y_height.min(original_height)))
}
