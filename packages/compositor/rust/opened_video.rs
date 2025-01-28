use remotionffmpeg::Rational;
use std::sync::Mutex;

use crate::{
    errors::ErrorWithBacktrace,
    frame_cache_manager::FrameCacheManager,
    global_printer::_print_verbose,
    opened_stream::{self, OpenedStream},
};
extern crate ffmpeg_next as remotionffmpeg;

pub struct OpenedVideo {
    pub opened_streams: Vec<Mutex<OpenedStream>>,
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
        opened_streams: vec![(Mutex::new(opened_stream))],
        fps,
        time_base,
        src: src.to_string(),
        original_src: original_src.to_string(),
    };

    _print_verbose(&format!(
        "Opening video {} ({}) with time base {} and fps {}",
        src, original_src, time_base, fps
    ))?;

    Ok(opened_video)
}

impl OpenedVideo {
    pub fn close(&mut self) -> Result<(), ErrorWithBacktrace> {
        self.opened_streams = vec![];

        Ok(())
    }
    pub fn open_new_stream(
        &mut self,
        transparent: bool,
        thread_index: usize,
    ) -> Result<usize, ErrorWithBacktrace> {
        let (opened_stream, _, _) =
            opened_stream::open_stream(&self.src, &self.original_src, transparent)?;
        _print_verbose(&format!("Opening new stream on thread {}", thread_index))?;
        let arc_mutex = Mutex::new(opened_stream);
        self.opened_streams.push(arc_mutex);
        return Ok(self.opened_streams.len() - 1);
    }

    pub fn close_video_if_frame_cache_empty(
        &mut self,
        frame_cache_manager: &mut FrameCacheManager,
    ) -> Result<bool, ErrorWithBacktrace> {
        if !frame_cache_manager
            .get_frame_cache(&self.src, &self.original_src, true, true)
            .lock()
            .unwrap()
            .items
            .is_empty()
        {
            return Ok(false);
        }

        if !frame_cache_manager
            .get_frame_cache(&self.src, &self.original_src, true, false)
            .lock()
            .unwrap()
            .items
            .is_empty()
        {
            return Ok(false);
        }
        if !frame_cache_manager
            .get_frame_cache(&self.src, &self.original_src, false, true)
            .lock()
            .unwrap()
            .items
            .is_empty()
        {
            return Ok(false);
        }
        if !frame_cache_manager
            .get_frame_cache(&self.src, &self.original_src, false, false)
            .lock()
            .unwrap()
            .items
            .is_empty()
        {
            return Ok(false);
        }

        self.close()?;
        Ok(true)
    }
}
