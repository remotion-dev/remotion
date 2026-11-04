pub mod flag;
pub use self::flag::Flags;

pub mod dither;
pub use self::dither::Dither;

pub mod engine;
pub use self::engine::Engine;

pub mod filter;
pub use self::filter::Filter;

pub mod delay;
pub use self::delay::Delay;

pub mod context;
pub use self::context::Context;

mod extensions;

use std::ffi::CStr;
use std::str::from_utf8_unchecked;

use ffi::*;

pub fn version() -> u32 {
    unsafe { swresample_version() }
}

pub fn configuration() -> &'static str {
    unsafe { from_utf8_unchecked(CStr::from_ptr(swresample_configuration()).to_bytes()) }
}

pub fn license() -> &'static str {
    unsafe { from_utf8_unchecked(CStr::from_ptr(swresample_license()).to_bytes()) }
}
