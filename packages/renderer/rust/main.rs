mod commands;
mod compositor;
mod errors;
mod ffmpeg;
mod image;
mod payloads;
use commands::execute_command;
use errors::PossibleErrors;
use std::sync::mpsc;
use std::{env, thread};
use threadpool::ThreadPool;

use payloads::payloads::{parse_cli, CliInputCommand};

extern crate png;

fn mainfn() -> Result<(), PossibleErrors> {
    println!("Starting renderer");
    let args = env::args();

    let first_arg =
        args.skip(1)
            .next()
            .ok_or(errors::PossibleErrors::IoError(std::io::Error::new(
                std::io::ErrorKind::Other,
                "No input",
            )))?;

    println!("First arg: {}", first_arg);

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
    let (command_tx, command_rx) = mpsc::channel::<String>();

    let pool = ThreadPool::new(4); // Create a thread pool with 4 threads

    println!("Starting long running process");
    // Read messages from stdin in a separate thread

    let thread_handle = thread::spawn(move || loop {
        let mut input = String::new();
        std::io::stdin().read_line(&mut input).unwrap();
        println!("Received: {}", input);
        input = input.trim().to_string();
        if input == "EOF" {
            break;
        }
        command_tx.send(input).unwrap();
    });

    let worker_queue = thread::spawn(move || loop {
        let message = match command_rx.recv() {
            Ok(message) => message,
            Err(_) => {
                break;
            }
        };
        if message == "EOF" {
            break;
        }

        pool.execute(move || {
            let opts: CliInputCommand = parse_cli(&message).unwrap();
            execute_command(opts).unwrap();
        });
    });

    worker_queue.join()?;
    thread_handle.join()?;

    Ok(())
}

fn main() {
    match mainfn() {
        Ok(_) => (),
        Err(err) => errors::handle_error(err),
    }
}
