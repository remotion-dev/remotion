use std::mem;
use std::ops::{Deref, DerefMut};
use std::slice;

use super::Frame;
use color;
use ffi::*;
use libc::c_int;
use picture;
use util::chroma;
use util::format;
use Rational;

#[derive(PartialEq, Eq)]
pub struct Video(Frame);

impl Video {
    #[inline(always)]
    pub unsafe fn wrap(ptr: *mut AVFrame) -> Self {
        Video(Frame::wrap(ptr))
    }

    #[inline]
    pub unsafe fn alloc(&mut self, format: format::Pixel, width: u32, height: u32) {
        self.set_format(format);
        self.set_width(width);
        self.set_height(height);

        av_frame_get_buffer(self.as_mut_ptr(), 32);
    }
}

impl Video {
    #[inline(always)]
    pub fn empty() -> Self {
        unsafe { Video(Frame::empty()) }
    }

    #[inline]
    pub fn new(format: format::Pixel, width: u32, height: u32) -> Self {
        unsafe {
            let mut frame = Video::empty();
            frame.alloc(format, width, height);

            frame
        }
    }

    #[inline]
    pub fn format(&self) -> format::Pixel {
        unsafe {
            if (*self.as_ptr()).format == -1 {
                format::Pixel::None
            } else {
                format::Pixel::from(mem::transmute::<i32, AVPixelFormat>(
                    (*self.as_ptr()).format,
                ))
            }
        }
    }

    #[inline]
    pub fn set_format(&mut self, value: format::Pixel) {
        unsafe {
            (*self.as_mut_ptr()).format = mem::transmute::<AVPixelFormat, c_int>(value.into());
        }
    }

    #[inline]
    pub fn kind(&self) -> picture::Type {
        unsafe { picture::Type::from((*self.as_ptr()).pict_type) }
    }

    #[inline]
    pub fn set_kind(&mut self, value: picture::Type) {
        unsafe {
            (*self.as_mut_ptr()).pict_type = value.into();
        }
    }

    #[inline]
    pub fn is_interlaced(&self) -> bool {
        unsafe { (*self.as_ptr()).interlaced_frame != 0 }
    }

    #[inline]
    pub fn is_top_first(&self) -> bool {
        unsafe { (*self.as_ptr()).top_field_first != 0 }
    }

    #[inline]
    pub fn has_palette_changed(&self) -> bool {
        unsafe { (*self.as_ptr()).palette_has_changed != 0 }
    }

    #[inline]
    pub fn width(&self) -> u32 {
        unsafe { (*self.as_ptr()).width as u32 }
    }

    #[inline]
    pub fn set_width(&mut self, value: u32) {
        unsafe {
            (*self.as_mut_ptr()).width = value as c_int;
        }
    }

    #[inline]
    pub fn height(&self) -> u32 {
        unsafe { (*self.as_ptr()).height as u32 }
    }

    #[inline]
    pub fn set_height(&mut self, value: u32) {
        unsafe {
            (*self.as_mut_ptr()).height = value as c_int;
        }
    }

    #[inline]
    pub fn color_space(&self) -> color::Space {
        unsafe { color::Space::from((*self.as_ptr()).colorspace) }
    }

    #[inline]
    pub fn set_color_space(&mut self, value: color::Space) {
        unsafe {
            (*self.as_mut_ptr()).colorspace = value.into();
        }
    }

    #[inline]
    pub fn color_range(&self) -> color::Range {
        unsafe { color::Range::from((*self.as_ptr()).color_range) }
    }

    #[inline]
    pub fn set_color_range(&mut self, value: color::Range) {
        unsafe {
            (*self.as_mut_ptr()).color_range = value.into();
        }
    }

    #[inline]
    pub fn color_primaries(&self) -> color::Primaries {
        unsafe { color::Primaries::from((*self.as_ptr()).color_primaries) }
    }

    #[inline]
    pub fn set_color_primaries(&mut self, value: color::Primaries) {
        unsafe {
            (*self.as_mut_ptr()).color_primaries = value.into();
        }
    }

    #[inline]
    pub fn color_transfer_characteristic(&self) -> color::TransferCharacteristic {
        unsafe { color::TransferCharacteristic::from((*self.as_ptr()).color_trc) }
    }

    #[inline]
    pub fn set_color_transfer_characteristic(&mut self, value: color::TransferCharacteristic) {
        unsafe {
            (*self.as_mut_ptr()).color_trc = value.into();
        }
    }

    #[inline]
    pub fn chroma_location(&self) -> chroma::Location {
        unsafe { chroma::Location::from((*self.as_ptr()).chroma_location) }
    }

    #[inline]
    pub fn aspect_ratio(&self) -> Rational {
        unsafe { Rational::from((*self.as_ptr()).sample_aspect_ratio) }
    }

    #[inline]
    #[cfg(not(feature = "ffmpeg_7_0"))]
    pub fn coded_number(&self) -> usize {
        unsafe { (*self.as_ptr()).coded_picture_number as usize }
    }

    #[inline]
    #[cfg(not(feature = "ffmpeg_7_0"))]
    pub fn display_number(&self) -> usize {
        unsafe { (*self.as_ptr()).display_picture_number as usize }
    }

    #[inline]
    pub fn repeat(&self) -> f64 {
        unsafe { f64::from((*self.as_ptr()).repeat_pict) }
    }

    #[inline]
    pub fn stride(&self, index: usize) -> usize {
        if index >= self.planes() {
            panic!("out of bounds");
        }

        unsafe { (*self.as_ptr()).linesize[index] as usize }
    }

    #[inline]
    pub fn planes(&self) -> usize {
        for i in 0..8 {
            unsafe {
                if (*self.as_ptr()).linesize[i] == 0 {
                    return i;
                }
            }
        }

        8
    }

    #[inline]
    pub fn plane_width(&self, index: usize) -> u32 {
        if index >= self.planes() {
            panic!("out of bounds");
        }

        // Logic taken from image_get_linesize().
        if index != 1 && index != 2 {
            return self.width();
        }

        if let Some(desc) = self.format().descriptor() {
            let s = desc.log2_chroma_w();
            (self.width() + (1 << s) - 1) >> s
        } else {
            self.width()
        }
    }

    #[inline]
    pub fn plane_height(&self, index: usize) -> u32 {
        if index >= self.planes() {
            panic!("out of bounds");
        }

        // Logic taken from av_image_fill_pointers().
        if index != 1 && index != 2 {
            return self.height();
        }

        if let Some(desc) = self.format().descriptor() {
            let s = desc.log2_chroma_h();
            (self.height() + (1 << s) - 1) >> s
        } else {
            self.height()
        }
    }

    #[inline]
    pub fn plane<T: Component>(&self, index: usize) -> &[T] {
        if index >= self.planes() {
            panic!("out of bounds");
        }

        if !<T as Component>::is_valid(self.format()) {
            panic!("unsupported type");
        }

        unsafe {
            slice::from_raw_parts(
                (*self.as_ptr()).data[index] as *const T,
                self.stride(index) * self.plane_height(index) as usize / mem::size_of::<T>(),
            )
        }
    }

    #[inline]
    pub fn plane_mut<T: Component>(&mut self, index: usize) -> &mut [T] {
        if index >= self.planes() {
            panic!("out of bounds");
        }

        if !<T as Component>::is_valid(self.format()) {
            panic!("unsupported type");
        }

        unsafe {
            slice::from_raw_parts_mut(
                (*self.as_mut_ptr()).data[index] as *mut T,
                self.stride(index) * self.plane_height(index) as usize / mem::size_of::<T>(),
            )
        }
    }

    #[inline]
    pub fn data(&self, index: usize) -> &[u8] {
        if index >= self.planes() {
            panic!("out of bounds");
        }

        unsafe {
            slice::from_raw_parts(
                (*self.as_ptr()).data[index],
                self.stride(index) * self.plane_height(index) as usize,
            )
        }
    }

    #[inline]
    pub fn data_mut(&mut self, index: usize) -> &mut [u8] {
        if index >= self.planes() {
            panic!("out of bounds");
        }

        unsafe {
            slice::from_raw_parts_mut(
                (*self.as_mut_ptr()).data[index],
                self.stride(index) * self.plane_height(index) as usize,
            )
        }
    }
}

impl Deref for Video {
    type Target = Frame;

    #[inline]
    fn deref(&self) -> &Frame {
        &self.0
    }
}

impl DerefMut for Video {
    #[inline]
    fn deref_mut(&mut self) -> &mut Frame {
        &mut self.0
    }
}

impl Clone for Video {
    #[inline]
    fn clone(&self) -> Self {
        let mut cloned = Video::new(self.format(), self.width(), self.height());
        cloned.clone_from(self);

        cloned
    }

    #[inline]
    fn clone_from(&mut self, source: &Self) {
        unsafe {
            av_frame_copy(self.as_mut_ptr(), source.as_ptr());
            av_frame_copy_props(self.as_mut_ptr(), source.as_ptr());
        }
    }
}

impl From<Frame> for Video {
    #[inline]
    fn from(frame: Frame) -> Self {
        Video(frame)
    }
}

pub unsafe trait Component {
    fn is_valid(format: format::Pixel) -> bool;
}

#[cfg(feature = "image")]
unsafe impl Component for ::image::Luma<u8> {
    #[inline(always)]
    fn is_valid(format: format::Pixel) -> bool {
        format == format::Pixel::GRAY8
    }
}

#[cfg(feature = "image")]
unsafe impl Component for ::image::Rgb<u8> {
    #[inline(always)]
    fn is_valid(format: format::Pixel) -> bool {
        format == format::Pixel::RGB24
    }
}

#[cfg(feature = "image")]
unsafe impl Component for ::image::Rgba<u8> {
    #[inline(always)]
    fn is_valid(format: format::Pixel) -> bool {
        format == format::Pixel::RGBA
    }
}

unsafe impl Component for [u8; 3] {
    #[inline(always)]
    fn is_valid(format: format::Pixel) -> bool {
        format == format::Pixel::RGB24 || format == format::Pixel::BGR24
    }
}

unsafe impl Component for (u8, u8, u8) {
    #[inline(always)]
    fn is_valid(format: format::Pixel) -> bool {
        format == format::Pixel::RGB24 || format == format::Pixel::BGR24
    }
}

unsafe impl Component for [u8; 4] {
    #[inline(always)]
    fn is_valid(format: format::Pixel) -> bool {
        format == format::Pixel::RGBA
            || format == format::Pixel::BGRA
            || format == format::Pixel::ARGB
            || format == format::Pixel::ABGR
            || format == format::Pixel::RGBZ
            || format == format::Pixel::BGRZ
            || format == format::Pixel::ZRGB
            || format == format::Pixel::ZBGR
    }
}

unsafe impl Component for (u8, u8, u8, u8) {
    #[inline(always)]
    fn is_valid(format: format::Pixel) -> bool {
        format == format::Pixel::RGBA
            || format == format::Pixel::BGRA
            || format == format::Pixel::ARGB
            || format == format::Pixel::ABGR
            || format == format::Pixel::RGBZ
            || format == format::Pixel::BGRZ
            || format == format::Pixel::ZRGB
            || format == format::Pixel::ZBGR
    }
}
