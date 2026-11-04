use ffi::*;
use libc::c_int;

bitflags! {
    #[derive(Copy, Clone, Debug, PartialEq, Eq)]
    pub struct Flags: c_int {
        const DYNAMIC_INPUTS            = AVFILTER_FLAG_DYNAMIC_INPUTS;
        const DYNAMIC_OUTPUTS           = AVFILTER_FLAG_DYNAMIC_OUTPUTS;
        const SLICE_THREADS             = AVFILTER_FLAG_SLICE_THREADS;
        const SUPPORT_TIMELINE_GENERIC  = AVFILTER_FLAG_SUPPORT_TIMELINE_GENERIC;
        const SUPPORT_TIMELINE_INTERNAL = AVFILTER_FLAG_SUPPORT_TIMELINE_INTERNAL;
        const SUPPORT_TIMELINE          = AVFILTER_FLAG_SUPPORT_TIMELINE;
    }
}
