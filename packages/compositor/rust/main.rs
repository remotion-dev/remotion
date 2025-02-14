mod commands;
mod errors;
mod extract_audio;
mod ffmpeg;
mod frame_cache;
mod frame_cache_manager;
mod get_silent_parts;
mod get_video_metadata;
mod global_printer;
mod image;
mod logger;
mod long_running_process;
mod max_cache_size;
mod memory;
mod opened_stream;
mod opened_video;
mod opened_video_manager;
mod payloads;
mod rotation;
mod scalable_frame;
mod select_right_thread;
mod thread;
mod tone_map;

use errors::ErrorWithBacktrace;
use global_printer::{_print_verbose, set_verbose_logging};
use long_running_process::LongRunningProcess;
use memory::get_ideal_maximum_frame_cache_size;
use std::env;

use payloads::payloads::{CliInputCommand, CliInputCommandPayload};

extern crate png;

fn mainfn() -> Result<(), ErrorWithBacktrace> {
    let args = env::args();

    let first_arg =
        args.skip(1)
            .next()
            .ok_or(errors::ErrorWithBacktrace::from(std::io::Error::new(
                std::io::ErrorKind::Other,
                "No input",
            )))?;

    let opts: CliInputCommand = parse_init_command(&first_arg)?;

    match opts.payload {
        CliInputCommandPayload::StartLongRunningProcess(payload) => {
            set_verbose_logging(payload.verbose);

            let max_video_cache_size = payload
                .maximum_frame_cache_size_in_bytes
                .unwrap_or(get_ideal_maximum_frame_cache_size());

            _print_verbose(&format!(
                "Starting Rust process. Max video cache size: {}MB, max threads = {}",
                max_video_cache_size / 1024 / 1024,
                payload.concurrency
            ))?;

            let mut long_running_process =
                LongRunningProcess::new(payload.concurrency, max_video_cache_size);
            long_running_process.start()
        }
        _ => {
            panic!("only supports long running compositor")
        }
    }
}

pub fn parse_init_command(json: &str) -> Result<CliInputCommand, ErrorWithBacktrace> {
    let cli_input: CliInputCommand = serde_json::from_str(json)?;

    Ok(cli_input)
}

fn main() {
    match mainfn() {
        Ok(_) => (),
        Err(err) => errors::handle_global_error(err),
    }
}
