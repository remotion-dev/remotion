mod commands;
mod compositor;
mod copy_clipboard;
mod errors;
mod ffmpeg;
mod frame_cache;
mod frame_cache_manager;
mod get_silent_parts;
mod global_printer;
mod image;
mod logger;
mod memory;
mod opened_stream;
mod opened_video;
mod opened_video_manager;
mod payloads;
mod rotation;
mod scalable_frame;
mod tone_map;
use commands::execute_command;
use errors::{error_to_json, ErrorWithBacktrace};
use global_printer::{_print_verbose, set_verbose_logging};
use memory::{get_ideal_maximum_frame_cache_size, is_about_to_run_out_of_memory};
use std::env;

use payloads::payloads::{parse_cli, CliInputCommand, CliInputCommandPayload};

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
                "Starting Rust process. Max video cache size: {}MB, max concurrency = {}",
                max_video_cache_size / 1024 / 1024,
                payload.concurrency
            ))?;

            start_long_running_process(payload.concurrency, max_video_cache_size)?;
        }
        _ => {
            let data = execute_command(opts.payload, None)?;
            global_printer::synchronized_write_buf(0, &opts.nonce, &data)?;
        }
    }

    Ok(())
}

pub fn parse_init_command(json: &str) -> Result<CliInputCommand, ErrorWithBacktrace> {
    let cli_input: CliInputCommand = serde_json::from_str(json)?;

    Ok(cli_input)
}

fn start_long_running_process(
    threads: usize,
    maximum_frame_cache_size_in_bytes: u128,
) -> Result<(), ErrorWithBacktrace> {
    let pool = rayon::ThreadPoolBuilder::new()
        .num_threads(threads)
        .build()?;

    loop {
        let mut input = String::new();
        let matched = match std::io::stdin().read_line(&mut input) {
            Ok(_) => input,
            Err(_) => {
                break;
            }
        };

        input = matched.trim().to_string();
        if input == "EOF" {
            break;
        }
        let opts: CliInputCommand = parse_cli(&input)?;

        let mut current_maximum_cache_size = maximum_frame_cache_size_in_bytes;

        pool.install(move || {
            match execute_command(opts.payload, Some(current_maximum_cache_size)) {
                Ok(res) => global_printer::synchronized_write_buf(0, &opts.nonce, &res).unwrap(),
                Err(err) => global_printer::synchronized_write_buf(
                    1,
                    &opts.nonce,
                    &error_to_json(err).unwrap().as_bytes(),
                )
                .unwrap(),
            };
            if is_about_to_run_out_of_memory() {
                ffmpeg::emergency_memory_free_up().unwrap();
                current_maximum_cache_size = current_maximum_cache_size / 2;
            }

            ffmpeg::keep_only_latest_frames_and_close_videos(current_maximum_cache_size).unwrap();
        });
    }

    Ok(())
}

fn main() {
    match mainfn() {
        Ok(_) => (),
        Err(err) => errors::handle_global_error(err),
    }
}
