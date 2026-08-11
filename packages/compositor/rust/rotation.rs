use std::{f64::consts::PI, io::ErrorKind};

use crate::errors::ErrorWithBacktrace;

pub fn get_from_side_data(value: &[u8]) -> Result<f64, ErrorWithBacktrace> {
    let mut i32_values: Vec<i32> = Vec::new();

    for bytes in value.chunks(4) {
        let i32_value = i32::from_le_bytes(bytes.try_into().unwrap());
        i32_values.push(i32_value);
    }

    if i32_values.len() != 9 {
        Err(std::io::Error::new(ErrorKind::Other, "Invalid side data"))?;
    }
    return get_rotation(&i32_values);
}

pub fn get_rotation(displaymatrix: &[i32]) -> Result<f64, ErrorWithBacktrace> {
    let mut theta = -(rotation_get(displaymatrix))?.round();

    theta -= 360.0 * (theta / 360.0 + 0.9 / 360.0).floor();

    if (theta - 90.0 * (theta / 90.0).round()).abs() > 2.0 {
        Err(std::io::Error::new(ErrorKind::Other, "Odd rotation angle"))?;
    }

    return Ok(theta);
}

pub fn rotation_get(matrix: &[i32]) -> Result<f64, ErrorWithBacktrace> {
    let scale0 = (matrix[0] as f64).hypot(matrix[3] as f64);
    let scale1 = (matrix[1] as f64).hypot(matrix[4] as f64);

    if scale0 == 0.0 || scale1 == 0.0 {
        Err(std::io::Error::new(ErrorKind::Other, "Invalid matrix"))?;
    }

    let rotation = (((matrix[1] as f64) / scale1).atan2((matrix[0] as f64) / scale0)) * 180.0 / PI;

    return Ok(-rotation);
}
