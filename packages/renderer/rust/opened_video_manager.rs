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
    global_printer::_print_verbose,
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
                let references = frame_cache_locked.get_references(
                    video_locked.src.clone(),
                    video_locked.original_src.clone(),
                    transparent,
                )?;
                for reference in references {
                    vec.push(reference);
                }
            }
        }

        return Ok(vec);
    }

    fn get_total_size(&self) -> Result<u128, ErrorWithBacktrace> {
        let mut total_size = 0;

        for video in self.videos.read()?.values() {
            let video_locked = video.lock()?;
            total_size += video_locked.get_cache_size_bytes()?;
        }

        return Ok(total_size);
    }

    pub fn only_keep_n_frames(
        &self,
        maximum_frame_cache_size_in_bytes: u128,
    ) -> Result<(), ErrorWithBacktrace> {
        self.prune(maximum_frame_cache_size_in_bytes)
    }

    pub fn prune_oldest(
        &self,
        maximum_frame_cache_size_in_bytes: u128,
    ) -> Result<(), ErrorWithBacktrace> {
        self.prune(maximum_frame_cache_size_in_bytes)
    }

    pub fn prune(&self, maximum_frame_cache_size_in_bytes: u128) -> Result<(), ErrorWithBacktrace> {
        let references = self.get_frame_references()?;
        let mut sorted = references.clone();
        sorted.sort_by(|a, b| a.last_used.cmp(&b.last_used));

        let mut pruned = 0;
        for removal in sorted {
            let current_cache_size_in_bytes = self.get_total_size()?;
            if current_cache_size_in_bytes < maximum_frame_cache_size_in_bytes {
                break;
            }
            {
                let video_locked =
                    self.get_video(&removal.src, &removal.original_src, removal.transparent)?;
                let mut video = video_locked.lock()?;
                video
                    .get_frame_cache(removal.transparent)
                    .lock()?
                    .remove_item_by_id(removal.id)?;

                pruned += 1;

                let closed = video.close_video_if_frame_cache_empty()?;
                if closed {
                    self.videos.write()?.remove(&video.src);
                }
            }
        }

        if pruned > 0 {
            _print_verbose(&format!(
                "Pruned {} to save memory, keeping {}. Total cache size: {}MB",
                pruned,
                self.get_frames_in_cache()?,
                self.get_total_size()? / 1024 / 1024
            ))?;
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
            count += video.lock()?.get_cache_size_items()?;
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
