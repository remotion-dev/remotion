use crate::errors::{error_to_json, ErrorWithBacktrace};
use crate::payloads::payloads::{CliInputCommand, CliInputCommandPayload};
use crate::{extract_audio, get_silent_parts, get_video_metadata, global_printer};
use std::io::ErrorKind;

pub fn execute_command_on_thread(
    opts: CliInputCommandPayload,
) -> Result<Vec<u8>, ErrorWithBacktrace> {
    let res = match opts {
        CliInputCommandPayload::DeliberatePanic(_) => {
            // For testing purposes
            let hi: Option<usize> = None;
            hi.unwrap();
            Ok(vec![])
        }
        CliInputCommandPayload::Eof(_) => Ok(vec![]),
        CliInputCommandPayload::StartLongRunningProcess(_command) => Err(std::io::Error::new(
            ErrorKind::Other,
            "Cannot start long running process as command",
        ))?,
        CliInputCommandPayload::Echo(_command) => {
            Ok(format!("Echo {}", _command.message).as_bytes().to_vec())
        }
        CliInputCommandPayload::GetVideoMetadata(_command) => {
            let res = get_video_metadata::get_video_metadata(&_command.src)?;
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
            extract_audio::extract_audio(&_command.input_path, &_command.output_path)?;
            Ok(vec![])
        }
        _ => {
            panic!("Command not implemented");
        }
    };

    return res;
}

pub fn execute_command_and_print(message: CliInputCommand) -> Result<(), ErrorWithBacktrace> {
    match execute_command_on_thread(message.payload.clone()) {
        Ok(res) => global_printer::synchronized_write_buf(0, &message.nonce, &res)?,
        Err(err) => global_printer::synchronized_write_buf(
            1,
            &message.nonce,
            &error_to_json(err).unwrap().as_bytes(),
        )?,
    };
    Ok(())
}
