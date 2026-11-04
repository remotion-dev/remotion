use ffi::*;
use libc::c_uint;

bitflags! {
    #[derive(Copy, Clone, Debug, PartialEq, Eq)]
    pub struct Flags: c_uint {
        const UNALIGNED       = AV_CODEC_FLAG_UNALIGNED;
        const QSCALE          = AV_CODEC_FLAG_QSCALE;
        const _4MV            = AV_CODEC_FLAG_4MV;
        const OUTPUT_CORRUPT  = AV_CODEC_FLAG_OUTPUT_CORRUPT;
        const QPEL            = AV_CODEC_FLAG_QPEL;
        const PASS1           = AV_CODEC_FLAG_PASS1;
        const PASS2           = AV_CODEC_FLAG_PASS2;
        const GRAY            = AV_CODEC_FLAG_GRAY;
        const PSNR            = AV_CODEC_FLAG_PSNR;
        #[cfg(not(feature = "ffmpeg_6_0"))]
        const TRUNCATED       = AV_CODEC_FLAG_TRUNCATED;
        const INTERLACED_DCT  = AV_CODEC_FLAG_INTERLACED_DCT;
        const LOW_DELAY       = AV_CODEC_FLAG_LOW_DELAY;
        const GLOBAL_HEADER   = AV_CODEC_FLAG_GLOBAL_HEADER;
        const BITEXACT        = AV_CODEC_FLAG_BITEXACT;
        const AC_PRED         = AV_CODEC_FLAG_AC_PRED;
        const LOOP_FILTER     = AV_CODEC_FLAG_LOOP_FILTER;
        const INTERLACED_ME   = AV_CODEC_FLAG_INTERLACED_ME;
        const CLOSED_GOP      = AV_CODEC_FLAG_CLOSED_GOP;
    }
}
