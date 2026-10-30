use std::ops::{Deref, DerefMut};

use ffi::*;
use libc::c_int;

use super::Opened;
use codec::Context;
use {packet, Error};

pub struct Subtitle(pub Opened);

impl Subtitle {
    pub fn decode<P: packet::Ref>(
        &mut self,
        packet: &P,
        out: &mut ::Subtitle,
    ) -> Result<bool, Error> {
        unsafe {
            let mut got: c_int = 0;

            match avcodec_decode_subtitle2(
                self.as_mut_ptr(),
                out.as_mut_ptr(),
                &mut got,
                packet.as_ptr() as *mut _,
            ) {
                e if e < 0 => Err(Error::from(e)),
                _ => Ok(got != 0),
            }
        }
    }
}

impl Deref for Subtitle {
    type Target = Opened;

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
