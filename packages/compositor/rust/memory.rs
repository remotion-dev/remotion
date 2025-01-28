use sysinfo::System;

use crate::global_printer::_print_verbose;

pub fn get_max_lambda_memory() -> u64 {
    match std::env::var("AWS_LAMBDA_FUNCTION_MEMORY_SIZE") {
        Ok(val) => val.parse::<u64>().unwrap() * 1024 * 1024,
        Err(_) => std::u64::MAX,
    }
}

pub fn get_available_memory() -> u64 {
    let mut sys = System::new();
    sys.refresh_memory();
    let total_memory = sys.total_memory().min(get_max_lambda_memory());
    let used_memory = sys.used_memory();

    // Underflow can only happen in release mode, is prevented in debug
    // At least with sysinfo 0.29.9, we spotted an underflow
    // https://github.com/remotion-dev/remotion/issues/3576
    if used_memory >= total_memory {
        _print_verbose(&format!(
            "Warning: Detected total memory as {} bytes, free memory as {} bytes. This implies a non-positive amount of free memory. Free memory detection might be broken on this system, please report this at https://remotion.dev/issue",
            total_memory, used_memory
        ))
        .unwrap();

        return 0;
    }
    return total_memory - used_memory;
}

// Is there less than 100MB of memory left?
pub fn is_about_to_run_out_of_memory() -> bool {
    return get_available_memory() < 100 * 1024 * 1024;
}

pub fn get_ideal_maximum_frame_cache_size() -> u64 {
    let available_memory = get_available_memory();

    // Take 40% of available memory
    let max = available_memory * 2 / 5;

    return max.max(mb_to_bytes(240)).min(mb_to_bytes(20_000)).into();
}

pub fn mb_to_bytes(mb: u64) -> u64 {
    return mb * 1024 * 1024;
}
