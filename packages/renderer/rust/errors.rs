use crate::payloads::payloads::ErrorPayload;
use std::backtrace::Backtrace;

pub fn handle_error(err: &dyn std::error::Error) -> ! {
    let err = ErrorPayload {
        error: err.to_string(),
        backtrace: Backtrace::force_capture().to_string(),
    };
    let j = serde_json::to_string(&err).unwrap();

    eprint!("{}", j);
    std::process::exit(1);
}
