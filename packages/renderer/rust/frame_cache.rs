extern crate ffmpeg_next as remotionffmpeg;

use std::sync::atomic::{AtomicUsize, Ordering};

pub fn get_frame_cache_id() -> usize {
    static COUNTER: AtomicUsize = AtomicUsize::new(1);
    COUNTER.fetch_add(1, Ordering::Relaxed)
}

pub struct NotRgbFrame {
    pub planes: Vec<Vec<u8>>,
    pub linesizes: [i32; 8],
}

pub struct FrameCacheItem {
    pub resolved_pts: i64,
    pub resolved_dts: i64,
    pub asked_time: i64,
    pub frame: NotRgbFrame,
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

    pub fn get_last_frame(&self) -> Option<&FrameCacheItem> {
        self.last_frame.and_then(|id| self.get_item_from_id(id))
    }

    pub fn set_last_frame(&mut self, id: usize) {
        self.last_frame = Some(id);
    }

    pub fn get_item_from_id(&self, id: usize) -> Option<&FrameCacheItem> {
        self.items.iter().find(|i| i.id == id)
    }

    pub fn get_item(&self, time: i64) -> Option<&FrameCacheItem> {
        let mut best_item: Option<&FrameCacheItem> = None;
        let mut best_distance = std::i64::MAX;

        for i in 0..self.items.len() {
            let item = &self.items[i];
            let exact = item.asked_time == time as i64;

            if item.asked_time < time as i64 {
                // Asked for frame beyond last frame
                if self.last_frame.is_some() && self.last_frame.unwrap() == item.id {
                    return Some(item);
                }
                continue;
            }

            if exact {
                return Some(item);
            }

            let distance = (item.asked_time - time as i64).abs();
            if distance < best_distance as i64 {
                best_distance = distance;
                best_item = Some(item);
            }
        }
        best_item
    }
}
