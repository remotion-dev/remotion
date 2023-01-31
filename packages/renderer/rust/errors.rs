use crate::payloads::payloads::{DebugPayload, ErrorPayload};
use std::backtrace::Backtrace;

pub fn handle_error(err: &dyn std::error::Error) -> ! {
    let err = ErrorPayload {
        error: err.to_string(),
        msg_type: "error".to_string(),
        backtrace: Backtrace::force_capture().to_string(),
    };
    let j = serde_json::to_string(&err).unwrap();

    print!("--debug-start--{}--debug-end--\n", j);
    std::process::exit(1);
}

pub fn print_debug(str: String) {
    let err = DebugPayload {
        msg: str,
        msg_type: "debug".to_string(),
    };
    let j = serde_json::to_string(&err).unwrap();

    print!("--debug-start--{}--debug-end--\n", j);
}
