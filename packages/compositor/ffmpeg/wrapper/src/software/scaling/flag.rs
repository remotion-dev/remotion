use ffi::*;
use libc::c_int;

bitflags! {
    #[derive(Copy, Clone, Debug, PartialEq, Eq)]
    pub struct Flags: c_int {
        const FAST_BILINEAR        = SWS_FAST_BILINEAR;
        const BILINEAR             = SWS_BILINEAR;
        const BICUBIC              = SWS_BICUBIC;
        const X                    = SWS_X;
        const POINT                = SWS_POINT;
        const AREA                 = SWS_AREA;
        const BICUBLIN             = SWS_BICUBLIN;
        const GAUSS                = SWS_GAUSS;
        const SINC                 = SWS_SINC;
        const LANCZOS              = SWS_LANCZOS;
        const SPLINE               = SWS_SPLINE;
        const SRC_V_CHR_DROP_MASK  = SWS_SRC_V_CHR_DROP_MASK;
        const SRC_V_CHR_DROP_SHIFT = SWS_SRC_V_CHR_DROP_SHIFT;
        const PARAM_DEFAULT        = SWS_PARAM_DEFAULT;
        const PRINT_INFO           = SWS_PRINT_INFO;
        const FULL_CHR_H_INT       = SWS_FULL_CHR_H_INT;
        const FULL_CHR_H_INP       = SWS_FULL_CHR_H_INP;
        const DIRECT_BGR           = SWS_DIRECT_BGR;
        const ACCURATE_RND         = SWS_ACCURATE_RND;
        const BITEXACT             = SWS_BITEXACT;
        const ERROR_DIFFUSION      = SWS_ERROR_DIFFUSION;
    }
}
