use ffi::AVMediaType::*;
use ffi::*;

#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum Type {
    Unknown,
    Video,
    Audio,
    Data,
    Subtitle,
    Attachment,
}

impl From<AVMediaType> for Type {
    #[inline(always)]
    fn from(value: AVMediaType) -> Self {
        match value {
            AVMEDIA_TYPE_UNKNOWN => Type::Unknown,
            AVMEDIA_TYPE_VIDEO => Type::Video,
            AVMEDIA_TYPE_AUDIO => Type::Audio,
            AVMEDIA_TYPE_DATA => Type::Data,
            AVMEDIA_TYPE_SUBTITLE => Type::Subtitle,
            AVMEDIA_TYPE_ATTACHMENT => Type::Attachment,
            AVMEDIA_TYPE_NB => Type::Unknown,
        }
    }
}

impl From<Type> for AVMediaType {
    #[inline(always)]
    fn from(value: Type) -> AVMediaType {
        match value {
            Type::Unknown => AVMEDIA_TYPE_UNKNOWN,
            Type::Video => AVMEDIA_TYPE_VIDEO,
            Type::Audio => AVMEDIA_TYPE_AUDIO,
            Type::Data => AVMEDIA_TYPE_DATA,
            Type::Subtitle => AVMEDIA_TYPE_SUBTITLE,
            Type::Attachment => AVMEDIA_TYPE_ATTACHMENT,
        }
    }
}
