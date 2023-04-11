use lazy_static::lazy_static;
use std::io::{self, Write};
use std::sync::Mutex;

use crate::errors::PossibleErrors;

lazy_static! {
    static ref STDOUT_MUTEX: Mutex<io::Stdout> = Mutex::new(io::stdout());
}

pub fn _print_debug(msg: &str) -> Result<(), PossibleErrors> {
    synchronized_println("0", msg)
}

pub fn synchronized_println(nonce: &str, msg: &str) -> Result<(), PossibleErrors> {
    synchronized_write_buf(nonce, msg.as_bytes())
}

pub fn synchronized_write_buf(nonce: &str, data: &[u8]) -> Result<(), PossibleErrors> {
    let str = format!("remotion_buffer:{};{}:", nonce, data.len());
    let mut stdout_guard = STDOUT_MUTEX.lock().unwrap();
    stdout_guard.write(str.as_bytes())?;
    stdout_guard.write_all(&data)?;
    stdout_guard.flush()?;
    Ok(())
}
