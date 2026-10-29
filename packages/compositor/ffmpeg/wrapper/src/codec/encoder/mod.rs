pub mod encoder;
pub use self::encoder::Encoder;

pub mod video;
pub use self::video::Encoder as Video;

pub mod audio;
pub use self::audio::Encoder as Audio;

pub mod subtitle;
pub use self::subtitle::Encoder as Subtitle;

pub mod motion_estimation;
pub use self::motion_estimation::MotionEstimation;

#[cfg(not(feature = "ffmpeg_5_0"))]
pub mod prediction;
#[cfg(not(feature = "ffmpeg_5_0"))]
pub use self::prediction::Prediction;

pub mod comparison;
pub use self::comparison::Comparison;

pub mod decision;
pub use self::decision::Decision;

use std::ffi::CString;

use codec::Context;
use codec::Id;
use ffi::*;
use Codec;

pub fn new() -> Encoder {
    Context::new().encoder()
}

pub fn find(id: Id) -> Option<Codec> {
    unsafe {
        // We get a clippy warning in 4.4 but not in 5.0 and newer, so we allow that cast to not complicate the code
        #[allow(clippy::unnecessary_cast)]
        let ptr = avcodec_find_encoder(id.into()) as *mut AVCodec;

        if ptr.is_null() {
            None
        } else {
            Some(Codec::wrap(ptr))
        }
    }
}

pub fn find_by_name(name: &str) -> Option<Codec> {
    unsafe {
        let name = CString::new(name).unwrap();
        #[allow(clippy::unnecessary_cast)]
        let ptr = avcodec_find_encoder_by_name(name.as_ptr()) as *mut AVCodec;

        if ptr.is_null() {
            None
        } else {
            Some(Codec::wrap(ptr))
        }
    }
}
