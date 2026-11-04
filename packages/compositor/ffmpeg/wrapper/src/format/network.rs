use ffi::*;

pub fn init() {
    unsafe {
        avformat_network_init();
    }
}

pub fn deinit() {
    unsafe {
        avformat_network_deinit();
    }
}
