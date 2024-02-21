use crate::errors::ErrorWithBacktrace;
use crate::frame_cache_manager::FrameCacheManager;
use crate::global_printer::_print_verbose;
use crate::opened_stream::calc_position;
use crate::opened_video_manager::OpenedVideoManager;
use crate::payloads::payloads::{
    KnownAudioCodecs, KnownCodecs, KnownColorSpaces, OpenVideoStats, VideoMetadata,
};
use std::fs::File;
use std::io::{BufReader, ErrorKind};
extern crate ffmpeg_next as remotionffmpeg;
use remotionffmpeg::{codec, encoder, format, media, Rational};

pub fn get_open_video_stats() -> Result<OpenVideoStats, ErrorWithBacktrace> {
    let manager = OpenedVideoManager::get_instance();
    let cache_manager = FrameCacheManager::get_instance();
    let open_videos = manager.get_open_videos()?;
    let open_streams = manager.get_open_video_streams()?;
    let frames_in_cache = cache_manager.get_frames_in_cache()?;

    Ok(OpenVideoStats {
        open_videos,
        open_streams,
        frames_in_cache,
    })
}

pub fn keep_only_latest_frames(
    maximum_frame_cache_size_in_bytes: u128,
) -> Result<(), ErrorWithBacktrace> {
    let manager = FrameCacheManager::get_instance();

    manager.prune_oldest(maximum_frame_cache_size_in_bytes)?;

    Ok(())
}
pub fn keep_only_latest_frames_and_close_videos(
    maximum_frame_cache_size_in_bytes: u128,
) -> Result<(), ErrorWithBacktrace> {
    keep_only_latest_frames(maximum_frame_cache_size_in_bytes)?;

    let opened_video_manager = OpenedVideoManager::get_instance();
    opened_video_manager.close_videos_if_cache_empty()?;

    Ok(())
}

pub fn emergency_memory_free_up() -> Result<(), ErrorWithBacktrace> {
    let manager = FrameCacheManager::get_instance();

    _print_verbose("System is about to run out of memory, freeing up memory.")?;
    manager.halfen_cache_size()?;

    Ok(())
}

pub fn extract_frame(
    src: String,
    original_src: String,
    time: f64,
    transparent: bool,
    tone_mapped: bool,
    maximum_frame_cache_size_in_bytes: Option<u128>,
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
    let cache_item = FrameCacheManager::get_instance().get_cache_item_id(
        &src,
        &original_src,
        transparent,
        tone_mapped,
        position,
        threshold - 1,
    );

    match cache_item {
        Ok(Some(item)) => {
            return Ok(FrameCacheManager::get_instance().get_cache_item_from_id(
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

    let time_base = vid.time_base;

    let frame_id = first_opened_stream.get_frame(
        time,
        position,
        time_base,
        one_frame_in_time_base,
        threshold,
        maximum_frame_cache_size_in_bytes,
        tone_mapped,
    )?;

    let from_cache = FrameCacheManager::get_instance()
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

// https://docs.rs/ffmpeg-next/6.0.0/src/metadata/metadata.rs.html#35
pub fn get_video_metadata(file_path: &str) -> Result<VideoMetadata, ErrorWithBacktrace> {
    // Initialize the FFmpeg library
    remotionffmpeg::init().map_err(|e| e.to_string())?;

    // Open the input file
    let input = remotionffmpeg::format::input(&file_path)?;

    // Find the video stream
    let video_stream = match input.streams().best(remotionffmpeg::media::Type::Video) {
        Some(video_stream) => video_stream,
        None => Err(std::io::Error::new(
            ErrorKind::Other,
            "No video stream found",
        ))?,
    };

    // Audio stream, only if has one

    let audio_stream = input.streams().best(remotionffmpeg::media::Type::Audio);

    let video_codec_id = unsafe { (*(*(video_stream).as_ptr()).codecpar).codec_id };
    let color_space = unsafe { (*(*(video_stream).as_ptr()).codecpar).color_space };
    let audio_codec_id = match audio_stream {
        Some(audio_stream) => unsafe { (*(*(audio_stream).as_ptr()).codecpar).codec_id },
        None => remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_NONE,
    };

    let video_codec_name = match video_codec_id {
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_H264 => KnownCodecs::H264,
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_HEVC => KnownCodecs::H265,
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_VP8 => KnownCodecs::Vp8,
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_VP9 => KnownCodecs::Vp9,
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_AV1 => KnownCodecs::Av1,
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PRORES => KnownCodecs::ProRes,
        _ => KnownCodecs::Unknown,
    };

    let audio_codec_name: Option<KnownAudioCodecs> = match audio_codec_id {
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_AAC => Some(KnownAudioCodecs::Aac),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_OPUS => Some(KnownAudioCodecs::Opus),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_MP3 => Some(KnownAudioCodecs::Mp3),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_VORBIS => Some(KnownAudioCodecs::Vorbis),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_F16LE => Some(KnownAudioCodecs::PcmF16Le),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_F24LE => Some(KnownAudioCodecs::PcmF24Le),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_F32BE => Some(KnownAudioCodecs::PcmF32be),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_S16BE => Some(KnownAudioCodecs::PcmS16be),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_S16LE => Some(KnownAudioCodecs::PcmS16le),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_F32LE => Some(KnownAudioCodecs::PcmF32be),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_F64BE => Some(KnownAudioCodecs::PcmF64be),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_S24BE => Some(KnownAudioCodecs::PcmS24be),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_S24LE => Some(KnownAudioCodecs::PcmS24le),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_S32BE => Some(KnownAudioCodecs::PcmS32be),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_S32LE => Some(KnownAudioCodecs::PcmS32le),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_S64BE => Some(KnownAudioCodecs::PcmS64be),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_S64LE => Some(KnownAudioCodecs::PcmS64le),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_S8 => Some(KnownAudioCodecs::PcmS8),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_U16BE => Some(KnownAudioCodecs::PcmU16be),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_U16LE => Some(KnownAudioCodecs::PcmU16le),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_U24BE => Some(KnownAudioCodecs::PcmU24be),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_U8 => Some(KnownAudioCodecs::PcmU8),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_U24LE => Some(KnownAudioCodecs::PcmS24le),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_U32BE => Some(KnownAudioCodecs::PcmU32be),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_U32LE => Some(KnownAudioCodecs::PcmU32le),
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_S16BE_PLANAR => {
            Some(KnownAudioCodecs::PcmS16bePlanar)
        }
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_S8_PLANAR => {
            Some(KnownAudioCodecs::PcmS8Planar)
        }
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_S24LE_PLANAR => {
            Some(KnownAudioCodecs::PcmS24lePlanar)
        }
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_PCM_S32LE_PLANAR => {
            Some(KnownAudioCodecs::PcmS32lePlanar)
        }
        remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_NONE => None,
        _ => Some(KnownAudioCodecs::Unknown),
    };

    #[allow(non_snake_case)]
    let colorSpace = match color_space {
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_BT2020_CL => KnownColorSpaces::BT2020CL,
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_BT2020_NCL => KnownColorSpaces::BT2020NCL,
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_BT470BG => KnownColorSpaces::BT470BG,
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_BT709 => KnownColorSpaces::BT709,
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_SMPTE170M => KnownColorSpaces::SMPTE170M,
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_SMPTE240M => KnownColorSpaces::SMPTE240M,
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_YCGCO => KnownColorSpaces::YCGCO,
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_RGB => KnownColorSpaces::RGB,
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_FCC => KnownColorSpaces::FCC,
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_CHROMA_DERIVED_CL => {
            KnownColorSpaces::CHROMADERIVEDCL
        }
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_CHROMA_DERIVED_NCL => {
            KnownColorSpaces::CHROMADERIVEDNCL
        }
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_ICTCP => KnownColorSpaces::ICTCP,
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_NB => KnownColorSpaces::Unknown,
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_RESERVED => KnownColorSpaces::Unknown,
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_SMPTE2085 => KnownColorSpaces::SMPTE2085,
        remotionffmpeg::ffi::AVColorSpace::AVCOL_SPC_UNSPECIFIED => KnownColorSpaces::BT601,
    };

    #[allow(non_snake_case)]
    let canPlayInVideoTag = match video_codec_name {
        KnownCodecs::H264 => true,
        KnownCodecs::H265 => true,
        KnownCodecs::Vp8 => true,
        KnownCodecs::Vp9 => true,
        KnownCodecs::Av1 => true,
        _ => false,
    };

    // Get the frame rate
    let fps = (video_stream.avg_frame_rate().numerator() as f32)
        / (video_stream.avg_frame_rate().denominator() as f32);

    // Get the codec
    let codec = remotionffmpeg::codec::context::Context::from_parameters(video_stream.parameters())
        .map_err(|e| e.to_string())?;

    // Get the duration
    #[allow(non_snake_case)]
    let durationInSeconds = input.duration() as f64 / remotionffmpeg::ffi::AV_TIME_BASE as f64;

    #[allow(non_snake_case)]
    let supportsSeeking = match video_codec_name {
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

    let audio_file_extension: Option<String> = match audio_codec_name {
        Some(KnownAudioCodecs::Opus) => Some("opus".to_string()),
        Some(KnownAudioCodecs::Aac) => Some("aac".to_string()),
        Some(KnownAudioCodecs::Mp3) => Some("mp3".to_string()),
        Some(KnownAudioCodecs::PcmF16Le) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmF24Le) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmF32be) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmS16be) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmS16le) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmF32le) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmF64be) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmS24be) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmS24le) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmS32be) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmS32le) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmS64be) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmS64le) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmS8) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmU16be) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmU16le) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmU24be) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmU8) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmU24le) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmU32be) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmU32le) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmS16bePlanar) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmS8Planar) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmS24lePlanar) => Some("wav".to_string()),
        Some(KnownAudioCodecs::PcmS32lePlanar) => Some("wav".to_string()),
        Some(KnownAudioCodecs::Vorbis) => Some("ogg".to_string()),
        Some(KnownAudioCodecs::Unknown) => None,
        None => None,
    };

    if let Ok(video) = codec.decoder().video() {
        #[allow(non_snake_case)]
        let pixelFormat: Option<String> = match video.format() {
            remotionffmpeg::format::Pixel::YUV420P => Some("yuv420p".to_string()),
            remotionffmpeg::format::Pixel::YUYV422 => Some("yuyv422".to_string()),
            remotionffmpeg::format::Pixel::RGB24 => Some("rgb24".to_string()),
            remotionffmpeg::format::Pixel::BGR24 => Some("bgr24".to_string()),
            remotionffmpeg::format::Pixel::YUV422P => Some("yuv422p".to_string()),
            remotionffmpeg::format::Pixel::YUV444P => Some("yuv444p".to_string()),
            remotionffmpeg::format::Pixel::YUV410P => Some("yuv410p".to_string()),
            remotionffmpeg::format::Pixel::YUV411P => Some("yuv411p".to_string()),
            remotionffmpeg::format::Pixel::YUVJ420P => Some("yuvj420p".to_string()),
            remotionffmpeg::format::Pixel::YUVJ422P => Some("yuvj422p".to_string()),
            remotionffmpeg::format::Pixel::YUVJ444P => Some("yuvj444p".to_string()),
            remotionffmpeg::format::Pixel::ARGB => Some("argb".to_string()),
            remotionffmpeg::format::Pixel::RGBA => Some("rgba".to_string()),
            remotionffmpeg::format::Pixel::ABGR => Some("abgr".to_string()),
            remotionffmpeg::format::Pixel::BGRA => Some("bgra".to_string()),
            remotionffmpeg::format::Pixel::YUV440P => Some("yuv440p".to_string()),
            remotionffmpeg::format::Pixel::YUVJ440P => Some("yuvj440p".to_string()),
            remotionffmpeg::format::Pixel::YUVA420P => Some("yuva420p".to_string()),
            remotionffmpeg::format::Pixel::YUV420P16LE => Some("yuv420p16le".to_string()),
            remotionffmpeg::format::Pixel::YUV420P16BE => Some("yuv420p16be".to_string()),
            remotionffmpeg::format::Pixel::YUV422P16LE => Some("yuv422p16le".to_string()),
            remotionffmpeg::format::Pixel::YUV422P16BE => Some("yuv422p16be".to_string()),
            remotionffmpeg::format::Pixel::YUV444P16LE => Some("yuv444p16le".to_string()),
            remotionffmpeg::format::Pixel::YUV444P16BE => Some("yuv444p16be".to_string()),
            remotionffmpeg::format::Pixel::YUV420P9BE => Some("yuv420p9be".to_string()),
            remotionffmpeg::format::Pixel::YUV420P9LE => Some("yuv420p9le".to_string()),
            remotionffmpeg::format::Pixel::YUV420P10BE => Some("yuv420p10be".to_string()),
            remotionffmpeg::format::Pixel::YUV420P10LE => Some("yuv420p10le".to_string()),
            remotionffmpeg::format::Pixel::YUV422P10BE => Some("yuv422p10be".to_string()),
            remotionffmpeg::format::Pixel::YUV422P10LE => Some("yuv422p10le".to_string()),
            remotionffmpeg::format::Pixel::YUV444P9BE => Some("yuv444p9be".to_string()),
            remotionffmpeg::format::Pixel::YUV444P9LE => Some("yuv444p9le".to_string()),
            remotionffmpeg::format::Pixel::YUV444P10BE => Some("yuv444p10be".to_string()),
            remotionffmpeg::format::Pixel::YUV444P10LE => Some("yuv444p10le".to_string()),
            remotionffmpeg::format::Pixel::YUV422P9BE => Some("yuv422p9be".to_string()),
            remotionffmpeg::format::Pixel::YUV422P9LE => Some("yuv422p9le".to_string()),
            remotionffmpeg::format::Pixel::YUVA420P9BE => Some("yuva420p9be".to_string()),
            remotionffmpeg::format::Pixel::YUVA420P9LE => Some("yuva420p9le".to_string()),
            remotionffmpeg::format::Pixel::YUVA422P9BE => Some("yuva422p9be".to_string()),
            remotionffmpeg::format::Pixel::YUVA422P9LE => Some("yuva422p9le".to_string()),
            remotionffmpeg::format::Pixel::YUVA444P9BE => Some("yuva444p9be".to_string()),
            remotionffmpeg::format::Pixel::YUVA444P9LE => Some("yuva444p9le".to_string()),
            remotionffmpeg::format::Pixel::YUVA420P10BE => Some("yuva420p10be".to_string()),
            remotionffmpeg::format::Pixel::YUVA420P10LE => Some("yuva420p10le".to_string()),
            remotionffmpeg::format::Pixel::YUVA422P10BE => Some("yuva422p10be".to_string()),
            remotionffmpeg::format::Pixel::YUVA422P10LE => Some("yuva422p10le".to_string()),
            remotionffmpeg::format::Pixel::YUVA444P10BE => Some("yuva444p10be".to_string()),
            remotionffmpeg::format::Pixel::YUVA444P10LE => Some("yuva444p10le".to_string()),
            remotionffmpeg::format::Pixel::YUVA420P16BE => Some("yuva420p16be".to_string()),
            remotionffmpeg::format::Pixel::YUVA420P16LE => Some("yuva420p16le".to_string()),
            remotionffmpeg::format::Pixel::YUVA422P16BE => Some("yuva422p16be".to_string()),
            remotionffmpeg::format::Pixel::YUVA422P16LE => Some("yuva422p16le".to_string()),
            remotionffmpeg::format::Pixel::YUVA444P16BE => Some("yuva444p16be".to_string()),
            remotionffmpeg::format::Pixel::YUVA444P16LE => Some("yuva444p16le".to_string()),
            remotionffmpeg::format::Pixel::YUVA444P => Some("yuva444p".to_string()),
            remotionffmpeg::format::Pixel::YUVA422P => Some("yuva422p".to_string()),
            remotionffmpeg::format::Pixel::YUV420P12BE => Some("yuv420p12be".to_string()),
            remotionffmpeg::format::Pixel::YUV420P12LE => Some("yuv420p12le".to_string()),
            remotionffmpeg::format::Pixel::YUV420P14BE => Some("yuv420p14be".to_string()),
            remotionffmpeg::format::Pixel::YUV420P14LE => Some("yuv420p14le".to_string()),
            remotionffmpeg::format::Pixel::YUV422P12BE => Some("yuv422p12be".to_string()),
            remotionffmpeg::format::Pixel::YUV422P12LE => Some("yuv422p12le".to_string()),
            remotionffmpeg::format::Pixel::YUV422P14BE => Some("yuv422p14be".to_string()),
            remotionffmpeg::format::Pixel::YUV422P14LE => Some("yuv422p14le".to_string()),
            remotionffmpeg::format::Pixel::YUV444P12BE => Some("yuv444p12be".to_string()),
            remotionffmpeg::format::Pixel::YUV444P12LE => Some("yuv444p12le".to_string()),
            remotionffmpeg::format::Pixel::YUV444P14BE => Some("yuv444p14be".to_string()),
            remotionffmpeg::format::Pixel::YUV444P14LE => Some("yuv444p14le".to_string()),
            remotionffmpeg::format::Pixel::YUVJ411P => Some("yuvj411p".to_string()),
            remotionffmpeg::format::Pixel::YUV440P10LE => Some("yuv440p10le".to_string()),
            remotionffmpeg::format::Pixel::YUV440P10BE => Some("yuv440p10be".to_string()),
            remotionffmpeg::format::Pixel::YUV440P12LE => Some("yuv440p12le".to_string()),
            remotionffmpeg::format::Pixel::YUV440P12BE => Some("yuv440p12be".to_string()),
            remotionffmpeg::format::Pixel::YUV420P9 => Some("yuv420p9".to_string()),
            remotionffmpeg::format::Pixel::YUV422P9 => Some("yuv422p9".to_string()),
            remotionffmpeg::format::Pixel::YUV444P9 => Some("yuv444p9".to_string()),
            remotionffmpeg::format::Pixel::YUV420P10 => Some("yuv420p10".to_string()),
            remotionffmpeg::format::Pixel::YUV422P10 => Some("yuv422p10".to_string()),
            remotionffmpeg::format::Pixel::YUV440P10 => Some("yuv440p10".to_string()),
            remotionffmpeg::format::Pixel::YUV444P10 => Some("yuv444p10".to_string()),
            remotionffmpeg::format::Pixel::YUV420P12 => Some("yuv420p12".to_string()),
            remotionffmpeg::format::Pixel::YUV422P12 => Some("yuv422p12".to_string()),
            remotionffmpeg::format::Pixel::YUV440P12 => Some("yuv440p12".to_string()),
            remotionffmpeg::format::Pixel::YUV444P12 => Some("yuv444p12".to_string()),
            remotionffmpeg::format::Pixel::YUV420P14 => Some("yuv420p14".to_string()),
            remotionffmpeg::format::Pixel::YUV422P14 => Some("yuv422p14".to_string()),
            remotionffmpeg::format::Pixel::YUV444P14 => Some("yuv444p14".to_string()),
            remotionffmpeg::format::Pixel::YUV420P16 => Some("yuv420p16".to_string()),
            remotionffmpeg::format::Pixel::YUV422P16 => Some("yuv422p16".to_string()),
            remotionffmpeg::format::Pixel::YUV444P16 => Some("yuv444p16".to_string()),
            remotionffmpeg::format::Pixel::YUVA420P9 => Some("yuva420p9".to_string()),
            remotionffmpeg::format::Pixel::YUVA422P9 => Some("yuva422p9".to_string()),
            remotionffmpeg::format::Pixel::YUVA444P9 => Some("yuva444p9".to_string()),
            remotionffmpeg::format::Pixel::YUVA420P10 => Some("yuva420p10".to_string()),
            remotionffmpeg::format::Pixel::YUVA422P10 => Some("yuva422p10".to_string()),
            remotionffmpeg::format::Pixel::YUVA444P10 => Some("yuva444p10".to_string()),
            remotionffmpeg::format::Pixel::YUVA420P16 => Some("yuva420p16".to_string()),
            remotionffmpeg::format::Pixel::YUVA422P16 => Some("yuva422p16".to_string()),
            remotionffmpeg::format::Pixel::YUVA444P16 => Some("yuva444p16".to_string()),
            remotionffmpeg::format::Pixel::YUVA422P12BE => Some("yuva422p12be".to_string()),
            remotionffmpeg::format::Pixel::YUVA422P12LE => Some("yuva422p12le".to_string()),
            remotionffmpeg::format::Pixel::YUVA444P12BE => Some("yuva444p12be".to_string()),
            remotionffmpeg::format::Pixel::YUVA444P12LE => Some("yuva444p12le".to_string()),
            remotionffmpeg::format::Pixel::None => None,
            _ => Some("unknown".to_string()),
        };

        // Return the video metadata
        let metadata = VideoMetadata {
            fps,
            width: video.width(),
            height: video.height(),
            durationInSeconds,
            codec: video_codec_name,
            canPlayInVideoTag,
            supportsSeeking,
            colorSpace,
            audioCodec: audio_codec_name,
            audioFileExtension: audio_file_extension,
            pixelFormat,
        };
        Ok(metadata)
    } else {
        return Err(std::io::Error::new(
            ErrorKind::Other,
            "The codec is not a video codec",
        ))?;
    }
}

pub fn extract_audio(input_path: &str, output_path: &str) -> Result<(), ErrorWithBacktrace> {
    remotionffmpeg::init().map_err(|e| format!("Initialization error: {}", e))?;

    _print_verbose(&format!(
        "Extracting audio from {} {}",
        input_path, output_path
    ))?;

    let mut ictx = format::input(&input_path)
        .map_err(|e| format!("Error reading input from '{}': {}", input_path, e))?;
    let mut octx = format::output(&output_path)
        .map_err(|e| format!("Error setting up output to '{}': {}", output_path, e))?;

    // Determine the audio codec of the input file
    let audio_stream = match ictx.streams().best(remotionffmpeg::media::Type::Audio) {
        Some(audio_stream) => audio_stream,
        None => Err(std::io::Error::new(
            ErrorKind::Other,
            format!(
                "No audio stream found in '{}'. Ensure the video contains an audio track.",
                input_path
            ),
        ))?,
    };

    let audio_codec_id = unsafe { (*(*(audio_stream).as_ptr()).codecpar).codec_id };

    let mut stream_mapping = vec![-1; ictx.nb_streams() as _];
    let mut ist_time_bases = vec![Rational(0, 1); ictx.nb_streams() as _];
    let mut ost_index = 0;
    for (ist_index, ist) in ictx.streams().enumerate() {
        if ist.parameters().medium() != media::Type::Audio {
            continue;
        }
        stream_mapping[ist_index] = ost_index;
        ist_time_bases[ist_index] = ist.time_base();
        ost_index += 1;
        let mut ost = octx
            .add_stream(encoder::find(codec::Id::None))
            .map_err(|e| format!("Error adding stream: {}", e))?;
        ost.set_parameters(ist.parameters());
        unsafe {
            (*ost.parameters().as_mut_ptr()).codec_tag = 0;
        }
    }

    octx.write_header().map_err(|e| {
        if e.to_string().contains("ADTS muxer")
            && audio_codec_id != remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_AAC
        {
            format!(
                "Error: The audio format in '{}' is not AAC, and cannot be saved as an .aac file.",
                input_path
            )
        } else {
            format!(
                "Error writing header to '{}'. Input audio codec: '{:?}'. Error: {}",
                output_path, audio_codec_id, e
            )
        }
    })?;

    loop {
        match ictx.get_next_packet() {
            Ok((stream, mut packet)) => {
                let ist_index = stream.index();
                let ost_index = stream_mapping[ist_index];
                if ost_index < 0 {
                    continue;
                }
                let ost = octx.stream(ost_index as _).unwrap(); // This unwrap can be left as is, since we've ensured the stream exists
                packet.rescale_ts(ist_time_bases[ist_index], ost.time_base());
                packet.set_position(-1);
                packet.set_stream(ost_index as _);
                packet
                    .write_interleaved(&mut octx)
                    .map_err(|e| format!("Error writing packet: {}", e))?;
            }
            Err(remotionffmpeg::Error::Eof) => break, // Break on end of file.
            Err(err) => {
                return Err(ErrorWithBacktrace::from(format!(
                    "Error processing packet: {}",
                    err
                )))
            }
        };
    }

    octx.write_trailer()
        .map_err(|e| format!("Error writing trailer: {}", e))?;
    Ok(())
}
