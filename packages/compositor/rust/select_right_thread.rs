use crate::{errors::ErrorWithBacktrace, global_printer::_print_verbose};

struct OpenStream {
    src: String,
    last_time: f64,
}

struct ThreadStreams {
    streams: Vec<OpenStream>,
}

pub struct ThreadMap {
    map: Vec<Option<ThreadStreams>>,
    threads: usize,
}

impl ThreadMap {
    pub fn new(t: usize) -> Self {
        let mut map = ThreadMap {
            map: Vec::new(),
            threads: t,
        };
        for _ in 0..t {
            map.map.push(None);
        }
        map
    }

    pub fn select_right_thread(
        &mut self,
        src: &String,
        time: f64,
    ) -> Result<usize, ErrorWithBacktrace> {
        for thread_id in 0..self.map.len() {
            let thread_streams = self.map[thread_id].as_mut();
            if thread_streams.is_none() {
                continue;
            }
            for stream in &mut thread_streams.unwrap().streams {
                if &stream.src == src {
                    if (stream.last_time - time).abs() <= 10.0 {
                        stream.last_time = time;
                        _print_verbose(&format!(
                            "Reusing thread {} for stream {} at time {}",
                            thread_id, src, time
                        ))?;
                        return Ok(thread_id);
                    }
                }
            }
        }

        let mut min_streams = usize::MAX;
        let mut selected_thread = None;

        for thread_id in 0..self.map.len() {
            let thread_streams = self.map[thread_id].as_mut();
            if thread_streams.is_none() {
                continue;
            }
            let unwrapped = thread_streams.unwrap();

            if unwrapped.streams.is_empty() {
                selected_thread = Some(thread_id);
                break;
            } else if unwrapped.streams.len() < min_streams {
                min_streams = unwrapped.streams.len();
                selected_thread = Some(thread_id);
            }
        }

        let new_thread_id = match self.map.iter().position(|x| x.is_none()) {
            Some(thread_id) => thread_id,
            None => match selected_thread {
                Some(x) => x,
                None => self.map.len() % self.threads,
            },
        };

        if self.map[new_thread_id].is_none() {
            self.map[new_thread_id] = Some(ThreadStreams {
                streams: Vec::new(),
            });
        }

        let new_thread_streams = self.map[new_thread_id].as_mut().unwrap();

        new_thread_streams.streams.push(OpenStream {
            src: src.clone(),
            last_time: time,
        });

        _print_verbose(&format!(
            "Adding stream {} to thread {}",
            src, new_thread_id
        ))?;

        Ok(new_thread_id)
    }
}
