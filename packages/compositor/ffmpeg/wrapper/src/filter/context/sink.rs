use super::Context;
use ffi::*;
use libc::c_int;
use {Error, Frame, Rational};

pub struct Sink<'a> {
    ctx: &'a mut Context,
}

impl<'a> Sink<'a> {
    pub unsafe fn wrap(ctx: &'a mut Context) -> Self {
        Self { ctx }
    }
}

impl<'a> Sink<'a> {
    pub fn frame(&mut self, frame: &mut Frame) -> Result<(), Error> {
        unsafe {
            match av_buffersink_get_frame(self.ctx.as_mut_ptr(), frame.as_mut_ptr()) {
                n if n >= 0 => Ok(()),
                e => Err(Error::from(e)),
            }
        }
    }

    pub fn samples(&mut self, frame: &mut Frame, samples: usize) -> Result<(), Error> {
        unsafe {
            match av_buffersink_get_samples(
                self.ctx.as_mut_ptr(),
                frame.as_mut_ptr(),
                samples as c_int,
            ) {
                n if n >= 0 => Ok(()),
                e => Err(Error::from(e)),
            }
        }
    }

    pub fn set_frame_size(&mut self, value: u32) {
        unsafe {
            av_buffersink_set_frame_size(self.ctx.as_mut_ptr(), value);
        }
    }

    pub fn time_base(&self) -> Rational {
        unsafe { av_buffersink_get_time_base(self.ctx.as_ptr()) }.into()
    }
}
