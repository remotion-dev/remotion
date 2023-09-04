use sysinfo::{System, SystemExt};

pub fn get_available_memory() -> u64 {
    let mut sys = System::new();
    sys.refresh_memory();
    return sys.free_memory();
}

// Is there less than 100MB of memory left?
pub fn is_about_to_run_out_of_memory() -> bool {
    let mut sys = System::new();
    sys.refresh_memory();

    let free_memory_and_swap = sys.free_memory() + sys.free_swap();
    return free_memory_and_swap < 100 * 1024 * 1024;
}
