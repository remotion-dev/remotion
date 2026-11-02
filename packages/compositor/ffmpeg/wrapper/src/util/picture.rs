use ffi::AVPictureType::*;
use ffi::*;

#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum Type {
    None,
    I,
    P,
    B,
    S,
    SI,
    SP,
    BI,
}

impl From<AVPictureType> for Type {
    #[inline(always)]
    fn from(value: AVPictureType) -> Type {
        match value {
            AV_PICTURE_TYPE_NONE => Type::None,
            AV_PICTURE_TYPE_I => Type::I,
            AV_PICTURE_TYPE_P => Type::P,
            AV_PICTURE_TYPE_B => Type::B,
            AV_PICTURE_TYPE_S => Type::S,
            AV_PICTURE_TYPE_SI => Type::SI,
            AV_PICTURE_TYPE_SP => Type::SP,
            AV_PICTURE_TYPE_BI => Type::BI,
        }
    }
}

impl From<Type> for AVPictureType {
    #[inline(always)]
    fn from(value: Type) -> AVPictureType {
        match value {
            Type::None => AV_PICTURE_TYPE_NONE,
            Type::I => AV_PICTURE_TYPE_I,
            Type::P => AV_PICTURE_TYPE_P,
            Type::B => AV_PICTURE_TYPE_B,
            Type::S => AV_PICTURE_TYPE_S,
            Type::SI => AV_PICTURE_TYPE_SI,
            Type::SP => AV_PICTURE_TYPE_SP,
            Type::BI => AV_PICTURE_TYPE_BI,
        }
    }
}
