use crate::{errors::ErrorWithBacktrace, frame_cache_manager::FrameCacheManager};
extern crate ffmpeg_next as remotionffmpeg;

pub fn is_frame_cache_empty(
    src: &str,
    original_src: &str,
    frame_cache_manager: &mut FrameCacheManager,
) -> Result<bool, ErrorWithBacktrace> {
    if !frame_cache_manager.is_empty(src, original_src, true, true)? {
        return Ok(false);
    }
    if !frame_cache_manager.is_empty(src, original_src, true, false)? {
        return Ok(false);
    }
    if !frame_cache_manager.is_empty(src, original_src, false, true)? {
        return Ok(false);
    }
    if !frame_cache_manager.is_empty(src, original_src, false, false)? {
        return Ok(false);
    }

    Ok(true)
}
