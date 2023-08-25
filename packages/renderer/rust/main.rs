mod commands;
mod compositor;
mod copy_clipboard;
mod errors;
mod ffmpeg;
mod frame_cache;
mod get_silent_parts;
mod global_printer;
mod image;
mod logger;
mod opened_stream;
mod opened_video;
mod opened_video_manager;
mod payloads;
mod rotation;
mod scalable_frame;
use commands::execute_command;
use errors::{error_to_json, ErrorWithBacktrace};
use global_printer::{_print_verbose, set_verbose_logging};
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
            _print_verbose(&format!(
                "Starting Rust process. Max video cache size: {}MB, max concurrency = {}",
                payload.maximum_frame_cache_size_in_bytes / 1024 / 1024,
                payload.concurrency
            ))?;
            start_long_running_process(
                payload.concurrency,
                payload.maximum_frame_cache_size_in_bytes,
            )?;
        }
        _ => {
            let data = execute_command(opts.payload)?;
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
        pool.install(move || {
            match execute_command(opts.payload) {
                Ok(res) => global_printer::synchronized_write_buf(0, &opts.nonce, &res).unwrap(),
                Err(err) => global_printer::synchronized_write_buf(
                    1,
                    &opts.nonce,
                    &error_to_json(err).unwrap().as_bytes(),
                )
                .unwrap(),
            };
            ffmpeg::keep_only_latest_frames(maximum_frame_cache_size_in_bytes).unwrap();
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
