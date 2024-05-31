use std::usize;

use ffmpeg_next::{
    color,
    format::Pixel,
    frame::{self, Video},
    software::scaling::{Context, Flags},
};

use crate::{
    errors::ErrorWithBacktrace,
    global_printer::_print_verbose,
    image::get_png_data,
    tone_map::{make_tone_map_filtergraph, FilterGraph},
};

#[derive(Clone, Copy)]
pub enum Rotate {
    Rotate0,
    Rotate90,
    Rotate180,
    Rotate270,
}

pub struct NotRgbFrame {
    pub original_width: u32,
    pub original_height: u32,
    pub scaled_width: u32,
    pub scaled_height: u32,
    pub rotate: Rotate,
    pub original_src: String,
    pub unscaled_frame: Video,
    pub size: u128,
    pub tone_mapped: bool,
    pub filter_graph: FilterGraph,
    pub colorspace: color::Space,
    pub src_range: color::Range,
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
                let mut video;
                let mut planes: Vec<Vec<u8>>;
                let format: Pixel;
                let linesize: [i32; 8];
                let (mut filter, should_filter) = make_tone_map_filtergraph(frame.filter_graph)?;
                if frame.tone_mapped && should_filter {
                    video = frame::Video::empty();
                    filter
                        .get("in")
                        .unwrap()
                        .source()
                        .add(&frame.unscaled_frame)?;
                    filter.get("out").unwrap().sink().frame(&mut video)?;

                    let amount_of_planes = video.planes();

                    planes = Vec::with_capacity(amount_of_planes);
                    for i in 0..amount_of_planes {
                        let d = &video.data(i).to_vec();
                        let data = d.clone();
                        planes.push(data);
                    }
                    format = video.format();

                    linesize = unsafe { (*video.as_ptr()).linesize };
                } else {
                    let amount_of_planes = frame.unscaled_frame.planes();

                    planes = Vec::with_capacity(amount_of_planes);
                    for i in 0..amount_of_planes {
                        let d = &frame.unscaled_frame.data(i).to_vec();
                        let data = d.clone();
                        planes.push(data);
                    }
                    format = frame.unscaled_frame.format();
                    linesize = unsafe { (*frame.unscaled_frame.as_ptr()).linesize };
                }

                let bitmap =
                    scale_and_make_bitmap(&frame, planes, format, linesize, self.transparent)?;
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
            Some(ref frame) => size = frame.size,
        }

        size
    }
}

fn create_bmp_image_from_frame(rgb_frame: &[u8], width: u32, height: u32) -> Vec<u8> {
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
        let row_start = (y * width * 3) as usize;
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
    planes: Vec<Vec<u8>>,
    src_format: Pixel,
    linesize: [i32; 8],
    transparent: bool,
) -> Result<Vec<u8>, ErrorWithBacktrace> {
    let dst_format: Pixel = match transparent {
        true => Pixel::RGBA,
        false => Pixel::BGR24,
    };

    let mut scaler = Context::get(
        src_format,
        native_frame.original_width,
        native_frame.original_height,
        dst_format,
        native_frame.scaled_width,
        native_frame.scaled_height,
        Flags::BILINEAR,
    )?;

    if native_frame.colorspace == color::Space::BT709
        && native_frame.src_range == color::Range::MPEG
    {
        scaler.set_colorspace_details(
            native_frame.colorspace,
            native_frame.src_range,
            color::Range::JPEG,
            0,
            1 << 16,
            1 << 16,
        )?;
    }

    scaler.set_colorspace_details(
        native_frame.colorspace,
        native_frame.src_range,
        color::Range::JPEG,
        0,
        1 << 16,
        1 << 16,
    )?;

    let mut data: Vec<*const u8> = Vec::with_capacity(planes.len());

    for i in 0..planes.len() {
        let ptr: *const u8 = planes[i].as_ptr();
        data.push(ptr);
    }

    let ptr = data.as_ptr();

    let mut scaled = Video::empty();
    scaler.run(
        src_format,
        native_frame.original_width,
        native_frame.original_height,
        ptr,
        linesize.as_ptr(),
        &mut scaled,
    )?;

    let is_transparent_pixel_format = src_format == Pixel::YUVA420P
        || src_format == Pixel::YUVA444P10LE
        || src_format == Pixel::YUVA444P12LE;

    let channels = match is_transparent_pixel_format {
        true => 4,
        false => 3,
    } as usize;

    let (rotated, rotated_width, rotated_height) = match native_frame.rotate {
        Rotate::Rotate90 => rotate_90(
            scaled.data(0),
            native_frame.scaled_width,
            native_frame.scaled_height,
            scaled.stride(0),
            channels,
        ),
        Rotate::Rotate180 => rotate_180(
            scaled.data(0),
            native_frame.scaled_width,
            native_frame.scaled_height,
            scaled.stride(0),
            channels,
        ),
        Rotate::Rotate270 => rotate_270(
            scaled.data(0),
            native_frame.scaled_width,
            native_frame.scaled_height,
            scaled.stride(0),
            channels,
        ),
        Rotate::Rotate0 => rotate_0(
            scaled.data(0),
            native_frame.scaled_width,
            native_frame.scaled_height,
            scaled.stride(0),
            channels,
        ),
    };

    if transparent {
        if is_transparent_pixel_format {
            return get_png_data(&rotated, rotated_width, rotated_height);
        } else {
            _print_verbose(&format!(
                "Requested transparent image, but the video {} is not transparent (pixel format {:?}). Returning BMP.",
                native_frame.original_src,
                src_format
            ))?;
            return Ok(create_bmp_image_from_frame(
                &rotated,
                rotated_width,
                rotated_height,
            ));
        }
    }

    Ok(create_bmp_image_from_frame(
        &rotated,
        rotated_width,
        rotated_height,
    ))
}

pub fn rotate_270(
    data: &[u8],
    width: u32,
    height: u32,
    stride: usize,
    channels: usize,
) -> (Vec<u8>, u32, u32) {
    let new_stride = height as usize * channels;
    let mut new_data: Vec<u8> = vec![0; new_stride * width as usize];

    for y in 0..height {
        for x in 0..width {
            let new_x = y;
            let new_y = width - x - 1;
            let new_index = (new_y * height + new_x) as usize * channels;
            let old_index = y as usize * stride + x as usize * channels;
            new_data[new_index..new_index + channels]
                .copy_from_slice(&data[old_index..old_index + channels]);
        }
    }

    (new_data, height, width)
}

pub fn rotate_0(
    data: &[u8],
    width: u32,
    height: u32,
    stride: usize,
    channels: usize,
) -> (Vec<u8>, u32, u32) {
    let new_stride = width as usize * channels;
    if new_stride == stride {
        return (data.to_vec(), width, height);
    }

    let mut new_data: Vec<u8> = vec![0; new_stride * height as usize];

    for y in 0..height {
        for x in 0..width {
            let new_index = (y as usize) * (new_stride as usize) + x as usize * channels;
            let old_index = y as usize * stride + x as usize * channels;
            new_data[new_index..new_index + channels]
                .copy_from_slice(&data[old_index..old_index + channels]);
        }
    }

    (new_data, width, height)
}

pub fn rotate_180(
    data: &[u8],
    width: u32,
    height: u32,
    stride: usize,
    channels: usize,
) -> (Vec<u8>, u32, u32) {
    let new_stride = width as usize * channels;

    let mut new_data: Vec<u8> = vec![0; new_stride * height as usize];

    for y in 0..height {
        for x in 0..width {
            let new_x = width - x - 1;
            let new_y = height - y - 1;
            let new_index = (new_y as usize * new_stride) + (new_x as usize * channels);
            let old_index = (y as usize * stride) + (x as usize * channels);
            new_data[new_index..new_index + channels]
                .copy_from_slice(&data[old_index..old_index + channels]);
        }
    }

    (new_data, width, height)
}

pub fn rotate_90(
    data: &[u8],
    width: u32,
    height: u32,
    stride: usize,
    channels: usize,
) -> (Vec<u8>, u32, u32) {
    let new_stride = height as usize * channels;
    let mut new_data: Vec<u8> = vec![0; new_stride * width as usize];

    for y in 0..height {
        for x in 0..width {
            let new_x = height - y - 1;
            let new_y = x;
            let new_index = (new_y as usize * new_stride) + (new_x as usize * channels);
            let old_index = (y as usize * stride) + (x as usize * channels);
            new_data[new_index..new_index + channels]
                .copy_from_slice(&data[old_index..old_index + channels]);
        }
    }

    (new_data, height, width)
}
