use std::sync::{Arc, Mutex};

use crate::opened_stream::OpenedStream;

pub struct OpenedVideo {
    pub opened_streams: Vec<Arc<Mutex<OpenedStream>>>,
}
