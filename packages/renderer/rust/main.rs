mod commands;
mod compositor;
mod errors;
mod ffmpeg;
mod global_printer;
mod image;
mod payloads;
use commands::execute_command;
use errors::PossibleErrors;
use global_printer::_print_debug;
use std::{env, thread};
use threadpool::ThreadPool;

use payloads::payloads::{parse_cli, CliInputCommand};

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

    match opts {
        CliInputCommand::StartLongRunningProcess(_) => {
            start_long_running_process()?;
        }
        _ => {
            execute_command(opts)?;
        }
    }

    Ok(())
}

pub fn parse_init_command(json: &str) -> Result<CliInputCommand, PossibleErrors> {
    let cli_input: CliInputCommand = serde_json::from_str(json)?;

    Ok(cli_input)
}

fn start_long_running_process() -> Result<(), PossibleErrors> {
    let pool = ThreadPool::new(4); // Create a thread pool with 4 threads

    // Read messages from stdin in a separate thread

    let thread_handle = thread::spawn(move || loop {
        let mut input = String::new();
        std::io::stdin().read_line(&mut input).unwrap();
        input = input.trim().to_string();
        if input == "EOF" {
            pool.join();

            break;
        }
        pool.execute(move || {
            let opts: CliInputCommand = parse_cli(&input).unwrap();
            execute_command(opts).unwrap();
        });
    });

    thread_handle.join()?;

    Ok(())
}

fn main() {
    match mainfn() {
        Ok(_) => (),
        Err(err) => errors::handle_error(err),
    }
}
