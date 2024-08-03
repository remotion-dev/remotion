use crate::compositor::draw_layer;
use crate::copy_clipboard::copy_to_clipboard;
use crate::errors::ErrorWithBacktrace;
use crate::image::{save_as_jpeg, save_as_png};
use crate::memory::is_about_to_run_out_of_memory;
use crate::opened_video_manager::OpenedVideoManager;
use crate::payloads::payloads::CliInputCommandPayload;
use crate::{ffmpeg, get_silent_parts, max_cache_size};
use std::io::ErrorKind;

pub fn execute_command(opts: CliInputCommandPayload) -> Result<Vec<u8>, ErrorWithBacktrace> {
    let current_maximum_cache_size = max_cache_size::get_instance().lock().unwrap().get_value();

    if is_about_to_run_out_of_memory() && current_maximum_cache_size.is_some() {
        ffmpeg::emergency_memory_free_up().unwrap();
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
            )?;
            Ok(res)
        }
        CliInputCommandPayload::GetOpenVideoStats(_) => {
            let res = ffmpeg::get_open_video_stats()?;
            let str = serde_json::to_string(&res)?;
            Ok(str.as_bytes().to_vec())
        }
        CliInputCommandPayload::DeliberatePanic(_) => {
            // For testing purposes
            let hi: Option<usize> = None;
            hi.unwrap();
            Ok(vec![])
        }
        CliInputCommandPayload::FreeUpMemory(payload) => {
            ffmpeg::keep_only_latest_frames_and_close_videos(payload.remaining_bytes)?;
            Ok(vec![])
        }
        CliInputCommandPayload::CloseAllVideos(_) => {
            let manager = OpenedVideoManager::get_instance();
            manager.close_all_videos()?;

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
        CliInputCommandPayload::Compose(compose_command) => {
            let len: usize = (compose_command.width * compose_command.height).try_into()?;
            let mut data: Vec<u8> = vec![0; len * 4];

            for layer in compose_command.layers {
                draw_layer(&mut data, compose_command.width, layer)?;
            }

            if matches!(
                compose_command.output_format,
                crate::payloads::payloads::ImageFormat::Jpeg
            ) {
                save_as_jpeg(
                    compose_command.width,
                    compose_command.height,
                    data,
                    compose_command.output,
                )?;
            } else {
                save_as_png(
                    compose_command.width,
                    compose_command.height,
                    data,
                    compose_command.output,
                )?;
            }

            Ok("".as_bytes().to_vec())
        }
        CliInputCommandPayload::CopyImageToClipboard(command) => copy_to_clipboard(command.src),
        CliInputCommandPayload::ExtractAudio(_command) => {
            ffmpeg::extract_audio(&_command.input_path, &_command.output_path)?;
            Ok(vec![])
        }
    };
    if current_maximum_cache_size.is_some() {
        ffmpeg::keep_only_latest_frames_and_close_videos(current_maximum_cache_size.unwrap())
            .unwrap();
    }

    return res;
}
