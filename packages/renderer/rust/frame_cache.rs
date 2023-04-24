extern crate ffmpeg_next as remotionffmpeg;

use std::sync::atomic::{AtomicUsize, Ordering};

use crate::{errors::PossibleErrors, scalable_frame::ScalableFrame};

pub fn get_frame_cache_id() -> usize {
    static COUNTER: AtomicUsize = AtomicUsize::new(1);
    COUNTER.fetch_add(1, Ordering::Relaxed)
}

pub struct FrameCacheItem {
    pub resolved_pts: i64,
    pub resolved_dts: i64,
    pub asked_time: i64,
    pub frame: ScalableFrame,
    pub id: usize,
}

pub struct FrameCache {
    pub items: Vec<FrameCacheItem>,
    pub last_frame: Option<usize>,
}

impl FrameCache {
    pub fn new() -> Self {
        Self {
            items: Vec::new(),
            last_frame: None,
        }
    }

    pub fn add_item(&mut self, item: FrameCacheItem) {
        self.items.push(item);
    }

    pub fn set_last_frame(&mut self, id: usize) {
        self.last_frame = Some(id);
    }

    pub fn get_item_from_id(&mut self, id: usize) -> Result<Option<Vec<u8>>, PossibleErrors> {
        let mut data: Option<Vec<u8>> = None;
        for i in 0..self.items.len() {
            if self.items[i].id == id {
                self.items[i].frame.ensure_data()?;
                data = Some(self.items[i].frame.get_data().unwrap());
                break;
            }
        }
        Ok(data)
    }

    pub fn get_item_id(
        &mut self,
        time: i64,
        threshold: i64,
    ) -> Result<Option<usize>, PossibleErrors> {
        let mut best_item: Option<usize> = None;
        let mut best_distance = std::i64::MAX;

        for i in 0..self.items.len() {
            if self.last_frame.is_some() && self.items[i].resolved_pts < time as i64 {
                // Asked for frame beyond last frame
                if self.last_frame.unwrap() == self.items[i].id {
                    self.items[i].frame.ensure_data()?;

                    return Ok(Some(self.items[i].id));
                }

                continue;
            }

            if self.items[i].resolved_pts == time {
                self.items[i].frame.ensure_data()?;
                return Ok(Some(self.items[i].id));
            }
            let distance = (self.items[i].asked_time - time as i64).abs();
            // LTE: IF multiple items have the same distance, we take the last one.
            // This is because the last frame is more likely to have been decoded
            if distance <= best_distance as i64 {
                best_distance = distance;
                best_item = Some(i);
            }
        }

        if best_distance > threshold {
            return Ok(None);
        }

        self.items[best_item.unwrap()].frame.ensure_data()?;
        Ok(Some(self.items[best_item.unwrap()].id))
    }
}
