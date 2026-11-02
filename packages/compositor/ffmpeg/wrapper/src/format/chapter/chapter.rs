use ffi::*;
use {DictionaryRef, Rational};

use format::context::common::Context;

// WARNING: index refers to the offset in the chapters array (starting from 0)
// it is not necessarly equal to the id (which may start at 1)
pub struct Chapter<'a> {
    context: &'a Context,
    index: usize,
}

impl<'a> Chapter<'a> {
    pub unsafe fn wrap(context: &Context, index: usize) -> Chapter {
        Chapter { context, index }
    }

    pub unsafe fn as_ptr(&self) -> *const AVChapter {
        *(*self.context.as_ptr()).chapters.add(self.index)
    }
}

impl<'a> Chapter<'a> {
    pub fn index(&self) -> usize {
        self.index
    }

    pub fn id(&self) -> i64 {
        #[allow(clippy::unnecessary_cast)]
        unsafe {
            (*self.as_ptr()).id as i64
        }
    }

    pub fn time_base(&self) -> Rational {
        unsafe { Rational::from((*self.as_ptr()).time_base) }
    }

    pub fn start(&self) -> i64 {
        unsafe { (*self.as_ptr()).start }
    }

    pub fn end(&self) -> i64 {
        unsafe { (*self.as_ptr()).end }
    }

    pub fn metadata(&self) -> DictionaryRef {
        unsafe { DictionaryRef::wrap((*self.as_ptr()).metadata) }
    }
}

impl<'a> PartialEq for Chapter<'a> {
    fn eq(&self, other: &Self) -> bool {
        unsafe { self.as_ptr() == other.as_ptr() }
    }
}
