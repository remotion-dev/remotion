use std::{collections::HashMap, sync::Mutex};

use crate::{
    errors::ErrorWithBacktrace,
    frame_cache::{FrameCache, FrameCacheReference},
    global_printer::_print_verbose,
    max_cache_size,
};

pub struct FrameCacheAndOriginalSource {
    transparent_tone_mapped: Mutex<FrameCache>,
    opaque_tone_mapped: Mutex<FrameCache>,
    transparent_original: Mutex<FrameCache>,
    opaque_original: Mutex<FrameCache>,
    original_src: String,
}

pub struct FrameCacheManager {
    cache: HashMap<String, FrameCacheAndOriginalSource>,
}

impl FrameCacheManager {
    fn frame_cache_exists(&self, src: &str) -> bool {
        self.cache.contains_key(src)
    }

    pub fn remove_frame_cache(&mut self, src: &str) {
        self.cache.remove(src);
    }

    fn add_frame_cache(&mut self, src: &str, original_src: &str) {
        let frame_cache_and_original_src = FrameCacheAndOriginalSource {
            transparent_original: Mutex::new(FrameCache::new()),
            transparent_tone_mapped: Mutex::new(FrameCache::new()),
            opaque_original: Mutex::new(FrameCache::new()),
            opaque_tone_mapped: Mutex::new(FrameCache::new()),
            original_src: original_src.to_string(),
        };

        self.cache
            .insert(src.to_string(), frame_cache_and_original_src);
    }

    pub fn get_frame_cache(
        &mut self,
        src: &str,
        original_src: &str,
        transparent: bool,
        tone_mapped: bool,
    ) -> &Mutex<FrameCache> {
        if !self.frame_cache_exists(src) {
            self.add_frame_cache(src, original_src);
        }

        match transparent {
            true => match tone_mapped {
                true => &self.cache.get(src).unwrap().transparent_tone_mapped,
                false => &self.cache.get(src).unwrap().transparent_original,
            },
            false => match tone_mapped {
                true => &self.cache.get(src).unwrap().opaque_tone_mapped,
                false => &self.cache.get(src).unwrap().opaque_original,
            },
        }
    }

    pub fn get_cache_item_id(
        &mut self,
        src: &str,
        original_src: &str,
        transparent: bool,
        tone_mapped: bool,
        time: i64,
        threshold: i64,
    ) -> Result<Option<usize>, ErrorWithBacktrace> {
        Ok(self
            .get_frame_cache(src, original_src, transparent, tone_mapped)
            .lock()?
            .get_item_id(time, threshold)?)
    }

    pub fn get_cache_item_from_id(
        &mut self,
        src: &str,
        original_src: &str,
        transparent: bool,
        tone_mapped: bool,
        frame_id: usize,
    ) -> Result<Vec<u8>, ErrorWithBacktrace> {
        match self
            .get_frame_cache(src, original_src, transparent, tone_mapped)
            .lock()?
            .get_item_from_id(frame_id)?
        {
            Some(item) => Ok(item),
            None => Err(ErrorWithBacktrace::from("No item found in cache")),
        }
    }

    pub fn get_frame_references(&mut self) -> Result<Vec<FrameCacheReference>, ErrorWithBacktrace> {
        let mut vec: Vec<FrameCacheReference> = Vec::new();
        // 0..2 loops twice, not 0..1
        let keys = self.cache.keys().cloned().collect::<Vec<String>>();

        for i in 0..4 {
            let transparent = i == 0 || i == 2;
            let tone_mapped = i == 0 || i == 1;

            for key in keys.clone() {
                let src = key.clone();
                let original_src = self.cache.get(&src).unwrap().original_src.clone();
                let lock = self.get_frame_cache(&src, &original_src, transparent, tone_mapped);
                let frame_cache = lock.lock()?;

                let references = frame_cache.get_references(
                    src.to_string(),
                    original_src.to_string(),
                    transparent,
                    tone_mapped,
                )?;
                for reference in references {
                    vec.push(reference);
                }
            }
        }

        return Ok(vec);
    }

    fn get_total_size(&mut self) -> Result<u64, ErrorWithBacktrace> {
        let mut total_size = 0;

        let keys = self.cache.keys().cloned().collect::<Vec<String>>();

        for i in 0..4 {
            let transparent = i == 0 || i == 2;
            let tone_mapped = i == 0 || i == 1;

            for key in keys.clone() {
                let src = key.clone();

                let original_src = self.cache.get(&src).unwrap().original_src.clone();
                let lock = self.get_frame_cache(&src, &original_src, transparent, tone_mapped);
                let frame_cache = lock.lock()?;
                total_size += frame_cache.get_local_size_in_bytes();
            }
        }

        return Ok(total_size);
    }

    pub fn prune(
        &mut self,
        maximum_frame_cache_size_in_bytes: u64,
        thread_index: usize,
    ) -> Result<(), ErrorWithBacktrace> {
        let references = self.get_frame_references()?;
        let mut sorted = references.clone();
        sorted.sort_by(|a, b| a.last_used.cmp(&b.last_used));

        let mut pruned = 0;
        for removal in sorted {
            let current_cache_size_in_bytes = max_cache_size::get_instance()
                .lock()
                .unwrap()
                .get_current_cache_size();
            if current_cache_size_in_bytes < maximum_frame_cache_size_in_bytes {
                break;
            }
            {
                self.get_frame_cache(
                    &removal.src,
                    &removal.original_src,
                    removal.transparent,
                    removal.tone_mapped,
                )
                .lock()?
                .remove_item_by_id(removal.id)?;

                pruned += 1;
            }
        }

        if pruned > 0 {
            _print_verbose(&format!(
                "Pruned {} to save memory, keeping {}. Cache size on thread {}: {}MB, total cache: {}MB",
                pruned,
                self.get_frames_in_cache()?,
                thread_index,
                self.get_total_size()? / 1024 / 1024,
                max_cache_size::get_instance().lock().unwrap().get_current_cache_size() / 1024 / 1024
            ))?;
        }

        Ok(())
    }

    // Should be called if system is about to run out of memory
    pub fn halfen_cache_size(&mut self, thread_index: usize) -> Result<(), ErrorWithBacktrace> {
        let current_cache_size = self.get_total_size()?;
        self.prune(current_cache_size / 2, thread_index)
    }

    pub fn get_frames_in_cache(&mut self) -> Result<usize, ErrorWithBacktrace> {
        let references = self.get_frame_references()?;

        return Ok(references.len());
    }
}

pub fn make_frame_cache_manager() -> Result<FrameCacheManager, ErrorWithBacktrace> {
    Ok(FrameCacheManager {
        cache: HashMap::new(),
    })
}
