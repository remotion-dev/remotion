use sysinfo::{System, SystemExt};

pub fn get_available_memory() -> u64 {
    let mut sys = System::new();
    sys.refresh_memory();
    return sys.total_memory() - sys.used_memory();
}

// Is there less than 100MB of memory left?
pub fn is_about_to_run_out_of_memory() -> bool {
    return get_available_memory() < 100 * 1024 * 1024;
}

pub fn get_ideal_maximum_frame_cache_size() -> u128 {
    let available_memory = get_available_memory();

    // Take 40% of available memory
    let max = available_memory * 2 / 5;

    return max.max(mb_to_bytes(240)).min(mb_to_bytes(20_000)).into();
}

pub fn mb_to_bytes(mb: u64) -> u64 {
    return mb * 1024 * 1024;
}
