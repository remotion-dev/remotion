use std::ops::{Deref, DerefMut};

#[cfg(not(feature = "ffmpeg_5_0"))]
use ffi::*;
#[cfg(not(feature = "ffmpeg_5_0"))]
use libc::c_int;

use super::Opened;
use codec::Context;
#[cfg(not(feature = "ffmpeg_5_0"))]
use frame;
use util::format;
#[cfg(not(feature = "ffmpeg_5_0"))]
use {packet, Error};
use {AudioService, ChannelLayout};

pub struct Audio(pub Opened);

impl Audio {
    #[deprecated(
        since = "4.4.0",
        note = "Underlying API avcodec_decode_audio4 has been deprecated since FFmpeg 3.1; \
        consider switching to send_packet() and receive_frame()"
    )]
    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn decode<P: packet::Ref>(
        &mut self,
        packet: &P,
        out: &mut frame::Audio,
    ) -> Result<bool, Error> {
        unsafe {
            let mut got: c_int = 0;

            match avcodec_decode_audio4(
                self.as_mut_ptr(),
                out.as_mut_ptr(),
                &mut got,
                packet.as_ptr(),
            ) {
                e if e < 0 => Err(Error::from(e)),
                _ => Ok(got != 0),
            }
        }
    }

    pub fn rate(&self) -> u32 {
        unsafe { (*self.as_ptr()).sample_rate as u32 }
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

    pub fn format(&self) -> format::Sample {
        unsafe { format::Sample::from((*self.as_ptr()).sample_fmt) }
    }

    pub fn request_format(&mut self, value: format::Sample) {
        unsafe {
            (*self.as_mut_ptr()).request_sample_fmt = value.into();
        }
    }

    pub fn frames(&self) -> usize {
        #[cfg(not(feature = "ffmpeg_7_0"))]
        unsafe {
            (*self.as_ptr()).frame_number as usize
        }

        #[cfg(feature = "ffmpeg_7_0")]
        unsafe {
            (*self.as_ptr()).frame_num as usize
        }
    }

    pub fn align(&self) -> usize {
        unsafe { (*self.as_ptr()).block_align as usize }
    }

    pub fn channel_layout(&self) -> ChannelLayout {
        #[cfg(not(feature = "ffmpeg_7_0"))]
        unsafe {
            ChannelLayout::from_bits_truncate((*self.as_ptr()).channel_layout)
        }

        #[cfg(feature = "ffmpeg_7_0")]
        unsafe {
            ChannelLayout::from((*self.as_ptr()).ch_layout)
        }
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

    #[cfg(not(feature = "ffmpeg_7_0"))]
    pub fn request_channel_layout(&mut self, value: ChannelLayout) {
        unsafe {
            (*self.as_mut_ptr()).request_channel_layout = value.bits();
        }
    }

    pub fn audio_service(&mut self) -> AudioService {
        unsafe { AudioService::from((*self.as_mut_ptr()).audio_service_type) }
    }

    pub fn max_bit_rate(&self) -> usize {
        unsafe { (*self.as_ptr()).rc_max_rate as usize }
    }

    pub fn frame_size(&self) -> u32 {
        unsafe { (*self.as_ptr()).frame_size as u32 }
    }

    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn frame_start(&self) -> Option<usize> {
        unsafe {
            // Removed in ffmpeg >= 5.0 in favor of using encoder
            // private options.
            match (*self.as_ptr()).timecode_frame_start {
                -1 => None,
                n => Some(n as usize),
            }
        }
    }
}

impl Deref for Audio {
    type Target = Opened;

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
