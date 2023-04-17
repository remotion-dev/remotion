use std::io::{self, BufWriter, Write};

use crate::errors::PossibleErrors;

pub fn _print_debug(msg: &str) -> Result<(), PossibleErrors> {
    synchronized_write_buf("0", &msg.as_bytes())
}

pub fn synchronized_write_buf(nonce: &str, data: &[u8]) -> Result<(), PossibleErrors> {
    let str = format!("remotion_buffer:{};{}:", nonce, data.len());
    let handle = io::stdout().lock();
    let mut stdout_guard = BufWriter::with_capacity(32 * 1024, handle);
    stdout_guard.write(str.as_bytes())?;
    stdout_guard.write_all(&data)?;
    stdout_guard.flush()?;
    Ok(())
}
