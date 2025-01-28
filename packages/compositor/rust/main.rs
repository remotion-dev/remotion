mod commands;
mod errors;
mod ffmpeg;
mod frame_cache;
mod frame_cache_manager;
mod get_silent_parts;
mod global_printer;
mod image;
mod logger;
mod max_cache_size;
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
use frame_cache_manager::make_frame_cache_manager;
use global_printer::{_print_verbose, set_verbose_logging};
use memory::get_ideal_maximum_frame_cache_size;
use opened_video_manager::make_opened_stream_manager;
use std::env;
use std::sync::mpsc;
use std::thread;

use payloads::payloads::{parse_cli, CliInputCommand, CliInputCommandPayload, Eof};

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

    let mut frame_cache_manager = make_frame_cache_manager().unwrap();
    let mut open_video_manager = make_opened_stream_manager().unwrap();

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
            let data = execute_command(
                opts.payload,
                0,
                &mut frame_cache_manager,
                &mut open_video_manager,
            )?;
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
    let mut thread_handles = vec![];
    let mut send_handles = vec![];
    for thread_index in 0..threads {
        let (tx, rx) = mpsc::channel::<CliInputCommand>();

        let handle = thread::spawn(move || {
            let mut frame_cache_manager = make_frame_cache_manager().unwrap();
            let mut opened_video_manager = make_opened_stream_manager().unwrap();

            while let Ok(message) = rx.recv() {
                match message.payload {
                    CliInputCommandPayload::Eof(_) => {
                        break;
                    }
                    _ => (),
                }
                match execute_command(
                    message.payload,
                    thread_index,
                    &mut frame_cache_manager,
                    &mut opened_video_manager,
                ) {
                    Ok(res) => {
                        global_printer::synchronized_write_buf(0, &message.nonce, &res).unwrap()
                    }
                    Err(err) => global_printer::synchronized_write_buf(
                        1,
                        &message.nonce,
                        &error_to_json(err).unwrap().as_bytes(),
                    )
                    .unwrap(),
                };
            }

            // Thread work here
        });
        send_handles.push(tx);
        thread_handles.push(handle);
    }

    max_cache_size::get_instance()
        .lock()
        .unwrap()
        .set_value(Some(maximum_frame_cache_size_in_bytes));

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
            for handle in send_handles {
                handle
                    .send(CliInputCommand {
                        payload: CliInputCommandPayload::Eof(Eof {}),
                        nonce: "".to_string(),
                    })
                    .unwrap();
            }
            break;
        }

        let opts: CliInputCommand = parse_cli(&input)?;
        // TODO: Find best thread to send to
        send_handles[0].send(opts).unwrap();
    }

    for handle in thread_handles {
        handle.join().unwrap();
    }

    Ok(())
}

fn main() {
    match mainfn() {
        Ok(_) => (),
        Err(err) => errors::handle_global_error(err),
    }
}
