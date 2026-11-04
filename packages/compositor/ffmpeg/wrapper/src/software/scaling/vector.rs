use std::marker::PhantomData;
use std::slice;

use ffi::*;
use libc::{c_double, c_int};

pub struct Vector<'a> {
    ptr: *mut SwsVector,

    _own: bool,
    _marker: PhantomData<&'a ()>,
}

impl<'a> Vector<'a> {
    pub unsafe fn wrap(ptr: *mut SwsVector) -> Self {
        Vector {
            ptr,
            _own: false,
            _marker: PhantomData,
        }
    }

    pub unsafe fn as_ptr(&self) -> *const SwsVector {
        self.ptr as *const _
    }

    pub unsafe fn as_mut_ptr(&mut self) -> *mut SwsVector {
        self.ptr
    }
}

impl<'a> Vector<'a> {
    pub fn new(length: usize) -> Self {
        unsafe {
            Vector {
                ptr: sws_allocVec(length as c_int),
                _own: true,
                _marker: PhantomData,
            }
        }
    }

    pub fn gaussian(variance: f64, quality: f64) -> Self {
        unsafe {
            Vector {
                ptr: sws_getGaussianVec(variance as c_double, quality as c_double),
                _own: true,
                _marker: PhantomData,
            }
        }
    }

    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn value(value: f64, length: usize) -> Self {
        unsafe {
            Vector {
                ptr: sws_getConstVec(value as c_double, length as c_int),
                _own: true,
                _marker: PhantomData,
            }
        }
    }

    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn identity() -> Self {
        unsafe {
            Vector {
                ptr: sws_getIdentityVec(),
                _own: true,
                _marker: PhantomData,
            }
        }
    }

    pub fn scale(&mut self, scalar: f64) {
        unsafe {
            sws_scaleVec(self.as_mut_ptr(), scalar as c_double);
        }
    }

    pub fn normalize(&mut self, height: f64) {
        unsafe {
            sws_normalizeVec(self.as_mut_ptr(), height as c_double);
        }
    }

    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn conv(&mut self, other: &Vector) {
        unsafe {
            sws_convVec(self.as_mut_ptr(), other.as_ptr() as *mut _);
        }
    }

    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn add(&mut self, other: &Vector) {
        unsafe {
            sws_addVec(self.as_mut_ptr(), other.as_ptr() as *mut _);
        }
    }

    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn sub(&mut self, other: &Vector) {
        unsafe {
            sws_subVec(self.as_mut_ptr(), other.as_ptr() as *mut _);
        }
    }

    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn shift(&mut self, value: usize) {
        unsafe {
            sws_shiftVec(self.as_mut_ptr(), value as c_int);
        }
    }

    pub fn coefficients(&self) -> &[f64] {
        unsafe { slice::from_raw_parts((*self.as_ptr()).coeff, (*self.as_ptr()).length as usize) }
    }

    pub fn coefficients_mut(&self) -> &[f64] {
        unsafe {
            slice::from_raw_parts_mut((*self.as_ptr()).coeff, (*self.as_ptr()).length as usize)
        }
    }
}

#[cfg(not(feature = "ffmpeg_5_0"))]
impl<'a> Clone for Vector<'a> {
    fn clone(&self) -> Self {
        unsafe {
            Vector {
                ptr: sws_cloneVec(self.as_ptr() as *mut _),
                _own: true,
                _marker: PhantomData,
            }
        }
    }
}

impl<'a> Drop for Vector<'a> {
    fn drop(&mut self) {
        unsafe {
            if self._own {
                sws_freeVec(self.as_mut_ptr());
            }
        }
    }
}
