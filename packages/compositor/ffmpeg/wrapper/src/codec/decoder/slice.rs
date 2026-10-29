use ffi::*;
use libc::c_int;

bitflags! {
    #[derive(Copy, Clone, Debug, PartialEq, Eq)]
    pub struct Flags: c_int {
        const CODED_ORDER = SLICE_FLAG_CODED_ORDER;
        const ALLOW_FIELD = SLICE_FLAG_ALLOW_FIELD;
        const ALLOW_PLANE = SLICE_FLAG_ALLOW_PLANE;
    }
}
