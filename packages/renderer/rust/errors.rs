use crate::payloads::payloads::ErrorPayload;
use ffmpeg_next as remotionffmpeg;
use std::any::Any;
use std::backtrace::Backtrace;

pub fn error_to_string(err: &ErrorWithBacktrace) -> String {
    match &err.error {
        PossibleErrors::IoError(err) => err.to_string(),
        PossibleErrors::FfmpegError(err) => err.to_string(),
        PossibleErrors::TryFromIntError(err) => err.to_string(),
        PossibleErrors::DecodingError(err) => err.to_string(),
        PossibleErrors::JpegDecoderError(err) => err.to_string(),
        PossibleErrors::SerdeError(err) => err.to_string(),
        PossibleErrors::WorkerError(err) => format!("{:?}", err),
    }
}

pub fn error_to_json(err: ErrorWithBacktrace) -> String {
    let json = ErrorPayload {
        error: error_to_string(&err),
        backtrace: err.backtrace,
    };
    let j = serde_json::to_string(&json).unwrap();
    return j;
}

pub fn handle_global_error(err: ErrorWithBacktrace) -> ! {
    // Only log printing to stderr
    eprint!("{}", error_to_json(err));
    std::process::exit(1);
}

enum PossibleErrors {
    IoError(std::io::Error),
    FfmpegError(remotionffmpeg::Error),
    TryFromIntError(std::num::TryFromIntError),
    DecodingError(png::DecodingError),
    JpegDecoderError(jpeg_decoder::Error),
    SerdeError(serde_json::Error),
    WorkerError(Box<dyn Any + Send>),
}

pub struct ErrorWithBacktrace {
    error: PossibleErrors,
    pub backtrace: String,
}

impl From<Box<dyn Any + Send>> for ErrorWithBacktrace {
    fn from(err: Box<dyn Any + Send>) -> ErrorWithBacktrace {
        ErrorWithBacktrace {
            error: PossibleErrors::WorkerError(err),
            backtrace: Backtrace::force_capture().to_string(),
        }
    }
}

impl From<remotionffmpeg::Error> for ErrorWithBacktrace {
    fn from(err: remotionffmpeg::Error) -> ErrorWithBacktrace {
        ErrorWithBacktrace {
            error: PossibleErrors::FfmpegError(err),
            backtrace: Backtrace::force_capture().to_string(),
        }
    }
}

impl From<std::io::Error> for ErrorWithBacktrace {
    fn from(err: std::io::Error) -> ErrorWithBacktrace {
        ErrorWithBacktrace {
            error: PossibleErrors::IoError(err),
            backtrace: Backtrace::force_capture().to_string(),
        }
    }
}

impl From<std::num::TryFromIntError> for ErrorWithBacktrace {
    fn from(err: std::num::TryFromIntError) -> ErrorWithBacktrace {
        ErrorWithBacktrace {
            error: PossibleErrors::TryFromIntError(err),
            backtrace: Backtrace::force_capture().to_string(),
        }
    }
}

impl From<serde_json::Error> for ErrorWithBacktrace {
    fn from(err: serde_json::Error) -> ErrorWithBacktrace {
        ErrorWithBacktrace {
            error: PossibleErrors::SerdeError(err),
            backtrace: Backtrace::force_capture().to_string(),
        }
    }
}

impl From<png::DecodingError> for ErrorWithBacktrace {
    fn from(err: png::DecodingError) -> ErrorWithBacktrace {
        ErrorWithBacktrace {
            error: PossibleErrors::DecodingError(err),
            backtrace: Backtrace::force_capture().to_string(),
        }
    }
}

impl From<jpeg_decoder::Error> for ErrorWithBacktrace {
    fn from(err: jpeg_decoder::Error) -> ErrorWithBacktrace {
        ErrorWithBacktrace {
            error: PossibleErrors::JpegDecoderError(err),
            backtrace: Backtrace::force_capture().to_string(),
        }
    }
}

impl std::fmt::Debug for ErrorWithBacktrace {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match &self.error {
            PossibleErrors::IoError(err) => write!(f, "IoError: {:?}", err),
            PossibleErrors::FfmpegError(err) => write!(f, "FfmpegError: {:?}", err),
            PossibleErrors::TryFromIntError(err) => write!(f, "TryFromIntError: {:?}", err),
            PossibleErrors::DecodingError(err) => write!(f, "DecodingError: {:?}", err),
            PossibleErrors::JpegDecoderError(err) => write!(f, "JpegDecoderError: {:?}", err),
            PossibleErrors::SerdeError(err) => write!(f, "SerdeError: {:?}", err),
            PossibleErrors::WorkerError(err) => write!(f, "WorkerError: {:?}", err),
        }
    }
}
