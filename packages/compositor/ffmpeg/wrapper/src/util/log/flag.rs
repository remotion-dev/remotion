use ffi::*;
use libc::c_int;

bitflags! {
    #[derive(Copy, Clone, Debug, PartialEq, Eq)]
    pub struct Flags: c_int {
        const SKIP_REPEATED = AV_LOG_SKIP_REPEATED;
        const PRINT_LEVEL = AV_LOG_PRINT_LEVEL;
    }
}
