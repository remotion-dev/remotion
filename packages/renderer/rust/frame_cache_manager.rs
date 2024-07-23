use std::{
    collections::HashMap,
    sync::{Arc, Mutex, RwLock},
};

use crate::{
    errors::ErrorWithBacktrace,
    frame_cache::{FrameCache, FrameCacheReference},
    global_printer::_print_verbose,
};
use ffmpeg_next::format;
use lazy_static::lazy_static;

pub struct FrameCacheAndOriginalSource {
    transparent_tone_mapped: Arc<Mutex<FrameCache>>,
    opaque_tone_mapped: Arc<Mutex<FrameCache>>,
    transparent_original: Arc<Mutex<FrameCache>>,
    opaque_original: Arc<Mutex<FrameCache>>,
    original_src: String,
}

pub struct FrameCacheManager {
    cache: RwLock<HashMap<String, FrameCacheAndOriginalSource>>,
}

impl FrameCacheManager {
    pub fn get_instance() -> &'static FrameCacheManager {
        lazy_static! {
            static ref INSTANCE: FrameCacheManager = make_frame_cache_manager().unwrap();
        }
        &INSTANCE
    }

    fn frame_cache_exists(&self, src: &str) -> bool {
        self.cache.read().unwrap().contains_key(src)
    }

    pub fn clear_frame_cache(&self, src: &str) {
        let cache = self.cache.write().unwrap();
        let unwrapped = cache.get(src).unwrap();
        unwrapped
            .transparent_tone_mapped
            .clone()
            .lock()
            .unwrap()
            .remove_all_items();

        unwrapped
            .transparent_original
            .clone()
            .lock()
            .unwrap()
            .remove_all_items();

        unwrapped
            .opaque_original
            .clone()
            .lock()
            .unwrap()
            .remove_all_items();

        unwrapped
            .opaque_tone_mapped
            .clone()
            .lock()
            .unwrap()
            .remove_all_items();
    }

    fn add_frame_cache(&self, src: &str, original_src: &str) {
        let frame_cache_and_original_src = FrameCacheAndOriginalSource {
            transparent_original: Arc::new(Mutex::new(FrameCache::new())),
            transparent_tone_mapped: Arc::new(Mutex::new(FrameCache::new())),
            opaque_original: Arc::new(Mutex::new(FrameCache::new())),
            opaque_tone_mapped: Arc::new(Mutex::new(FrameCache::new())),
            original_src: original_src.to_string(),
        };

        self.cache
            .write()
            .unwrap()
            .insert(src.to_string(), frame_cache_and_original_src);
    }

    pub fn get_frame_cache(
        &self,
        src: &str,
        original_src: &str,
        transparent: bool,
        tone_mapped: bool,
    ) -> Arc<Mutex<FrameCache>> {
        if !self.frame_cache_exists(src) {
            self.add_frame_cache(src, original_src);
        }

        match transparent {
            true => match tone_mapped {
                true => self
                    .cache
                    .read()
                    .unwrap()
                    .get(src)
                    .unwrap()
                    .transparent_tone_mapped
                    .clone(),
                false => self
                    .cache
                    .read()
                    .unwrap()
                    .get(src)
                    .unwrap()
                    .transparent_original
                    .clone(),
            },
            false => match tone_mapped {
                true => self
                    .cache
                    .read()
                    .unwrap()
                    .get(src)
                    .unwrap()
                    .opaque_tone_mapped
                    .clone(),
                false => self
                    .cache
                    .read()
                    .unwrap()
                    .get(src)
                    .unwrap()
                    .opaque_original
                    .clone(),
            },
        }
    }

    pub fn get_cache_item_id(
        &self,
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
        &self,
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

    pub fn get_frame_references(&self) -> Result<Vec<FrameCacheReference>, ErrorWithBacktrace> {
        let mut vec: Vec<FrameCacheReference> = Vec::new();
        let keys = self
            .cache
            .read()
            .unwrap()
            .keys()
            .cloned()
            .collect::<Vec<String>>();

        // 0..2 loops twice, not 0..1
        for i in 0..4 {
            let transparent = i == 0 || i == 2;
            let tone_mapped = i == 0 || i == 1;

            for key in keys.clone() {
                let src = key.clone();
                let original_src = self
                    .cache
                    .read()
                    .unwrap()
                    .get(&src)
                    .unwrap()
                    .original_src
                    .clone();
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

    pub fn get_total_size(&self) -> Result<u128, ErrorWithBacktrace> {
        let mut total_size = 0;

        let keys = self
            .cache
            .read()
            .unwrap()
            .keys()
            .cloned()
            .collect::<Vec<String>>();

        for i in 0..4 {
            let transparent = i == 0 || i == 2;
            let tone_mapped = i == 0 || i == 1;

            for key in keys.clone() {
                let src = key.clone();

                let original_src = self
                    .cache
                    .read()
                    .unwrap()
                    .get(&src)
                    .unwrap()
                    .original_src
                    .clone();
                let lock = self.get_frame_cache(&src, &original_src, transparent, tone_mapped);
                let frame_cache = lock.lock()?;
                total_size += frame_cache.get_size_in_bytes();
            }
        }

        return Ok(total_size);
    }

    pub fn get_average_size(&self) -> Result<u128, ErrorWithBacktrace> {
        let mut total_size = 0;

        let keys = self
            .cache
            .read()
            .unwrap()
            .keys()
            .cloned()
            .collect::<Vec<String>>();

        let mut items: usize = 0;

        let mut sizes = Vec::new();
        let mut item_counts = Vec::new();

        for i in 0..4 {
            let transparent = i == 0 || i == 2;
            let tone_mapped = i == 0 || i == 1;

            for key in keys.clone() {
                let src = key.clone();

                let original_src = self
                    .cache
                    .read()
                    .unwrap()
                    .get(&src)
                    .unwrap()
                    .original_src
                    .clone();
                let lock = self.get_frame_cache(&src, &original_src, transparent, tone_mapped);
                let frame_cache = lock.lock()?;
                let size_in_bytes = frame_cache.get_size_in_bytes();

                total_size += size_in_bytes;
                items += frame_cache.get_cache_item_count();
                sizes.push(size_in_bytes);
                item_counts.push(frame_cache.get_cache_item_count());
            }
        }

        _print_verbose(&format!("memory keys are {:?}", keys)).unwrap();
        _print_verbose(&format!("memory sizes are {:?}", sizes)).unwrap();
        _print_verbose(&format!("memory item counts are {:?}", item_counts)).unwrap();

        return Ok(total_size / items as u128);
    }

    pub fn prune(&self, maximum_frame_cache_size_in_bytes: u128) -> Result<(), ErrorWithBacktrace> {
        let references = FrameCacheManager::get_instance().get_frame_references()?;
        let mut sorted = references.clone();
        sorted.sort_by(|a, b| a.last_used.cmp(&b.last_used));

        let mut pruned = 0;
        for removal in sorted {
            let current_cache_size_in_bytes = self.get_total_size()?;
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
                _print_verbose(&format!(
                    "Save memory: Pruned frame {} {} {} {}",
                    removal.src, removal.transparent, removal.tone_mapped, removal.id
                ))?;

                pruned += 1;
            }
        }

        if pruned > 0 {
            _print_verbose(&format!(
                "Pruned {} to save memory, keeping {}. Total cache size: {}MB, Avg Size: {}MB",
                pruned,
                self.get_frames_in_cache()?,
                self.get_total_size()? / 1024 / 1024,
                self.get_average_size()? / 1024 / 1024
            ))?;
        }

        Ok(())
    }

    pub fn prune_oldest(
        &self,
        maximum_frame_cache_size_in_bytes: u128,
    ) -> Result<(), ErrorWithBacktrace> {
        self.prune(maximum_frame_cache_size_in_bytes)
    }

    // Should be called if system is about to run out of memory
    pub fn halfen_cache_size(&self) -> Result<(), ErrorWithBacktrace> {
        let current_cache_size = self.get_total_size()?;
        self.prune(current_cache_size / 2);
        _print_verbose(&format!(
            "memory Cache size reduced to {}MB",
            current_cache_size / 1024 / 1024
        ))?;
        Ok(())
    }

    pub fn get_frames_in_cache(&self) -> Result<usize, ErrorWithBacktrace> {
        let references = self.get_frame_references()?;

        return Ok(references.len());
    }
}

pub fn make_frame_cache_manager() -> Result<FrameCacheManager, ErrorWithBacktrace> {
    Ok(FrameCacheManager {
        cache: RwLock::new(HashMap::new()),
    })
}
