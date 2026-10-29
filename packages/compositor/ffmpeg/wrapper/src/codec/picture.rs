use std::marker::PhantomData;
use std::mem;
use std::slice;

use ffi::*;
use format;
use libc::{c_int, size_t};
use Error;

pub struct Picture<'a> {
    ptr: *mut AVPicture,

    format: format::Pixel,
    width: u32,
    height: u32,

    _own: bool,
    _marker: PhantomData<&'a ()>,
}

impl<'a> Picture<'a> {
    pub unsafe fn wrap(
        ptr: *mut AVPicture,
        format: format::Pixel,
        width: u32,
        height: u32,
    ) -> Self {
        Picture {
            ptr,

            format,
            width,
            height,

            _own: false,
            _marker: PhantomData,
        }
    }

    pub unsafe fn as_ptr(&self) -> *const AVPicture {
        self.ptr as *const _
    }

    pub unsafe fn as_mut_ptr(&mut self) -> *mut AVPicture {
        self.ptr
    }
}

impl<'a> Picture<'a> {
    pub fn size(format: format::Pixel, width: u32, height: u32) -> Result<usize, Error> {
        unsafe {
            match avpicture_get_size(format.into(), width as c_int, height as c_int) {
                v if v >= 0 => Ok(v as usize),
                e => Err(Error::from(e)),
            }
        }
    }

    pub fn new(format: format::Pixel, width: u32, height: u32) -> Result<Self, Error> {
        unsafe {
            let ptr = av_malloc(mem::size_of::<AVPicture>() as size_t) as *mut AVPicture;

            match avpicture_alloc(ptr, format.into(), width as c_int, height as c_int) {
                0 => Ok(Picture {
                    ptr,

                    format,
                    width,
                    height,

                    _own: true,
                    _marker: PhantomData,
                }),

                e => Err(Error::from(e)),
            }
        }
    }

    pub fn format(&self) -> format::Pixel {
        self.format
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn layout(&self, out: &mut [u8]) -> Result<usize, Error> {
        unsafe {
            match avpicture_layout(
                self.ptr,
                self.format.into(),
                self.width as c_int,
                self.height as c_int,
                out.as_mut_ptr(),
                out.len() as c_int,
            ) {
                s if s >= 0 => Ok(s as usize),
                e => Err(Error::from(e)),
            }
        }
    }

    pub fn layout_as(
        &self,
        format: format::Pixel,
        width: u32,
        height: u32,
        out: &mut [u8],
    ) -> Result<usize, Error> {
        unsafe {
            match avpicture_layout(
                self.as_ptr(),
                format.into(),
                width as c_int,
                height as c_int,
                out.as_mut_ptr(),
                out.len() as c_int,
            ) {
                s if s >= 0 => Ok(s as usize),
                e => Err(Error::from(e)),
            }
        }
    }

    pub fn crop(&self, source: &mut Picture, top: u32, left: u32) -> Result<(), Error> {
        if self.format != source.format {
            return Err(Error::Bug);
        }

        unsafe {
            match av_picture_crop(
                source.as_mut_ptr(),
                self.as_ptr(),
                self.format.into(),
                top as c_int,
                left as c_int,
            ) {
                0 => Ok(()),
                e => Err(Error::from(e)),
            }
        }
    }

    pub fn data(&self) -> Vec<&[u8]> {
        let mut result = Vec::new();

        unsafe {
            for (i, length) in (*self.as_ptr())
                .linesize
                .iter()
                .take_while(|l| **l > 0)
                .enumerate()
            {
                result.push(slice::from_raw_parts(
                    (*self.as_ptr()).data[i],
                    (*length as usize) * (self.height as usize),
                ))
            }
        }

        result
    }

    pub fn data_mut(&mut self) -> Vec<&mut [u8]> {
        let mut result = Vec::new();

        unsafe {
            for (i, length) in (*self.as_ptr())
                .linesize
                .iter()
                .take_while(|l| **l > 0)
                .enumerate()
            {
                result.push(slice::from_raw_parts_mut(
                    (*self.as_ptr()).data[i],
                    (*length as usize) * (self.height as usize),
                ))
            }
        }

        result
    }
}

impl<'a> Clone for Picture<'a> {
    fn clone(&self) -> Self {
        let mut pic = Picture::new(self.format, self.width, self.height).unwrap();
        pic.clone_from(self);

        pic
    }

    fn clone_from(&mut self, source: &Self) {
        unsafe {
            av_picture_copy(
                self.as_mut_ptr(),
                source.as_ptr(),
                source.format.into(),
                source.width as c_int,
                source.height as c_int,
            );
        }
    }
}

impl<'a> Drop for Picture<'a> {
    fn drop(&mut self) {
        if self._own {
            unsafe {
                av_free(self.as_mut_ptr() as *mut _);
            }
        }
    }
}
