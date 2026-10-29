use std::ops::{Deref, DerefMut};
use std::ptr;

use ffi::*;
#[cfg(not(feature = "ffmpeg_5_0"))]
use libc::c_int;

use super::Encoder as Super;
use codec::{traits, Context};
use util::format;
#[cfg(not(feature = "ffmpeg_5_0"))]
use {frame, packet};
use {ChannelLayout, Dictionary, Error};

pub struct Audio(pub Super);

impl Audio {
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

    pub fn open_with(mut self, options: Dictionary) -> Result<Encoder, Error> {
        unsafe {
            let mut opts = options.disown();
            let res = avcodec_open2(self.as_mut_ptr(), ptr::null(), &mut opts);

            Dictionary::own(opts);

            match res {
                0 => Ok(Encoder(self)),
                e => Err(Error::from(e)),
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

    pub fn set_rate(&mut self, rate: i32) {
        unsafe {
            (*self.as_mut_ptr()).sample_rate = rate;
        }
    }

    pub fn rate(&self) -> u32 {
        unsafe { (*self.as_ptr()).sample_rate as u32 }
    }

    pub fn set_format(&mut self, value: format::Sample) {
        unsafe {
            (*self.as_mut_ptr()).sample_fmt = value.into();
        }
    }

    pub fn format(&self) -> format::Sample {
        unsafe { format::Sample::from((*self.as_ptr()).sample_fmt) }
    }

    pub fn set_channel_layout(&mut self, value: ChannelLayout) {
        unsafe {
            #[cfg(not(feature = "ffmpeg_7_0"))]
            {
                (*self.as_mut_ptr()).channel_layout = value.bits();
            }

            #[cfg(feature = "ffmpeg_7_0")]
            {
                (*self.as_mut_ptr()).ch_layout = value.into();
            }
        }
    }

    pub fn channel_layout(&self) -> ChannelLayout {
        unsafe {
            #[cfg(not(feature = "ffmpeg_7_0"))]
            {
                ChannelLayout::from_bits_truncate((*self.as_ptr()).channel_layout)
            }

            #[cfg(feature = "ffmpeg_7_0")]
            {
                ChannelLayout::from((*self.as_ptr()).ch_layout)
            }
        }
    }

    #[cfg(not(feature = "ffmpeg_7_0"))]
    pub fn set_channels(&mut self, value: i32) {
        unsafe {
            (*self.as_mut_ptr()).channels = value;
        }
    }

    pub fn channels(&self) -> u16 {
        #[cfg(not(feature = "ffmpeg_7_0"))]
        unsafe {
            (*self.as_ptr()).channels as u16
        }

        #[cfg(feature = "ffmpeg_7_0")]
        {
            self.channel_layout().channels() as u16
        }
    }
}

impl Deref for Audio {
    type Target = Super;

    fn deref(&self) -> &<Self as Deref>::Target {
        &self.0
    }
}

impl DerefMut for Audio {
    fn deref_mut(&mut self) -> &mut <Self as Deref>::Target {
        &mut self.0
    }
}

impl AsRef<Context> for Audio {
    fn as_ref(&self) -> &Context {
        self
    }
}

impl AsMut<Context> for Audio {
    fn as_mut(&mut self) -> &mut Context {
        &mut self.0
    }
}

pub struct Encoder(pub Audio);

impl Encoder {
    #[deprecated(
        since = "4.4.0",
        note = "Underlying API avcodec_encode_audio2 has been deprecated since FFmpeg 3.1; \
        consider switching to send_frame() and receive_packet()"
    )]
    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn encode<P: packet::Mut>(
        &mut self,
        frame: &frame::Audio,
        out: &mut P,
    ) -> Result<bool, Error> {
        unsafe {
            if self.format() != frame.format() {
                return Err(Error::InvalidData);
            }

            let mut got: c_int = 0;

            match avcodec_encode_audio2(
                self.0.as_mut_ptr(),
                out.as_mut_ptr(),
                frame.as_ptr(),
                &mut got,
            ) {
                e if e < 0 => Err(Error::from(e)),
                _ => Ok(got != 0),
            }
        }
    }

    #[deprecated(
        since = "4.4.0",
        note = "Underlying API avcodec_encode_audio2 has been deprecated since FFmpeg 3.1; \
        consider switching to send_eof() and receive_packet()"
    )]
    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn flush<P: packet::Mut>(&mut self, out: &mut P) -> Result<bool, Error> {
        unsafe {
            let mut got: c_int = 0;

            match avcodec_encode_audio2(
                self.0.as_mut_ptr(),
                out.as_mut_ptr(),
                ptr::null(),
                &mut got,
            ) {
                e if e < 0 => Err(Error::from(e)),
                _ => Ok(got != 0),
            }
        }
    }

    pub fn frame_size(&self) -> u32 {
        unsafe { (*self.as_ptr()).frame_size as u32 }
    }
}

impl Deref for Encoder {
    type Target = Audio;

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
