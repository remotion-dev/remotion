use crate::global_printer::_print_debug;

extern crate ffmpeg_next as remotionffmpeg;

pub struct FrameCacheItem {
    pub bitmap: Vec<u8>,
    pub time: i64,
    pub next_time: i64,
    pub has_next_time: bool,
}

pub struct FrameCache {
    pub items: Vec<FrameCacheItem>,
    pub last_frame: Option<FrameCacheItem>,
}

impl FrameCache {
    pub fn new() -> Self {
        Self {
            items: Vec::new(),
            last_frame: None,
        }
    }
    pub fn add_item(&mut self, item: FrameCacheItem) {
        // TODO: This is weird with shifted PTS
        let exists = self
            .items
            .iter()
            .any(|i| i.time == item.time && i.next_time == item.next_time);
        if exists {
            return;
        }

        if item.has_next_time == false {
            self.last_frame = Some(item);
            return;
        }

        self.items.push(item);
    }

    pub fn get_item(&self, time: i64) -> Option<Vec<u8>> {
        if self.last_frame.is_some() {
            let last_frame = self.last_frame.as_ref().unwrap();
            if last_frame.time < time {
                return Some(last_frame.bitmap.clone());
            }
        }

        for i in 0..self.items.len() {
            let item = &self.items[i];
            if item.time <= time && item.next_time > time {
                return Some(item.bitmap.clone());
            }
        }
        return None;
    }
}
