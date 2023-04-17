mod commands;
mod compositor;
mod errors;
mod ffmpeg;
mod frame_cache;
mod global_printer;
mod image;
mod opened_video;
mod payloads;
use commands::execute_command;
use errors::{error_to_string, PossibleErrors};
use std::{backtrace::Backtrace, env};
use threadpool::ThreadPool;

use payloads::payloads::{parse_cli, CliInputCommand, CliInputCommandPayload, ErrorPayload};

extern crate png;

fn mainfn() -> Result<(), PossibleErrors> {
    let args = env::args();

    let first_arg =
        args.skip(1)
            .next()
            .ok_or(errors::PossibleErrors::IoError(std::io::Error::new(
                std::io::ErrorKind::Other,
                "No input",
            )))?;

    let opts: CliInputCommand = parse_init_command(&first_arg)?;

    match opts.payload {
        CliInputCommandPayload::StartLongRunningProcess(_) => {
            start_long_running_process()?;
        }
        _ => {
            let data = execute_command(opts.payload)?;
            global_printer::synchronized_write_buf(&opts.nonce, &data)?;
        }
    }

    Ok(())
}

pub fn parse_init_command(json: &str) -> Result<CliInputCommand, PossibleErrors> {
    let cli_input: CliInputCommand = serde_json::from_str(json)?;

    Ok(cli_input)
}

fn start_long_running_process() -> Result<(), PossibleErrors> {
    let pool = ThreadPool::new(4);

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
        let opts: CliInputCommand = parse_cli(&input).unwrap();
        pool.execute(move || match execute_command(opts.payload) {
            Ok(res) => global_printer::synchronized_write_buf(&opts.nonce, &res).unwrap(),
            Err(err) => {
                let err = ErrorPayload {
                    error: error_to_string(err),
                    backtrace: Backtrace::force_capture().to_string(),
                };

                let err_payload = serde_json::to_string(&err).unwrap();
                let j = err_payload.as_bytes();

                global_printer::synchronized_write_buf(&opts.nonce, &j).unwrap()
            }
        });
    }

    pool.join();

    Ok(())
}

fn main() {
    match mainfn() {
        Ok(_) => (),
        Err(err) => errors::handle_error(err),
    }
}
