use std::marker::PhantomData;
use std::ptr;

use device;
use ffi::*;
use format::context::common::Context;
use libc::c_int;
use Error;

impl Context {
    pub fn devices(&self) -> Result<DeviceIter, Error> {
        unsafe { DeviceIter::wrap(self.as_ptr()) }
    }
}

pub struct DeviceIter<'a> {
    ptr: *mut AVDeviceInfoList,
    cur: c_int,

    _marker: PhantomData<&'a ()>,
}

impl<'a> DeviceIter<'a> {
    pub unsafe fn wrap(ctx: *const AVFormatContext) -> Result<Self, Error> {
        let mut ptr: *mut AVDeviceInfoList = ptr::null_mut();

        match avdevice_list_devices(ctx as *mut _, &mut ptr) {
            n if n < 0 => Err(Error::from(n)),

            _ => Ok(DeviceIter {
                ptr,
                cur: 0,
                _marker: PhantomData,
            }),
        }
    }
}

impl<'a> DeviceIter<'a> {
    pub fn default(&self) -> usize {
        unsafe { (*self.ptr).default_device as usize }
    }
}

impl<'a> Drop for DeviceIter<'a> {
    fn drop(&mut self) {
        unsafe {
            avdevice_free_list_devices(&mut self.ptr);
        }
    }
}

impl<'a> Iterator for DeviceIter<'a> {
    type Item = device::Info<'a>;

    fn next(&mut self) -> Option<<Self as Iterator>::Item> {
        unsafe {
            if self.cur >= (*self.ptr).nb_devices {
                None
            } else {
                self.cur += 1;
                Some(device::Info::wrap(
                    *(*self.ptr).devices.offset((self.cur - 1) as isize),
                ))
            }
        }
    }

    fn size_hint(&self) -> (usize, Option<usize>) {
        unsafe {
            let length = (*self.ptr).nb_devices as usize;

            (length - self.cur as usize, Some(length - self.cur as usize))
        }
    }
}

impl<'a> ExactSizeIterator for DeviceIter<'a> {}
