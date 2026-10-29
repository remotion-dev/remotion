use std::ops::{Deref, DerefMut};
use std::ptr;

use ffi::*;
use libc::c_int;

use super::Encoder as Super;
use codec::{traits, Context};
use {Dictionary, Error};

pub struct Subtitle(pub Super);

impl Subtitle {
    pub fn open(mut self) -> Result<Encoder, Error> {
        unsafe {
            match avcodec_open2(self.as_mut_ptr(), ptr::null(), ptr::null_mut()) {
                0 => Ok(Encoder(self)),
                e => Err(Error::from(e)),
            }
        }
    }

    pub fn open_as<E: traits::Encoder>(mut self, codec: E) -> Result<Encoder, Error> {
        unsafe {
            if let Some(codec) = codec.encoder() {
                match avcodec_open2(self.as_mut_ptr(), codec.as_ptr(), ptr::null_mut()) {
                    0 => Ok(Encoder(self)),
                    e => Err(Error::from(e)),
                }
            } else {
                Err(Error::EncoderNotFound)
            }
        }
    }

    pub fn open_as_with<E: traits::Encoder>(
        mut self,
        codec: E,
        options: Dictionary,
    ) -> Result<Encoder, Error> {
        unsafe {
            if let Some(codec) = codec.encoder() {
                let mut opts = options.disown();
                let res = avcodec_open2(self.as_mut_ptr(), codec.as_ptr(), &mut opts);

                Dictionary::own(opts);

                match res {
                    0 => Ok(Encoder(self)),
                    e => Err(Error::from(e)),
                }
            } else {
                Err(Error::EncoderNotFound)
            }
        }
    }
}

impl Deref for Subtitle {
    type Target = Super;

    fn deref(&self) -> &<Self as Deref>::Target {
        &self.0
    }
}

impl DerefMut for Subtitle {
    fn deref_mut(&mut self) -> &mut <Self as Deref>::Target {
        &mut self.0
    }
}

impl AsRef<Context> for Subtitle {
    fn as_ref(&self) -> &Context {
        self
    }
}

impl AsMut<Context> for Subtitle {
    fn as_mut(&mut self) -> &mut Context {
        &mut self.0
    }
}

pub struct Encoder(pub Subtitle);

impl Encoder {
    pub fn encode(&mut self, subtitle: &::Subtitle, out: &mut [u8]) -> Result<bool, Error> {
        unsafe {
            match avcodec_encode_subtitle(
                self.0.as_mut_ptr(),
                out.as_mut_ptr(),
                out.len() as c_int,
                subtitle.as_ptr(),
            ) {
                e if e < 0 => Err(Error::from(e)),
                _ => Ok(true),
            }
        }
    }
}

impl Deref for Encoder {
    type Target = Subtitle;

    fn deref(&self) -> &<Self as Deref>::Target {
        &self.0
    }
}

impl DerefMut for Encoder {
    fn deref_mut(&mut self) -> &mut <Self as Deref>::Target {
        &mut self.0
    }
}

impl AsRef<Context> for Encoder {
    fn as_ref(&self) -> &Context {
        self
    }
}

impl AsMut<Context> for Encoder {
    fn as_mut(&mut self) -> &mut Context {
        &mut self.0
    }
}
