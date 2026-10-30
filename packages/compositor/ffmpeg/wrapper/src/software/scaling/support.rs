use ffi::*;
use util::format;

pub fn input(format: format::Pixel) -> bool {
    unsafe { sws_isSupportedInput(format.into()) != 0 }
}

pub fn output(format: format::Pixel) -> bool {
    unsafe { sws_isSupportedOutput(format.into()) != 0 }
}

pub fn endianness_conversion(format: format::Pixel) -> bool {
    unsafe { sws_isSupportedEndiannessConversion(format.into()) != 0 }
}
