mod commands;
mod compositor;
mod errors;
mod ffmpeg;
mod image;
mod payloads;
use commands::execute_command;
use errors::PossibleErrors;

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
    execute_command(opts)?;

    Ok(())
}

fn main() {
    match mainfn() {
        Ok(_) => (),
        Err(err) => errors::handle_error(err),
    }
}
