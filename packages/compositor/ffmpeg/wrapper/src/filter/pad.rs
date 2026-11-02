use std::ffi::CStr;
use std::marker::PhantomData;
use std::str::from_utf8_unchecked;

use ffi::*;
use media;

pub struct Pad<'a> {
    ptr: *const AVFilterPad,
    idx: isize,

    _marker: PhantomData<&'a ()>,
}

impl<'a> Pad<'a> {
    pub unsafe fn wrap(ptr: *const AVFilterPad, idx: isize) -> Self {
        Pad {
            ptr,
            idx,
            _marker: PhantomData,
        }
    }

    pub unsafe fn as_ptr(&self) -> *const AVFilterPad {
        self.ptr
    }

    pub unsafe fn as_mut_ptr(&mut self) -> *mut AVFilterPad {
        self.ptr as *mut _
    }
}

impl<'a> Pad<'a> {
    pub fn name(&self) -> Option<&str> {
        unsafe {
            let ptr = avfilter_pad_get_name(self.ptr, self.idx as i32);

            if ptr.is_null() {
                None
            } else {
                Some(from_utf8_unchecked(CStr::from_ptr(ptr).to_bytes()))
            }
        }
    }

    pub fn medium(&self) -> media::Type {
        unsafe { media::Type::from(avfilter_pad_get_type(self.ptr, self.idx as i32)) }
    }
}
