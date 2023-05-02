use lazy_static::lazy_static;

use crate::errors::ErrorWithBacktrace;
use crate::frame_cache::FrameCacheReference;
use crate::global_printer::_print_debug;
use crate::logger::log_callback;
use crate::opened_stream::calc_position;
use crate::opened_video::open_video;
use crate::opened_video::OpenedVideo;
use crate::payloads::payloads::OpenVideoStats;
use std::collections::HashMap;
use std::io::ErrorKind;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::RwLock;
extern crate ffmpeg_next as remotionffmpeg;

pub fn get_open_video_stats() -> Result<OpenVideoStats, ErrorWithBacktrace> {
    let manager = OpenedVideoManager::get_instance();
    let open_videos = manager.get_open_videos()?;
    let open_streams = manager.get_open_video_streams()?;
    let frames_in_cache = manager.get_frames_in_cache()?;

    Ok(OpenVideoStats {
        open_videos,
        open_streams,
        frames_in_cache,
    })
}

pub fn close_all_videos() -> Result<(), ErrorWithBacktrace> {
    let manager = OpenedVideoManager::get_instance();

    let video_sources: Vec<String> = manager.videos.read()?.keys().cloned().collect();
    for video_source in video_sources {
        manager.remove_video(&video_source)?;
    }
    Ok(())
}

pub fn free_up_memory(ratio: f64) -> Result<(), ErrorWithBacktrace> {
    let manager = OpenedVideoManager::get_instance();

    manager.prune_oldest(ratio)?;

    Ok(())
}

pub fn keep_only_latest_frames(frames: usize) -> Result<(), ErrorWithBacktrace> {
    let manager = OpenedVideoManager::get_instance();

    manager.only_keep_n_frames(frames)?;

    Ok(())
}

pub fn extract_frame(
    src: String,
    time: f64,
    transparent: bool,
) -> Result<Vec<u8>, ErrorWithBacktrace> {
    let manager = OpenedVideoManager::get_instance();
    let video_locked = manager.get_video(&src, transparent)?;
    let mut vid = video_locked.lock()?;

    let position = calc_position(time, vid.time_base);
    _print_debug(&format!("time, position {} {}", time, position));
    let one_frame_after = calc_position(
        time + (1.0 / (vid.fps.numerator() as f64 / vid.fps.denominator() as f64)),
        vid.time_base,
    );
    let threshold = (one_frame_after - position) / 2;
    let cache_item = vid.get_cache_item_id(transparent, position, threshold);

    match cache_item {
        Ok(Some(item)) => return Ok(vid.get_cache_item_from_id(transparent, item)?),
        Ok(None) => {}
        Err(err) => {
            return Err(err);
        }
    }
    let open_stream_count = vid.opened_streams.len();
    let mut suitable_open_stream: Option<usize> = None;

    // Seeking too far back in a stream is not efficient, rather open a new stream
    // 15 seconds was chosen arbitrarily
    let max_stream_position = calc_position(time + 15.0, vid.time_base);
    let min_stream_position = calc_position(time - 15.0, vid.time_base);
    for i in 0..open_stream_count {
        let stream = vid.opened_streams[i].lock()?;

        suitable_open_stream = Some(i);
        break;
    }

    let stream_index = match suitable_open_stream {
        Some(index) => Ok(index),
        None => vid.open_new_stream(transparent),
    };

    let opened_stream = match vid.opened_streams.get(stream_index?) {
        Some(stream) => stream,
        None => Err(std::io::Error::new(
            ErrorKind::Other,
            "Stream index out of bounds",
        ))?,
    };

    let mut first_opened_stream = opened_stream.lock()?;

    let frame_id = first_opened_stream.get_frame(
        time,
        &vid.get_frame_cache(transparent),
        position,
        vid.time_base,
    )?;

    let from_cache = vid
        .get_frame_cache(transparent)
        .lock()?
        .get_item_from_id(frame_id);

    match from_cache {
        Ok(Some(data)) => Ok(data),
        Ok(None) => Err(std::io::Error::new(
            ErrorKind::Other,
            "Frame evicted from cache",
        ))?,
        Err(err) => Err(err),
    }
}

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
}
