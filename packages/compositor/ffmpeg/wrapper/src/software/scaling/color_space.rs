use ffi::*;
use libc::c_int;

#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum ColorSpace {
    Default,

    ITU709,
    FCC,
    ITU601,
    ITU624,
    SMPTE170M,
    SMPTE240M,
    BT2020,
}

impl From<c_int> for ColorSpace {
    fn from(value: c_int) -> ColorSpace {
        match value {
            SWS_CS_ITU709 => ColorSpace::ITU709,
            SWS_CS_FCC => ColorSpace::FCC,
            SWS_CS_DEFAULT => ColorSpace::Default,
            SWS_CS_SMPTE240M => ColorSpace::SMPTE240M,
            SWS_CS_BT2020 => ColorSpace::BT2020,
            _ => ColorSpace::Default,
        }
    }
}

impl From<ColorSpace> for c_int {
    fn from(value: ColorSpace) -> c_int {
        match value {
            ColorSpace::Default => SWS_CS_DEFAULT,
            ColorSpace::ITU709 => SWS_CS_ITU709,
            ColorSpace::FCC => SWS_CS_FCC,
            ColorSpace::ITU601 => SWS_CS_ITU601,
            ColorSpace::ITU624 => SWS_CS_ITU624,
            ColorSpace::SMPTE170M => SWS_CS_SMPTE170M,
            ColorSpace::SMPTE240M => SWS_CS_SMPTE240M,
            ColorSpace::BT2020 => SWS_CS_BT2020,
        }
    }
}
