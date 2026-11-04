use ffi::*;
use libc::c_int;

bitflags! {
    #[derive(Copy, Clone, Debug, PartialEq, Eq)]
    pub struct Disposition: c_int {
        const DEFAULT          = AV_DISPOSITION_DEFAULT;
        const DUB              = AV_DISPOSITION_DUB;
        const ORIGINAL         = AV_DISPOSITION_ORIGINAL;
        const COMMENT          = AV_DISPOSITION_COMMENT;
        const LYRICS           = AV_DISPOSITION_LYRICS;
        const KARAOKE          = AV_DISPOSITION_KARAOKE;
        const FORCED           = AV_DISPOSITION_FORCED;
        const HEARING_IMPAIRED = AV_DISPOSITION_HEARING_IMPAIRED;
        const VISUAL_IMPAIRED  = AV_DISPOSITION_VISUAL_IMPAIRED;
        const CLEAN_EFFECTS    = AV_DISPOSITION_CLEAN_EFFECTS;
        const ATTACHED_PIC     = AV_DISPOSITION_ATTACHED_PIC;
        const CAPTIONS         = AV_DISPOSITION_CAPTIONS;
        const DESCRIPTIONS     = AV_DISPOSITION_DESCRIPTIONS;
        const METADATA         = AV_DISPOSITION_METADATA;
        #[cfg(feature = "ffmpeg_7_1")]
        const MULTILAYER       = AV_DISPOSITION_MULTILAYER;
    }
}
