use remotionffmpeg::Rational;
use std::sync::{Arc, Mutex};

use crate::{
    errors::ErrorWithBacktrace,
    frame_cache_manager::FrameCacheManager,
    global_printer::_print_verbose,
    opened_stream::{self, OpenedStream},
};
extern crate ffmpeg_next as remotionffmpeg;

pub struct OpenedVideo {
    pub opened_streams: Vec<Arc<Mutex<OpenedStream>>>,
    pub fps: Rational,
    pub time_base: Rational,
    pub src: String,
    pub original_src: String,
}

pub fn open_video(
    src: &str,
    original_src: &str,
    transparent: bool,
) -> Result<OpenedVideo, ErrorWithBacktrace> {
    let (opened_stream, fps, time_base) =
        opened_stream::open_stream(src, original_src, transparent)?;

    let opened_video = OpenedVideo {
        opened_streams: vec![(Arc::new(Mutex::new(opened_stream)))],
        fps,
        time_base,
        src: src.to_string(),
        original_src: original_src.to_string(),
    };

    _print_verbose(&format!(
        "Opening video {} with time base {} and fps {}",
        src, time_base, fps
    ))?;

    Ok(opened_video)
}

impl OpenedVideo {
    pub fn close(&mut self) -> Result<(), ErrorWithBacktrace> {
        self.opened_streams = vec![];

        Ok(())
    }
    pub fn open_new_stream(&mut self, transparent: bool) -> Result<usize, ErrorWithBacktrace> {
        let (opened_stream, _, _) =
            opened_stream::open_stream(&self.src, &self.original_src, transparent)?;
        let arc_mutex = Arc::new(Mutex::new(opened_stream));
        self.opened_streams.push(arc_mutex);
        return Ok(self.opened_streams.len() - 1);
    }

    pub fn close_video_if_frame_cache_empty(&mut self) -> Result<bool, ErrorWithBacktrace> {
        let transparent_tone_mapped_cache = FrameCacheManager::get_instance().get_frame_cache(
            &self.src,
            &self.original_src,
            true,
            true,
        );
        let transparent_original_cache = FrameCacheManager::get_instance().get_frame_cache(
            &self.src,
            &self.original_src,
            true,
            false,
        );
        let opaque_tone_mapped_cache = FrameCacheManager::get_instance().get_frame_cache(
            &self.src,
            &self.original_src,
            false,
            true,
        );
        let opaque_original_cache = FrameCacheManager::get_instance().get_frame_cache(
            &self.src,
            &self.original_src,
            false,
            false,
        );
        if opaque_tone_mapped_cache.lock()?.is_empty()
            && opaque_original_cache.lock()?.is_empty()
            && transparent_original_cache.lock()?.is_empty()
            && transparent_tone_mapped_cache.lock()?.is_empty()
        {
            self.close()?;
            Ok(true)
        } else {
            Ok(false)
        }
    }
}
