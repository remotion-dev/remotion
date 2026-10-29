pub mod flag;
pub use self::flag::Flags;

pub mod color_space;
pub use self::color_space::ColorSpace;

pub mod support;

pub mod vector;
pub use self::vector::Vector;

pub mod filter;
pub use self::filter::Filter;

pub mod context;
pub use self::context::Context;

mod extensions;

use std::ffi::CStr;
use std::str::from_utf8_unchecked;

use ffi::*;

pub fn version() -> u32 {
    unsafe { swscale_version() }
}

pub fn configuration() -> &'static str {
    unsafe { from_utf8_unchecked(CStr::from_ptr(swscale_configuration()).to_bytes()) }
}

pub fn license() -> &'static str {
    unsafe { from_utf8_unchecked(CStr::from_ptr(swscale_license()).to_bytes()) }
}
