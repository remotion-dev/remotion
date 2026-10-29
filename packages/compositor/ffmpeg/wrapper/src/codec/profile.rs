use super::Id;
use ffi::*;
use libc::c_int;

#[allow(non_camel_case_types)]
#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum Profile {
    Unknown,
    Reserved,

    AAC(AAC),
    MPEG2(MPEG2),
    DTS(DTS),
    H264(H264),
    VC1(VC1),
    MPEG4(MPEG4),
    JPEG2000(JPEG2000),
    HEVC(HEVC),
    VP9(VP9),
}

#[allow(non_camel_case_types)]
#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum AAC {
    Main,
    Low,
    SSR,
    LTP,
    HE,
    HEv2,
    LD,
    ELD,

    MPEG2Low,
    MPEG2HE,
}

#[allow(non_camel_case_types)]
#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum DTS {
    Default,
    ES,
    _96_24,
    HD_HRA,
    HD_MA,
    Express,
}

#[allow(non_camel_case_types)]
#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum MPEG2 {
    _422,
    High,
    SS,
    SNRScalable,
    Main,
    Simple,
}

#[allow(non_camel_case_types)]
#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum H264 {
    Constrained,
    Intra,
    Baseline,
    ConstrainedBaseline,
    Main,
    Extended,
    High,
    High10,
    High10Intra,
    High422,
    High422Intra,
    High444,
    High444Predictive,
    High444Intra,
    CAVLC444,
}

#[allow(non_camel_case_types)]
#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum VC1 {
    Simple,
    Main,
    Complex,
    Advanced,
}

#[allow(non_camel_case_types)]
#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum MPEG4 {
    Simple,
    SimpleScalable,
    Core,
    Main,
    NBit,
    ScalableTexture,
    SimpleFaceAnimation,
    BasicAnimatedTexture,
    Hybrid,
    AdvancedRealTime,
    CoreScalable,
    AdvancedCoding,
    AdvancedCore,
    AdvancedScalableTexture,
    SimpleStudio,
    AdvancedSimple,
}

#[allow(non_camel_case_types)]
#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum JPEG2000 {
    CStreamRestriction0,
    CStreamRestriction1,
    CStreamNoRestriction,
    DCinema2K,
    DCinema4K,
}

#[allow(non_camel_case_types)]
#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum HEVC {
    Main,
    Main10,
    MainStillPicture,
    Rext,
}

#[allow(non_camel_case_types)]
#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum VP9 {
    _0,
    _1,
    _2,
    _3,
}

impl From<(Id, c_int)> for Profile {
    fn from((id, value): (Id, c_int)) -> Profile {
        if value == FF_PROFILE_UNKNOWN {
            return Profile::Unknown;
        }

        if value == FF_PROFILE_RESERVED {
            return Profile::Reserved;
        }

        match id {
            Id::AAC => match value {
                FF_PROFILE_AAC_MAIN => Profile::AAC(AAC::Main),
                FF_PROFILE_AAC_LOW => Profile::AAC(AAC::Low),
                FF_PROFILE_AAC_SSR => Profile::AAC(AAC::SSR),
                FF_PROFILE_AAC_LTP => Profile::AAC(AAC::LTP),
                FF_PROFILE_AAC_HE => Profile::AAC(AAC::HE),
                FF_PROFILE_AAC_HE_V2 => Profile::AAC(AAC::HEv2),
                FF_PROFILE_AAC_LD => Profile::AAC(AAC::LD),
                FF_PROFILE_AAC_ELD => Profile::AAC(AAC::ELD),

                FF_PROFILE_MPEG2_AAC_LOW => Profile::AAC(AAC::MPEG2Low),
                FF_PROFILE_MPEG2_AAC_HE => Profile::AAC(AAC::MPEG2HE),

                _ => Profile::Unknown,
            },

            Id::DTS => match value {
                FF_PROFILE_DTS => Profile::DTS(DTS::Default),
                FF_PROFILE_DTS_ES => Profile::DTS(DTS::ES),
                FF_PROFILE_DTS_96_24 => Profile::DTS(DTS::_96_24),
                FF_PROFILE_DTS_HD_HRA => Profile::DTS(DTS::HD_HRA),
                FF_PROFILE_DTS_HD_MA => Profile::DTS(DTS::HD_MA),
                FF_PROFILE_DTS_EXPRESS => Profile::DTS(DTS::Express),

                _ => Profile::Unknown,
            },

            Id::MPEG2VIDEO => match value {
                FF_PROFILE_MPEG2_422 => Profile::MPEG2(MPEG2::_422),
                FF_PROFILE_MPEG2_HIGH => Profile::MPEG2(MPEG2::High),
                FF_PROFILE_MPEG2_SS => Profile::MPEG2(MPEG2::SS),
                FF_PROFILE_MPEG2_SNR_SCALABLE => Profile::MPEG2(MPEG2::SNRScalable),
                FF_PROFILE_MPEG2_MAIN => Profile::MPEG2(MPEG2::Main),
                FF_PROFILE_MPEG2_SIMPLE => Profile::MPEG2(MPEG2::Simple),

                _ => Profile::Unknown,
            },

            Id::H264 => match value {
                FF_PROFILE_H264_CONSTRAINED => Profile::H264(H264::Constrained),
                FF_PROFILE_H264_INTRA => Profile::H264(H264::Intra),
                FF_PROFILE_H264_BASELINE => Profile::H264(H264::Baseline),
                FF_PROFILE_H264_CONSTRAINED_BASELINE => Profile::H264(H264::ConstrainedBaseline),
                FF_PROFILE_H264_MAIN => Profile::H264(H264::Main),
                FF_PROFILE_H264_EXTENDED => Profile::H264(H264::Extended),
                FF_PROFILE_H264_HIGH => Profile::H264(H264::High),
                FF_PROFILE_H264_HIGH_10 => Profile::H264(H264::High10),
                FF_PROFILE_H264_HIGH_10_INTRA => Profile::H264(H264::High10Intra),
                FF_PROFILE_H264_HIGH_422 => Profile::H264(H264::High422),
                FF_PROFILE_H264_HIGH_422_INTRA => Profile::H264(H264::High422Intra),
                FF_PROFILE_H264_HIGH_444 => Profile::H264(H264::High444),
                FF_PROFILE_H264_HIGH_444_PREDICTIVE => Profile::H264(H264::High444Predictive),
                FF_PROFILE_H264_HIGH_444_INTRA => Profile::H264(H264::High444Intra),
                FF_PROFILE_H264_CAVLC_444 => Profile::H264(H264::CAVLC444),

                _ => Profile::Unknown,
            },

            Id::VC1 => match value {
                FF_PROFILE_VC1_SIMPLE => Profile::VC1(VC1::Simple),
                FF_PROFILE_VC1_MAIN => Profile::VC1(VC1::Main),
                FF_PROFILE_VC1_COMPLEX => Profile::VC1(VC1::Complex),
                FF_PROFILE_VC1_ADVANCED => Profile::VC1(VC1::Advanced),

                _ => Profile::Unknown,
            },

            Id::MPEG4 => match value {
                FF_PROFILE_MPEG4_SIMPLE => Profile::MPEG4(MPEG4::Simple),
                FF_PROFILE_MPEG4_SIMPLE_SCALABLE => Profile::MPEG4(MPEG4::SimpleScalable),
                FF_PROFILE_MPEG4_CORE => Profile::MPEG4(MPEG4::Core),
                FF_PROFILE_MPEG4_MAIN => Profile::MPEG4(MPEG4::Main),
                FF_PROFILE_MPEG4_N_BIT => Profile::MPEG4(MPEG4::NBit),
                FF_PROFILE_MPEG4_SCALABLE_TEXTURE => Profile::MPEG4(MPEG4::ScalableTexture),
                FF_PROFILE_MPEG4_SIMPLE_FACE_ANIMATION => {
                    Profile::MPEG4(MPEG4::SimpleFaceAnimation)
                }
                FF_PROFILE_MPEG4_BASIC_ANIMATED_TEXTURE => {
                    Profile::MPEG4(MPEG4::BasicAnimatedTexture)
                }
                FF_PROFILE_MPEG4_HYBRID => Profile::MPEG4(MPEG4::Hybrid),
                FF_PROFILE_MPEG4_ADVANCED_REAL_TIME => Profile::MPEG4(MPEG4::AdvancedRealTime),
                FF_PROFILE_MPEG4_CORE_SCALABLE => Profile::MPEG4(MPEG4::CoreScalable),
                FF_PROFILE_MPEG4_ADVANCED_CODING => Profile::MPEG4(MPEG4::AdvancedCoding),
                FF_PROFILE_MPEG4_ADVANCED_CORE => Profile::MPEG4(MPEG4::AdvancedCore),
                FF_PROFILE_MPEG4_ADVANCED_SCALABLE_TEXTURE => {
                    Profile::MPEG4(MPEG4::AdvancedScalableTexture)
                }
                FF_PROFILE_MPEG4_SIMPLE_STUDIO => Profile::MPEG4(MPEG4::SimpleStudio),
                FF_PROFILE_MPEG4_ADVANCED_SIMPLE => Profile::MPEG4(MPEG4::AdvancedSimple),

                _ => Profile::Unknown,
            },

            Id::JPEG2000 => match value {
                FF_PROFILE_JPEG2000_CSTREAM_RESTRICTION_0 => {
                    Profile::JPEG2000(JPEG2000::CStreamRestriction0)
                }
                FF_PROFILE_JPEG2000_CSTREAM_RESTRICTION_1 => {
                    Profile::JPEG2000(JPEG2000::CStreamRestriction1)
                }
                FF_PROFILE_JPEG2000_CSTREAM_NO_RESTRICTION => {
                    Profile::JPEG2000(JPEG2000::CStreamNoRestriction)
                }
                FF_PROFILE_JPEG2000_DCINEMA_2K => Profile::JPEG2000(JPEG2000::DCinema2K),
                FF_PROFILE_JPEG2000_DCINEMA_4K => Profile::JPEG2000(JPEG2000::DCinema4K),

                _ => Profile::Unknown,
            },

            Id::HEVC => match value {
                FF_PROFILE_HEVC_MAIN => Profile::HEVC(HEVC::Main),
                FF_PROFILE_HEVC_MAIN_10 => Profile::HEVC(HEVC::Main10),
                FF_PROFILE_HEVC_MAIN_STILL_PICTURE => Profile::HEVC(HEVC::MainStillPicture),
                FF_PROFILE_HEVC_REXT => Profile::HEVC(HEVC::Rext),

                _ => Profile::Unknown,
            },

            Id::VP9 => match value {
                FF_PROFILE_VP9_0 => Profile::VP9(VP9::_0),
                FF_PROFILE_VP9_1 => Profile::VP9(VP9::_1),
                FF_PROFILE_VP9_2 => Profile::VP9(VP9::_2),
                FF_PROFILE_VP9_3 => Profile::VP9(VP9::_3),

                _ => Profile::Unknown,
            },

            _ => Profile::Unknown,
        }
    }
}

impl From<Profile> for c_int {
    fn from(value: Profile) -> c_int {
        match value {
            Profile::Unknown => FF_PROFILE_UNKNOWN,
            Profile::Reserved => FF_PROFILE_RESERVED,

            Profile::AAC(AAC::Main) => FF_PROFILE_AAC_MAIN,
            Profile::AAC(AAC::Low) => FF_PROFILE_AAC_LOW,
            Profile::AAC(AAC::SSR) => FF_PROFILE_AAC_SSR,
            Profile::AAC(AAC::LTP) => FF_PROFILE_AAC_LTP,
            Profile::AAC(AAC::HE) => FF_PROFILE_AAC_HE,
            Profile::AAC(AAC::HEv2) => FF_PROFILE_AAC_HE_V2,
            Profile::AAC(AAC::LD) => FF_PROFILE_AAC_LD,
            Profile::AAC(AAC::ELD) => FF_PROFILE_AAC_ELD,

            Profile::AAC(AAC::MPEG2Low) => FF_PROFILE_MPEG2_AAC_LOW,
            Profile::AAC(AAC::MPEG2HE) => FF_PROFILE_MPEG2_AAC_HE,

            Profile::DTS(DTS::Default) => FF_PROFILE_DTS,
            Profile::DTS(DTS::ES) => FF_PROFILE_DTS_ES,
            Profile::DTS(DTS::_96_24) => FF_PROFILE_DTS_96_24,
            Profile::DTS(DTS::HD_HRA) => FF_PROFILE_DTS_HD_HRA,
            Profile::DTS(DTS::HD_MA) => FF_PROFILE_DTS_HD_MA,
            Profile::DTS(DTS::Express) => FF_PROFILE_DTS_EXPRESS,

            Profile::MPEG2(MPEG2::_422) => FF_PROFILE_MPEG2_422,
            Profile::MPEG2(MPEG2::High) => FF_PROFILE_MPEG2_HIGH,
            Profile::MPEG2(MPEG2::SS) => FF_PROFILE_MPEG2_SS,
            Profile::MPEG2(MPEG2::SNRScalable) => FF_PROFILE_MPEG2_SNR_SCALABLE,
            Profile::MPEG2(MPEG2::Main) => FF_PROFILE_MPEG2_MAIN,
            Profile::MPEG2(MPEG2::Simple) => FF_PROFILE_MPEG2_SIMPLE,

            Profile::H264(H264::Constrained) => FF_PROFILE_H264_CONSTRAINED,
            Profile::H264(H264::Intra) => FF_PROFILE_H264_INTRA,
            Profile::H264(H264::Baseline) => FF_PROFILE_H264_BASELINE,
            Profile::H264(H264::ConstrainedBaseline) => FF_PROFILE_H264_CONSTRAINED_BASELINE,
            Profile::H264(H264::Main) => FF_PROFILE_H264_MAIN,
            Profile::H264(H264::Extended) => FF_PROFILE_H264_EXTENDED,
            Profile::H264(H264::High) => FF_PROFILE_H264_HIGH,
            Profile::H264(H264::High10) => FF_PROFILE_H264_HIGH_10,
            Profile::H264(H264::High10Intra) => FF_PROFILE_H264_HIGH_10_INTRA,
            Profile::H264(H264::High422) => FF_PROFILE_H264_HIGH_422,
            Profile::H264(H264::High422Intra) => FF_PROFILE_H264_HIGH_422_INTRA,
            Profile::H264(H264::High444) => FF_PROFILE_H264_HIGH_444,
            Profile::H264(H264::High444Predictive) => FF_PROFILE_H264_HIGH_444_PREDICTIVE,
            Profile::H264(H264::High444Intra) => FF_PROFILE_H264_HIGH_444_INTRA,
            Profile::H264(H264::CAVLC444) => FF_PROFILE_H264_CAVLC_444,

            Profile::VC1(VC1::Simple) => FF_PROFILE_VC1_SIMPLE,
            Profile::VC1(VC1::Main) => FF_PROFILE_VC1_MAIN,
            Profile::VC1(VC1::Complex) => FF_PROFILE_VC1_COMPLEX,
            Profile::VC1(VC1::Advanced) => FF_PROFILE_VC1_ADVANCED,

            Profile::MPEG4(MPEG4::Simple) => FF_PROFILE_MPEG4_SIMPLE,
            Profile::MPEG4(MPEG4::SimpleScalable) => FF_PROFILE_MPEG4_SIMPLE_SCALABLE,
            Profile::MPEG4(MPEG4::Core) => FF_PROFILE_MPEG4_CORE,
            Profile::MPEG4(MPEG4::Main) => FF_PROFILE_MPEG4_MAIN,
            Profile::MPEG4(MPEG4::NBit) => FF_PROFILE_MPEG4_N_BIT,
            Profile::MPEG4(MPEG4::ScalableTexture) => FF_PROFILE_MPEG4_SCALABLE_TEXTURE,
            Profile::MPEG4(MPEG4::SimpleFaceAnimation) => FF_PROFILE_MPEG4_SIMPLE_FACE_ANIMATION,
            Profile::MPEG4(MPEG4::BasicAnimatedTexture) => FF_PROFILE_MPEG4_BASIC_ANIMATED_TEXTURE,
            Profile::MPEG4(MPEG4::Hybrid) => FF_PROFILE_MPEG4_HYBRID,
            Profile::MPEG4(MPEG4::AdvancedRealTime) => FF_PROFILE_MPEG4_ADVANCED_REAL_TIME,
            Profile::MPEG4(MPEG4::CoreScalable) => FF_PROFILE_MPEG4_CORE_SCALABLE,
            Profile::MPEG4(MPEG4::AdvancedCoding) => FF_PROFILE_MPEG4_ADVANCED_CODING,
            Profile::MPEG4(MPEG4::AdvancedCore) => FF_PROFILE_MPEG4_ADVANCED_CORE,
            Profile::MPEG4(MPEG4::AdvancedScalableTexture) => {
                FF_PROFILE_MPEG4_ADVANCED_SCALABLE_TEXTURE
            }
            Profile::MPEG4(MPEG4::SimpleStudio) => FF_PROFILE_MPEG4_SIMPLE_STUDIO,
            Profile::MPEG4(MPEG4::AdvancedSimple) => FF_PROFILE_MPEG4_ADVANCED_SIMPLE,

            Profile::JPEG2000(JPEG2000::CStreamRestriction0) => {
                FF_PROFILE_JPEG2000_CSTREAM_RESTRICTION_0
            }
            Profile::JPEG2000(JPEG2000::CStreamRestriction1) => {
                FF_PROFILE_JPEG2000_CSTREAM_RESTRICTION_1
            }
            Profile::JPEG2000(JPEG2000::CStreamNoRestriction) => {
                FF_PROFILE_JPEG2000_CSTREAM_NO_RESTRICTION
            }
            Profile::JPEG2000(JPEG2000::DCinema2K) => FF_PROFILE_JPEG2000_DCINEMA_2K,
            Profile::JPEG2000(JPEG2000::DCinema4K) => FF_PROFILE_JPEG2000_DCINEMA_4K,

            Profile::HEVC(HEVC::Main) => FF_PROFILE_HEVC_MAIN,
            Profile::HEVC(HEVC::Main10) => FF_PROFILE_HEVC_MAIN_10,
            Profile::HEVC(HEVC::MainStillPicture) => FF_PROFILE_HEVC_MAIN_STILL_PICTURE,
            Profile::HEVC(HEVC::Rext) => FF_PROFILE_HEVC_REXT,

            Profile::VP9(VP9::_0) => FF_PROFILE_VP9_0,
            Profile::VP9(VP9::_1) => FF_PROFILE_VP9_1,
            Profile::VP9(VP9::_2) => FF_PROFILE_VP9_2,
            Profile::VP9(VP9::_3) => FF_PROFILE_VP9_3,
        }
    }
}
