use std::os::raw::{c_char, c_int, c_void};

use ffmpeg_next::log::VaListLoggerArg;

use crate::global_printer::{_print_debug, _print_verbose};

pub unsafe extern "C" fn log_callback(
    _arg1: *mut c_void,
    level: c_int,
    fmt: *const c_char,
    list: VaListLoggerArg,
) {
    let message = ffmpeg_next::log::make_log_message(fmt, list).unwrap();

    // Warning that we cannot do much about
    if message.contains("No accelerated colorspace conversion found") {
        return;
    }

    // libvpx logs this
    if message.trim() == "v1.12.0" {
        return;
    }

    // libvpx on windows logs this
    if message.trim() == "v1.13.0" {
        return;
    }

    if level <= ffmpeg_next::log::Level::Info.into() {
        _print_debug(&format!("[FFmpeg] {}", message)).unwrap();
    } else if level <= ffmpeg_next::log::Level::Verbose.into() {
        _print_verbose(&format!("[FFmpeg] {}", message)).unwrap();
    }
}
