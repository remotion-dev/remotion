use crate::errors::ErrorWithBacktrace;
use crate::frame_cache_manager::FrameCacheManager;
use crate::global_printer::_print_verbose;
use crate::opened_stream::calc_position;
use crate::opened_video_manager::OpenedVideoManager;
use crate::payloads::payloads::OpenVideoStats;
use std::io::ErrorKind;
extern crate ffmpeg_next as remotionffmpeg;

pub fn get_open_video_stats(
    frame_cache_manager: &mut FrameCacheManager,
    manager: &OpenedVideoManager,
) -> Result<OpenVideoStats, ErrorWithBacktrace> {
    let open_videos = manager.get_open_videos()?;
    let open_streams = manager.get_open_video_streams()?;
    let frames_in_cache = frame_cache_manager.get_frames_in_cache()?;

    Ok(OpenVideoStats {
        open_videos,
        open_streams,
        frames_in_cache,
    })
}

pub fn keep_only_latest_frames(
    maximum_frame_cache_size_in_bytes: u64,
    frame_cache_manager: &mut FrameCacheManager,
    thread_index: usize,
) -> Result<(), ErrorWithBacktrace> {
    frame_cache_manager.prune(maximum_frame_cache_size_in_bytes, thread_index)?;

    Ok(())
}
pub fn keep_only_latest_frames_and_close_videos(
    maximum_frame_cache_size_in_bytes: u64,
    opened_video_manager: &mut OpenedVideoManager,
    frame_cache_manager: &mut FrameCacheManager,
    thread_index: usize,
) -> Result<(), ErrorWithBacktrace> {
    keep_only_latest_frames(
        maximum_frame_cache_size_in_bytes,
        frame_cache_manager,
        thread_index,
    )?;

    opened_video_manager.close_videos_if_cache_empty(frame_cache_manager)?;

    Ok(())
}

pub fn emergency_memory_free_up(
    frame_cache_manager: &mut FrameCacheManager,
    thread_index: usize,
) -> Result<(), ErrorWithBacktrace> {
    _print_verbose("System is about to run out of memory, freeing up memory.")?;
    frame_cache_manager.halfen_cache_size(thread_index)?;

    Ok(())
}

pub fn extract_frame(
    src: String,
    original_src: String,
    time: f64,
    transparent: bool,
    tone_mapped: bool,
    maximum_frame_cache_size_in_bytes: Option<u64>,
    thread_index: usize,
    manager: &mut OpenedVideoManager,
    frame_cache_manager: &mut FrameCacheManager,
) -> Result<Vec<u8>, ErrorWithBacktrace> {
    let video_locked = manager.get_video(&src, &original_src, transparent)?;
    let mut vid = video_locked.lock()?;
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

    // Don't allow previous frame, but allow for some flexibility
    let cache_item = frame_cache_manager.get_cache_item_id(
        &src,
        &original_src,
        transparent,
        tone_mapped,
        position,
        threshold - 1,
    );

    match cache_item {
        Ok(Some(item)) => {
            return Ok(frame_cache_manager.get_cache_item_from_id(
                &src,
                &original_src,
                transparent,
                tone_mapped,
                item,
            )?);
        }
        Ok(None) => {}
        Err(err) => {
            return Err(err);
        }
    }

    let open_stream_count = vid.opened_streams.len();
    let mut suitable_open_stream: Option<usize> = None;

    // Seeking too far back in a stream is not efficient, rather open a new stream
    // 15 seconds was chosen arbitrarily
    let max_stream_position = calc_position(time + 5.0, vid.time_base);
    let min_stream_position = calc_position(time - 5.0, vid.time_base);
    for i in 0..open_stream_count {
        let stream = vid.opened_streams[i].lock()?;
        if stream.reached_eof {
            continue;
        }
        if transparent != stream.transparent {
            continue;
        }
        if stream.last_position.unwrap_or(0) > max_stream_position {
            continue;
        }
        if stream.last_position.unwrap_or(0) < min_stream_position {
            continue;
        }
        suitable_open_stream = Some(i);
        break;
    }

    let stream_index = match suitable_open_stream {
        Some(index) => Ok(index),
        None => vid.open_new_stream(transparent, thread_index),
    };

    let opened_stream = match vid.opened_streams.get(stream_index?) {
        Some(stream) => stream,
        None => Err(std::io::Error::new(
            ErrorKind::Other,
            "Stream index out of bounds",
        ))?,
    };

    let mut first_opened_stream = opened_stream.lock()?;

    let time_base = vid.time_base;

    let frame_id = first_opened_stream.get_frame(
        time,
        position,
        time_base,
        one_frame_in_time_base,
        threshold,
        maximum_frame_cache_size_in_bytes,
        tone_mapped,
        frame_cache_manager,
        thread_index,
    )?;

    let from_cache = frame_cache_manager
        .get_frame_cache(&src, &original_src, transparent, tone_mapped)
        .lock()?
        .get_item_from_id(frame_id);

    match from_cache {
        Ok(Some(data)) => Ok(data),
        Ok(None) => Err(std::io::Error::new(
            ErrorKind::Other,
            "Frame evicted from cache",
        ))?,
        Err(err) => Err(err),
    }
}
