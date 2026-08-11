use std::{
    io::{self, BufWriter, Write},
    sync::{Arc, Mutex},
};

use lazy_static::lazy_static;

use crate::errors::{error_to_json, ErrorWithBacktrace};

pub fn _print_debug(msg: &str) -> Result<(), ErrorWithBacktrace> {
    synchronized_write_buf(0, "0", &msg.as_bytes())
}

pub fn _print_verbose(msg: &str) -> Result<(), ErrorWithBacktrace> {
    let logger_verbose = LOGGER_INSTANCE.verbose.lock().unwrap();
    if *logger_verbose {
        synchronized_write_buf(0, "0", &msg.as_bytes())
    } else {
        Ok(())
    }
}

pub fn synchronized_write_buf(
    status: i64,
    nonce: &str,
    data: &[u8],
) -> Result<(), ErrorWithBacktrace> {
    let str = format!("remotion_buffer:{}:{}:{}:", nonce, data.len(), status,);
    let handle = io::stdout().lock();
    let mut stdout_guard = BufWriter::with_capacity(32 * 1024, handle);
    stdout_guard.write(str.as_bytes())?;
    stdout_guard.write_all(&data)?;
    stdout_guard.flush()?;
    Ok(())
}

pub fn print_error(nonce: &str, err: ErrorWithBacktrace) {
    synchronized_write_buf(1, nonce, &error_to_json(err).unwrap().as_bytes()).unwrap();
}

struct Logger {
    verbose: Arc<Mutex<bool>>,
}

lazy_static! {
    static ref LOGGER_INSTANCE: Logger = Logger {
        verbose: Arc::new(Mutex::new(false)),
    };
}

pub fn set_verbose_logging(verbose: bool) {
    let mut logger_verbose = LOGGER_INSTANCE.verbose.lock().unwrap();
    *logger_verbose = verbose;
}
