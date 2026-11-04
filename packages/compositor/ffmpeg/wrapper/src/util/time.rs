use ffi::*;
use Error;

#[inline(always)]
pub fn current() -> i64 {
    unsafe { av_gettime() }
}

#[inline(always)]
pub fn relative() -> i64 {
    unsafe { av_gettime_relative() }
}

#[inline(always)]
pub fn is_monotonic() -> bool {
    unsafe { av_gettime_relative_is_monotonic() != 0 }
}

#[inline(always)]
pub fn sleep(usec: u32) -> Result<(), Error> {
    unsafe {
        match av_usleep(usec) {
            0 => Ok(()),
            e => Err(Error::from(e)),
        }
    }
}
