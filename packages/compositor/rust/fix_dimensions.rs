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

    let u_height = planes[1].len() as u32 / linesizes[1] as u32;
    let u_width = linesizes[1] as u32;

    let v_height = planes[2].len() as u32 / linesizes[2] as u32;
    let v_width = linesizes[2] as u32;

    // For YUV420P, U and V planes should be half the size of Y plane
    let expected_u_width = y_width / 2;
    let expected_u_height = y_height / 2;
    let expected_v_width = y_width / 2;
    let expected_v_height = y_height / 2;

    // Verify all planes have consistent dimensions
    if u_width != expected_u_width || u_height != expected_u_height {
        return Err(std::io::Error::new(
            ErrorKind::Other,
            "U plane dimensions mismatch",
        ));
    }

    if v_width != expected_v_width || v_height != expected_v_height {
        return Err(std::io::Error::new(
            ErrorKind::Other,
            "V plane dimensions mismatch",
        ));
    }

    Ok((y_width, y_height))
}
