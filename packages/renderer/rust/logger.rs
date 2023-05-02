use std::os::raw::{c_char, c_int, c_void};

use ffmpeg_next::log::VaListLoggerArg;

use crate::global_printer::_print_debug;

pub unsafe extern "C" fn log_callback(
    _arg1: *mut c_void,
    level: c_int,
    fmt: *const c_char,
    list: VaListLoggerArg,
) {
    let message = ffmpeg_next::log::make_log_message(fmt, list);

    if level <= ffmpeg_next::log::Level::Info.into() {
        _print_debug(&format!("[FFmpeg] {}", message.unwrap())).unwrap();
    }
}
