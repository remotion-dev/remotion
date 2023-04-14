use remotionffmpeg::frame::Video;
extern crate ffmpeg_next as remotionffmpeg;

pub struct FrameCacheItem {
    pub frame: Video,
    pub time: i64,
    pub next_time: i64,
    pub has_next: bool,
}

pub struct FrameCache {
    pub items: Vec<FrameCacheItem>,
}

impl FrameCache {
    pub fn new() -> Self {
        Self { items: Vec::new() }
    }

    pub fn add_item(&mut self, item: FrameCacheItem) {
        let exists = self.items.iter().any(|i| i.time == item.time);
        if exists {
            return;
        }

        self.items.push(item);
    }

    pub fn get_item(&self, time: i64) -> Option<&FrameCacheItem> {
        self.items
            .iter()
            .find(|i| time >= i.time && time < i.next_time)
    }
}
