pub mod level;
pub use self::level::Level;
use std::ffi::CString;
pub mod flag;
pub use self::flag::Flags;
use std::os::raw::c_char;

use ffi::*;
use std::convert::TryInto;

const INITIAL_BUFFER_SIZE: usize = 512;

pub fn set_level(value: Level) {
    unsafe { av_log_set_level(value.into()) }
}

pub fn get_level() -> Result<Level, &'static str> {
    unsafe { av_log_get_level().try_into() }
}

pub fn set_flags(value: Flags) {
    unsafe { av_log_set_flags(value.bits()) }
}

pub fn get_flags() -> Flags {
    unsafe { Flags::from_bits_truncate(av_log_get_flags()) }
}

pub fn set_callback(
    callback: ::std::option::Option<
        unsafe extern "C" fn(
            arg1: *mut libc::c_void,
            arg2: libc::c_int,
            arg3: *const libc::c_char,
            arg4: VaListLoggerArg,
        ),
    >,
) {
    unsafe {
        av_log_set_callback(callback);
    }
}

#[cfg(all(target_arch = "aarch64", target_os = "macos"))]
pub type VaListLoggerArg = __builtin_va_list;

#[cfg(all(target_arch = "x86_64", target_os = "macos"))]
pub type VaListLoggerArg = *mut __va_list_tag;

#[cfg(all(target_arch = "x86_64", target_os = "linux"))]
pub type VaListLoggerArg = *mut __va_list_tag;

#[cfg(all(target_arch = "aarch64", target_os = "linux"))]
pub type VaListLoggerArg = va_list;

#[cfg(target_os = "windows")]
pub type VaListLoggerArg = va_list;

pub unsafe fn make_log_message(
    fmt: *const c_char,
    list: VaListLoggerArg,
) -> Result<String, std::io::Error> {
    let mut buffer = Vec::with_capacity(INITIAL_BUFFER_SIZE);
    buffer.resize(INITIAL_BUFFER_SIZE, 0 as c_char);

    #[cfg(target_os = "windows")]
    let result = vsnprintf_s(buffer.as_mut_ptr(), buffer.len(), 1000, fmt, list);
    #[cfg(not(target_os = "windows"))]
    let result = vsnprintf(buffer.as_mut_ptr(), buffer.len() as u64, fmt, list);

    if result >= 0 {
        let len = result as usize;
        if len > buffer.capacity() {
            buffer.reserve(len - buffer.capacity());
            #[cfg(target_os = "windows")]
            let result = vsnprintf_s(buffer.as_mut_ptr(), buffer.len(), 1000, fmt, list);
            #[cfg(not(target_os = "windows"))]
            let result = vsnprintf(buffer.as_mut_ptr(), buffer.len() as u64, fmt, list);

            if result < 0 {
                let err = std::io::Error::new(std::io::ErrorKind::Other, "prevented overflow");
                Err::<String, std::io::Error>(err)?;
            }
        }
        buffer.set_len(len);
        let cstring = CString::from_vec_unchecked(buffer.iter().map(|&x| x as u8).collect());
        let log_message = cstring.to_string_lossy().into_owned();
        Ok(log_message)
    } else {
        Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            "vsnprintf failed",
        ))
    }
}
