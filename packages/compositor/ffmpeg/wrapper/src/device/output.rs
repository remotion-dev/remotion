use std::ptr;

use ffi::*;
use format;
use Format;

pub struct AudioIter(*mut AVOutputFormat);

impl Iterator for AudioIter {
    type Item = Format;

    fn next(&mut self) -> Option<<Self as Iterator>::Item> {
        unsafe {
            // We get a clippy warning in 4.4 but not in 5.0 and newer, so we allow that cast to not complicate the code
            #[allow(clippy::unnecessary_cast)]
            let ptr = av_output_audio_device_next(self.0) as *mut AVOutputFormat;

            if ptr.is_null() && !self.0.is_null() {
                None
            } else {
                self.0 = ptr;

                Some(Format::Output(format::Output::wrap(ptr)))
            }
        }
    }
}

pub fn audio() -> AudioIter {
    AudioIter(ptr::null_mut())
}

pub struct VideoIter(*mut AVOutputFormat);

impl Iterator for VideoIter {
    type Item = Format;

    fn next(&mut self) -> Option<<Self as Iterator>::Item> {
        unsafe {
            // We get a clippy warning in 4.4 but not in 5.0 and newer, so we allow that cast to not complicate the code
            #[allow(clippy::unnecessary_cast)]
            let ptr = av_output_video_device_next(self.0) as *mut AVOutputFormat;

            if ptr.is_null() && !self.0.is_null() {
                None
            } else {
                self.0 = ptr;

                Some(Format::Output(format::Output::wrap(ptr)))
            }
        }
    }
}

pub fn video() -> VideoIter {
    VideoIter(ptr::null_mut())
}
