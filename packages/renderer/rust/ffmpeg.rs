use lazy_static::lazy_static;

use crate::errors::PossibleErrors;
use crate::opened_stream::open_video;
use crate::opened_video::OpenedVideo;
use std::collections::HashMap;
use std::io::ErrorKind;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::RwLock;
extern crate ffmpeg_next as remotionffmpeg;

pub fn extract_frame(src: String, time: f64, transparent: bool) -> Result<Vec<u8>, PossibleErrors> {
    let manager = OpenedVideoManager::get_instance();
    let video_locked = manager.get_video(&src, transparent)?;
    let vid = video_locked.lock().unwrap();

    let mut first_opened_stram = vid.opened_streams.first().unwrap().lock().unwrap();

    // TODO: Handle multiple streams
    let frame_id = first_opened_stram.get_frame(time, transparent, &vid.frame_cache);

    let from_cache = vid
        .frame_cache
        .lock()
        .unwrap()
        .get_item_from_id(frame_id.unwrap());

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

pub fn make_opened_stream_manager() -> OpenedVideoManager {
    remotionffmpeg::init().unwrap();
    OpenedVideoManager {
        videos: RwLock::new(HashMap::new()),
    }
}

impl OpenedVideoManager {
    pub fn get_instance() -> &'static OpenedVideoManager {
        lazy_static! {
            static ref INSTANCE: OpenedVideoManager = make_opened_stream_manager();
        }
        &INSTANCE
    }

    pub fn get_video(
        &self,
        src: &str,
        transparent: bool,
    ) -> Result<Arc<Mutex<OpenedVideo>>, PossibleErrors> {
        // Adding a block scope because of the RwLock,
        // preventing a deadlock
        {
            let videos_read = self.videos.try_read();
            if videos_read.is_err() {
                return Err(std::io::Error::new(ErrorKind::Other, "Deadlock").into());
            }
            let videos = videos_read.unwrap();
            if videos.contains_key(src) {
                return Ok(videos.get(src).unwrap().clone());
            }
        }

        let video = open_video(src, transparent)?;
        let videos_write = self.videos.write();

        videos_write
            .unwrap()
            .insert(src.to_string(), Arc::new(Mutex::new(video)));

        return Ok(self.videos.read().unwrap().get(src).unwrap().clone());
    }

    pub fn remove_video(&self, src: String) {
        let videos = self.videos.write();
        videos.unwrap().remove(&src);
    }
}
