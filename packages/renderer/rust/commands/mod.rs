use crate::compositor::draw_layer;
use crate::errors::PossibleErrors;
use crate::image::{save_as_jpeg, save_as_png};
use crate::payloads::payloads::CliInputCommandPayload;
use crate::{ffmpeg, global_printer};
use std::io::ErrorKind;

pub fn execute_command(nonce: &str, opts: CliInputCommandPayload) -> Result<(), PossibleErrors> {
    match opts {
        CliInputCommandPayload::ExtractFrame(command) => {
            let _result = ffmpeg::extract_frame(command.input, command.time)?;
            global_printer::synchronized_write_buf(&nonce, &_result)?;
        }
        CliInputCommandPayload::StartLongRunningProcess(_command) => {
            Err(std::io::Error::new(
                ErrorKind::Other,
                "Cannot start long running process as command",
            ))?;
        }
        CliInputCommandPayload::Echo(_command) => {
            global_printer::synchronized_println(&nonce, &format!("Echo {}", _command.message))?;
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
        }
    }
    Ok(())
}
