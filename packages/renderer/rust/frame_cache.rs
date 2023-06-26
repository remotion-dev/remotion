extern crate ffmpeg_next as remotionffmpeg;

use std::sync::atomic::{AtomicUsize, Ordering};

use crate::{errors::ErrorWithBacktrace, opened_stream::get_time, scalable_frame::ScalableFrame, global_printer::_print_verbose};

pub fn get_frame_cache_id() -> usize {
    static COUNTER: AtomicUsize = AtomicUsize::new(1);
    COUNTER.fetch_add(1, Ordering::Relaxed)
}

pub struct FrameCacheItem {
    pub resolved_dts: i64,
    pub resolved_pts: i64,
    pub asked_time: i64,
    pub frame: ScalableFrame,
    pub id: usize,
    pub last_used: u128,
}

pub struct FrameCache {
    pub items: Vec<FrameCacheItem>,
    pub last_frame: Option<usize>,
}

#[derive(Clone)]
pub struct FrameCacheReference {
    pub id: usize,
    pub last_used: u128,
    pub src: String,
    pub transparent: bool,
}

#[derive(Clone, Copy)]
struct LastFrameFoundSoFar {
    pub id: usize,
    pub dts: i64,
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
        transparent: bool,
    ) -> Result<Vec<FrameCacheReference>, ErrorWithBacktrace> {
        let mut references: Vec<FrameCacheReference> = Vec::new();
        for item in &self.items {
            references.push(FrameCacheReference {
                id: item.id,
                last_used: item.last_used,
                src: src.clone(),
                transparent,
            });
        }
        Ok(references)
    }

    pub fn remove_from_frame_reference(
        &mut self,
        frame_cache_reference: FrameCacheReference,
    ) -> Result<(), ErrorWithBacktrace> {
        self.remove_item_by_id(frame_cache_reference.id)
    }

    pub fn add_item(&mut self, item: FrameCacheItem) {
        self.items.push(item);
    }

    pub fn set_last_frame(&mut self, id: usize) {
        self.last_frame = Some(id);
    }

    pub fn set_biggest_frame_as_last_frame(&mut self) {
        let mut last_frame_found: Option<LastFrameFoundSoFar> = None;
        for i in 0..self.items.len() {
            match last_frame_found {
                Some(exists) => {
                    if self.items[i].resolved_dts > exists.dts {
                        last_frame_found = Some(LastFrameFoundSoFar {
                            id: self.items[i].id,
                            dts: self.items[i].resolved_dts,
                        });
                    }
                }
                None => {
                    last_frame_found = Some(LastFrameFoundSoFar {
                        id: self.items[i].id,
                        dts: self.items[i].resolved_dts,
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

    pub fn get_item_from_id(&mut self, id: usize) -> Result<Option<Vec<u8>>, ErrorWithBacktrace> {
        let mut data: Option<Vec<u8>> = None;
        for i in 0..self.items.len() {
            if self.items[i].id == id {
                self.items[i].frame.ensure_data()?;
                self.items[i].last_used = get_time();
                data = Some(self.items[i].frame.get_data()?);
                break;
            }
        }
        Ok(data)
    }

    pub fn remove_item_by_id(&mut self, id: usize) -> Result<(), ErrorWithBacktrace> {
        for i in 0..self.items.len() {
            if self.items[i].id == id {
                if self.last_frame.is_some() && id == self.last_frame.expect("last_frame") {
                    self.last_frame = None;
                }
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

    pub fn get_item_id(
        &mut self,
        time: i64,
        threshold: i64,
    ) -> Result<Option<usize>, ErrorWithBacktrace> {
        let mut best_item: Option<usize> = None;
        let mut best_distance = std::i64::MAX;

        _print_verbose(&format!("get item time {} threshold {}", time, threshold));



        for i in 0..self.items.len() {
            _print_verbose(&format!("item {} {}", self.items[i].resolved_dts, self.items[i].resolved_pts));
            // Is last frame or beyond
            match self.last_frame {
                Some(last_frame_id) => {
                    if self.items[i].id == last_frame_id && self.items[i].resolved_dts < time {
                        self.items[i].frame.ensure_data()?;
                        return Ok(Some(self.items[i].id));
                    }
                }
                None => {}
            }

            // Exact same time as requested
            if self.items[i].resolved_dts == time {
                self.items[i].frame.ensure_data()?;

                return Ok(Some(self.items[i].id));
            }
            let distance = (self.items[i].resolved_dts - time as i64).abs();
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
        match best_item {
            Some(best_item) => {
                self.items[best_item].frame.ensure_data()?;
                Ok(Some(self.items[best_item].id))
            }
            None => Ok(None),
        }
    }
}
