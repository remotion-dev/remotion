use std::ffi::CString;
use std::fmt;
use std::marker::PhantomData;
use std::ops::Deref;

use super::immutable;
use ffi::*;

pub struct Ref<'a> {
    ptr: *mut AVDictionary,
    imm: immutable::Ref<'a>,

    _marker: PhantomData<&'a ()>,
}

impl<'a> Ref<'a> {
    pub unsafe fn wrap(ptr: *mut AVDictionary) -> Self {
        Ref {
            ptr,
            imm: immutable::Ref::wrap(ptr),
            _marker: PhantomData,
        }
    }

    pub unsafe fn as_mut_ptr(&self) -> *mut AVDictionary {
        self.ptr
    }
}

impl<'a> Ref<'a> {
    pub fn set(&mut self, key: &str, value: &str) {
        unsafe {
            let key = CString::new(key).unwrap();
            let value = CString::new(value).unwrap();
            let mut ptr = self.as_mut_ptr();

            if av_dict_set(&mut ptr, key.as_ptr(), value.as_ptr(), 0) < 0 {
                panic!("out of memory");
            }

            self.ptr = ptr;
            self.imm = immutable::Ref::wrap(ptr);
        }
    }
}

impl<'a> Deref for Ref<'a> {
    type Target = immutable::Ref<'a>;

    fn deref(&self) -> &Self::Target {
        &self.imm
    }
}

impl<'a> fmt::Debug for Ref<'a> {
    fn fmt(&self, fmt: &mut fmt::Formatter) -> fmt::Result {
        self.imm.fmt(fmt)
    }
}
