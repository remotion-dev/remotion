extern crate ffmpeg_next as remotionffmpeg;

use std::sync::atomic::{AtomicUsize, Ordering};

use ffmpeg_next::Rational;
use serde::{Deserialize, Serialize};

use crate::{
    errors::ErrorWithBacktrace,
    global_printer::{_print_debug, _print_verbose},
    max_cache_size,
    opened_stream::get_time,
    scalable_frame::ScalableFrame,
};

pub fn get_frame_cache_id() -> usize {
    static COUNTER: AtomicUsize = AtomicUsize::new(1);
    COUNTER.fetch_add(1, Ordering::Relaxed)
}

pub struct FrameCacheItem {
    pub resolved_pts: i64,
    pub previous_pts: Option<i64>,
    pub asked_time: i64,
    pub frame: ScalableFrame,
    pub id: usize,
    pub last_used: u128,
}

pub struct FrameCache {
    pub items: Vec<FrameCacheItem>,
    pub last_frame: Option<usize>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct FrameCacheReference {
    pub id: usize,
    pub last_used: u128,
    pub src: String,
    pub original_src: String,
    pub transparent: bool,
    pub tone_mapped: bool,
    pub thread_index: usize,
    pub size: u64,
}

#[derive(Clone, Copy)]
struct LastFrameFoundSoFar {
    pub id: usize,
    pub pts: i64,
}

impl FrameCache {
    pub fn new() -> Self {
        Self {
            items: Vec::new(),
            last_frame: None,
        }
    }

    pub fn get_references(
        &self,
        src: String,
        original_src: String,
        transparent: bool,
        tone_mapped: bool,
        thread_index: usize,
    ) -> Result<Vec<FrameCacheReference>, ErrorWithBacktrace> {
        let mut references: Vec<FrameCacheReference> = Vec::new();
        for item in &self.items {
            references.push(FrameCacheReference {
                id: item.id,
                last_used: item.last_used,
                src: src.clone(),
                original_src: original_src.clone(),
                transparent,
                tone_mapped,
                thread_index,
                size: item.frame.get_size(),
            });
        }
        Ok(references)
    }

    pub fn add_item(&mut self, item: FrameCacheItem, thread_index: usize) {
        max_cache_size::get_instance()
            .lock()
            .unwrap()
            .add_to_current_cache_size(thread_index, item.frame.get_size().into());
        self.items.push(item);
    }

    pub fn set_last_frame(&mut self, id: usize) {
        self.last_frame = Some(id);
    }

    pub fn get_last_frame_in_second(&mut self, time_base: Rational) -> Option<f64> {
        match self.last_frame {
            Some(last_frame_id) => {
                for i in 0..self.items.len() {
                    if self.items[i].id == last_frame_id {
                        let pts = self.items[i].resolved_pts as f64;
                        let in_seconds = pts / (time_base.1 as f64 / time_base.0 as f64);
                        return Some(in_seconds);
                    }
                }
                None
            }
            None => None,
        }
    }

    pub fn set_biggest_frame_as_last_frame(&mut self) {
        let mut last_frame_found: Option<LastFrameFoundSoFar> = None;
        for i in 0..self.items.len() {
            match last_frame_found {
                Some(exists) => {
                    if self.items[i].resolved_pts > exists.pts {
                        last_frame_found = Some(LastFrameFoundSoFar {
                            id: self.items[i].id,
                            pts: self.items[i].resolved_pts,
                        });
                    }
                }
                None => {
                    last_frame_found = Some(LastFrameFoundSoFar {
                        id: self.items[i].id,
                        pts: self.items[i].resolved_pts,
                    });
                }
            }
        }
        match last_frame_found {
            Some(biggest_frame) => {
                self.set_last_frame(biggest_frame.id);
            }
            None => {}
        }
    }

    pub fn get_item_from_id(
        &mut self,
        id: usize,
        thread_index: usize,
    ) -> Result<Option<Vec<u8>>, ErrorWithBacktrace> {
        let mut data: Option<Vec<u8>> = None;
        for i in 0..self.items.len() {
            if self.items[i].id == id {
                self.items[i].frame.ensure_data(thread_index)?;
                self.items[i].last_used = get_time();
                data = Some(self.items[i].frame.get_data()?);
                break;
            }
        }
        Ok(data)
    }

    pub fn remove_item_by_id(
        &mut self,
        id: usize,
        thread_index: usize,
    ) -> Result<(), ErrorWithBacktrace> {
        for i in 0..self.items.len() {
            if self.items[i].id == id {
                if self.last_frame.is_some() && id == self.last_frame.expect("last_frame") {
                    self.last_frame = None;
                }

                max_cache_size::get_instance()
                    .lock()
                    .unwrap()
                    .remove_from_cache_size(thread_index, self.items[i].frame.get_size().into());

                self.items.remove(i);
                break;
            }
        }
        Ok(())
    }

    pub fn is_empty(&self) -> bool {
        self.items.is_empty()
    }

    pub fn get_cache_item_count(&self) -> usize {
        self.items.len()
    }

    pub fn get_local_size_in_bytes(&self) -> u64 {
        let mut size: u64 = 0;
        for item in &self.items {
            size += item.frame.get_size();
        }
        size
    }

    pub fn get_item_id(
        &mut self,
        time: i64,
        threshold: i64,
        thread_index: usize,
    ) -> Result<Option<usize>, ErrorWithBacktrace> {
        let mut best_item: Option<usize> = None;
        let mut best_distance = std::i64::MAX;

        // Is last frame or beyond
        for i in 0..self.items.len() {
            match self.last_frame {
                Some(last_frame_id) => {
                    if self.items[i].id == last_frame_id && self.items[i].resolved_pts < time {
                        self.items[i].frame.ensure_data(thread_index)?;

                        return Ok(Some(self.items[i].id));
                    }
                }
                None => {}
            }
        }

        // Exact same time as requested
        for i in 0..self.items.len() {
            if self.items[i].resolved_pts == time {
                self.items[i].frame.ensure_data(thread_index)?;
                return Ok(Some(self.items[i].id));
            }
        }

        for i in 0..self.items.len() {
            let distance = (self.items[i].resolved_pts - time as i64).abs();
            // LTE: IF multiple items have the same distance, we take the one with the last timestamp.
            // This is because the last frame is more likely to have been decoded
            if distance <= best_distance as i64 {
                best_distance = distance;
                best_item = Some(i);
            }
        }

        let has_pts_after = self.items.iter().any(|item| item.resolved_pts >= time);

        // If this happens, then `last_frame` has not worked correctly. Do not match
        if !has_pts_after {
            return Ok(None);
        }

        if best_distance > threshold {
            let has_no_items_before = self.items.iter().all(|item| item.resolved_pts > time);

            if has_no_items_before {
                let has_asked_time_before = self
                    .items
                    .iter()
                    .find(|item| item.asked_time <= time)
                    .is_some();

                let asked_time_difference =
                    (self.items[best_item.unwrap()].asked_time - time).abs();
                if has_asked_time_before && self.items[best_item.unwrap()].asked_time <= time {
                    _print_debug(&format!(
                        "Found timestamp with too much threshold, but will let it pass because no closer frames found. difference = {}, threshold = {}",
                        asked_time_difference, threshold
                    ))?;
                    // Fall through to success case
                } else {
                    return Ok(None);
                }
            } else {
                let closest_item_after_this = self
                    .items
                    .iter()
                    .filter(|item| item.resolved_pts >= time)
                    .min_by_key(|item| item.resolved_pts);

                let is_inbetween_next_frame = match closest_item_after_this {
                    Some(closest_item_after_this) => {
                        // Comparing DTS and PTS - not perfect but that is the assumption for variable videos
                        closest_item_after_this.resolved_pts > time
                            && closest_item_after_this.previous_pts.is_some()
                            && closest_item_after_this.previous_pts.unwrap() < time
                    }
                    None => false,
                };

                let is_inbetween_and_after = best_item.is_some()
                    && self.items[best_item.unwrap()].previous_pts.is_some()
                    && self.items[best_item.unwrap()].previous_pts.unwrap() < time
                    && self.items[best_item.unwrap()].resolved_pts > time;

                if is_inbetween_next_frame {
                    _print_verbose(&format!(
                        "Found timestamp with too much threshold, but will let it pass because it is the best match and there is a frame after the current one that follows one with a lower timestamp. threshold = {}, after this pts = {} after this previous pts = {:?}",
                         threshold,
                         closest_item_after_this.unwrap().resolved_pts,
                        closest_item_after_this.unwrap().previous_pts,
                    ))?;
                    // Fall through to success
                } else if is_inbetween_and_after {
                    _print_verbose(&format!(
                        "Found timestamp with too much threshold, but will let it pass because it is inbetween frames. threshold = {}",
                         threshold
                    ))?;
                    // Fall through to success
                } else {
                    return Ok(None);
                }
            }
        }

        match best_item {
            Some(best_item) => {
                self.items[best_item].frame.ensure_data(thread_index)?;
                Ok(Some(self.items[best_item].id))
            }
            None => Ok(None),
        }
    }
}
