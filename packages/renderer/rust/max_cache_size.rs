use lazy_static::lazy_static;
use std::sync::Mutex;

pub struct MaxCacheSize {
    value: Option<u128>,
}

impl MaxCacheSize {
    // Private constructor
    fn new() -> Self {
        MaxCacheSize { value: None }
    }

    // Getter for the value
    pub fn get_value(&self) -> Option<u128> {
        self.value
    }

    // Setter for the value
    pub fn set_value(&mut self, value: Option<u128>) {
        self.value = value;
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
