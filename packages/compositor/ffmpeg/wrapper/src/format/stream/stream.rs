use super::Disposition;
use codec::{self, packet};
use ffi::*;
use format::context::common::Context;
use libc::c_int;
use {DictionaryRef, Discard, Rational};

#[derive(Debug)]
pub struct Stream<'a> {
    context: &'a Context,
    index: usize,
}

impl<'a> Stream<'a> {
    pub unsafe fn wrap(context: &Context, index: usize) -> Stream {
        Stream { context, index }
    }

    pub unsafe fn as_ptr(&self) -> *const AVStream {
        *(*self.context.as_ptr()).streams.add(self.index)
    }
}

impl<'a> Stream<'a> {
    pub fn id(&self) -> i32 {
        unsafe { (*self.as_ptr()).id }
    }

    #[cfg(not(feature = "ffmpeg_5_0"))]
    pub fn codec(&self) -> codec::Context {
        unsafe { codec::Context::wrap((*self.as_ptr()).codec, Some(self.context.destructor())) }
    }

    pub fn parameters(&self) -> codec::Parameters {
        unsafe {
            codec::Parameters::wrap((*self.as_ptr()).codecpar, Some(self.context.destructor()))
        }
    }

    pub fn index(&self) -> usize {
        unsafe { (*self.as_ptr()).index as usize }
    }

    pub fn time_base(&self) -> Rational {
        unsafe { Rational::from((*self.as_ptr()).time_base) }
    }

    pub fn start_time(&self) -> i64 {
        unsafe { (*self.as_ptr()).start_time }
    }

    pub fn duration(&self) -> i64 {
        unsafe { (*self.as_ptr()).duration }
    }

    pub fn frames(&self) -> i64 {
        unsafe { (*self.as_ptr()).nb_frames }
    }

    pub fn disposition(&self) -> Disposition {
        unsafe { Disposition::from_bits_truncate((*self.as_ptr()).disposition) }
    }

    pub fn discard(&self) -> Discard {
        unsafe { Discard::from((*self.as_ptr()).discard) }
    }

    pub fn side_data(&self) -> SideDataIter {
        SideDataIter::new(self)
    }

    pub fn rate(&self) -> Rational {
        unsafe { Rational::from((*self.as_ptr()).r_frame_rate) }
    }

    pub fn avg_frame_rate(&self) -> Rational {
        unsafe { Rational::from((*self.as_ptr()).avg_frame_rate) }
    }

    pub unsafe fn get_display_aspect_ratio(&self) -> Rational {
        let sample_aspect_ratio = (*self.as_ptr()).sample_aspect_ratio;
        let codec_width = (*(*self.as_ptr()).codecpar).width;
        let codec_height = (*(*self.as_ptr()).codecpar).height;

        // Careful to not mess with the casting, den is a i32, if multiplied without
        // first casting, it will overflow

        let num_no_overflow: i64 = codec_width as i64 * sample_aspect_ratio.num as i64;
        let den_no_overflow: i64 = codec_height as i64 * sample_aspect_ratio.den as i64;

        let mut num: i32 = 0;
        let mut den: i32 = 0;

        av_reduce(
            &mut num,
            &mut den,
            num_no_overflow,
            den_no_overflow,
            1024 * 1024,
        );

        return Rational::new(num, den);
    }

    pub fn metadata(&self) -> DictionaryRef {
        unsafe { DictionaryRef::wrap((*self.as_ptr()).metadata) }
    }
}

impl<'a> PartialEq for Stream<'a> {
    fn eq(&self, other: &Self) -> bool {
        unsafe { self.as_ptr() == other.as_ptr() }
    }
}

impl<'a> Eq for Stream<'a> {}

pub struct SideDataIter<'a> {
    stream: &'a Stream<'a>,
    current: c_int,
}

impl<'a> SideDataIter<'a> {
    pub fn new<'sd, 's: 'sd>(stream: &'s Stream) -> SideDataIter<'sd> {
        SideDataIter { stream, current: 0 }
    }
}

impl<'a> Iterator for SideDataIter<'a> {
    type Item = packet::SideData<'a>;

    fn next(&mut self) -> Option<<Self as Iterator>::Item> {
        unsafe {
            if self.current >= (*self.stream.as_ptr()).nb_side_data {
                return None;
            }

            self.current += 1;

            Some(packet::SideData::wrap(
                (*self.stream.as_ptr())
                    .side_data
                    .offset((self.current - 1) as isize),
            ))
        }
    }

    fn size_hint(&self) -> (usize, Option<usize>) {
        unsafe {
            let length = (*self.stream.as_ptr()).nb_side_data as usize;

            (
                length - self.current as usize,
                Some(length - self.current as usize),
            )
        }
    }
}

impl<'a> ExactSizeIterator for SideDataIter<'a> {}
