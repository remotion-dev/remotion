use crate::errors::ErrorWithBacktrace;
use crate::opened_stream::calc_position;
use crate::opened_video_manager::OpenedVideoManager;
use crate::payloads::payloads::{KnownCodecs, OpenVideoStats, VideoMetadata};
use std::fs::File;
use std::io::{BufReader, ErrorKind};
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

pub fn free_up_memory(maximum_frame_cache_size_in_bytes: u128) -> Result<(), ErrorWithBacktrace> {
    let manager = OpenedVideoManager::get_instance();

    manager.prune_oldest(maximum_frame_cache_size_in_bytes)?;

    Ok(())
}

pub fn keep_only_latest_frames(
    maximum_frame_cache_size_in_bytes: u128,
) -> Result<(), ErrorWithBacktrace> {
    let manager = OpenedVideoManager::get_instance();

    manager.only_keep_n_frames(maximum_frame_cache_size_in_bytes)?;

    Ok(())
}

pub fn extract_frame(
    src: String,
    original_src: String,
    time: f64,
    transparent: bool,
) -> Result<Vec<u8>, ErrorWithBacktrace> {
    let manager = OpenedVideoManager::get_instance();
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
    let cache_item = vid.get_cache_item_id(transparent, position, threshold - 1);

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
        threshold,
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

// https://docs.rs/ffmpeg-next/6.0.0/src/metadata/metadata.rs.html#35
pub fn get_video_metadata(file_path: &str) -> Result<VideoMetadata, ErrorWithBacktrace> {
    // Initialize the FFmpeg library
    remotionffmpeg::init().map_err(|e| e.to_string())?;

    // Open the input file
    let input = remotionffmpeg::format::input(&file_path)?;

    // Find the video stream
    let stream = match input.streams().best(remotionffmpeg::media::Type::Video) {
        Some(video_stream) => video_stream,
        None => Err(std::io::Error::new(
            ErrorKind::Other,
            "No video stream found",
        ))?,
    };
    let codec_id = unsafe { (*(*(stream).as_ptr()).codecpar).codec_id };
    let codec_name = match codec_id {
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_H264 => KnownCodecs::H264,
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_HEVC => KnownCodecs::H265,
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_VP8 => KnownCodecs::Vp8,
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_VP9 => KnownCodecs::Vp9,
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_AV1 => KnownCodecs::Av1,
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PRORES => KnownCodecs::ProRes,
        _ => KnownCodecs::Unknown,
    };

    #[allow(non_snake_case)]
    let canPlayInVideoTag = match codec_name {
        KnownCodecs::H264 => true,
        KnownCodecs::H265 => true,
        KnownCodecs::Vp8 => true,
        KnownCodecs::Vp9 => true,
        KnownCodecs::Av1 => true,
        _ => false,
    };

    // Get the frame rate
    let fps: i32 = stream.avg_frame_rate().numerator();

    // Get the codec
    let codec = remotionffmpeg::codec::context::Context::from_parameters(stream.parameters())
        .map_err(|e| e.to_string())?;

    // Get the duration
    #[allow(non_snake_case)]
    let durationInSeconds = input.duration() as f64 / remotionffmpeg::ffi::AV_TIME_BASE as f64;

    #[allow(non_snake_case)]
    let supportsSeeking = match codec_name {
        KnownCodecs::H264 => {
            if durationInSeconds < 5.0 {
                true
            } else {
                let f = File::open(file_path).unwrap();
                let size = f.metadata()?.len();
                let reader = BufReader::new(f);

                let mp4 = mp4::Mp4Reader::read_header(reader, size);
                let supports_fast_start = match mp4 {
                    Ok(mp4) => mp4.supports_fast_start,
                    Err(_) => false,
                };
                supports_fast_start
            }
        }
        KnownCodecs::H265 => true,
        KnownCodecs::Vp8 => true,
        KnownCodecs::Vp9 => true,
        KnownCodecs::Av1 => true,
        KnownCodecs::ProRes => false,
        KnownCodecs::Unknown => false,
    };

    if let Ok(video) = codec.decoder().video() {
        // Return the video metadata
        let metadata = VideoMetadata {
            fps,
            width: video.width(),
            height: video.height(),
            durationInSeconds,
            codec: codec_name,
            canPlayInVideoTag,
            supportsSeeking,
        };
        Ok(metadata)
    } else {
        return Err(std::io::Error::new(
            ErrorKind::Other,
            "The codec is not a video codec",
        ))?;
    }
}
