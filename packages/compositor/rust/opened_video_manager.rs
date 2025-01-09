extern crate ffmpeg_next as remotionffmpeg;

use std::{
    collections::HashMap,
    io::ErrorKind,
    sync::{Arc, Mutex, RwLock},
};

use lazy_static::lazy_static;

use crate::{
    errors::ErrorWithBacktrace,
    frame_cache_manager::FrameCacheManager,
    logger::log_callback,
    opened_video::{open_video, OpenedVideo},
};

pub struct OpenedVideoManager {
    videos: RwLock<HashMap<String, Arc<Mutex<OpenedVideo>>>>,
}

pub fn make_opened_stream_manager() -> Result<OpenedVideoManager, ErrorWithBacktrace> {
    remotionffmpeg::init()?;
    remotionffmpeg::log::set_callback(Some(log_callback));
    Ok(OpenedVideoManager {
        videos: RwLock::new(HashMap::new()),
    })
}

impl OpenedVideoManager {
    pub fn get_instance() -> &'static OpenedVideoManager {
        lazy_static! {
            static ref INSTANCE: OpenedVideoManager = make_opened_stream_manager().unwrap();
        }
        &INSTANCE
    }

    pub fn get_open_videos(&self) -> Result<usize, ErrorWithBacktrace> {
        return Ok(self.videos.read()?.len());
    }

    pub fn get_open_video_streams(&self) -> Result<usize, ErrorWithBacktrace> {
        let mut count = 0;
        for video in self.videos.read()?.values() {
            count += video.lock()?.opened_streams.len();
        }
        return Ok(count);
    }

    pub fn get_video(
        &self,
        src: &str,
        original_src: &str,
        transparent: bool,
    ) -> Result<Arc<Mutex<OpenedVideo>>, ErrorWithBacktrace> {
        // Adding a block scope because of the RwLock,
        // preventing a deadlock
        {
            let videos_read = self.videos.try_read();
            if videos_read.is_err() {
                return Err(std::io::Error::new(ErrorKind::Other, "Deadlock").into());
            }
            let videos = videos_read?;
            if videos.contains_key(src) {
                return Ok(videos.get(src).expect("Video contains key").clone());
            }
        }

        let video = open_video(src, original_src, transparent)?;
        let videos_write = self.videos.write();

        videos_write?.insert(src.to_string(), Arc::new(Mutex::new(video)));

        Ok(self.videos.read()?.get(src).unwrap().clone())
    }

    pub fn remove_video(&self, src: &str) -> Result<(), ErrorWithBacktrace> {
        {
            self.videos
                .read()?
                .get(src)
                .cloned()
                .unwrap()
                .lock()
                .unwrap()
                .close()?;
        }

        let mut vid = self.videos.write()?;
        vid.remove(src);

        FrameCacheManager::get_instance().remove_frame_cache(src);

        Ok(())
    }

    pub fn close_all_videos(&self) -> Result<(), ErrorWithBacktrace> {
        let video_sources: Vec<String> = self.videos.read()?.keys().cloned().collect();
        for video_source in video_sources {
            self.remove_video(&video_source)?;
        }
        Ok(())
    }

    pub fn close_videos_if_cache_empty(&self) -> Result<(), ErrorWithBacktrace> {
        let video_sources: Vec<String> = self.videos.read()?.keys().cloned().collect();
        for video_source in video_sources {
            let closed = self
                .videos
                .read()?
                .get(&video_source)
                .cloned()
                .unwrap()
                .lock()
                .unwrap()
                .close_video_if_frame_cache_empty()?;
            if closed {
                self.videos.write()?.remove(&video_source);
            }
        }
        Ok(())
    }
}
