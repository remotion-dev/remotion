use crate::errors::ErrorWithBacktrace;
use crate::frame_cache_manager::FrameCacheManager;
use crate::memory::is_about_to_run_out_of_memory;
use crate::opened_video_manager::OpenedVideoManager;
use crate::payloads::payloads::CliInputCommandPayload;
use crate::{ffmpeg, get_silent_parts, max_cache_size};
use std::io::ErrorKind;

pub fn execute_command(
    opts: CliInputCommandPayload,
    thread_index: usize,
    frame_cache_manager: &mut FrameCacheManager,
    opened_video_manager: &mut OpenedVideoManager,
) -> Result<Vec<u8>, ErrorWithBacktrace> {
    let current_maximum_cache_size = max_cache_size::get_instance().lock().unwrap().get_value();

    if is_about_to_run_out_of_memory() && current_maximum_cache_size.is_some() {
        ffmpeg::emergency_memory_free_up(frame_cache_manager).unwrap();
        max_cache_size::get_instance()
            .lock()
            .unwrap()
            .set_value(Some(current_maximum_cache_size.unwrap() / 2));
    }

    let res = match opts {
        CliInputCommandPayload::ExtractFrame(command) => {
            let res = ffmpeg::extract_frame(
                command.src,
                command.original_src,
                command.time,
                command.transparent,
                command.tone_mapped,
                max_cache_size::get_instance().lock().unwrap().get_value(),
                thread_index,
                opened_video_manager,
                frame_cache_manager,
            )?;
            Ok(res)
        }
        CliInputCommandPayload::GetOpenVideoStats(_) => {
            let res = ffmpeg::get_open_video_stats(frame_cache_manager, opened_video_manager)?;
            let str = serde_json::to_string(&res)?;
            Ok(str.as_bytes().to_vec())
        }
        CliInputCommandPayload::DeliberatePanic(_) => {
            // For testing purposes
            let hi: Option<usize> = None;
            hi.unwrap();
            Ok(vec![])
        }
        CliInputCommandPayload::Eof(_) => Ok(vec![]),
        CliInputCommandPayload::FreeUpMemory(payload) => {
            ffmpeg::keep_only_latest_frames_and_close_videos(
                payload.remaining_bytes,
                opened_video_manager,
                frame_cache_manager,
            )?;
            Ok(vec![])
        }
        CliInputCommandPayload::CloseAllVideos(_) => {
            opened_video_manager.close_all_videos(frame_cache_manager)?;

            Ok(vec![])
        }
        CliInputCommandPayload::StartLongRunningProcess(_command) => Err(std::io::Error::new(
            ErrorKind::Other,
            "Cannot start long running process as command",
        ))?,
        CliInputCommandPayload::Echo(_command) => {
            Ok(format!("Echo {}", _command.message).as_bytes().to_vec())
        }
        CliInputCommandPayload::GetVideoMetadata(_command) => {
            let res = ffmpeg::get_video_metadata(&_command.src)?;
            let str = serde_json::to_string(&res)?;
            Ok(str.as_bytes().to_vec())
        }
        CliInputCommandPayload::GetSilences(_command) => {
            let filter = format!(
                "silencedetect=n={}dB:d={}",
                _command.noiseThresholdInDecibels, _command.minDurationInSeconds
            );
            let res = get_silent_parts::get_silent_parts(_command.src, filter.to_string())?;
            let str = serde_json::to_string(&res)?;
            Ok(str.as_bytes().to_vec())
        }

        CliInputCommandPayload::ExtractAudio(_command) => {
            ffmpeg::extract_audio(&_command.input_path, &_command.output_path)?;
            Ok(vec![])
        }
    };
    if current_maximum_cache_size.is_some() {
        ffmpeg::keep_only_latest_frames_and_close_videos(
            current_maximum_cache_size.unwrap(),
            opened_video_manager,
            frame_cache_manager,
        )
        .unwrap();
    }

    return res;
}
