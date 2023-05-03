extern crate ffmpeg_next as remotionffmpeg;

use std::{
    collections::HashMap,
    io::ErrorKind,
    sync::{Arc, Mutex, RwLock},
};

use lazy_static::lazy_static;

use crate::{
    errors::ErrorWithBacktrace,
    frame_cache::FrameCacheReference,
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

    fn get_frame_references(&self) -> Result<Vec<FrameCacheReference>, ErrorWithBacktrace> {
        let mut vec: Vec<FrameCacheReference> = Vec::new();
        // 0..2 loops twice, not 0..1
        for i in 0..2 {
            let transparent = i == 0;
            for video in self.videos.read()?.values() {
                let video_locked = video.lock()?;
                let frame_cache = video_locked.get_frame_cache(transparent);
                let frame_cache_locked = frame_cache.lock()?;
                let references =
                    frame_cache_locked.get_references(video_locked.src.clone(), transparent)?;
                for reference in references {
                    vec.push(reference);
                }
            }
        }

        return Ok(vec);
    }

    pub fn only_keep_n_frames(&self, n_frames: usize) -> Result<(), ErrorWithBacktrace> {
        let references = self.get_frame_references()?;
        // Pay attention to underflow, usize is unsigned
        if references.len() < n_frames {
            return Ok(());
        }
        let to_remove = references.len() - n_frames;
        self.prune(to_remove)
    }

    pub fn prune_oldest(&self, ratio: f64) -> Result<(), ErrorWithBacktrace> {
        let references = self.get_frame_references()?;
        let oldest_n = (references.len() as f64 * ratio).ceil() as usize;
        self.prune(oldest_n)
    }

    pub fn prune(&self, oldest_n: usize) -> Result<(), ErrorWithBacktrace> {
        let references = self.get_frame_references()?;
        let mut sorted = references.clone();
        sorted.sort_by(|a, b| a.last_used.cmp(&b.last_used));
        let mut to_remove: Vec<FrameCacheReference> = Vec::new();
        for i in 0..oldest_n {
            to_remove.push(sorted[i].clone());
        }
        for removal in to_remove {
            let video_locked = self.get_video(&removal.src, removal.transparent)?;
            let mut video = video_locked.lock()?;
            video
                .get_frame_cache(removal.transparent)
                .lock()?
                .remove_item_by_id(removal.id)?;

            let closed = video.close_video_if_frame_cache_empty()?;
            if closed {
                self.videos.write()?.remove(&video.src);
            }
        }

        Ok(())
    }

    pub fn get_open_video_streams(&self) -> Result<usize, ErrorWithBacktrace> {
        let mut count = 0;
        for video in self.videos.read()?.values() {
            count += video.lock()?.opened_streams.len();
        }
        return Ok(count);
    }

    pub fn get_frames_in_cache(&self) -> Result<usize, ErrorWithBacktrace> {
        let mut count = 0;
        for video in self.videos.read()?.values() {
            count += video.lock()?.get_cache_size()?;
        }
        return Ok(count);
    }

    pub fn get_video(
        &self,
        src: &str,
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

        let video = open_video(src, transparent)?;
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
        Ok(())
    }

    pub fn close_all_videos(&self) -> Result<(), ErrorWithBacktrace> {
        let video_sources: Vec<String> = self.videos.read()?.keys().cloned().collect();
        for video_source in video_sources {
            self.remove_video(&video_source)?;
        }
        Ok(())
    }
}
