use std::path::Path;

use std::ffi::{CStr, CString};
use std::ptr;
use std::str::from_utf8_unchecked;

use super::Flags;
use ffi::*;
use {codec, media};

pub struct Output {
    ptr: *mut AVOutputFormat,
}

impl Output {
    pub unsafe fn wrap(ptr: *mut AVOutputFormat) -> Self {
        Output { ptr }
    }

    pub unsafe fn as_ptr(&self) -> *const AVOutputFormat {
        self.ptr as *const _
    }

    pub unsafe fn as_mut_ptr(&mut self) -> *mut AVOutputFormat {
        self.ptr
    }
}

impl Output {
    pub fn name(&self) -> &str {
        unsafe { from_utf8_unchecked(CStr::from_ptr((*self.as_ptr()).name).to_bytes()) }
    }

    pub fn description(&self) -> &str {
        unsafe { from_utf8_unchecked(CStr::from_ptr((*self.as_ptr()).long_name).to_bytes()) }
    }

    pub fn extensions(&self) -> Vec<&str> {
        unsafe {
            let ptr = (*self.as_ptr()).extensions;

            if ptr.is_null() {
                Vec::new()
            } else {
                from_utf8_unchecked(CStr::from_ptr(ptr).to_bytes())
                    .split(',')
                    .collect()
            }
        }
    }

    pub fn mime_types(&self) -> Vec<&str> {
        unsafe {
            let ptr = (*self.as_ptr()).mime_type;

            if ptr.is_null() {
                Vec::new()
            } else {
                from_utf8_unchecked(CStr::from_ptr(ptr).to_bytes())
                    .split(',')
                    .collect()
            }
        }
    }

    pub fn codec<P: AsRef<Path> + ?Sized>(&self, path: &P, kind: media::Type) -> codec::Id {
        // XXX: use to_cstring when stable
        let path = CString::new(path.as_ref().as_os_str().to_str().unwrap()).unwrap();

        unsafe {
            codec::Id::from(av_guess_codec(
                self.as_ptr() as *mut _,
                ptr::null(),
                path.as_ptr(),
                ptr::null(),
                kind.into(),
            ))
        }
    }

    pub fn flags(&self) -> Flags {
        unsafe { Flags::from_bits_truncate((*self.as_ptr()).flags) }
    }
}
