use std::error;
use std::ffi::CStr;
use std::fmt;
use std::io;
use std::str::from_utf8_unchecked;

use ffi::{
    av_strerror, AVERROR, AVERROR_BSF_NOT_FOUND, AVERROR_BUFFER_TOO_SMALL, AVERROR_BUG,
    AVERROR_BUG2, AVERROR_DECODER_NOT_FOUND, AVERROR_DEMUXER_NOT_FOUND, AVERROR_ENCODER_NOT_FOUND,
    AVERROR_EOF, AVERROR_EXIT, AVERROR_EXPERIMENTAL, AVERROR_EXTERNAL, AVERROR_FILTER_NOT_FOUND,
    AVERROR_HTTP_BAD_REQUEST, AVERROR_HTTP_FORBIDDEN, AVERROR_HTTP_NOT_FOUND,
    AVERROR_HTTP_OTHER_4XX, AVERROR_HTTP_SERVER_ERROR, AVERROR_HTTP_UNAUTHORIZED,
    AVERROR_INPUT_CHANGED, AVERROR_INVALIDDATA, AVERROR_MUXER_NOT_FOUND, AVERROR_OPTION_NOT_FOUND,
    AVERROR_OUTPUT_CHANGED, AVERROR_PATCHWELCOME, AVERROR_PROTOCOL_NOT_FOUND,
    AVERROR_STREAM_NOT_FOUND, AVERROR_UNKNOWN, AVUNERROR, AV_ERROR_MAX_STRING_SIZE,
};
use libc::{c_char, c_int};

// Export POSIX error codes so that users can do something like
//
//   if error == (Error::Other { errno: EAGAIN }) {
//       ...
//   }
pub use libc::{
    E2BIG, EACCES, EADDRINUSE, EADDRNOTAVAIL, EAFNOSUPPORT, EAGAIN, EALREADY, EBADF, EBADMSG,
    EBUSY, ECANCELED, ECHILD, ECONNABORTED, ECONNREFUSED, ECONNRESET, EDEADLK, EDESTADDRREQ, EDOM,
    EEXIST, EFAULT, EFBIG, EHOSTUNREACH, EIDRM, EILSEQ, EINPROGRESS, EINTR, EINVAL, EIO, EISCONN,
    EISDIR, ELOOP, EMFILE, EMLINK, EMSGSIZE, ENAMETOOLONG, ENETDOWN, ENETRESET, ENETUNREACH,
    ENFILE, ENOBUFS, ENODEV, ENOENT, ENOEXEC, ENOLCK, ENOLINK, ENOMEM, ENOMSG, ENOPROTOOPT, ENOSPC,
    ENOSYS, ENOTCONN, ENOTDIR, ENOTEMPTY, ENOTRECOVERABLE, ENOTSOCK, ENOTSUP, ENOTTY, ENXIO,
    EOPNOTSUPP, EOVERFLOW, EOWNERDEAD, EPERM, EPIPE, EPROTO, EPROTONOSUPPORT, EPROTOTYPE, ERANGE,
    EROFS, ESPIPE, ESRCH, ETIMEDOUT, ETXTBSY, EWOULDBLOCK, EXDEV,
};
#[cfg(not(any(target_os = "freebsd", target_os = "wasi")))]
pub use libc::{ENODATA, ENOSR, ENOSTR, ETIME};

#[derive(Copy, Clone, PartialEq, Eq)]
pub enum Error {
    Bug,
    Bug2,
    Unknown,
    Experimental,
    BufferTooSmall,
    Eof,
    Exit,
    External,
    InvalidData,
    PatchWelcome,

    InputChanged,
    OutputChanged,

    BsfNotFound,
    DecoderNotFound,
    DemuxerNotFound,
    EncoderNotFound,
    OptionNotFound,
    MuxerNotFound,
    FilterNotFound,
    ProtocolNotFound,
    StreamNotFound,

    HttpBadRequest,
    HttpUnauthorized,
    HttpForbidden,
    HttpNotFound,
    HttpOther4xx,
    HttpServerError,

    /// For AVERROR(e) wrapping POSIX error codes, e.g. AVERROR(EAGAIN).
    Other {
        errno: c_int,
    },
}

impl From<c_int> for Error {
    fn from(value: c_int) -> Error {
        match value {
            AVERROR_BSF_NOT_FOUND => Error::BsfNotFound,
            AVERROR_BUG => Error::Bug,
            AVERROR_BUFFER_TOO_SMALL => Error::BufferTooSmall,
            AVERROR_DECODER_NOT_FOUND => Error::DecoderNotFound,
            AVERROR_DEMUXER_NOT_FOUND => Error::DemuxerNotFound,
            AVERROR_ENCODER_NOT_FOUND => Error::EncoderNotFound,
            AVERROR_EOF => Error::Eof,
            AVERROR_EXIT => Error::Exit,
            AVERROR_EXTERNAL => Error::External,
            AVERROR_FILTER_NOT_FOUND => Error::FilterNotFound,
            AVERROR_INVALIDDATA => Error::InvalidData,
            AVERROR_MUXER_NOT_FOUND => Error::MuxerNotFound,
            AVERROR_OPTION_NOT_FOUND => Error::OptionNotFound,
            AVERROR_PATCHWELCOME => Error::PatchWelcome,
            AVERROR_PROTOCOL_NOT_FOUND => Error::ProtocolNotFound,
            AVERROR_STREAM_NOT_FOUND => Error::StreamNotFound,
            AVERROR_BUG2 => Error::Bug2,
            AVERROR_UNKNOWN => Error::Unknown,
            AVERROR_EXPERIMENTAL => Error::Experimental,
            AVERROR_INPUT_CHANGED => Error::InputChanged,
            AVERROR_OUTPUT_CHANGED => Error::OutputChanged,
            AVERROR_HTTP_BAD_REQUEST => Error::HttpBadRequest,
            AVERROR_HTTP_UNAUTHORIZED => Error::HttpUnauthorized,
            AVERROR_HTTP_FORBIDDEN => Error::HttpForbidden,
            AVERROR_HTTP_NOT_FOUND => Error::HttpNotFound,
            AVERROR_HTTP_OTHER_4XX => Error::HttpOther4xx,
            AVERROR_HTTP_SERVER_ERROR => Error::HttpServerError,
            e => Error::Other {
                errno: AVUNERROR(e),
            },
        }
    }
}

impl From<Error> for c_int {
    fn from(value: Error) -> c_int {
        match value {
            Error::BsfNotFound => AVERROR_BSF_NOT_FOUND,
            Error::Bug => AVERROR_BUG,
            Error::BufferTooSmall => AVERROR_BUFFER_TOO_SMALL,
            Error::DecoderNotFound => AVERROR_DECODER_NOT_FOUND,
            Error::DemuxerNotFound => AVERROR_DEMUXER_NOT_FOUND,
            Error::EncoderNotFound => AVERROR_ENCODER_NOT_FOUND,
            Error::Eof => AVERROR_EOF,
            Error::Exit => AVERROR_EXIT,
            Error::External => AVERROR_EXTERNAL,
            Error::FilterNotFound => AVERROR_FILTER_NOT_FOUND,
            Error::InvalidData => AVERROR_INVALIDDATA,
            Error::MuxerNotFound => AVERROR_MUXER_NOT_FOUND,
            Error::OptionNotFound => AVERROR_OPTION_NOT_FOUND,
            Error::PatchWelcome => AVERROR_PATCHWELCOME,
            Error::ProtocolNotFound => AVERROR_PROTOCOL_NOT_FOUND,
            Error::StreamNotFound => AVERROR_STREAM_NOT_FOUND,
            Error::Bug2 => AVERROR_BUG2,
            Error::Unknown => AVERROR_UNKNOWN,
            Error::Experimental => AVERROR_EXPERIMENTAL,
            Error::InputChanged => AVERROR_INPUT_CHANGED,
            Error::OutputChanged => AVERROR_OUTPUT_CHANGED,
            Error::HttpBadRequest => AVERROR_HTTP_BAD_REQUEST,
            Error::HttpUnauthorized => AVERROR_HTTP_UNAUTHORIZED,
            Error::HttpForbidden => AVERROR_HTTP_FORBIDDEN,
            Error::HttpNotFound => AVERROR_HTTP_NOT_FOUND,
            Error::HttpOther4xx => AVERROR_HTTP_OTHER_4XX,
            Error::HttpServerError => AVERROR_HTTP_SERVER_ERROR,
            Error::Other { errno } => AVERROR(errno),
        }
    }
}

impl error::Error for Error {}

impl From<Error> for io::Error {
    fn from(value: Error) -> io::Error {
        io::Error::new(io::ErrorKind::Other, value)
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> Result<(), fmt::Error> {
        f.write_str(unsafe {
            from_utf8_unchecked(
                CStr::from_ptr(match *self {
                    Error::Other { errno } => libc::strerror(errno),
                    _ => STRINGS[index(self)].as_ptr(),
                })
                .to_bytes(),
            )
        })
    }
}

impl fmt::Debug for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> Result<(), fmt::Error> {
        f.write_str("ffmpeg::Error(")?;
        f.write_str(&format!("{}: ", AVUNERROR((*self).into())))?;
        fmt::Display::fmt(self, f)?;
        f.write_str(")")
    }
}

#[inline(always)]
fn index(error: &Error) -> usize {
    match *error {
        Error::BsfNotFound => 0,
        Error::Bug => 1,
        Error::BufferTooSmall => 2,
        Error::DecoderNotFound => 3,
        Error::DemuxerNotFound => 4,
        Error::EncoderNotFound => 5,
        Error::Eof => 6,
        Error::Exit => 7,
        Error::External => 8,
        Error::FilterNotFound => 9,
        Error::InvalidData => 10,
        Error::MuxerNotFound => 11,
        Error::OptionNotFound => 12,
        Error::PatchWelcome => 13,
        Error::ProtocolNotFound => 14,
        Error::StreamNotFound => 15,
        Error::Bug2 => 16,
        Error::Unknown => 17,
        Error::Experimental => 18,
        Error::InputChanged => 19,
        Error::OutputChanged => 20,
        Error::HttpBadRequest => 21,
        Error::HttpUnauthorized => 22,
        Error::HttpForbidden => 23,
        Error::HttpNotFound => 24,
        Error::HttpOther4xx => 25,
        Error::HttpServerError => 26,
        Error::Other { errno: _ } => (-1isize) as usize,
    }
}

// XXX: the length has to be synced with the number of errors
static mut STRINGS: [[c_char; AV_ERROR_MAX_STRING_SIZE]; 27] = [[0; AV_ERROR_MAX_STRING_SIZE]; 27];

pub fn register_all() {
    unsafe {
        av_strerror(
            Error::Bug.into(),
            STRINGS[index(&Error::Bug)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::Bug2.into(),
            STRINGS[index(&Error::Bug2)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::Unknown.into(),
            STRINGS[index(&Error::Unknown)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::Experimental.into(),
            STRINGS[index(&Error::Experimental)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::BufferTooSmall.into(),
            STRINGS[index(&Error::BufferTooSmall)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::Eof.into(),
            STRINGS[index(&Error::Eof)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::Exit.into(),
            STRINGS[index(&Error::Exit)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::External.into(),
            STRINGS[index(&Error::External)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::InvalidData.into(),
            STRINGS[index(&Error::InvalidData)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::PatchWelcome.into(),
            STRINGS[index(&Error::PatchWelcome)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );

        av_strerror(
            Error::InputChanged.into(),
            STRINGS[index(&Error::InputChanged)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::OutputChanged.into(),
            STRINGS[index(&Error::OutputChanged)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );

        av_strerror(
            Error::BsfNotFound.into(),
            STRINGS[index(&Error::BsfNotFound)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::DecoderNotFound.into(),
            STRINGS[index(&Error::DecoderNotFound)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::DemuxerNotFound.into(),
            STRINGS[index(&Error::DemuxerNotFound)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::EncoderNotFound.into(),
            STRINGS[index(&Error::EncoderNotFound)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::OptionNotFound.into(),
            STRINGS[index(&Error::OptionNotFound)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::MuxerNotFound.into(),
            STRINGS[index(&Error::MuxerNotFound)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::FilterNotFound.into(),
            STRINGS[index(&Error::FilterNotFound)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::ProtocolNotFound.into(),
            STRINGS[index(&Error::ProtocolNotFound)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::StreamNotFound.into(),
            STRINGS[index(&Error::StreamNotFound)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );

        av_strerror(
            Error::HttpBadRequest.into(),
            STRINGS[index(&Error::HttpBadRequest)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::HttpUnauthorized.into(),
            STRINGS[index(&Error::HttpUnauthorized)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::HttpForbidden.into(),
            STRINGS[index(&Error::HttpForbidden)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::HttpNotFound.into(),
            STRINGS[index(&Error::HttpNotFound)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::HttpOther4xx.into(),
            STRINGS[index(&Error::HttpOther4xx)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
        av_strerror(
            Error::HttpServerError.into(),
            STRINGS[index(&Error::HttpServerError)].as_mut_ptr(),
            AV_ERROR_MAX_STRING_SIZE,
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_roundtrip() {
        assert_eq!(Into::<c_int>::into(Error::from(AVERROR_EOF)), AVERROR_EOF);
        assert_eq!(
            Into::<c_int>::into(Error::from(AVERROR(EAGAIN))),
            AVERROR(EAGAIN)
        );
        assert_eq!(Error::from(AVERROR(EAGAIN)), Error::Other { errno: EAGAIN });
    }

    #[cfg(any(target_os = "linux", target_os = "macos"))]
    #[test]
    fn test_posix_error_string() {
        assert_eq!(
            Error::from(AVERROR(EAGAIN)).to_string(),
            "Resource temporarily unavailable"
        )
    }
}
