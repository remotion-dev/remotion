use lazy_static::lazy_static;
use std::sync::Mutex;

pub struct MaxCacheSize {
    max_cache_size: Option<u64>,
    current_cache_size: i128,
}

impl MaxCacheSize {
    // Private constructor
    fn new() -> Self {
        MaxCacheSize {
            max_cache_size: None,
            current_cache_size: 0,
        }
    }

    // Getter for the value
    pub fn get_value(&self) -> Option<u64> {
        self.max_cache_size
    }

    // Setter for the value
    pub fn set_value(&mut self, value: Option<u64>) {
        self.max_cache_size = value;
    }

    pub fn add_to_current_cache_size(&mut self, value: i128) {
        self.current_cache_size += value;
    }
    pub fn remove_from_cache_size(&mut self, value: i128) {
        self.current_cache_size -= value;
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
