use std::ffi::CStr;
use std::marker::PhantomData;
use std::slice;
use std::str::from_utf8_unchecked;

use super::Frame;
use ffi::AVFrameSideDataType::*;
use ffi::*;
use DictionaryRef;

#[derive(Eq, PartialEq, Copy, Clone, Debug)]
pub enum Type {
    PanScan,
    A53CC,
    Stereo3D,
    MatrixEncoding,
    DownMixInfo,
    ReplayGain,
    DisplayMatrix,
    AFD,
    MotionVectors,
    SkipSamples,
    AudioServiceType,
    MasteringDisplayMetadata,
    GOPTimecode,
    Spherical,

    ContentLightLevel,
    IccProfile,

    #[cfg(all(feature = "ffmpeg_4_0", not(feature = "ffmpeg_5_0")))]
    QPTableProperties,
    #[cfg(all(feature = "ffmpeg_4_0", not(feature = "ffmpeg_5_0")))]
    QPTableData,

    #[cfg(feature = "ffmpeg_4_1")]
    S12M_TIMECODE,

    #[cfg(feature = "ffmpeg_4_2")]
    DYNAMIC_HDR_PLUS,
    #[cfg(feature = "ffmpeg_4_2")]
    REGIONS_OF_INTEREST,

    #[cfg(feature = "ffmpeg_4_3")]
    VIDEO_ENC_PARAMS,

    #[cfg(feature = "ffmpeg_4_4")]
    SEI_UNREGISTERED,
    #[cfg(feature = "ffmpeg_4_4")]
    FILM_GRAIN_PARAMS,

    #[cfg(feature = "ffmpeg_5_0")]
    DETECTION_BBOXES,
    #[cfg(feature = "ffmpeg_5_0")]
    DOVI_RPU_BUFFER,
    #[cfg(feature = "ffmpeg_5_0")]
    DOVI_METADATA,

    #[cfg(feature = "ffmpeg_5_1")]
    DYNAMIC_HDR_VIVID,

    #[cfg(feature = "ffmpeg_6_0")]
    AMBIENT_VIEWING_ENVIRONMENT,

    #[cfg(feature = "ffmpeg_6_1")]
    VIDEO_HINT,

    #[cfg(feature = "ffmpeg_7_1")]
    LCEVC,
    #[cfg(feature = "ffmpeg_7_1")]
    VIEW_ID,
}

impl Type {
    #[inline]
    pub fn name(&self) -> &'static str {
        unsafe {
            from_utf8_unchecked(CStr::from_ptr(av_frame_side_data_name((*self).into())).to_bytes())
        }
    }
}

impl From<AVFrameSideDataType> for Type {
    #[inline(always)]
    fn from(value: AVFrameSideDataType) -> Self {
        match value {
            AV_FRAME_DATA_PANSCAN => Type::PanScan,
            AV_FRAME_DATA_A53_CC => Type::A53CC,
            AV_FRAME_DATA_STEREO3D => Type::Stereo3D,
            AV_FRAME_DATA_MATRIXENCODING => Type::MatrixEncoding,
            AV_FRAME_DATA_DOWNMIX_INFO => Type::DownMixInfo,
            AV_FRAME_DATA_REPLAYGAIN => Type::ReplayGain,
            AV_FRAME_DATA_DISPLAYMATRIX => Type::DisplayMatrix,
            AV_FRAME_DATA_AFD => Type::AFD,
            AV_FRAME_DATA_MOTION_VECTORS => Type::MotionVectors,
            AV_FRAME_DATA_SKIP_SAMPLES => Type::SkipSamples,
            AV_FRAME_DATA_AUDIO_SERVICE_TYPE => Type::AudioServiceType,
            AV_FRAME_DATA_MASTERING_DISPLAY_METADATA => Type::MasteringDisplayMetadata,
            AV_FRAME_DATA_GOP_TIMECODE => Type::GOPTimecode,
            AV_FRAME_DATA_SPHERICAL => Type::Spherical,

            AV_FRAME_DATA_CONTENT_LIGHT_LEVEL => Type::ContentLightLevel,
            AV_FRAME_DATA_ICC_PROFILE => Type::IccProfile,

            #[cfg(all(feature = "ffmpeg_4_0", not(feature = "ffmpeg_5_0")))]
            AV_FRAME_DATA_QP_TABLE_PROPERTIES => Type::QPTableProperties,
            #[cfg(all(feature = "ffmpeg_4_0", not(feature = "ffmpeg_5_0")))]
            AV_FRAME_DATA_QP_TABLE_DATA => Type::QPTableData,
            #[cfg(feature = "ffmpeg_4_1")]
            AV_FRAME_DATA_S12M_TIMECODE => Type::S12M_TIMECODE,

            #[cfg(feature = "ffmpeg_4_2")]
            AV_FRAME_DATA_DYNAMIC_HDR_PLUS => Type::DYNAMIC_HDR_PLUS,
            #[cfg(feature = "ffmpeg_4_2")]
            AV_FRAME_DATA_REGIONS_OF_INTEREST => Type::REGIONS_OF_INTEREST,

            #[cfg(feature = "ffmpeg_4_3")]
            AV_FRAME_DATA_VIDEO_ENC_PARAMS => Type::VIDEO_ENC_PARAMS,

            #[cfg(feature = "ffmpeg_4_4")]
            AV_FRAME_DATA_SEI_UNREGISTERED => Type::SEI_UNREGISTERED,
            #[cfg(feature = "ffmpeg_4_4")]
            AV_FRAME_DATA_FILM_GRAIN_PARAMS => Type::FILM_GRAIN_PARAMS,

            #[cfg(feature = "ffmpeg_5_0")]
            AV_FRAME_DATA_DETECTION_BBOXES => Type::DETECTION_BBOXES,
            #[cfg(feature = "ffmpeg_5_0")]
            AV_FRAME_DATA_DOVI_RPU_BUFFER => Type::DOVI_RPU_BUFFER,
            #[cfg(feature = "ffmpeg_5_0")]
            AV_FRAME_DATA_DOVI_METADATA => Type::DOVI_METADATA,

            #[cfg(feature = "ffmpeg_5_1")]
            AV_FRAME_DATA_DYNAMIC_HDR_VIVID => Type::DYNAMIC_HDR_VIVID,

            #[cfg(feature = "ffmpeg_6_0")]
            AV_FRAME_DATA_AMBIENT_VIEWING_ENVIRONMENT => Type::AMBIENT_VIEWING_ENVIRONMENT,

            #[cfg(feature = "ffmpeg_6_1")]
            AV_FRAME_DATA_VIDEO_HINT => Type::VIDEO_HINT,

            #[cfg(feature = "ffmpeg_7_1")]
            AV_FRAME_DATA_LCEVC => Type::LCEVC,
            #[cfg(feature = "ffmpeg_7_1")]
            AV_FRAME_DATA_VIEW_ID => Type::VIEW_ID,
        }
    }
}

impl From<Type> for AVFrameSideDataType {
    #[inline(always)]
    fn from(value: Type) -> AVFrameSideDataType {
        match value {
            Type::PanScan => AV_FRAME_DATA_PANSCAN,
            Type::A53CC => AV_FRAME_DATA_A53_CC,
            Type::Stereo3D => AV_FRAME_DATA_STEREO3D,
            Type::MatrixEncoding => AV_FRAME_DATA_MATRIXENCODING,
            Type::DownMixInfo => AV_FRAME_DATA_DOWNMIX_INFO,
            Type::ReplayGain => AV_FRAME_DATA_REPLAYGAIN,
            Type::DisplayMatrix => AV_FRAME_DATA_DISPLAYMATRIX,
            Type::AFD => AV_FRAME_DATA_AFD,
            Type::MotionVectors => AV_FRAME_DATA_MOTION_VECTORS,
            Type::SkipSamples => AV_FRAME_DATA_SKIP_SAMPLES,
            Type::AudioServiceType => AV_FRAME_DATA_AUDIO_SERVICE_TYPE,
            Type::MasteringDisplayMetadata => AV_FRAME_DATA_MASTERING_DISPLAY_METADATA,
            Type::GOPTimecode => AV_FRAME_DATA_GOP_TIMECODE,
            Type::Spherical => AV_FRAME_DATA_SPHERICAL,

            Type::ContentLightLevel => AV_FRAME_DATA_CONTENT_LIGHT_LEVEL,
            Type::IccProfile => AV_FRAME_DATA_ICC_PROFILE,

            #[cfg(all(feature = "ffmpeg_4_0", not(feature = "ffmpeg_5_0")))]
            Type::QPTableProperties => AV_FRAME_DATA_QP_TABLE_PROPERTIES,
            #[cfg(all(feature = "ffmpeg_4_0", not(feature = "ffmpeg_5_0")))]
            Type::QPTableData => AV_FRAME_DATA_QP_TABLE_DATA,
            #[cfg(feature = "ffmpeg_4_1")]
            Type::S12M_TIMECODE => AV_FRAME_DATA_S12M_TIMECODE,

            #[cfg(feature = "ffmpeg_4_2")]
            Type::DYNAMIC_HDR_PLUS => AV_FRAME_DATA_DYNAMIC_HDR_PLUS,
            #[cfg(feature = "ffmpeg_4_2")]
            Type::REGIONS_OF_INTEREST => AV_FRAME_DATA_REGIONS_OF_INTEREST,

            #[cfg(feature = "ffmpeg_4_3")]
            Type::VIDEO_ENC_PARAMS => AV_FRAME_DATA_VIDEO_ENC_PARAMS,

            #[cfg(feature = "ffmpeg_4_4")]
            Type::SEI_UNREGISTERED => AV_FRAME_DATA_SEI_UNREGISTERED,
            #[cfg(feature = "ffmpeg_4_4")]
            Type::FILM_GRAIN_PARAMS => AV_FRAME_DATA_FILM_GRAIN_PARAMS,

            #[cfg(feature = "ffmpeg_5_0")]
            Type::DETECTION_BBOXES => AV_FRAME_DATA_DETECTION_BBOXES,
            #[cfg(feature = "ffmpeg_5_0")]
            Type::DOVI_RPU_BUFFER => AV_FRAME_DATA_DOVI_RPU_BUFFER,
            #[cfg(feature = "ffmpeg_5_0")]
            Type::DOVI_METADATA => AV_FRAME_DATA_DOVI_METADATA,

            #[cfg(feature = "ffmpeg_5_1")]
            Type::DYNAMIC_HDR_VIVID => AV_FRAME_DATA_DYNAMIC_HDR_VIVID,

            #[cfg(feature = "ffmpeg_6_0")]
            Type::AMBIENT_VIEWING_ENVIRONMENT => AV_FRAME_DATA_AMBIENT_VIEWING_ENVIRONMENT,

            #[cfg(feature = "ffmpeg_6_1")]
            Type::VIDEO_HINT => AV_FRAME_DATA_VIDEO_HINT,

            #[cfg(feature = "ffmpeg_7_1")]
            Type::LCEVC => AV_FRAME_DATA_LCEVC,
            #[cfg(feature = "ffmpeg_7_1")]
            Type::VIEW_ID => AV_FRAME_DATA_VIEW_ID,
        }
    }
}

pub struct SideData<'a> {
    ptr: *mut AVFrameSideData,

    _marker: PhantomData<&'a Frame>,
}

impl<'a> SideData<'a> {
    #[inline(always)]
    pub unsafe fn wrap(ptr: *mut AVFrameSideData) -> Self {
        SideData {
            ptr,
            _marker: PhantomData,
        }
    }

    #[inline(always)]
    pub unsafe fn as_ptr(&self) -> *const AVFrameSideData {
        self.ptr as *const _
    }

    #[inline(always)]
    pub unsafe fn as_mut_ptr(&mut self) -> *mut AVFrameSideData {
        self.ptr
    }
}

impl<'a> SideData<'a> {
    #[inline]
    pub fn kind(&self) -> Type {
        unsafe { Type::from((*self.as_ptr()).type_) }
    }

    #[inline]
    pub fn data(&self) -> &[u8] {
        #[allow(clippy::unnecessary_cast)]
        unsafe {
            slice::from_raw_parts((*self.as_ptr()).data, (*self.as_ptr()).size as usize)
        }
    }

    #[inline]
    pub fn metadata(&self) -> DictionaryRef {
        unsafe { DictionaryRef::wrap((*self.as_ptr()).metadata) }
    }
}
