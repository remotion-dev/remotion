use std::ops::{Deref, DerefMut};
use std::ptr;

use ffi::*;
use libc::{c_float, c_int};

use super::Encoder as Super;
use super::{Comparison, Decision};
#[cfg(not(feature = "ffmpeg_5_0"))]
use super::{MotionEstimation, Prediction};
use codec::{traits, Context};
use {color, format, Dictionary, Error, Rational};
#[cfg(not(feature = "ffmpeg_5_0"))]
use {frame, packet};

pub struct Video(pub Super);

impl Video {
    #[inline]
    pub fn open(mut self) -> Result<Encoder, Error> {
        unsafe {
            match avcodec_open2(self.as_mut_ptr(), ptr::null(), ptr::null_mut()) {
                0 => Ok(Encoder(self)),
                e => Err(Error::from(e)),
            }
        }
    }

    #[inline]
    pub fn open_as<E: traits::Encoder>(mut self, codec: E) -> Result<Encoder, Error> {
        unsafe {
            if let Some(codec) = codec.encoder() {
                match avcodec_open2(self.as_mut_ptr(), codec.as_ptr(), ptr::null_mut()) {
                    0 => Ok(Encoder(self)),
                    e => Err(Error::from(e)),
                }
            } else {
                Err(Error::EncoderNotFound)
            }
        }
    }

    #[inline]
    pub fn open_with(mut self, options: Dictionary) -> Result<Encoder, Error> {
        unsafe {
            let mut opts = options.disown();
            let res = avcodec_open2(self.as_mut_ptr(), ptr::null(), &mut opts);

            Dictionary::own(opts);

            match res {
                0 => Ok(Encoder(self)),
                e => Err(Error::from(e)),
            }
        }
    }

    #[inline]
    pub fn open_as_with<E: traits::Encoder>(
        mut self,
        codec: E,
        options: Dictionary,
    ) -> Result<Encoder, Error> {
        unsafe {
            if let Some(codec) = codec.encoder() {
                let mut opts = options.disown();
                let res = avcodec_open2(self.as_mut_ptr(), codec.as_ptr(), &mut opts);

                Dictionary::own(opts);

                match res {
                    0 => Ok(Encoder(self)),
                    e => Err(Error::from(e)),
                }
            } else {
                Err(Error::EncoderNotFound)
            }
        }
    }

    #[inline]
    pub fn set_width(&mut self, value: u32) {
        unsafe {
            (*self.as_mut_ptr()).width = value as c_int;
        }
    }

    #[inline]
    pub fn width(&self) -> u32 {
        unsafe { (*self.as_ptr()).width as u32 }
    }

    #[inline]
    pub fn set_height(&mut self, value: u32) {
        unsafe {
            (*self.as_mut_ptr()).height = value as c_int;
        }
    }

    #[inline]
    pub fn height(&self) -> u32 {
        unsafe { (*self.as_ptr()).height as u32 }
    }

    #[inline]
    pub fn set_gop(&mut self, value: u32) {
        unsafe {
            (*self.as_mut_ptr()).gop_size = value as c_int;
        }
    }

    #[inline]
    pub fn set_format(&mut self, value: format::Pixel) {
        unsafe {
            (*self.as_mut_ptr()).pix_fmt = value.into();
        }
    }

    #[inline]
    pub fn format(&self) -> format::Pixel {
        unsafe { format::Pixel::from((*self.as_ptr()).pix_fmt) }
    }

    #[inline]
    #[cfg(feature = "ff_api_motion_est")]
    pub fn set_motion_estimation(&mut self, value: MotionEstimation) {
        unsafe {
            (*self.as_mut_ptr()).me_method = value.into();
        }
    }

    #[inline]
    pub fn set_max_b_frames(&mut self, value: usize) {
        unsafe {
            (*self.as_mut_ptr()).max_b_frames = value as c_int;
        }
    }

    #[inline]
    pub fn set_b_quant_factor(&mut self, value: f32) {
        unsafe {
            (*self.as_mut_ptr()).b_quant_factor = value as c_float;
        }
    }

    #[inline]
    pub fn set_b_quant_offset(&mut self, value: f32) {
        unsafe {
            (*self.as_mut_ptr()).b_quant_offset = value as c_float;
        }
    }

    #[inline]
    pub fn set_i_quant_factor(&mut self, value: f32) {
        unsafe {
            (*self.as_mut_ptr()).i_quant_factor = value as c_float;
        }
    }

    #[inline]
    pub fn set_i_quant_offset(&mut self, value: f32) {
        unsafe {
            (*self.as_mut_ptr()).i_quant_offset = value as c_float;
        }
    }

    #[inline]
    pub fn set_lumi_masking(&mut self, value: f32) {
        unsafe {
            (*self.as_mut_ptr()).lumi_masking = value as c_float;
        }
    }

    #[inline]
    pub fn set_temporal_cplx_masking(&mut self, value: f32) {
        unsafe {
            (*self.as_mut_ptr()).temporal_cplx_masking = value as c_float;
        }
    }

    #[inline]
    pub fn set_spatial_cplx_masking(&mut self, value: f32) {
        unsafe {
            (*self.as_mut_ptr()).spatial_cplx_masking = value as c_float;
        }
    }

    #[inline]
    pub fn set_p_masking(&mut self, value: f32) {
        unsafe {
            (*self.as_mut_ptr()).p_masking = value as c_float;
        }
    }

    #[inline]
    pub fn set_dark_masking(&mut self, value: f32) {
        unsafe {
            (*self.as_mut_ptr()).dark_masking = value as c_float;
        }
    }

    #[inline]
    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn set_prediction(&mut self, value: Prediction) {
        unsafe {
            (*self.as_mut_ptr()).prediction_method = value.into();
        }
    }

    #[inline]
    pub fn set_aspect_ratio<R: Into<Rational>>(&mut self, value: R) {
        unsafe {
            (*self.as_mut_ptr()).sample_aspect_ratio = value.into().into();
        }
    }

    #[inline]
    pub fn set_me_comparison(&mut self, value: Comparison) {
        unsafe {
            (*self.as_mut_ptr()).me_cmp = value.into();
        }
    }

    #[inline]
    pub fn set_me_sub_comparison(&mut self, value: Comparison) {
        unsafe {
            (*self.as_mut_ptr()).me_sub_cmp = value.into();
        }
    }

    #[inline]
    pub fn set_mb_comparison(&mut self, value: Comparison) {
        unsafe {
            (*self.as_mut_ptr()).mb_cmp = value.into();
        }
    }

    #[inline]
    pub fn set_ildct_comparison(&mut self, value: Comparison) {
        unsafe {
            (*self.as_mut_ptr()).ildct_cmp = value.into();
        }
    }

    #[inline]
    pub fn set_dia_size(&mut self, value: usize) {
        unsafe {
            (*self.as_mut_ptr()).dia_size = value as c_int;
        }
    }

    #[inline]
    pub fn set_last_predictors(&mut self, value: usize) {
        unsafe {
            (*self.as_mut_ptr()).last_predictor_count = value as c_int;
        }
    }

    #[inline]
    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn set_pre_me(&mut self, value: MotionEstimation) {
        unsafe {
            (*self.as_mut_ptr()).pre_me = value.into();
        }
    }

    #[inline]
    pub fn set_me_pre_comparison(&mut self, value: Comparison) {
        unsafe {
            (*self.as_mut_ptr()).me_pre_cmp = value.into();
        }
    }

    #[inline]
    pub fn set_pre_dia_size(&mut self, value: usize) {
        unsafe {
            (*self.as_mut_ptr()).pre_dia_size = value as c_int;
        }
    }

    #[inline]
    pub fn set_me_subpel_quality(&mut self, value: usize) {
        unsafe {
            (*self.as_mut_ptr()).me_subpel_quality = value as c_int;
        }
    }

    #[inline]
    pub fn set_me_range(&mut self, value: usize) {
        unsafe {
            (*self.as_mut_ptr()).me_range = value as c_int;
        }
    }

    #[inline]
    #[cfg(feature = "ff_api_quant_bias")]
    pub fn set_intra_quant_bias(&mut self, value: Option<usize>) {
        unsafe {
            if let Some(value) = value {
                (*self.as_mut_ptr()).intra_quant_bias = value as c_int;
            } else {
                (*self.as_mut_ptr()).intra_quant_bias = FF_DEFAULT_QUANT_BIAS;
            }
        }
    }

    #[inline]
    #[cfg(feature = "ff_api_quant_bias")]
    pub fn set_inter_quant_bias(&mut self, value: Option<usize>) {
        unsafe {
            if let Some(value) = value {
                (*self.as_mut_ptr()).inter_quant_bias = value as c_int;
            } else {
                (*self.as_mut_ptr()).inter_quant_bias = FF_DEFAULT_QUANT_BIAS;
            }
        }
    }

    #[inline]
    pub fn set_mb_decision(&mut self, value: Decision) {
        unsafe {
            (*self.as_mut_ptr()).mb_decision = value.into();
        }
    }

    #[inline]
    pub fn set_mb_lmin(&mut self, value: i32) {
        unsafe {
            (*self.as_mut_ptr()).mb_lmin = value as c_int;
        }
    }

    #[inline]
    pub fn set_mb_lmax(&mut self, value: i32) {
        unsafe {
            (*self.as_mut_ptr()).mb_lmax = value as c_int;
        }
    }

    #[inline]
    pub fn set_intra_dc_precision(&mut self, value: u8) {
        unsafe {
            (*self.as_mut_ptr()).intra_dc_precision = i32::from(value);
        }
    }

    #[inline]
    pub fn set_qmin(&mut self, value: i32) {
        unsafe {
            (*self.as_mut_ptr()).qmin = value as c_int;
        }
    }

    #[inline]
    pub fn set_qmax(&mut self, value: i32) {
        unsafe {
            (*self.as_mut_ptr()).qmax = value as c_int;
        }
    }

    #[inline]
    pub fn set_global_quality(&mut self, value: i32) {
        unsafe {
            (*self.as_mut_ptr()).global_quality = value as c_int;
        }
    }

    #[inline]
    pub fn set_colorspace(&mut self, value: color::Space) {
        unsafe {
            (*self.as_mut_ptr()).colorspace = value.into();
        }
    }

    #[inline]
    pub fn colorspace(&self) -> color::Space {
        unsafe { (*self.as_ptr()).colorspace.into() }
    }

    #[inline]
    pub fn set_color_range(&mut self, value: color::Range) {
        unsafe {
            (*self.as_mut_ptr()).color_range = value.into();
        }
    }

    #[inline]
    pub fn color_range(&self) -> color::Range {
        unsafe { (*self.as_ptr()).color_range.into() }
    }
}

impl Deref for Video {
    type Target = Super;

    #[inline(always)]
    fn deref(&self) -> &<Self as Deref>::Target {
        &self.0
    }
}

impl DerefMut for Video {
    #[inline(always)]
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

pub struct Encoder(pub Video);

impl Encoder {
    #[deprecated(
        since = "4.4.0",
        note = "Underlying API avcodec_encode_video2 has been deprecated since FFmpeg 3.1; \
        consider switching to send_frame() and receive_packet()"
    )]
    #[inline]
    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn encode<P: packet::Mut>(
        &mut self,
        frame: &frame::Video,
        out: &mut P,
    ) -> Result<bool, Error> {
        unsafe {
            if self.format() != frame.format()
                || self.width() != frame.width()
                || self.height() != frame.height()
            {
                return Err(Error::InvalidData);
            }

            let mut got: c_int = 0;

            match avcodec_encode_video2(
                self.0.as_mut_ptr(),
                out.as_mut_ptr(),
                frame.as_ptr(),
                &mut got,
            ) {
                e if e < 0 => Err(Error::from(e)),
                _ => Ok(got != 0),
            }
        }
    }

    #[deprecated(
        since = "4.4.0",
        note = "Underlying API avcodec_encode_video2 has been deprecated since FFmpeg 3.1; \
        consider switching to send_frame() and receive_packet()"
    )]
    #[inline]
    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn flush<P: packet::Mut>(&mut self, out: &mut P) -> Result<bool, Error> {
        unsafe {
            let mut got: c_int = 0;

            match avcodec_encode_video2(
                self.0.as_mut_ptr(),
                out.as_mut_ptr(),
                ptr::null(),
                &mut got,
            ) {
                e if e < 0 => Err(Error::from(e)),
                _ => Ok(got != 0),
            }
        }
    }

    #[inline]
    pub fn frame_size(&self) -> u32 {
        unsafe { (*self.as_ptr()).frame_size as u32 }
    }
}

impl Deref for Encoder {
    type Target = Video;

    #[inline]
    fn deref(&self) -> &<Self as Deref>::Target {
        &self.0
    }
}

impl DerefMut for Encoder {
    #[inline]
    fn deref_mut(&mut self) -> &mut <Self as Deref>::Target {
        &mut self.0
    }
}

impl AsRef<Context> for Encoder {
    fn as_ref(&self) -> &Context {
        self
    }
}

impl AsMut<Context> for Encoder {
    fn as_mut(&mut self) -> &mut Context {
        &mut self.0
    }
}
