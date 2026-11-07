use ffi::*;

pub trait Ref {
    fn as_ptr(&self) -> *const AVPacket;
}

pub trait Mut {
    fn as_mut_ptr(&mut self) -> *mut AVPacket;
}
