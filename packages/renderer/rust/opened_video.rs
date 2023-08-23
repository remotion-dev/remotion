use remotionffmpeg::Rational;
use std::sync::{Arc, Mutex};

use crate::{
    errors::ErrorWithBacktrace,
    frame_cache::FrameCache,
    global_printer::_print_verbose,
    opened_stream::{self, OpenedStream},
};
extern crate ffmpeg_next as remotionffmpeg;

pub struct OpenedVideo {
    pub opened_streams: Vec<Arc<Mutex<OpenedStream>>>,
    pub transparent_frame_cache: Arc<Mutex<FrameCache>>,
    pub opaque_frame_cache: Arc<Mutex<FrameCache>>,
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
        transparent_frame_cache: Arc::new(Mutex::new(FrameCache::new())),
        opaque_frame_cache: Arc::new(Mutex::new(FrameCache::new())),
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
        if self.transparent_frame_cache.lock()?.is_empty()
            && self.opaque_frame_cache.lock()?.is_empty()
        {
            self.close()?;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    pub fn get_frame_cache(&self, transparent: bool) -> Arc<Mutex<FrameCache>> {
        match transparent {
            true => self.transparent_frame_cache.clone(),
            false => self.opaque_frame_cache.clone(),
        }
    }

    pub fn get_cache_size_items(&self) -> Result<usize, ErrorWithBacktrace> {
        Ok(self
            .transparent_frame_cache
            .lock()?
            .get_cache_item_count()
            .saturating_add(self.opaque_frame_cache.lock()?.get_cache_item_count()))
    }

    pub fn get_cache_size_bytes(&self) -> Result<u128, ErrorWithBacktrace> {
        Ok(self
            .transparent_frame_cache
            .lock()?
            .get_size_in_bytes()
            .saturating_add(self.opaque_frame_cache.lock()?.get_size_in_bytes()))
    }

    pub fn get_cache_item_from_id(
        &self,
        transparent: bool,
        frame_id: usize,
    ) -> Result<Vec<u8>, ErrorWithBacktrace> {
        match self
            .get_frame_cache(transparent)
            .lock()?
            .get_item_from_id(frame_id)?
        {
            Some(item) => Ok(item),
            None => Err(ErrorWithBacktrace::from("No item found in cache")),
        }
    }

    pub fn get_cache_item_id(
        &self,
        transparent: bool,
        time: i64,
        threshold: i64,
    ) -> Result<Option<usize>, ErrorWithBacktrace> {
        Ok(self
            .get_frame_cache(transparent)
            .lock()?
            .get_item_id(time, threshold)?)
    }
}
