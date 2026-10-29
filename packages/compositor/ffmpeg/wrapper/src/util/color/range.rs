use std::ffi::CStr;
use std::str::from_utf8_unchecked;

use ffi::AVColorRange::*;
use ffi::*;

#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum Range {
    Unspecified,
    MPEG,
    JPEG,
}

impl Range {
    pub fn name(&self) -> Option<&'static str> {
        if *self == Range::Unspecified {
            return None;
        }
        unsafe {
            let ptr = av_color_range_name((*self).into());
            ptr.as_ref()
                .map(|ptr| from_utf8_unchecked(CStr::from_ptr(ptr).to_bytes()))
        }
    }
}

impl From<AVColorRange> for Range {
    fn from(value: AVColorRange) -> Self {
        match value {
            AVCOL_RANGE_UNSPECIFIED => Range::Unspecified,
            AVCOL_RANGE_MPEG => Range::MPEG,
            AVCOL_RANGE_JPEG => Range::JPEG,
            AVCOL_RANGE_NB => Range::Unspecified,
        }
    }
}

impl From<Range> for AVColorRange {
    fn from(value: Range) -> AVColorRange {
        match value {
            Range::Unspecified => AVCOL_RANGE_UNSPECIFIED,
            Range::MPEG => AVCOL_RANGE_MPEG,
            Range::JPEG => AVCOL_RANGE_JPEG,
        }
    }
}
