use ffi::*;
use libc::c_uint;

bitflags! {
    #[derive(Copy, Clone, Debug, PartialEq, Eq)]
    pub struct Capabilities: c_uint {
        const DRAW_HORIZ_BAND     = AV_CODEC_CAP_DRAW_HORIZ_BAND;
        const DR1                 = AV_CODEC_CAP_DR1;
        #[cfg(not(feature = "ffmpeg_6_0"))]
        const TRUNCATED           = AV_CODEC_CAP_TRUNCATED;
        const DELAY               = AV_CODEC_CAP_DELAY;
        const SMALL_LAST_FRAME    = AV_CODEC_CAP_SMALL_LAST_FRAME;
        #[cfg(not(feature = "ffmpeg_4_0"))]
        const HWACCEL_VDPAU       = AV_CODEC_CAP_HWACCEL_VDPAU;
        const SUBFRAMES           = AV_CODEC_CAP_SUBFRAMES;
        const EXPERIMENTAL        = AV_CODEC_CAP_EXPERIMENTAL;
        const CHANNEL_CONF        = AV_CODEC_CAP_CHANNEL_CONF;
        const FRAME_THREADS       = AV_CODEC_CAP_FRAME_THREADS;
        const SLICE_THREADS       = AV_CODEC_CAP_SLICE_THREADS;
        const PARAM_CHANGE        = AV_CODEC_CAP_PARAM_CHANGE;
        #[cfg(not(feature = "ffmpeg_6_0"))]
        const AUTO_THREADS        = AV_CODEC_CAP_AUTO_THREADS;
        #[cfg(feature = "ffmpeg_6_0")]
        const OTHER_THREADS       = AV_CODEC_CAP_OTHER_THREADS;
        const VARIABLE_FRAME_SIZE = AV_CODEC_CAP_VARIABLE_FRAME_SIZE;
        #[cfg(not(feature = "ffmpeg_6_0"))]
        const INTRA_ONLY          = AV_CODEC_CAP_INTRA_ONLY;
        #[cfg(not(feature = "ffmpeg_6_0"))]
        const LOSSLESS            = AV_CODEC_CAP_LOSSLESS;
    }
}
