use std::marker::PhantomData;
use std::slice;

use super::Packet;
use ffi::AVPacketSideDataType::*;
use ffi::*;

#[derive(Eq, PartialEq, Copy, Clone, Debug)]
pub enum Type {
    Palette,
    NewExtraData,
    ParamChange,
    H263MbInfo,
    ReplayGain,
    DisplayMatrix,
    Stereo3d,
    AudioServiceType,
    QualityStats,
    FallbackTrack,
    CBPProperties,
    SkipSamples,
    JpDualMono,
    StringsMetadata,
    SubtitlePosition,
    MatroskaBlockAdditional,
    WebVTTIdentifier,
    WebVTTSettings,
    MetadataUpdate,
    MPEGTSStreamID,
    MasteringDisplayMetadata,
    DataSpherical,
    DataNb,

    ContentLightLevel,
    A53CC,

    #[cfg(feature = "ffmpeg_4_0")]
    EncryptionInitInfo,
    #[cfg(feature = "ffmpeg_4_0")]
    EncryptionInfo,

    #[cfg(feature = "ffmpeg_4_1")]
    AFD,

    #[cfg(feature = "ffmpeg_4_3")]
    PRFT,
    #[cfg(feature = "ffmpeg_4_3")]
    ICC_PROFILE,
    #[cfg(feature = "ffmpeg_4_3")]
    DOVI_CONF,

    #[cfg(feature = "ffmpeg_4_4")]
    S12M_TIMECODE,

    #[cfg(feature = "ffmpeg_5_0")]
    DYNAMIC_HDR10_PLUS,

    #[cfg(feature = "ffmpeg_7_0")]
    IAMF_MIX_GAIN_PARAM,
    #[cfg(feature = "ffmpeg_7_0")]
    IAMF_DEMIXING_INFO_PARAM,
    #[cfg(feature = "ffmpeg_7_0")]
    IAMF_RECON_GAIN_INFO_PARAM,
    #[cfg(feature = "ffmpeg_7_0")]
    AMBIENT_VIEWING_ENVIRONMENT,

    #[cfg(feature = "ffmpeg_7_1")]
    FRAME_CROPPING,
    #[cfg(feature = "ffmpeg_7_1")]
    LCEVC,
}

impl From<AVPacketSideDataType> for Type {
    fn from(value: AVPacketSideDataType) -> Self {
        match value {
            AV_PKT_DATA_PALETTE => Type::Palette,
            AV_PKT_DATA_NEW_EXTRADATA => Type::NewExtraData,
            AV_PKT_DATA_PARAM_CHANGE => Type::ParamChange,
            AV_PKT_DATA_H263_MB_INFO => Type::H263MbInfo,
            AV_PKT_DATA_REPLAYGAIN => Type::ReplayGain,
            AV_PKT_DATA_DISPLAYMATRIX => Type::DisplayMatrix,
            AV_PKT_DATA_STEREO3D => Type::Stereo3d,
            AV_PKT_DATA_AUDIO_SERVICE_TYPE => Type::AudioServiceType,
            AV_PKT_DATA_QUALITY_STATS => Type::QualityStats,
            AV_PKT_DATA_FALLBACK_TRACK => Type::FallbackTrack,
            AV_PKT_DATA_CPB_PROPERTIES => Type::CBPProperties,
            AV_PKT_DATA_SKIP_SAMPLES => Type::SkipSamples,
            AV_PKT_DATA_JP_DUALMONO => Type::JpDualMono,
            AV_PKT_DATA_STRINGS_METADATA => Type::StringsMetadata,
            AV_PKT_DATA_SUBTITLE_POSITION => Type::SubtitlePosition,
            AV_PKT_DATA_MATROSKA_BLOCKADDITIONAL => Type::MatroskaBlockAdditional,
            AV_PKT_DATA_WEBVTT_IDENTIFIER => Type::WebVTTIdentifier,
            AV_PKT_DATA_WEBVTT_SETTINGS => Type::WebVTTSettings,
            AV_PKT_DATA_METADATA_UPDATE => Type::MetadataUpdate,
            AV_PKT_DATA_MPEGTS_STREAM_ID => Type::MPEGTSStreamID,
            AV_PKT_DATA_MASTERING_DISPLAY_METADATA => Type::MasteringDisplayMetadata,
            AV_PKT_DATA_SPHERICAL => Type::DataSpherical,
            AV_PKT_DATA_NB => Type::DataNb,

            AV_PKT_DATA_CONTENT_LIGHT_LEVEL => Type::ContentLightLevel,
            AV_PKT_DATA_A53_CC => Type::A53CC,

            #[cfg(feature = "ffmpeg_4_0")]
            AV_PKT_DATA_ENCRYPTION_INIT_INFO => Type::EncryptionInitInfo,
            #[cfg(feature = "ffmpeg_4_0")]
            AV_PKT_DATA_ENCRYPTION_INFO => Type::EncryptionInfo,

            #[cfg(feature = "ffmpeg_4_1")]
            AV_PKT_DATA_AFD => Type::AFD,

            #[cfg(feature = "ffmpeg_4_3")]
            AV_PKT_DATA_PRFT => Type::PRFT,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_PKT_DATA_ICC_PROFILE => Type::ICC_PROFILE,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_PKT_DATA_DOVI_CONF => Type::DOVI_CONF,

            #[cfg(feature = "ffmpeg_4_4")]
            AV_PKT_DATA_S12M_TIMECODE => Type::S12M_TIMECODE,

            #[cfg(feature = "ffmpeg_5_0")]
            AV_PKT_DATA_DYNAMIC_HDR10_PLUS => Type::DYNAMIC_HDR10_PLUS,

            #[cfg(feature = "ffmpeg_7_0")]
            AV_PKT_DATA_IAMF_MIX_GAIN_PARAM => Type::IAMF_MIX_GAIN_PARAM,
            #[cfg(feature = "ffmpeg_7_0")]
            AV_PKT_DATA_IAMF_DEMIXING_INFO_PARAM => Type::IAMF_DEMIXING_INFO_PARAM,
            #[cfg(feature = "ffmpeg_7_0")]
            AV_PKT_DATA_IAMF_RECON_GAIN_INFO_PARAM => Type::IAMF_RECON_GAIN_INFO_PARAM,
            #[cfg(feature = "ffmpeg_7_0")]
            AV_PKT_DATA_AMBIENT_VIEWING_ENVIRONMENT => Type::AMBIENT_VIEWING_ENVIRONMENT,

            #[cfg(feature = "ffmpeg_7_1")]
            AV_PKT_DATA_FRAME_CROPPING => Type::FRAME_CROPPING,
            #[cfg(feature = "ffmpeg_7_1")]
            AV_PKT_DATA_LCEVC => Type::LCEVC,
        }
    }
}

impl From<Type> for AVPacketSideDataType {
    fn from(value: Type) -> AVPacketSideDataType {
        match value {
            Type::Palette => AV_PKT_DATA_PALETTE,
            Type::NewExtraData => AV_PKT_DATA_NEW_EXTRADATA,
            Type::ParamChange => AV_PKT_DATA_PARAM_CHANGE,
            Type::H263MbInfo => AV_PKT_DATA_H263_MB_INFO,
            Type::ReplayGain => AV_PKT_DATA_REPLAYGAIN,
            Type::DisplayMatrix => AV_PKT_DATA_DISPLAYMATRIX,
            Type::Stereo3d => AV_PKT_DATA_STEREO3D,
            Type::AudioServiceType => AV_PKT_DATA_AUDIO_SERVICE_TYPE,
            Type::QualityStats => AV_PKT_DATA_QUALITY_STATS,
            Type::FallbackTrack => AV_PKT_DATA_FALLBACK_TRACK,
            Type::CBPProperties => AV_PKT_DATA_CPB_PROPERTIES,
            Type::SkipSamples => AV_PKT_DATA_SKIP_SAMPLES,
            Type::JpDualMono => AV_PKT_DATA_JP_DUALMONO,
            Type::StringsMetadata => AV_PKT_DATA_STRINGS_METADATA,
            Type::SubtitlePosition => AV_PKT_DATA_SUBTITLE_POSITION,
            Type::MatroskaBlockAdditional => AV_PKT_DATA_MATROSKA_BLOCKADDITIONAL,
            Type::WebVTTIdentifier => AV_PKT_DATA_WEBVTT_IDENTIFIER,
            Type::WebVTTSettings => AV_PKT_DATA_WEBVTT_SETTINGS,
            Type::MetadataUpdate => AV_PKT_DATA_METADATA_UPDATE,
            Type::MPEGTSStreamID => AV_PKT_DATA_MPEGTS_STREAM_ID,
            Type::MasteringDisplayMetadata => AV_PKT_DATA_MASTERING_DISPLAY_METADATA,
            Type::DataSpherical => AV_PKT_DATA_SPHERICAL,
            Type::DataNb => AV_PKT_DATA_NB,

            Type::ContentLightLevel => AV_PKT_DATA_CONTENT_LIGHT_LEVEL,
            Type::A53CC => AV_PKT_DATA_A53_CC,

            #[cfg(feature = "ffmpeg_4_0")]
            Type::EncryptionInitInfo => AV_PKT_DATA_ENCRYPTION_INIT_INFO,
            #[cfg(feature = "ffmpeg_4_0")]
            Type::EncryptionInfo => AV_PKT_DATA_ENCRYPTION_INFO,

            #[cfg(feature = "ffmpeg_4_1")]
            Type::AFD => AV_PKT_DATA_AFD,

            #[cfg(feature = "ffmpeg_4_3")]
            Type::PRFT => AV_PKT_DATA_PRFT,
            #[cfg(feature = "ffmpeg_4_3")]
            Type::ICC_PROFILE => AV_PKT_DATA_ICC_PROFILE,
            #[cfg(feature = "ffmpeg_4_3")]
            Type::DOVI_CONF => AV_PKT_DATA_DOVI_CONF,

            #[cfg(feature = "ffmpeg_4_4")]
            Type::S12M_TIMECODE => AV_PKT_DATA_S12M_TIMECODE,

            #[cfg(feature = "ffmpeg_5_0")]
            Type::DYNAMIC_HDR10_PLUS => AV_PKT_DATA_DYNAMIC_HDR10_PLUS,

            #[cfg(feature = "ffmpeg_7_0")]
            Type::IAMF_MIX_GAIN_PARAM => AV_PKT_DATA_IAMF_MIX_GAIN_PARAM,
            #[cfg(feature = "ffmpeg_7_0")]
            Type::IAMF_DEMIXING_INFO_PARAM => AV_PKT_DATA_IAMF_DEMIXING_INFO_PARAM,
            #[cfg(feature = "ffmpeg_7_0")]
            Type::IAMF_RECON_GAIN_INFO_PARAM => AV_PKT_DATA_IAMF_RECON_GAIN_INFO_PARAM,
            #[cfg(feature = "ffmpeg_7_0")]
            Type::AMBIENT_VIEWING_ENVIRONMENT => AV_PKT_DATA_AMBIENT_VIEWING_ENVIRONMENT,

            #[cfg(feature = "ffmpeg_7_1")]
            Type::FRAME_CROPPING => AV_PKT_DATA_FRAME_CROPPING,
            #[cfg(feature = "ffmpeg_7_1")]
            Type::LCEVC => AV_PKT_DATA_LCEVC,
        }
    }
}

pub struct SideData<'a> {
    ptr: *mut AVPacketSideData,

    _marker: PhantomData<&'a Packet>,
}

impl<'a> SideData<'a> {
    pub unsafe fn wrap(ptr: *mut AVPacketSideData) -> Self {
        SideData {
            ptr,
            _marker: PhantomData,
        }
    }

    pub unsafe fn as_ptr(&self) -> *const AVPacketSideData {
        self.ptr as *const _
    }
}

impl<'a> SideData<'a> {
    pub fn kind(&self) -> Type {
        unsafe { Type::from((*self.as_ptr()).type_) }
    }

    pub fn data(&self) -> &[u8] {
        #[allow(clippy::unnecessary_cast)]
        unsafe {
            slice::from_raw_parts((*self.as_ptr()).data, (*self.as_ptr()).size as usize)
        }
    }
}
