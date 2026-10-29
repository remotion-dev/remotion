use ffi::*;
use libc::c_int;

#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub struct Config {
    pub kind: Type,
    pub count: usize,
    #[cfg(not(feature = "ffmpeg_6_0"))]
    pub safe: bool,
}

impl Config {
    pub fn kind(value: Type) -> Self {
        Config {
            kind: value,
            ..Default::default()
        }
    }

    pub fn count(value: usize) -> Self {
        Config {
            count: value,
            ..Default::default()
        }
    }

    #[cfg(not(feature = "ffmpeg_6_0"))]
    pub fn safe(value: bool) -> Self {
        Config {
            safe: value,
            ..Default::default()
        }
    }
}

impl Default for Config {
    fn default() -> Self {
        Config {
            kind: Type::None,
            count: 0,
            #[cfg(not(feature = "ffmpeg_6_0"))]
            safe: false,
        }
    }
}

#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum Type {
    None,
    Frame,
    Slice,
}

impl From<c_int> for Type {
    fn from(value: c_int) -> Type {
        match value {
            FF_THREAD_FRAME => Type::Frame,
            FF_THREAD_SLICE => Type::Slice,

            _ => Type::None,
        }
    }
}

impl From<Type> for c_int {
    fn from(value: Type) -> c_int {
        match value {
            Type::None => 0,
            Type::Frame => FF_THREAD_FRAME,
            Type::Slice => FF_THREAD_SLICE,
        }
    }
}
