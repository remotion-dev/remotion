use crate::payloads::payloads::ErrorPayload;
use ffmpeg_next as remotionffmpeg;
use std::any::Any;
use std::backtrace::Backtrace;

fn error_to_string(err: PossibleErrors) -> String {
    match err {
        PossibleErrors::IoError(err) => err.to_string(),
        PossibleErrors::FfmpegError(err) => err.to_string(),
        PossibleErrors::TryFromIntError(err) => err.to_string(),
        PossibleErrors::DecodingError(err) => err.to_string(),
        PossibleErrors::JpegDecoderError(err) => err.to_string(),
        PossibleErrors::SerdeError(err) => err.to_string(),
        PossibleErrors::WorkerError(err) => format!("{:?}", err),
    }
}

pub fn handle_error(err: PossibleErrors) -> ! {
    let err = ErrorPayload {
        error: error_to_string(err),
        backtrace: Backtrace::force_capture().to_string(),
    };
    // TODO: Handling this error with the other print is better
    let j = serde_json::to_string(&err).unwrap();

    eprint!("{}", j);
    std::process::exit(1);
}

pub enum PossibleErrors {
    IoError(std::io::Error),
    FfmpegError(remotionffmpeg::Error),
    TryFromIntError(std::num::TryFromIntError),
    DecodingError(png::DecodingError),
    JpegDecoderError(jpeg_decoder::Error),
    SerdeError(serde_json::Error),
    WorkerError(Box<dyn Any + Send>),
}

impl From<Box<dyn Any + Send>> for PossibleErrors {
    fn from(err: Box<dyn Any + Send>) -> PossibleErrors {
        PossibleErrors::WorkerError(err)
    }
}

impl From<remotionffmpeg::Error> for PossibleErrors {
    fn from(err: remotionffmpeg::Error) -> PossibleErrors {
        PossibleErrors::FfmpegError(err)
    }
}

impl From<std::io::Error> for PossibleErrors {
    fn from(err: std::io::Error) -> PossibleErrors {
        PossibleErrors::IoError(err)
    }
}

impl From<std::num::TryFromIntError> for PossibleErrors {
    fn from(err: std::num::TryFromIntError) -> PossibleErrors {
        PossibleErrors::TryFromIntError(err)
    }
}

impl From<serde_json::Error> for PossibleErrors {
    fn from(err: serde_json::Error) -> PossibleErrors {
        PossibleErrors::SerdeError(err)
    }
}

impl From<png::DecodingError> for PossibleErrors {
    fn from(err: png::DecodingError) -> PossibleErrors {
        PossibleErrors::DecodingError(err)
    }
}

impl From<jpeg_decoder::Error> for PossibleErrors {
    fn from(err: jpeg_decoder::Error) -> PossibleErrors {
        PossibleErrors::JpegDecoderError(err)
    }
}

impl std::fmt::Debug for PossibleErrors {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
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
