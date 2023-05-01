use std::os::raw::{c_char, c_int, c_void};

use ffmpeg_next::log::VaListLoggerArg;

pub unsafe extern "C" fn log_callback(
    _arg1: *mut c_void,
    level: c_int,
    fmt: *const c_char,
    list: VaListLoggerArg,
) {
    let message = ffmpeg_next::log::make_log_message(fmt, list);

    println!("Level {}: {}", level, message.unwrap());
}
