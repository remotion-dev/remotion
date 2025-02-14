use crate::errors::ErrorWithBacktrace;
use crate::frame_cache_manager::FrameCacheManager;
use crate::opened_stream::calc_position;
use crate::opened_video_manager::OpenedVideoManager;
use crate::payloads::payloads::OpenVideoStats;
use std::io::ErrorKind;
extern crate ffmpeg_next as remotionffmpeg;

pub fn get_open_video_stats(
    frame_cache_manager: &mut FrameCacheManager,
    manager: &OpenedVideoManager,
) -> Result<OpenVideoStats, ErrorWithBacktrace> {
    let open_streams = manager.get_open_video_streams()?;
    let frames_in_cache = frame_cache_manager.get_frames_in_cache()?;

    Ok(OpenVideoStats {
        open_streams,
        frames_in_cache,
    })
}

pub fn extract_frame(
    src: String,
    original_src: String,
    time: f64,
    transparent: bool,
    tone_mapped: bool,
    thread_index: usize,
    manager: &mut OpenedVideoManager,
    frame_cache_manager: &mut FrameCacheManager,
    max_cache_size: u64,
) -> Result<Vec<u8>, ErrorWithBacktrace> {
    // Don't allow previous frame, but allow for some flexibility
    let cache_item = match manager.get_position_and_threshold_of_video(time, &src) {
        Ok(Some((position, threshold))) => frame_cache_manager.get_cache_item_id(
            &src,
            &original_src,
            transparent,
            tone_mapped,
            position,
            threshold - 1,
        ),
        Ok(None) => Ok(None),
        Err(err) => return Err(err),
    }?;
    if cache_item.is_some() {
        return Ok(frame_cache_manager.get_cache_item_from_id(
            &src,
            &original_src,
            transparent,
            tone_mapped,
            cache_item.unwrap(),
        )?);
    }

    let vid_index =
        manager.get_video_index(&src, &original_src, transparent, time, thread_index)?;
    let vid = manager.get_video(vid_index)?;
    // The requested position in the video.
    let position = calc_position(time, vid.time_base);

    let is_variable_fps = vid.fps.denominator() == 0 || vid.fps.numerator() == 0;
    let time_of_one_frame_in_seconds =
        1.0 / (vid.fps.numerator() as f64 / vid.fps.denominator() as f64);

    // How much the distance between 1 frame is in the videos internal time format.
    let one_frame_in_time_base = calc_position(time_of_one_frame_in_seconds, vid.time_base);

    // If a video has no FPS, take a high threshold, like 10fps
    let threshold = match is_variable_fps {
        true => calc_position(1.0, vid.time_base),
        false => one_frame_in_time_base,
    };

    let time_base = vid.time_base;

    let frame_id = manager.get_frame_id(
        vid_index,
        time,
        position,
        time_base,
        one_frame_in_time_base,
        threshold,
        tone_mapped,
        frame_cache_manager,
        thread_index,
        max_cache_size,
    )?;

    let from_cache = frame_cache_manager.get_item_from_id(
        &src,
        &original_src,
        transparent,
        tone_mapped,
        frame_id,
    );

    match from_cache {
        Ok(Some(data)) => Ok(data),
        Ok(None) => Err(std::io::Error::new(
            ErrorKind::Other,
            "Frame evicted from cache",
        ))?,
        Err(err) => Err(err),
    }
}
