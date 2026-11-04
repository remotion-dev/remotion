pub mod side_data;
pub use self::side_data::SideData;

pub mod video;
pub use self::video::Video;

pub mod audio;
pub use self::audio::Audio;

pub mod flag;
pub use self::flag::Flags;

use ffi::*;
use {Dictionary, DictionaryRef};

#[derive(PartialEq, Eq, Copy, Clone, Debug)]
pub struct Packet {
    pub duration: i64,
    pub position: i64,
    pub size: usize,

    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub pts: i64,
    pub dts: i64,
}

#[derive(PartialEq, Eq)]
pub struct Frame {
    ptr: *mut AVFrame,

    _own: bool,
}

unsafe impl Send for Frame {}
unsafe impl Sync for Frame {}

impl Frame {
    #[inline(always)]
    pub unsafe fn wrap(ptr: *mut AVFrame) -> Self {
        Frame { ptr, _own: false }
    }

    #[inline(always)]
    pub unsafe fn empty() -> Self {
        Frame {
            ptr: av_frame_alloc(),
            _own: true,
        }
    }

    #[inline(always)]
    pub unsafe fn as_ptr(&self) -> *const AVFrame {
        self.ptr as *const _
    }

    #[inline(always)]
    pub unsafe fn as_mut_ptr(&mut self) -> *mut AVFrame {
        self.ptr
    }

    #[inline(always)]
    pub unsafe fn is_empty(&self) -> bool {
        (*self.as_ptr()).data[0].is_null()
    }
}

impl Frame {
    #[inline]
    pub fn is_key(&self) -> bool {
        unsafe { (*self.as_ptr()).key_frame == 1 }
    }

    #[inline]
    pub fn is_corrupt(&self) -> bool {
        self.flags().contains(Flags::CORRUPT)
    }

    #[inline]
    pub fn packet(&self) -> Packet {
        unsafe {
            Packet {
                #[cfg(not(feature = "ffmpeg_7_0"))]
                duration: (*self.as_ptr()).pkt_duration,
                #[cfg(feature = "ffmpeg_7_0")]
                duration: (*self.as_ptr()).duration,

                position: (*self.as_ptr()).pkt_pos,
                size: (*self.as_ptr()).pkt_size as usize,

                #[cfg(not(feature = "ffmpeg_5_0"))]
                pts: (*self.as_ptr()).pkt_pts,
                dts: (*self.as_ptr()).pkt_dts,
            }
        }
    }

    #[inline]
    pub fn pts(&self) -> Option<i64> {
        unsafe {
            match (*self.as_ptr()).pts {
                AV_NOPTS_VALUE => None,
                pts => Some(pts),
            }
        }
    }

    #[inline]
    pub fn set_pts(&mut self, value: Option<i64>) {
        unsafe {
            (*self.as_mut_ptr()).pts = value.unwrap_or(AV_NOPTS_VALUE);
        }
    }

    #[inline]
    pub fn timestamp(&self) -> Option<i64> {
        unsafe {
            match (*self.as_ptr()).best_effort_timestamp {
                AV_NOPTS_VALUE => None,
                t => Some(t),
            }
        }
    }

    #[inline]
    pub fn quality(&self) -> usize {
        unsafe { (*self.as_ptr()).quality as usize }
    }

    #[inline]
    pub fn flags(&self) -> Flags {
        unsafe { Flags::from_bits_truncate((*self.as_ptr()).flags) }
    }

    #[inline]
    pub fn metadata(&self) -> DictionaryRef {
        unsafe { DictionaryRef::wrap((*self.as_ptr()).metadata) }
    }

    #[inline]
    pub fn set_metadata(&mut self, value: Dictionary) {
        unsafe { (*self.as_mut_ptr()).metadata = value.disown() }
    }

    #[inline]
    pub fn side_data(&self, kind: side_data::Type) -> Option<SideData> {
        unsafe {
            let ptr = av_frame_get_side_data(self.as_ptr(), kind.into());

            if ptr.is_null() {
                None
            } else {
                Some(SideData::wrap(ptr))
            }
        }
    }

    #[inline]
    pub fn new_side_data(&mut self, kind: side_data::Type, size: usize) -> Option<SideData> {
        unsafe {
            let ptr = av_frame_new_side_data(self.as_mut_ptr(), kind.into(), size as _);

            if ptr.is_null() {
                None
            } else {
                Some(SideData::wrap(ptr))
            }
        }
    }

    #[inline]
    pub fn remove_side_data(&mut self, kind: side_data::Type) {
        unsafe {
            av_frame_remove_side_data(self.as_mut_ptr(), kind.into());
        }
    }
}

impl Drop for Frame {
    #[inline]
    fn drop(&mut self) {
        unsafe {
            av_frame_free(&mut self.as_mut_ptr());
        }
    }
}
