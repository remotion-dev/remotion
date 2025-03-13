use lazy_static::lazy_static;
use std::collections::HashMap;
use std::sync::Mutex;

pub struct MaxCacheSize {
    thread_cache_sizes: HashMap<usize, u64>,
}

impl MaxCacheSize {
    // Private constructor
    fn new() -> Self {
        MaxCacheSize {
            thread_cache_sizes: HashMap::new(),
        }
    }

    pub fn add_to_current_cache_size(&mut self, thread_index: usize, value: i128) {
        let entry = self.thread_cache_sizes.entry(thread_index).or_insert(0);
        *entry += value as u64;
    }

    pub fn remove_from_cache_size(&mut self, thread_index: usize, value: i128) {
        let entry = self.thread_cache_sizes.entry(thread_index).or_insert(0);
        *entry -= value as u64;
    }

    pub fn get_current_cache_size(&self) -> u64 {
        self.thread_cache_sizes.values().sum()
    }

    pub fn get_cache_size_for_thread(&self, thread_index: usize) -> u64 {
        match self.thread_cache_sizes.get(&thread_index) {
            Some(size) => *size,
            None => 0,
        }
    }
}

// Global static instance of MaxCacheSize
lazy_static! {
    static ref INSTANCE: Mutex<MaxCacheSize> = Mutex::new(MaxCacheSize::new());
}

// Function to access the global singleton instance
pub fn get_instance() -> &'static Mutex<MaxCacheSize> {
    &INSTANCE
}
