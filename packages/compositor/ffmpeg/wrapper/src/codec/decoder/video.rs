use std::ops::{Deref, DerefMut};

#[cfg(not(feature = "ffmpeg_5_0"))]
use ffi::*;
use libc::c_int;

use super::{slice, Opened};
use codec::Context;
use color;
#[cfg(not(feature = "ffmpeg_5_0"))]
use frame;
use util::chroma;
use util::format;
#[cfg(not(feature = "ffmpeg_5_0"))]
use {packet, Error};
use {FieldOrder, Rational};

pub struct Video(pub Opened);

impl Video {
    #[deprecated(
        since = "4.4.0",
        note = "Underlying API avcodec_decode_video2 has been deprecated since FFmpeg 3.1; \
        consider switching to send_packet() and receive_frame()"
    )]
    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn decode<P: packet::Ref>(
        &mut self,
        packet: &P,
        out: &mut frame::Video,
    ) -> Result<bool, Error> {
        unsafe {
            let mut got: c_int = 0;

            match avcodec_decode_video2(
                self.as_mut_ptr(),
                out.as_mut_ptr(),
                &mut got,
                packet.as_ptr(),
            ) {
                e if e < 0 => Err(Error::from(e)),
                _ => Ok(got != 0),
            }
        }
    }

    pub fn width(&self) -> u32 {
        unsafe { (*self.as_ptr()).width as u32 }
    }

    pub fn height(&self) -> u32 {
        unsafe { (*self.as_ptr()).height as u32 }
    }

    pub fn format(&self) -> format::Pixel {
        unsafe { format::Pixel::from((*self.as_ptr()).pix_fmt) }
    }

    pub fn has_b_frames(&self) -> bool {
        unsafe { (*self.as_ptr()).has_b_frames != 0 }
    }

    pub fn aspect_ratio(&self) -> Rational {
        unsafe { Rational::from((*self.as_ptr()).sample_aspect_ratio) }
    }

    pub fn color_space(&self) -> color::Space {
        unsafe { color::Space::from((*self.as_ptr()).colorspace) }
    }

    pub fn color_range(&self) -> color::Range {
        unsafe { color::Range::from((*self.as_ptr()).color_range) }
    }

    pub fn color_primaries(&self) -> color::Primaries {
        unsafe { color::Primaries::from((*self.as_ptr()).color_primaries) }
    }

    pub fn color_transfer_characteristic(&self) -> color::TransferCharacteristic {
        unsafe { color::TransferCharacteristic::from((*self.as_ptr()).color_trc) }
    }

    pub fn chroma_location(&self) -> chroma::Location {
        unsafe { chroma::Location::from((*self.as_ptr()).chroma_sample_location) }
    }

    #[cfg(not(feature = "ffmpeg_7_0"))]
    pub fn set_slice_count(&mut self, value: usize) {
        unsafe {
            (*self.as_mut_ptr()).slice_count = value as c_int;
        }
    }

    pub fn set_slice_flags(&mut self, value: slice::Flags) {
        unsafe {
            (*self.as_mut_ptr()).slice_flags = value.bits();
        }
    }

    pub fn skip_top(&mut self, value: usize) {
        unsafe {
            (*self.as_mut_ptr()).skip_top = value as c_int;
        }
    }

    pub fn skip_bottom(&mut self, value: usize) {
        unsafe {
            (*self.as_mut_ptr()).skip_bottom = value as c_int;
        }
    }

    pub fn references(&self) -> usize {
        unsafe { (*self.as_ptr()).refs as usize }
    }

    pub fn set_field_order(&mut self, value: FieldOrder) {
        unsafe {
            (*self.as_mut_ptr()).field_order = value.into();
        }
    }

    // intra_matrix
    // inter_matrix

    pub fn intra_dc_precision(&self) -> u8 {
        unsafe { (*self.as_ptr()).intra_dc_precision as u8 }
    }

    pub fn max_bit_rate(&self) -> usize {
        unsafe { (*self.as_ptr()).rc_max_rate as usize }
    }
}

impl Deref for Video {
    type Target = Opened;

    fn deref(&self) -> &<Self as Deref>::Target {
        &self.0
    }
}

impl DerefMut for Video {
    fn deref_mut(&mut self) -> &mut <Self as Deref>::Target {
        &mut self.0
    }
}

impl AsRef<Context> for Video {
    fn as_ref(&self) -> &Context {
        self
    }
}

impl AsMut<Context> for Video {
    fn as_mut(&mut self) -> &mut Context {
        &mut self.0
    }
}
