extern crate ffmpeg_next as remotionffmpeg;

use std::{collections::HashMap, sync::Mutex};

use crate::{
    errors::ErrorWithBacktrace,
    frame_cache_manager::FrameCacheManager,
    logger::log_callback,
    opened_video::{open_video, OpenedVideo},
};

pub struct OpenedVideoManager {
    videos: HashMap<String, Mutex<OpenedVideo>>,
}

pub fn make_opened_stream_manager() -> Result<OpenedVideoManager, ErrorWithBacktrace> {
    remotionffmpeg::init()?;
    remotionffmpeg::log::set_callback(Some(log_callback));
    Ok(OpenedVideoManager {
        videos: HashMap::new(),
    })
}

impl OpenedVideoManager {
    pub fn get_open_videos(&self) -> Result<usize, ErrorWithBacktrace> {
        return Ok(self.videos.len());
    }

    pub fn get_open_video_streams(&self) -> Result<usize, ErrorWithBacktrace> {
        let mut count = 0;
        for video in self.videos.values() {
            count += video.lock()?.opened_streams.len();
        }
        return Ok(count);
    }

    pub fn get_video(
        &mut self,
        src: &str,
        original_src: &str,
        transparent: bool,
    ) -> Result<&Mutex<OpenedVideo>, ErrorWithBacktrace> {
        if self.videos.contains_key(src) {
            return Ok(self.videos.get(src).expect("Video contains key"));
        }

        let video = open_video(src, original_src, transparent)?;

        self.videos.insert(src.to_string(), Mutex::new(video));

        let video = self.videos.get(src).unwrap();

        Ok(video)
    }

    pub fn remove_video(
        &mut self,
        src: &str,
        frame_cache_manager: &mut FrameCacheManager,
    ) -> Result<(), ErrorWithBacktrace> {
        {
            self.videos.get(src).unwrap().lock().unwrap().close()?;
        }

        self.videos.remove(src);

        frame_cache_manager.remove_frame_cache(src);

        Ok(())
    }

    pub fn close_all_videos(
        &mut self,
        frame_cache_manager: &mut FrameCacheManager,
    ) -> Result<(), ErrorWithBacktrace> {
        let video_sources: Vec<String> = self.videos.keys().cloned().collect();
        for video_source in video_sources {
            self.remove_video(&video_source, frame_cache_manager)?;
        }
        Ok(())
    }

    pub fn close_videos_if_cache_empty(
        &mut self,
        frame_cache_manager: &mut FrameCacheManager,
    ) -> Result<(), ErrorWithBacktrace> {
        let video_sources: Vec<String> = self.videos.keys().cloned().collect();
        for video_source in video_sources {
            let closed = self
                .videos
                .get(&video_source)
                .unwrap()
                .lock()
                .unwrap()
                .close_video_if_frame_cache_empty(frame_cache_manager)?;
            if closed {
                self.videos.remove(&video_source);
            }
        }
        Ok(())
    }
}
