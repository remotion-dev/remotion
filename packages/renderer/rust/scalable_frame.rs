use std::usize;

use ffmpeg_next::{
    color::{Range, Space},
    format::Pixel,
    frame::Video,
    software::scaling::{Context, Flags},
};

use crate::{errors::ErrorWithBacktrace, global_printer::_print_verbose, image::get_png_data};

#[derive(Clone, Copy)]
pub enum Rotate {
    Rotate0,
    Rotate90,
    Rotate180,
    Rotate270,
}

pub struct NotRgbFrame {
    pub planes: Vec<Vec<u8>>,
    pub linesizes: [i32; 8],
    pub format: Pixel,
    pub space: Space,
    pub range: Range,
    pub original_width: u32,
    pub original_height: u32,
    pub scaled_width: u32,
    pub scaled_height: u32,
    pub rotate: Rotate,
    pub original_src: String,
}

pub struct RgbFrame {
    pub data: Vec<u8>,
}

pub struct ScalableFrame {
    pub native_frame: Option<NotRgbFrame>,
    pub rgb_frame: Option<RgbFrame>,
    pub transparent: bool,
}

impl ScalableFrame {
    pub fn new(native_frame: NotRgbFrame, transparent: bool) -> Self {
        Self {
            native_frame: Some(native_frame),
            rgb_frame: None,
            transparent,
        }
    }

    pub fn ensure_data(&mut self) -> Result<(), ErrorWithBacktrace> {
        if self.rgb_frame.is_some() {
            return Ok(());
        }

        match &self.native_frame {
            None => Err(ErrorWithBacktrace::from(std::io::Error::new(
                std::io::ErrorKind::Other,
                "has neither native nor rgb frame",
            ))),
            Some(frame) => {
                let bitmap = scale_and_make_bitmap(&frame, self.transparent)?;
                self.rgb_frame = Some(RgbFrame { data: bitmap });
                self.native_frame = None;
                Ok(())
            }
        }
    }

    pub fn get_data(&self) -> Result<Vec<u8>, ErrorWithBacktrace> {
        match self.rgb_frame {
            None => Err(ErrorWithBacktrace::from(std::io::Error::new(
                std::io::ErrorKind::Other,
                "has neither native nor rgb frame",
            ))),
            Some(ref frame) => Ok(frame.data.clone()),
        }
    }

    pub fn get_size(&self) -> u128 {
        let mut size: u128 = 0;
        match self.rgb_frame {
            None => {}
            Some(ref frame) => {
                size += frame.data.len() as u128;
            }
        }
        match self.native_frame {
            None => {}
            Some(ref frame) => {
                for plane in &frame.planes {
                    size += plane.len() as u128;
                }
            }
        }

        size
    }
}

pub fn create_bmp_image_from_frame(
    rgb_frame: &[u8],
    width: u32,
    height: u32,
    stride: usize,
) -> Vec<u8> {
    let row_size = (width * 3 + 3) & !3;
    let row_padding = row_size - width * 3;
    let image_size = row_size * height;
    let header_size = 54;

    let mut bmp_data = Vec::with_capacity(header_size as usize + image_size as usize);

    bmp_data.extend_from_slice(b"BM");
    bmp_data.extend(&(header_size + image_size).to_le_bytes());
    bmp_data.extend(&0u16.to_le_bytes());
    bmp_data.extend(&0u16.to_le_bytes());
    bmp_data.extend(&header_size.to_le_bytes());

    bmp_data.extend(&40u32.to_le_bytes());
    bmp_data.extend(&width.to_le_bytes());
    bmp_data.extend(&height.to_le_bytes());
    bmp_data.extend(&1u16.to_le_bytes());
    bmp_data.extend(&24u16.to_le_bytes());
    bmp_data.extend(&0u32.to_le_bytes());
    bmp_data.extend(&image_size.to_le_bytes());
    bmp_data.extend(&2835u32.to_le_bytes());
    bmp_data.extend(&2835u32.to_le_bytes());
    bmp_data.extend(&0u32.to_le_bytes());
    bmp_data.extend(&0u32.to_le_bytes());

    for y in (0..height).rev() {
        let row_start = (y as usize) * stride;
        let row_end = row_start + (width * 3) as usize;
        bmp_data.extend_from_slice(&rgb_frame[row_start..row_end]);
        for _ in 0..row_padding {
            bmp_data.push(0);
        }
    }

    bmp_data
}

pub fn scale_and_make_bitmap(
    native_frame: &NotRgbFrame,
    transparent: bool,
) -> Result<Vec<u8>, ErrorWithBacktrace> {
    let format: Pixel = match transparent {
        true => Pixel::RGBA,
        false => Pixel::BGR24,
    };

    let mut scaler = Context::get(
        native_frame.format,
        native_frame.original_width,
        native_frame.original_height,
        format,
        native_frame.scaled_width,
        native_frame.scaled_height,
        Flags::FAST_BILINEAR | Flags::FULL_CHR_H_INT | Flags::ACCURATE_RND,
    )?;

    scaler.set_colorspace_details(
        native_frame.space,
        native_frame.range,
        Range::MPEG,
        0,
        1 << 16,
        1 << 16,
    )?;

    let mut data: Vec<*const u8> = Vec::with_capacity(native_frame.planes.len());

    for i in 0..native_frame.planes.len() {
        let ptr: *const u8 = native_frame.planes[i].as_ptr();
        data.push(ptr);
    }

    let ptr = data.as_ptr();

    let mut scaled = Video::empty();
    scaler.run(
        native_frame.format,
        native_frame.original_width,
        native_frame.original_height,
        ptr,
        native_frame.linesizes.as_ptr(),
        &mut scaled,
    )?;

    let (rotated, rotated_width, rotated_height, stride) = match native_frame.rotate {
        Rotate::Rotate90 => rotate_90(
            scaled.data(0),
            native_frame.scaled_width,
            native_frame.scaled_height,
            scaled.stride(0),
        ),
        Rotate::Rotate180 => rotate_180(
            scaled.data(0),
            native_frame.scaled_width,
            native_frame.scaled_height,
            scaled.stride(0),
        ),
        Rotate::Rotate270 => rotate_270(
            scaled.data(0),
            native_frame.scaled_width,
            native_frame.scaled_height,
            scaled.stride(0),
        ),
        Rotate::Rotate0 => (
            scaled.data(0).to_vec(),
            native_frame.scaled_width,
            native_frame.scaled_height,
            scaled.stride(0),
        ),
    };

    if transparent {
        let is_transparent_pixel_format = native_frame.format == Pixel::YUVA420P
            || native_frame.format == Pixel::YUVA444P10LE
            || native_frame.format == Pixel::YUVA444P12LE;

        if is_transparent_pixel_format {
            return get_png_data(&rotated, rotated_width, rotated_height);
        } else {
            _print_verbose(&format!(
                "Requested transparent image, but the video {} is not transparent (pixel format {:?}). Returning BMP.",
                native_frame.original_src,
                native_frame.format
            ))?;
            return Ok(create_bmp_image_from_frame(
                &rotated,
                rotated_width,
                rotated_height,
                stride,
            ));
        }
    }

    Ok(create_bmp_image_from_frame(
        &rotated,
        rotated_width,
        rotated_height,
        stride,
    ))
}

pub fn rotate_270(
    data: &[u8],
    width: u32,
    height: u32,
    stride: usize,
) -> (Vec<u8>, u32, u32, usize) {
    let new_stride = (height as usize * 3 + 3) & !3; // This ensures the new stride is a multiple of 4 for alignment
    let mut new_data: Vec<u8> = vec![0; new_stride * width as usize];

    for y in 0..height {
        for x in 0..width {
            let new_x = y;
            let new_y = width - x - 1;
            let new_index = (new_y * height + new_x) as usize * 3;
            let old_index = y as usize * stride + x as usize * 3;
            new_data[new_index..new_index + 3].copy_from_slice(&data[old_index..old_index + 3]);
        }
    }

    (new_data, height, width, new_stride)
}

pub fn rotate_180(
    data: &[u8],
    width: u32,
    height: u32,
    stride: usize,
) -> (Vec<u8>, u32, u32, usize) {
    let mut new_data: Vec<u8> = vec![0; stride * height as usize];

    for y in 0..height {
        for x in 0..width {
            let new_x = width - x - 1;
            let new_y = height - y - 1;
            let new_index = (new_y as usize * stride) + (new_x as usize * 3);
            let old_index = (y as usize * stride) + (x as usize * 3);
            new_data[new_index..new_index + 3].copy_from_slice(&data[old_index..old_index + 3]);
        }
    }

    (new_data, width, height, stride)
}

pub fn rotate_90(
    data: &[u8],
    width: u32,
    height: u32,
    stride: usize,
) -> (Vec<u8>, u32, u32, usize) {
    let new_stride = (height as usize * 3 + 3) & !3; // This ensures the new stride is a multiple of 4 for alignment
    let mut new_data: Vec<u8> = vec![0; new_stride * width as usize];

    for y in 0..height {
        for x in 0..width {
            let new_x = height - y - 1;
            let new_y = x;
            let new_index = (new_y as usize * new_stride) + (new_x as usize * 3);
            let old_index = (y as usize * stride) + (x as usize * 3);
            new_data[new_index..new_index + 3].copy_from_slice(&data[old_index..old_index + 3]);
        }
    }

    (new_data, height, width, new_stride)
}
