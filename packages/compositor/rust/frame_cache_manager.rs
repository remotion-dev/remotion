use std::{collections::HashMap, sync::Mutex};

use ffmpeg_next::Rational;

use crate::{
    errors::ErrorWithBacktrace,
    frame_cache::{FrameCache, FrameCacheItem, FrameCacheReference},
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
    thread_index: usize,
}

impl FrameCacheManager {
    fn frame_cache_exists(&self, src: &str) -> bool {
        self.cache.contains_key(src)
    }

    pub fn remove_frame_cache(&mut self, src: &str) {
        self.cache.remove(src);
    }

    pub fn remove_all(&mut self) {
        self.cache.clear();
    }

    fn get_frames_to_prune(
        &mut self,
        maximum_frame_cache_size_in_bytes: u64,
    ) -> Result<Vec<FrameCacheReference>, ErrorWithBacktrace> {
        let references = self.get_frame_references()?;
        let mut sorted = references.clone();
        sorted.sort_by(|a, b| a.last_used.cmp(&b.last_used));

        let max_cache_size = max_cache_size::get_instance().lock().unwrap();

        let current_cache_size_in_bytes =
            max_cache_size.get_cache_size_for_thread(self.thread_index);

        let mut to_remove: Vec<FrameCacheReference> = vec![];

        let bytes_to_free = match current_cache_size_in_bytes > maximum_frame_cache_size_in_bytes {
            true => current_cache_size_in_bytes - maximum_frame_cache_size_in_bytes,
            false => {
                return Ok(to_remove);
            }
        };

        let mut removed = 0;
        let mut removed_count = 0;

        for removal in sorted {
            removed += removal.size;
            removed_count += 1;
            to_remove.push(removal.clone());
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

    pub fn get_to_prune_local(
        &mut self,
        max_cache_size: u64,
    ) -> Result<Vec<FrameCacheReference>, ErrorWithBacktrace> {
        let to_prune = { self.get_frames_to_prune(max_cache_size)? };
        let of_thread: Vec<FrameCacheReference> = to_prune.clone();
        Ok(of_thread)
    }

    pub fn prune_on_thread(&mut self, max_cache_size: u64) -> Result<(), ErrorWithBacktrace> {
        let of_thread = self.get_to_prune_local(max_cache_size)?;
        self.execute_prune(of_thread, self.thread_index, max_cache_size)?;
        Ok(())
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

    pub fn add_to_cache(
        &mut self,
        src: &str,
        original_src: &str,
        transparent: bool,
        tone_mapped: bool,
        item: FrameCacheItem,
        thread_index: usize,
    ) {
        self.get_frame_cache(src, original_src, transparent, tone_mapped)
            .lock()
            .unwrap()
            .add_item(item, thread_index)
    }

    pub fn get_item_from_id(
        &mut self,
        src: &str,
        original_src: &str,
        transparent: bool,
        tone_mapped: bool,
        frame_id: usize,
    ) -> Result<Option<Vec<u8>>, ErrorWithBacktrace> {
        let thread_index = self.thread_index.clone();
        self.get_frame_cache(src, original_src, transparent, tone_mapped)
            .lock()
            .unwrap()
            .get_item_from_id(frame_id, thread_index)
    }

    pub fn set_last_frame(
        &mut self,
        src: &str,
        original_src: &str,
        transparent: bool,
        tone_mapped: bool,
        last_frame: usize,
    ) {
        self.get_frame_cache(src, original_src, transparent, tone_mapped)
            .lock()
            .unwrap()
            .set_last_frame(last_frame);
    }
    pub fn get_last_timestamp_in_sec(
        &mut self,
        src: &str,
        original_src: &str,
        transparent: bool,
        tone_mapped: bool,
        time_base: Rational,
    ) -> Option<f64> {
        self.get_frame_cache(src, original_src, transparent, tone_mapped)
            .lock()
            .unwrap()
            .get_last_frame_in_second(time_base)
    }
    pub fn set_biggest_frame_as_last_frame(
        &mut self,
        src: &str,
        original_src: &str,
        transparent: bool,
        tone_mapped: bool,
    ) {
        self.get_frame_cache(src, original_src, transparent, tone_mapped)
            .lock()
            .unwrap()
            .set_biggest_frame_as_last_frame();
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
        let thread_index = self.thread_index.clone();
        Ok(self
            .get_frame_cache(src, original_src, transparent, tone_mapped)
            .lock()?
            .get_item_id(time, threshold, thread_index)?)
    }

    pub fn get_cache_item_from_id(
        &mut self,
        src: &str,
        original_src: &str,
        transparent: bool,
        tone_mapped: bool,
        frame_id: usize,
    ) -> Result<Vec<u8>, ErrorWithBacktrace> {
        let thread_index = self.thread_index.clone();
        match self
            .get_frame_cache(src, original_src, transparent, tone_mapped)
            .lock()?
            .get_item_from_id(frame_id, thread_index)?
        {
            Some(item) => Ok(item),
            None => Err(ErrorWithBacktrace::from("No item found in cache")),
        }
    }

    pub fn is_empty(
        &mut self,
        src: &str,
        original_src: &str,
        transparent: bool,
        tone_mapped: bool,
    ) -> Result<bool, ErrorWithBacktrace> {
        let res = self
            .get_frame_cache(src, original_src, transparent, tone_mapped)
            .lock()?
            .is_empty();
        Ok(res)
    }

    pub fn get_frame_references(&mut self) -> Result<Vec<FrameCacheReference>, ErrorWithBacktrace> {
        let mut vec: Vec<FrameCacheReference> = Vec::new();
        let keys = self.cache.keys().cloned().collect::<Vec<String>>();

        let thread_index = self.thread_index;

        // 0..2 loops twice, not 0..1
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
                    thread_index,
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

    fn remove_item_by_id(
        &mut self,
        removal: FrameCacheReference,
    ) -> Result<(), ErrorWithBacktrace> {
        self.get_frame_cache(
            &removal.src,
            &removal.original_src,
            removal.transparent,
            removal.tone_mapped,
        )
        .lock()?
        .remove_item_by_id(removal.id, removal.thread_index)?;
        Ok(())
    }

    pub fn execute_prune(
        &mut self,
        to_prune: Vec<FrameCacheReference>,
        thread_index: usize,
        max_cache_size: u64,
    ) -> Result<(), ErrorWithBacktrace> {
        let mut pruned = 0;
        for removal in to_prune {
            self.remove_item_by_id(removal)?;
            pruned += 1;
        }

        let max_cache = max_cache_size::get_instance().lock().unwrap();
        if pruned > 0 {
            _print_verbose(&format!(
                "Pruned {} on thread {} to save memory, keeping {}. Cache size on thread: {}MB, total cache: {}MB, max cache on thread: {}MB",
                pruned,
                thread_index,
                self.get_frames_in_cache()?,
                self.get_total_size()? / 1024 / 1024,
                max_cache.get_current_cache_size() / 1024 / 1024,
                max_cache_size / 1024 / 1024
            ))?;
        } else {
            _print_verbose(&format!(
                "Nothing to prune on thread {}, frames in cache: {}, cache on thread: {}MB, total cache size: {}MB, max cache on thread: {}MB",
                thread_index,
                self.get_frames_in_cache()?,
                self.get_total_size()? / 1024 / 1024,
                max_cache.get_current_cache_size() / 1024 / 1024,
                max_cache_size / 1024 / 1024
            ))?;
        }
        Ok(())
    }

    pub fn get_frames_in_cache(&mut self) -> Result<usize, ErrorWithBacktrace> {
        let references = self.get_frame_references()?;

        return Ok(references.len());
    }
}

pub fn make_frame_cache_manager(
    thread_index: usize,
) -> Result<FrameCacheManager, ErrorWithBacktrace> {
    Ok(FrameCacheManager {
        cache: HashMap::new(),
        thread_index,
    })
}
