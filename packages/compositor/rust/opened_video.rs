use crate::{errors::ErrorWithBacktrace, frame_cache_manager::FrameCacheManager};
extern crate ffmpeg_next as remotionffmpeg;

pub fn is_frame_cache_empty(
    src: &str,
    original_src: &str,
    frame_cache_manager: &mut FrameCacheManager,
) -> Result<bool, ErrorWithBacktrace> {
    if !frame_cache_manager
        .get_frame_cache(src, original_src, true, true)
        .lock()
        .unwrap()
        .items
        .is_empty()
    {
        return Ok(false);
    }

    if !frame_cache_manager
        .get_frame_cache(src, original_src, true, false)
        .lock()
        .unwrap()
        .items
        .is_empty()
    {
        return Ok(false);
    }
    if !frame_cache_manager
        .get_frame_cache(src, original_src, false, true)
        .lock()
        .unwrap()
        .items
        .is_empty()
    {
        return Ok(false);
    }
    if !frame_cache_manager
        .get_frame_cache(src, original_src, false, false)
        .lock()
        .unwrap()
        .items
        .is_empty()
    {
        return Ok(false);
    }

    Ok(true)
}
