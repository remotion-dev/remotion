use std::panic;
use std::process;

use ffi::*;
use libc::{c_int, c_void};

pub struct Interrupt {
    pub interrupt: AVIOInterruptCB,
}

extern "C" fn callback<F>(opaque: *mut c_void) -> c_int
where
    F: FnMut() -> bool,
{
    // Clippy suggests to remove &mut, but it doesn't compile then (move occurs because value has type `F`, which does not implement the `Copy` trait)
    #[allow(clippy::needless_borrow)]
    match panic::catch_unwind(|| (unsafe { &mut *(opaque as *mut F) })()) {
        Ok(ret) => ret as c_int,
        Err(_) => process::abort(),
    }
}

pub fn new<F>(opaque: Box<F>) -> Interrupt
where
    F: FnMut() -> bool,
{
    let interrupt_cb = AVIOInterruptCB {
        callback: Some(callback::<F>),
        opaque: Box::into_raw(opaque) as *mut c_void,
    };
    Interrupt {
        interrupt: interrupt_cb,
    }
}
