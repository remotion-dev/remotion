use ffmpeg_next::{
    format::Pixel,
    frame::Video,
    software::scaling::{Context, Flags},
};

use crate::{
    errors::{self, PossibleErrors},
    global_printer::_print_debug,
    image::get_png_data,
};

pub struct NotRgbFrame {
    pub planes: Vec<Vec<u8>>,
    pub linesizes: [i32; 8],
    pub format: Pixel,
    pub original_width: u32,
    pub original_height: u32,
    pub scaled_width: u32,
    pub scaled_height: u32,
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

    pub fn ensure_data(&mut self) -> Result<(), PossibleErrors> {
        if self.rgb_frame.is_some() {
            return Ok(());
        }

        if self.native_frame.is_none() {
            return Err(errors::PossibleErrors::IoError(std::io::Error::new(
                std::io::ErrorKind::Other,
                "has neither native nor rgb frame",
            )));
        }

        let bitmap = scale_and_make_bitmap(&self.native_frame.as_ref().unwrap(), self.transparent)?;
        self.rgb_frame = Some(RgbFrame { data: bitmap });
        self.native_frame = None;
        Ok(())
    }

    pub fn get_data(&self) -> Result<Vec<u8>, PossibleErrors> {
        if self.rgb_frame.is_none() {
            return Err(errors::PossibleErrors::IoError(std::io::Error::new(
                std::io::ErrorKind::Other,
                "has neither native nor rgb frame",
            )));
        }

        return Ok(self.rgb_frame.as_ref().unwrap().data.clone());
    }
}

fn create_bmp_image_from_frame(rgb_frame: &mut Video) -> Vec<u8> {
    let width = rgb_frame.width() as u32;
    let height = rgb_frame.height() as u32;
    let row_size = (width * 3 + 3) & !3;
    let row_padding = row_size - width * 3;
    let image_size = row_size * height;
    let header_size = 54;
    let stride = rgb_frame.stride(0);

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
        bmp_data.extend_from_slice(&rgb_frame.data(0)[row_start..row_end]);
        for _ in 0..row_padding {
            bmp_data.push(0);
        }
    }

    bmp_data
}

pub fn scale_and_make_bitmap(
    native_frame: &NotRgbFrame,
    transparent: bool,
) -> Result<Vec<u8>, PossibleErrors> {
    let format: Pixel = match transparent {
        true => Pixel::RGBA,
        false => Pixel::BGR24,
    };

    _print_debug(&format!("Scaling frame to {:?}", native_frame.format));

    let mut scaler = Context::get(
        native_frame,
        native_frame.original_width,
        native_frame.original_height,
        format,
        native_frame.scaled_width,
        native_frame.scaled_height,
        Flags::BILINEAR,
    )?;

    let mut data: Vec<*const u8> = Vec::with_capacity(native_frame.planes.len());

    for inner in native_frame.planes.clone() {
        let ptr: *const u8 = inner.as_ptr();
        std::mem::forget(inner);
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

    for inner in native_frame.planes.clone() {
        std::mem::drop(inner);
    }

    if transparent {
        return Ok(get_png_data(
            scaled.data(0),
            native_frame.scaled_width,
            native_frame.scaled_height,
        ));
    }

    Ok(create_bmp_image_from_frame(&mut scaled))
}
