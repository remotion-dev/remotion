use std::ops::{Deref, DerefMut};
use std::ptr;

use super::{Audio, Check, Conceal, Opened, Subtitle, Video};
use codec::{traits, Context};
use ffi::*;
use {Dictionary, Discard, Error, Rational};

pub struct Decoder(pub Context);

impl Decoder {
    pub fn open(mut self) -> Result<Opened, Error> {
        unsafe {
            match avcodec_open2(self.as_mut_ptr(), ptr::null(), ptr::null_mut()) {
                0 => Ok(Opened(self)),
                e => Err(Error::from(e)),
            }
        }
    }

    pub fn open_as<D: traits::Decoder>(mut self, codec: D) -> Result<Opened, Error> {
        unsafe {
            if let Some(codec) = codec.decoder() {
                match avcodec_open2(self.as_mut_ptr(), codec.as_ptr(), ptr::null_mut()) {
                    0 => Ok(Opened(self)),
                    e => Err(Error::from(e)),
                }
            } else {
                Err(Error::DecoderNotFound)
            }
        }
    }

    pub fn open_as_with<D: traits::Decoder>(
        mut self,
        codec: D,
        options: Dictionary,
    ) -> Result<Opened, Error> {
        unsafe {
            if let Some(codec) = codec.decoder() {
                let mut opts = options.disown();
                let res = avcodec_open2(self.as_mut_ptr(), codec.as_ptr(), &mut opts);

                Dictionary::own(opts);

                match res {
                    0 => Ok(Opened(self)),
                    e => Err(Error::from(e)),
                }
            } else {
                Err(Error::DecoderNotFound)
            }
        }
    }

    pub fn video(self) -> Result<Video, Error> {
        if let Some(codec) = self.codec() {
            self.open_as(codec).and_then(|o| o.video())
        } else if let Some(codec) = super::find(self.id()) {
            self.open_as(codec).and_then(|o| o.video())
        } else {
            Err(Error::DecoderNotFound)
        }
    }

    pub fn video_with_codec(self, name: &str) -> Result<Video, Error> {
        if let Some(codec) = super::find_by_name(name) {
            self.open_as(codec).and_then(|o| o.video())
        } else {
            Err(Error::DecoderNotFound)
        }
    }

    pub fn audio(self) -> Result<Audio, Error> {
        if let Some(codec) = self.codec() {
            self.open_as(codec).and_then(|o| o.audio())
        } else if let Some(codec) = super::find(self.id()) {
            self.open_as(codec).and_then(|o| o.audio())
        } else {
            Err(Error::DecoderNotFound)
        }
    }

    pub fn subtitle(self) -> Result<Subtitle, Error> {
        if let Some(codec) = super::find(self.id()) {
            self.open_as(codec).and_then(|o| o.subtitle())
        } else {
            Err(Error::DecoderNotFound)
        }
    }

    pub fn conceal(&mut self, value: Conceal) {
        unsafe {
            (*self.as_mut_ptr()).error_concealment = value.bits();
        }
    }

    pub fn check(&mut self, value: Check) {
        unsafe {
            (*self.as_mut_ptr()).err_recognition = value.bits();
        }
    }

    pub fn skip_loop_filter(&mut self, value: Discard) {
        unsafe {
            (*self.as_mut_ptr()).skip_loop_filter = value.into();
        }
    }

    pub fn skip_idct(&mut self, value: Discard) {
        unsafe {
            (*self.as_mut_ptr()).skip_idct = value.into();
        }
    }

    pub fn skip_frame(&mut self, value: Discard) {
        unsafe {
            (*self.as_mut_ptr()).skip_frame = value.into();
        }
    }

    pub fn packet_time_base(&self) -> Rational {
        unsafe { Rational::from((*self.as_ptr()).pkt_timebase) }
    }

    pub fn set_packet_time_base<R: Into<Rational>>(&mut self, value: R) {
        unsafe {
            (*self.as_mut_ptr()).pkt_timebase = value.into().into();
        }
    }
}

impl Deref for Decoder {
    type Target = Context;

    fn deref(&self) -> &<Self as Deref>::Target {
        &self.0
    }
}

impl DerefMut for Decoder {
    fn deref_mut(&mut self) -> &mut <Self as Deref>::Target {
        &mut self.0
    }
}

impl AsRef<Context> for Decoder {
    fn as_ref(&self) -> &Context {
        self
    }
}

impl AsMut<Context> for Decoder {
    fn as_mut(&mut self) -> &mut Context {
        &mut self.0
    }
}
