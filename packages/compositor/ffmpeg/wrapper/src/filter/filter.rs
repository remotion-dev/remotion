use std::ffi::CStr;
use std::marker::PhantomData;
use std::str::from_utf8_unchecked;

use super::{Flags, Pad};
use ffi::*;

pub struct Filter {
    ptr: *mut AVFilter,
}

impl Filter {
    pub unsafe fn wrap(ptr: *mut AVFilter) -> Self {
        Filter { ptr }
    }

    pub unsafe fn as_ptr(&self) -> *const AVFilter {
        self.ptr as *const _
    }

    pub unsafe fn as_mut_ptr(&mut self) -> *mut AVFilter {
        self.ptr
    }
}

impl Filter {
    pub fn name(&self) -> &str {
        unsafe { from_utf8_unchecked(CStr::from_ptr((*self.as_ptr()).name).to_bytes()) }
    }

    pub fn description(&self) -> Option<&str> {
        unsafe {
            let ptr = (*self.as_ptr()).description;

            if ptr.is_null() {
                None
            } else {
                Some(from_utf8_unchecked(CStr::from_ptr(ptr).to_bytes()))
            }
        }
    }

    pub fn inputs(&self) -> Option<PadIter> {
        unsafe {
            let ptr = (*self.as_ptr()).inputs;

            if ptr.is_null() {
                None
            } else {
                #[cfg(not(feature = "ffmpeg_6_0"))]
                let nb_inputs = avfilter_pad_count((*self.as_ptr()).inputs) as isize;
                #[cfg(feature = "ffmpeg_6_0")]
                let nb_inputs = (*self.as_ptr()).nb_inputs as isize;

                Some(PadIter::new((*self.as_ptr()).inputs, nb_inputs))
            }
        }
    }

    pub fn outputs(&self) -> Option<PadIter> {
        unsafe {
            let ptr = (*self.as_ptr()).outputs;

            if ptr.is_null() {
                None
            } else {
                #[cfg(not(feature = "ffmpeg_6_0"))]
                let nb_outputs = avfilter_pad_count((*self.as_ptr()).outputs) as isize;
                #[cfg(feature = "ffmpeg_6_0")]
                let nb_outputs = (*self.as_ptr()).nb_outputs as isize;

                Some(PadIter::new((*self.as_ptr()).outputs, nb_outputs))
            }
        }
    }

    pub fn flags(&self) -> Flags {
        unsafe { Flags::from_bits_truncate((*self.as_ptr()).flags) }
    }
}

pub struct PadIter<'a> {
    ptr: *const AVFilterPad,
    count: isize,
    cur: isize,

    _marker: PhantomData<&'a ()>,
}

impl<'a> PadIter<'a> {
    pub fn new(ptr: *const AVFilterPad, count: isize) -> Self {
        PadIter {
            ptr,
            count,
            cur: 0,
            _marker: PhantomData,
        }
    }
}

impl<'a> Iterator for PadIter<'a> {
    type Item = Pad<'a>;

    fn next(&mut self) -> Option<Self::Item> {
        unsafe {
            if self.cur >= self.count {
                return None;
            }

            let pad = Pad::wrap(self.ptr, self.cur);
            self.cur += 1;

            Some(pad)
        }
    }
}
