use std::sync::Mutex;

use crate::{
    errors::ErrorWithBacktrace, frame_cache::FrameCacheReference, global_printer::_print_verbose,
    max_cache_size,
};
use lazy_static::lazy_static;

pub struct CacheReferences {
    map: Vec<Vec<FrameCacheReference>>,
}

impl CacheReferences {
    pub fn new() -> Self {
        CacheReferences { map: Vec::new() }
    }

    pub fn set_cache_references(
        &mut self,
        thread_index: usize,
        references: Vec<FrameCacheReference>,
    ) {
        while self.map.len() <= thread_index {
            self.map.push(Vec::new());
        }

        self.map[thread_index] = references;
    }

    pub fn get_all_cache_references(&mut self) -> Vec<FrameCacheReference> {
        let mut map: Vec<FrameCacheReference> = Vec::new();
        for thread in self.map.iter() {
            for reference in thread.iter() {
                map.push(reference.clone());
            }
        }
        return map;
    }

    pub fn get_frames_to_prune(
        &mut self,
        maximum_frame_cache_size_in_bytes: u64,
        scope_to_thread_index: Option<usize>,
    ) -> Result<Vec<Vec<FrameCacheReference>>, ErrorWithBacktrace> {
        let references = self.get_all_cache_references();
        let mut sorted = references.clone();
        sorted.sort_by(|a, b| a.last_used.cmp(&b.last_used));

        let max_cache_size = max_cache_size::get_instance().lock().unwrap();

        let current_cache_size_in_bytes = match scope_to_thread_index {
            Some(index) => max_cache_size.get_cache_size_for_thread(index),
            None => max_cache_size.get_current_cache_size(),
        };
        let max_allowed_cache_size = match scope_to_thread_index {
            Some(_) => maximum_frame_cache_size_in_bytes / max_cache_size.thread_count() as u64,
            None => maximum_frame_cache_size_in_bytes,
        };

        let mut to_remove: Vec<Vec<FrameCacheReference>> = vec![Vec::new(); self.map.len()];

        let bytes_to_free = match current_cache_size_in_bytes > max_allowed_cache_size {
            true => current_cache_size_in_bytes - max_allowed_cache_size,
            false => {
                return Ok(to_remove);
            }
        };

        let mut removed = 0;
        let mut removed_count = 0;

        for removal in sorted {
            if scope_to_thread_index.is_some()
                && removal.thread_index != scope_to_thread_index.unwrap()
            {
                continue;
            }
            removed += removal.size;
            removed_count += 1;
            to_remove[removal.thread_index].push(removal.clone());
            if removed >= bytes_to_free {
                break;
            }
        }

        _print_verbose(&format!(
            "Need to free {}MB, Selected {} frames ({}MB) for removal",
            bytes_to_free / 1024 / 1024,
            removed_count,
            removed / 1024 / 1024
        ))?;

        Ok(to_remove)
    }
}

lazy_static! {
    pub static ref FRAME_CACHE_REFERENCES: Mutex<CacheReferences> =
        Mutex::new(CacheReferences::new());
}
