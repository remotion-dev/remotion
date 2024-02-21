use crate::compositor::draw_layer;
use crate::copy_clipboard::copy_to_clipboard;
use crate::errors::ErrorWithBacktrace;
use crate::image::{save_as_jpeg, save_as_png};
use crate::opened_video_manager::OpenedVideoManager;
use crate::payloads::payloads::CliInputCommandPayload;
use crate::{ffmpeg, get_silent_parts};
use std::io::ErrorKind;

pub fn execute_command(
    opts: CliInputCommandPayload,
    maximum_frame_cache_size_in_bytes: Option<u128>,
) -> Result<Vec<u8>, ErrorWithBacktrace> {
    match opts {
        CliInputCommandPayload::ExtractFrame(command) => {
            let res = ffmpeg::extract_frame(
                command.src,
                command.original_src,
                command.time,
                command.transparent,
                command.color_mapped,
                maximum_frame_cache_size_in_bytes,
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
    }
}
