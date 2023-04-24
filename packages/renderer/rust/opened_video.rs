use std::sync::{Arc, Mutex};

use crate::{frame_cache::FrameCache, opened_stream::OpenedStream};

pub struct OpenedVideo {
    pub opened_streams: Vec<Arc<Mutex<OpenedStream>>>,
    pub frame_cache: Arc<Mutex<FrameCache>>,
}
