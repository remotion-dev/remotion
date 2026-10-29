use std::convert::TryFrom;

use ffi::*;
use libc::c_int;

#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum Level {
    Quiet,
    Panic,
    Fatal,
    Error,
    Warning,
    Info,
    Verbose,
    Debug,
    Trace,
}

pub struct LevelError;

impl TryFrom<c_int> for Level {
    type Error = &'static str;

    fn try_from(value: c_int) -> Result<Self, &'static str> {
        match value {
            AV_LOG_QUIET => Ok(Level::Quiet),
            AV_LOG_PANIC => Ok(Level::Panic),
            AV_LOG_FATAL => Ok(Level::Fatal),
            AV_LOG_ERROR => Ok(Level::Error),
            AV_LOG_WARNING => Ok(Level::Warning),
            AV_LOG_INFO => Ok(Level::Info),
            AV_LOG_VERBOSE => Ok(Level::Verbose),
            AV_LOG_DEBUG => Ok(Level::Debug),
            AV_LOG_TRACE => Ok(Level::Trace),
            _ => Err("illegal log level"),
        }
    }
}

impl From<Level> for c_int {
    fn from(value: Level) -> c_int {
        match value {
            Level::Quiet => AV_LOG_QUIET,
            Level::Panic => AV_LOG_PANIC,
            Level::Fatal => AV_LOG_FATAL,
            Level::Error => AV_LOG_ERROR,
            Level::Warning => AV_LOG_WARNING,
            Level::Info => AV_LOG_INFO,
            Level::Verbose => AV_LOG_VERBOSE,
            Level::Debug => AV_LOG_DEBUG,
            Level::Trace => AV_LOG_TRACE,
        }
    }
}
