use std::ffi::{CStr, CString};
use std::fmt;
use std::marker::PhantomData;
use std::ptr;
use std::str::from_utf8_unchecked;

use super::{Iter, Owned};
use ffi::*;

pub struct Ref<'a> {
    ptr: *const AVDictionary,

    _marker: PhantomData<&'a ()>,
}

impl<'a> Ref<'a> {
    pub unsafe fn wrap(ptr: *const AVDictionary) -> Self {
        Ref {
            ptr,
            _marker: PhantomData,
        }
    }

    pub unsafe fn as_ptr(&self) -> *const AVDictionary {
        self.ptr
    }
}

impl<'a> Ref<'a> {
    pub fn get(&'a self, key: &str) -> Option<&'a str> {
        unsafe {
            let key = CString::new(key).unwrap();
            let entry = av_dict_get(self.as_ptr(), key.as_ptr(), ptr::null_mut(), 0);

            if entry.is_null() {
                None
            } else {
                Some(from_utf8_unchecked(
                    CStr::from_ptr((*entry).value).to_bytes(),
                ))
            }
        }
    }

    pub fn iter(&self) -> Iter {
        unsafe { Iter::new(self.as_ptr()) }
    }

    pub fn to_owned<'b>(&self) -> Owned<'b> {
        self.iter().collect()
    }
}

impl<'a> IntoIterator for &'a Ref<'a> {
    type Item = (&'a str, &'a str);
    type IntoIter = Iter<'a>;

    fn into_iter(self) -> Self::IntoIter {
        self.iter()
    }
}

impl<'a> fmt::Debug for Ref<'a> {
    fn fmt(&self, fmt: &mut fmt::Formatter) -> fmt::Result {
        fmt.debug_map().entries(self.iter()).finish()
    }
}
