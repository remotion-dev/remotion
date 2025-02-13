use std::sync::Mutex;

use crate::{errors::ErrorWithBacktrace, global_printer::_print_verbose};
use lazy_static::lazy_static;

pub struct OpenStream {
    pub src: String,
    pub last_time: f64,
    pub duration_in_seconds: Option<f64>,
    pub transparent: bool,
    pub id: usize,
}

struct ThreadStreams {
    streams: Vec<OpenStream>,
}

pub struct ThreadMap {
    map: Vec<ThreadStreams>,
    max_threads: Option<usize>,
}

#[derive(PartialEq, Debug, Clone)]
pub struct UseThisThread {
    pub thread_id: usize,
    pub stream_id: Option<usize>,
}

impl ThreadMap {
    pub fn new() -> Self {
        let map = ThreadMap {
            map: Vec::new(),
            max_threads: None,
        };
        map
    }

    pub fn set_max_thread_count(&mut self, max_threads: usize) {
        self.max_threads = Some(max_threads);
    }

    pub fn update_stream(
        &mut self,
        thread_index: usize,
        stream_index: usize,
        stream_to_set: OpenStream,
    ) {
        // Ensure we keep track of enough threads
        while self.map.len() <= thread_index {
            self.map.push(ThreadStreams {
                streams: Vec::new(),
            });
        }

        // Update stream if it exists
        for stream in self.map[thread_index].streams.iter_mut() {
            if stream.id == stream_index {
                self.map[thread_index].streams[stream_index] = stream_to_set;
                return;
            }
        }

        // Otherwise add it
        self.map[thread_index].streams.push(stream_to_set);
    }

    pub fn select_right_thread(
        &mut self,
        src: &String,
        time: f64,
        transparent: bool,
    ) -> Result<UseThisThread, ErrorWithBacktrace> {
        // Map to an existing stream
        for thread_id in 0..self.map.len() {
            for stream in self.map[thread_id].streams.iter_mut() {
                if &stream.src != src {
                    continue;
                }
                if stream.transparent != transparent {
                    continue;
                }
                let max_time = match stream.duration_in_seconds {
                    Some(duration) => duration.min(time),
                    None => time,
                };
                if (stream.last_time - max_time).abs() >= 5.0 {
                    continue;
                }
                _print_verbose(&format!(
                    "Reusing thread {} for stream {} at time {}",
                    thread_id, src, time
                ))?;
                return Ok(UseThisThread {
                    thread_id,
                    stream_id: Some(stream.id),
                });
            }
        }

        // Create new thread if allowed
        let max_thread = self.max_threads.unwrap();
        if self.map.len() < max_thread {
            return Ok(UseThisThread {
                thread_id: self.map.len(),
                stream_id: None,
            });
        }

        // Assign to the thread with the least amount of streams
        let least_amount_of_threads = self
            .map
            .iter()
            .enumerate()
            .min_by_key(|(_, streams)| streams.streams.len())
            .unwrap()
            .0;

        return Ok(UseThisThread {
            thread_id: least_amount_of_threads,
            stream_id: None,
        });
    }
}

lazy_static! {
    pub static ref THREAD_MAP: Mutex<ThreadMap> = Mutex::new(ThreadMap::new());
}
