use ffi::*;
use libc::c_int;

bitflags! {
    #[derive(Copy, Clone, Debug, PartialEq, Eq)]
    pub struct Flags: c_int {
        const NO_FILE       = AVFMT_NOFILE;
        const NEED_NUMBER   = AVFMT_NEEDNUMBER;
        const SHOW_IDS      = AVFMT_SHOW_IDS;
        #[cfg(not(feature = "ffmpeg_4_0"))]
        const RAW_PICTURE   = AVFMT_RAWPICTURE;
        const GLOBAL_HEADER = AVFMT_GLOBALHEADER;
        const NO_TIMESTAMPS = AVFMT_NOTIMESTAMPS;
        const GENERIC_INDEX = AVFMT_GENERIC_INDEX;
        const TS_DISCONT    = AVFMT_TS_DISCONT;
        const VARIABLE_FPS  = AVFMT_VARIABLE_FPS;
        const NO_DIMENSIONS = AVFMT_NODIMENSIONS;
        const NO_STREAMS    = AVFMT_NOSTREAMS;
        const NO_BINSEARCH  = AVFMT_NOBINSEARCH;
        const NO_GENSEARCH  = AVFMT_NOGENSEARCH;
        const NO_BYTE_SEEK  = AVFMT_NO_BYTE_SEEK;
        const ALLOW_FLUSH   = AVFMT_ALLOW_FLUSH;
        const TS_NONSTRICT  = AVFMT_TS_NONSTRICT;
        const TS_NEGATIVE   = AVFMT_TS_NEGATIVE;
        const SEEK_TO_PTS   = AVFMT_SEEK_TO_PTS;
    }
}
