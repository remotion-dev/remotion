use lazy_static::lazy_static;
use std::sync::Mutex;

pub struct MaxCacheSize {
    current_cache_size: u64,
}

impl MaxCacheSize {
    // Private constructor
    fn new() -> Self {
        MaxCacheSize {
            current_cache_size: 0,
        }
    }

    pub fn add_to_current_cache_size(&mut self, value: i128) {
        self.current_cache_size += value as u64;
    }
    pub fn remove_from_cache_size(&mut self, value: i128) {
        self.current_cache_size -= value as u64;
    }
    pub fn get_current_cache_size(&self) -> u64 {
        self.current_cache_size
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
