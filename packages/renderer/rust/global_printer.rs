use lazy_static::lazy_static;
use std::io::{self, Write};
use std::sync::Mutex;

use crate::errors::PossibleErrors;

lazy_static! {
    static ref STDOUT_MUTEX: Mutex<io::Stdout> = Mutex::new(io::stdout());
}

pub fn synchronized_println(nonce: &str, msg: &str) -> Result<(), PossibleErrors> {
    let str = format!("remotion_buffer:{};{}:{}", nonce, msg.len(), msg);
    synchronized_write_buf(str.as_bytes().to_vec())
}

pub fn synchronized_write_buf(data: Vec<u8>) -> Result<(), PossibleErrors> {
    let mut stdout_guard = STDOUT_MUTEX.lock().unwrap();
    stdout_guard.write_all(&data)?;
    stdout_guard.flush()?;
    Ok(())
}
