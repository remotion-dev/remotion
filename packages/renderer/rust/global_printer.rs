use std::fs::File;
use std::sync::{Mutex, Once, ONCE_INIT};
use std::{io::Write, sync::Arc};

struct SingletonWriter {
    file: Option<File>,
}

impl SingletonWriter {
    fn new() -> Self {
        Self { file: None }
    }

    fn get_file(&mut self) -> &mut Option<File> {
        &mut self.file
    }
}

lazy_static! {
    static ref SINGLETON: Mutex<SingletonWriter> = Mutex::new(SingletonWriter::new());
    static ref INIT: Once = ONCE_INIT;
}

fn initialize_file() {
    INIT.call_once(|| {
        let mut singleton = SINGLETON.lock().unwrap();
        singleton
            .get_file()
            .get_or_insert_with(|| File::create("/tmp/remotionfifo").unwrap());
    });
}

use lazy_static::lazy_static;

use crate::errors::ErrorWithBacktrace;

// Create single file descriptor for writing to FIFO

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
    initialize_file();

    // Open the FIFO for writing
    let mut singleton: std::sync::MutexGuard<'_, SingletonWriter> = SINGLETON.lock().unwrap();
    let file = singleton.get_file();
    let mut f = file.as_ref().unwrap();

    let str = format!("remotion_buffer:{}:{}:{}:", nonce, data.len(), status);
    f.write(str.as_bytes())?;
    f.write_all(&data)?;

    f.flush()?;
    Ok(())
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
