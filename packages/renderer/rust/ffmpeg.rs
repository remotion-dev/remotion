use crate::errors::ErrorWithBacktrace;
use crate::opened_stream::calc_position;
use crate::opened_video_manager::OpenedVideoManager;
use crate::payloads::payloads::OpenVideoStats;
use std::io::ErrorKind;
extern crate ffmpeg_next as remotionffmpeg;

pub fn get_open_video_stats() -> Result<OpenVideoStats, ErrorWithBacktrace> {
    let manager = OpenedVideoManager::get_instance();
    let open_videos = manager.get_open_videos()?;
    let open_streams = manager.get_open_video_streams()?;
    let frames_in_cache = manager.get_frames_in_cache()?;

    Ok(OpenVideoStats {
        open_videos,
        open_streams,
        frames_in_cache,
    })
}

pub fn free_up_memory(ratio: f64) -> Result<(), ErrorWithBacktrace> {
    let manager = OpenedVideoManager::get_instance();

    manager.prune_oldest(ratio)?;

    Ok(())
}

pub fn keep_only_latest_frames(frames: usize) -> Result<(), ErrorWithBacktrace> {
    let manager = OpenedVideoManager::get_instance();

    manager.only_keep_n_frames(frames)?;

    Ok(())
}

pub fn extract_frame(
    src: String,
    time: f64,
    transparent: bool,
) -> Result<Vec<u8>, ErrorWithBacktrace> {
    let manager = OpenedVideoManager::get_instance();
    let video_locked = manager.get_video(&src, transparent)?;
    let mut vid = video_locked.lock()?;

    // The requested position in the video.
    let position = calc_position(time, vid.time_base);

    // How much the distance between 1 frame is in the videos internal time format.
    let one_frame_in_time_base = calc_position(
        1.0 / (vid.fps.numerator() as f64 / vid.fps.denominator() as f64),
        vid.time_base,
    );

    let cache_item = vid.get_cache_item_id(transparent, position, false);

    match cache_item {
        Ok(Some(item)) => {
            return Ok(vid.get_cache_item_from_id(transparent, item)?);
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
    let max_stream_position = calc_position(time + 15.0, vid.time_base);
    let min_stream_position = calc_position(time - 15.0, vid.time_base);
    for i in 0..open_stream_count {
        let stream = vid.opened_streams[i].lock()?;
        if stream.reached_eof {
            continue;
        }
        if transparent != stream.transparent {
            continue;
        }
        if stream.last_position > max_stream_position {
            continue;
        }
        if stream.last_position < min_stream_position {
            continue;
        }
        suitable_open_stream = Some(i);
        break;
    }

    let stream_index = match suitable_open_stream {
        Some(index) => Ok(index),
        None => vid.open_new_stream(transparent),
    };

    let opened_stream = match vid.opened_streams.get(stream_index?) {
        Some(stream) => stream,
        None => Err(std::io::Error::new(
            ErrorKind::Other,
            "Stream index out of bounds",
        ))?,
    };

    let mut first_opened_stream = opened_stream.lock()?;

    let frame_id = first_opened_stream.get_frame(
        time,
        &vid.get_frame_cache(transparent),
        position,
        vid.time_base,
        one_frame_in_time_base,
    )?;

    let from_cache = vid
        .get_frame_cache(transparent)
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
