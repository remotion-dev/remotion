pub mod decoder;
pub use self::decoder::Decoder;

pub mod video;
pub use self::video::Video;

pub mod audio;
pub use self::audio::Audio;

pub mod subtitle;
pub use self::subtitle::Subtitle;

pub mod slice;

pub mod conceal;
pub use self::conceal::Conceal;

pub mod check;
pub use self::check::Check;

pub mod opened;
pub use self::opened::Opened;

use std::ffi::CString;

use codec::Context;
use codec::Id;
use ffi::*;
use Codec;

pub fn new() -> Decoder {
    Context::new().decoder()
}

pub fn find(id: Id) -> Option<Codec> {
    unsafe {
        // We get a clippy warning in 4.4 but not in 5.0 and newer, so we allow that cast to not complicate the code
        #[allow(clippy::unnecessary_cast)]
        let ptr = avcodec_find_decoder(id.into()) as *mut AVCodec;

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
        let ptr = avcodec_find_decoder_by_name(name.as_ptr()) as *mut AVCodec;

        if ptr.is_null() {
            None
        } else {
            Some(Codec::wrap(ptr))
        }
    }
}
