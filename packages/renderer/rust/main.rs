mod commands;
mod compositor;
mod errors;
mod ffmpeg;
mod image;
mod payloads;
use commands::execute_command;
use errors::PossibleErrors;
use std::sync::mpsc;
use std::thread;
use threadpool::ThreadPool;

use payloads::payloads::{parse_cli, CliInputCommand};
use std::io::Read;

extern crate png;

fn read_stdin_to_string() -> Result<String, std::io::Error> {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input)?;
    Ok(input)
}

fn mainfn() -> Result<(), PossibleErrors> {
    let input = read_stdin_to_string()?;
    let opts: CliInputCommand = parse_cli(&input)?;
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

fn start_long_running_process() -> Result<(), PossibleErrors> {
    let (command_tx, command_rx) = mpsc::channel::<String>();

    let pool = ThreadPool::new(4); // Create a thread pool with 4 threads

    // Read messages from stdin in a separate thread

    let thread_handle = thread::spawn(move || loop {
        let mut input = String::new();
        std::io::stdin().read_line(&mut input).unwrap();
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
