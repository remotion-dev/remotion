use lazy_static::lazy_static;
use std::io::{self, Write};
use std::sync::Mutex;

lazy_static! {
    static ref STDOUT_MUTEX: Mutex<io::Stdout> = Mutex::new(io::stdout());
}

pub fn synchronized_println(nonce: &str, msg: &str) {
    let mut stdout_guard = STDOUT_MUTEX.lock().unwrap();
    write!(stdout_guard, "remotion_buffer:{};{}:", nonce, msg.len()).unwrap();
    write!(stdout_guard, "{}", msg).unwrap();
    stdout_guard.flush().unwrap();
}
