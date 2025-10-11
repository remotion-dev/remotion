use crate::frame_cache::FrameCache;
use crate::opened_stream::OpenedStream;
use crate::opened_video_manager::OpenedVideoManager;
use crate::payloads::payloads::{CliInputAndMaxCacheSize, ErrorPayload};
use ffmpeg_next as remotionffmpeg;
use png::EncodingError;
use std::any::Any;
use std::backtrace::Backtrace;
use std::collections::HashMap;
use std::sync::{mpsc, Mutex, MutexGuard, PoisonError, RwLockReadGuard};

pub fn error_to_string(err: &ErrorWithBacktrace) -> String {
    match &err.error {
        PossibleErrors::IoError(err) => err.to_string(),
        PossibleErrors::FfmpegError(err) => err.to_string(),
        PossibleErrors::TryFromIntError(err) => err.to_string(),
        PossibleErrors::DecodingError(err) => err.to_string(),
        PossibleErrors::SerdeError(err) => err.to_string(),
        PossibleErrors::WorkerError(err) => format!("{:?}", err),
        PossibleErrors::EncodingError(err) => err.to_string(),
        PossibleErrors::ThreadPoolBuilderError(err) => err.to_string(),
        PossibleErrors::SendError(err) => format!("{:?}", err),
        PossibleErrors::RecvError(err) => format!("{:?}", err),
    }
}

pub fn error_to_json(err: ErrorWithBacktrace) -> Result<String, ErrorWithBacktrace> {
    let json = ErrorPayload {
        error: error_to_string(&err),
        backtrace: err.backtrace,
    };
    Ok(serde_json::to_string(&json)?)
}

pub fn handle_global_error(err: ErrorWithBacktrace) -> ! {
    // Only log printing to stderr
    eprint!("{}", error_to_json(err).unwrap());
    std::process::exit(1);
}

enum PossibleErrors {
    IoError(std::io::Error),
    FfmpegError(remotionffmpeg::Error),
    TryFromIntError(std::num::TryFromIntError),
    DecodingError(png::DecodingError),
    SerdeError(serde_json::Error),
    WorkerError(Box<dyn Any + Send>),
    EncodingError(EncodingError),
    ThreadPoolBuilderError(rayon_core::ThreadPoolBuildError),
    SendError(mpsc::SendError<CliInputAndMaxCacheSize>),
    RecvError(mpsc::RecvError),
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

impl From<EncodingError> for ErrorWithBacktrace {
    fn from(err: EncodingError) -> ErrorWithBacktrace {
        ErrorWithBacktrace {
            error: PossibleErrors::EncodingError(err),
            backtrace: Backtrace::force_capture().to_string(),
        }
    }
}

impl From<rayon_core::ThreadPoolBuildError> for ErrorWithBacktrace {
    fn from(err: rayon_core::ThreadPoolBuildError) -> ErrorWithBacktrace {
        ErrorWithBacktrace {
            error: PossibleErrors::ThreadPoolBuilderError(err),
            backtrace: Backtrace::force_capture().to_string(),
        }
    }
}

impl From<mpsc::SendError<CliInputAndMaxCacheSize>> for ErrorWithBacktrace {
    fn from(err: mpsc::SendError<CliInputAndMaxCacheSize>) -> ErrorWithBacktrace {
        ErrorWithBacktrace {
            error: PossibleErrors::SendError(err),
            backtrace: Backtrace::force_capture().to_string(),
        }
    }
}

impl From<mpsc::RecvError> for ErrorWithBacktrace {
    fn from(err: mpsc::RecvError) -> ErrorWithBacktrace {
        ErrorWithBacktrace {
            error: PossibleErrors::RecvError(err),
            backtrace: Backtrace::force_capture().to_string(),
        }
    }
}

impl From<&str> for ErrorWithBacktrace {
    fn from(err: &str) -> ErrorWithBacktrace {
        ErrorWithBacktrace {
            error: PossibleErrors::IoError(std::io::Error::new(
                std::io::ErrorKind::Other,
                err.to_string(),
            )),
            backtrace: Backtrace::force_capture().to_string(),
        }
    }
}

impl From<std::string::String> for ErrorWithBacktrace {
    fn from(err: std::string::String) -> ErrorWithBacktrace {
        ErrorWithBacktrace {
            error: PossibleErrors::IoError(std::io::Error::new(std::io::ErrorKind::Other, err)),
            backtrace: Backtrace::force_capture().to_string(),
        }
    }
}

fn create_error_with_backtrace<T>(err: PoisonError<MutexGuard<'_, T>>) -> ErrorWithBacktrace {
    ErrorWithBacktrace {
        error: PossibleErrors::IoError(std::io::Error::new(
            std::io::ErrorKind::Other,
            err.to_string(),
        )),
        backtrace: Backtrace::force_capture().to_string(),
    }
}

impl From<PoisonError<MutexGuard<'_, FrameCache>>> for ErrorWithBacktrace {
    fn from(err: PoisonError<MutexGuard<'_, FrameCache>>) -> ErrorWithBacktrace {
        create_error_with_backtrace(err)
    }
}

impl From<PoisonError<MutexGuard<'_, OpenedStream>>> for ErrorWithBacktrace {
    fn from(err: PoisonError<MutexGuard<'_, OpenedStream>>) -> ErrorWithBacktrace {
        create_error_with_backtrace(err)
    }
}
impl From<PoisonError<MutexGuard<'_, OpenedVideoManager>>> for ErrorWithBacktrace {
    fn from(err: PoisonError<MutexGuard<'_, OpenedVideoManager>>) -> ErrorWithBacktrace {
        create_error_with_backtrace(err)
    }
}

impl From<PoisonError<RwLockReadGuard<'_, HashMap<std::string::String, Mutex<FrameCache>>>>>
    for ErrorWithBacktrace
{
    fn from(
        err: PoisonError<RwLockReadGuard<'_, HashMap<std::string::String, Mutex<FrameCache>>>>,
    ) -> ErrorWithBacktrace {
        ErrorWithBacktrace::from(err.to_string())
    }
}

impl std::fmt::Debug for ErrorWithBacktrace {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match &self.error {
            PossibleErrors::IoError(err) => write!(f, "IoError: {:?}", err),
            PossibleErrors::FfmpegError(err) => write!(f, "FfmpegError: {:?}", err),
            PossibleErrors::TryFromIntError(err) => write!(f, "TryFromIntError: {:?}", err),
            PossibleErrors::DecodingError(err) => write!(f, "DecodingError: {:?}", err),
            PossibleErrors::SerdeError(err) => write!(f, "SerdeError: {:?}", err),
            PossibleErrors::WorkerError(err) => write!(f, "WorkerError: {:?}", err),
            PossibleErrors::EncodingError(err) => write!(f, "EncodingError: {:?}", err),
            PossibleErrors::ThreadPoolBuilderError(err) => {
                write!(f, "ThreadPoolBuilderError: {:?}", err)
            }
            PossibleErrors::SendError(err) => write!(f, "SendError: {:?}", err),
            PossibleErrors::RecvError(err) => write!(f, "RecvError: {:?}", err),
        }
    }
}
