use std::ffi::CStr;
use std::str::from_utf8_unchecked;

use ffi::AVCodecID::*;
use ffi::*;
use util::media;

#[allow(non_camel_case_types)]
#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum Id {
    None,

    // video codecs
    MPEG1VIDEO,
    MPEG2VIDEO,
    #[cfg(all(feature = "ff_api_xvmc", not(feature = "ffmpeg_5_0")))]
    MPEG2VIDEO_XVMC,
    H261,
    H263,
    RV10,
    RV20,
    MJPEG,
    MJPEGB,
    LJPEG,
    SP5X,
    JPEGLS,
    MPEG4,
    RAWVIDEO,
    MSMPEG4V1,
    MSMPEG4V2,
    MSMPEG4V3,
    WMV1,
    WMV2,
    H263P,
    H263I,
    FLV1,
    SVQ1,
    SVQ3,
    DVVIDEO,
    HUFFYUV,
    CYUV,
    H264,
    INDEO3,
    VP3,
    THEORA,
    ASV1,
    ASV2,
    FFV1,
    XM4,
    VCR1,
    CLJR,
    MDEC,
    ROQ,
    INTERPLAY_VIDEO,
    XAN_WC3,
    XAN_WC4,
    RPZA,
    CINEPAK,
    WS_VQA,
    MSRLE,
    MSVIDEO1,
    IDCIN,
    BPS8,
    SMC,
    FLIC,
    TRUEMOTION1,
    VMDVIDEO,
    MSZH,
    ZLIB,
    QTRLE,
    TSCC,
    ULTI,
    QDRAW,
    VIXL,
    QPEG,
    PNG,
    PPM,
    PBM,
    PGM,
    PGMYUV,
    PAM,
    FFVHUFF,
    RV30,
    RV40,
    VC1,
    WMV3,
    LOCO,
    WNV1,
    AASC,
    INDEO2,
    FRAPS,
    TRUEMOTION2,
    BMP,
    CSCD,
    MMVIDEO,
    ZMBV,
    AVS,
    SMACKVIDEO,
    NUV,
    KMVC,
    FLASHSV,
    CAVS,
    JPEG2000,
    VMNC,
    VP5,
    VP6,
    VP6F,
    TARGA,
    DSICINVIDEO,
    TIERTEXSEQVIDEO,
    TIFF,
    GIF,
    DXA,
    DNXHD,
    THP,
    SGI,
    C93,
    BETHSOFTVID,
    PTX,
    TXD,
    VP6A,
    AMV,
    VB,
    PCX,
    SUNRAST,
    INDEO4,
    INDEO5,
    MIMIC,
    RL2,
    ESCAPE124,
    DIRAC,
    BFI,
    CMV,
    MOTIONPIXELS,
    TGV,
    TGQ,
    TQI,
    AURA,
    AURA2,
    V210X,
    TMV,
    V210,
    DPX,
    MAD,
    FRWU,
    FLASHSV2,
    CDGRAPHICS,
    R210,
    ANM,
    BINKVIDEO,
    IFF_ILBM,
    IFF_BYTERUN1,
    KGV1,
    YOP,
    VP8,
    PICTOR,
    ANSI,
    A64_MULTI,
    A64_MULTI5,
    R10K,
    MXPEG,
    LAGARITH,
    PRORES,
    JV,
    DFA,
    WMV3IMAGE,
    VC1IMAGE,
    UTVIDEO,
    BMV_VIDEO,
    VBLE,
    DXTORY,
    V410,
    XWD,
    CDXL,
    XBM,
    ZEROCODEC,
    MSS1,
    MSA1,
    TSCC2,
    MTS2,
    CLLC,
    MSS2,
    VP9,
    AIC,
    ESCAPE130,
    G2M,
    WEBP,
    HNM4_VIDEO,
    HEVC,
    H265,
    FIC,
    ALIAS_PIX,
    BRENDER_PIX,
    PAF_VIDEO,
    EXR,
    VP7,
    SANM,
    SGIRLE,
    MVC1,
    MVC2,
    HQX,
    TDSC,
    HQ_HQA,
    HAP,
    DDS,
    DXV,
    SCREENPRESSO,
    RSCC,

    Y41P,
    AVRP,
    V012,
    AVUI,
    #[cfg(not(feature = "ffmpeg_7_0"))]
    AYUV,
    TARGA_Y216,
    V308,
    V408,
    YUV4,
    AVRN,
    CPIA,
    XFACE,
    SNOW,
    SMVJPEG,
    APNG,
    DAALA,
    CFHD,
    TRUEMOTION2RT,
    M101,
    MAGICYUV,
    SHEERVIDEO,
    YLC,

    // various PCM "codecs"
    PCM_S16LE,
    PCM_S16BE,
    PCM_U16LE,
    PCM_U16BE,
    PCM_S8,
    PCM_U8,
    PCM_MULAW,
    PCM_ALAW,
    PCM_S32LE,
    PCM_S32BE,
    PCM_U32LE,
    PCM_U32BE,
    PCM_S24LE,
    PCM_S24BE,
    PCM_U24LE,
    PCM_U24BE,
    PCM_S24DAUD,
    PCM_ZORK,
    PCM_S16LE_PLANAR,
    PCM_DVD,
    PCM_F32BE,
    PCM_F32LE,
    PCM_F64BE,
    PCM_F64LE,
    PCM_BLURAY,
    PCM_LXF,
    S302M,
    PCM_S8_PLANAR,
    PCM_S24LE_PLANAR,
    PCM_S32LE_PLANAR,
    PCM_S16BE_PLANAR,

    PCM_S64LE,
    PCM_S64BE,

    // various ADPCM codecs
    ADPCM_IMA_QT,
    ADPCM_IMA_WAV,
    ADPCM_IMA_DK3,
    ADPCM_IMA_DK4,
    ADPCM_IMA_WS,
    ADPCM_IMA_SMJPEG,
    ADPCM_MS,
    ADPCM_4XM,
    ADPCM_XA,
    ADPCM_ADX,
    ADPCM_EA,
    ADPCM_G726,
    ADPCM_CT,
    ADPCM_SWF,
    ADPCM_YAMAHA,
    ADPCM_SBPRO_4,
    ADPCM_SBPRO_3,
    ADPCM_SBPRO_2,
    ADPCM_THP,
    ADPCM_IMA_AMV,
    ADPCM_EA_R1,
    ADPCM_EA_R3,
    ADPCM_EA_R2,
    ADPCM_IMA_EA_SEAD,
    ADPCM_IMA_EA_EACS,
    ADPCM_EA_XAS,
    ADPCM_EA_MAXIS_XA,
    ADPCM_IMA_ISS,
    ADPCM_G722,
    ADPCM_IMA_APC,
    ADPCM_VIMA,

    ADPCM_AFC,
    ADPCM_IMA_OKI,
    ADPCM_DTK,
    ADPCM_IMA_RAD,
    ADPCM_G726LE,
    ADPCM_THP_LE,
    ADPCM_PSX,
    ADPCM_AICA,
    ADPCM_IMA_DAT4,
    ADPCM_MTAF,

    // AMR
    AMR_NB,
    AMR_WB,

    // RealAudio codecs
    RA_144,
    RA_288,

    // various DPCM codecs
    ROQ_DPCM,
    INTERPLAY_DPCM,
    XAN_DPCM,
    SOL_DPCM,

    SDX2_DPCM,

    // audio codecs
    MP2,
    MP3,
    AAC,
    AC3,
    DTS,
    VORBIS,
    DVAUDIO,
    WMAV1,
    WMAV2,
    MACE3,
    MACE6,
    VMDAUDIO,
    FLAC,
    MP3ADU,
    MP3ON4,
    SHORTEN,
    ALAC,
    WESTWOOD_SND1,
    GSM,
    QDM2,
    COOK,
    TRUESPEECH,
    TTA,
    SMACKAUDIO,
    QCELP,
    WAVPACK,
    DSICINAUDIO,
    IMC,
    MUSEPACK7,
    MLP,
    GSM_MS,
    ATRAC3,
    #[cfg(feature = "ff_api_voxware")]
    VOXWARE,
    APE,
    NELLYMOSER,
    MUSEPACK8,
    SPEEX,
    WMAVOICE,
    WMAPRO,
    WMALOSSLESS,
    ATRAC3P,
    EAC3,
    SIPR,
    MP1,
    TWINVQ,
    TRUEHD,
    MP4ALS,
    ATRAC1,
    BINKAUDIO_RDFT,
    BINKAUDIO_DCT,
    AAC_LATM,
    QDMC,
    CELT,
    G723_1,
    G729,
    SVX_EXP8,
    SVX_FIB8,
    BMV_AUDIO,
    RALF,
    IAC,
    ILBC,
    OPUS,
    COMFORT_NOISE,
    TAK,
    METASOUND,
    PAF_AUDIO,
    ON2AVC,
    DSS_SP,

    #[cfg(feature = "ffmpeg_4_0")]
    CODEC2,
    FFWAVESYNTH,
    SONIC,
    SONIC_LS,
    EVRC,
    SMV,
    DSD_LSBF,
    DSD_MSBF,
    DSD_LSBF_PLANAR,
    DSD_MSBF_PLANAR,
    _4GV,
    INTERPLAY_ACM,
    XMA1,
    XMA2,
    DST,

    // subtitle codecs
    DVD_SUBTITLE,
    DVB_SUBTITLE,
    TEXT,
    XSUB,
    SSA,
    MOV_TEXT,
    HDMV_PGS_SUBTITLE,
    DVB_TELETEXT,
    SRT,

    MICRODVD,
    EIA_608,
    JACOSUB,
    SAMI,
    REALTEXT,
    STL,
    SUBVIEWER1,
    SUBVIEWER,
    SUBRIP,
    WEBVTT,
    MPL2,
    VPLAYER,
    PJS,
    ASS,
    HDMV_TEXT_SUBTITLE,

    // other specific kind of codecs (generally used for attachments)
    TTF,

    SCTE_35,
    BINTEXT,
    XBIN,
    IDF,
    OTF,
    SMPTE_KLV,
    DVD_NAV,
    TIMED_ID3,
    BIN_DATA,

    PROBE,

    MPEG2TS,
    MPEG4SYSTEMS,
    FFMETADATA,
    WRAPPED_AVFRAME,

    PSD,
    PIXLET,
    SPEEDHQ,
    CLEARVIDEO,
    FMVC,
    SCPR,
    XPM,
    AV1,
    PCM_F16LE,
    PCM_F24LE,
    ATRAC3AL,
    ATRAC3PAL,

    BITPACKED,
    MSCC,
    SRGC,
    SVG,
    GDV,
    FITS,
    GREMLIN_DPCM,
    DOLBY_E,

    #[cfg(feature = "ffmpeg_4_0")]
    APTX,
    #[cfg(feature = "ffmpeg_4_0")]
    APTX_HD,
    #[cfg(feature = "ffmpeg_4_0")]
    SBC,

    #[cfg(feature = "ffmpeg_4_1")]
    AVS2,
    #[cfg(feature = "ffmpeg_4_1")]
    IMM4,
    #[cfg(feature = "ffmpeg_4_1")]
    PROSUMER,
    #[cfg(feature = "ffmpeg_4_1")]
    MWSC,
    #[cfg(feature = "ffmpeg_4_1")]
    WCMV,
    #[cfg(feature = "ffmpeg_4_1")]
    RASC,
    #[cfg(feature = "ffmpeg_4_1")]
    PCM_VIDC,
    #[cfg(feature = "ffmpeg_4_1")]
    ATRAC9,
    #[cfg(feature = "ffmpeg_4_1")]
    TTML,

    #[cfg(feature = "ffmpeg_4_2")]
    HYMT,
    #[cfg(feature = "ffmpeg_4_2")]
    ARBC,
    #[cfg(feature = "ffmpeg_4_2")]
    AGM,
    #[cfg(feature = "ffmpeg_4_2")]
    LSCR,
    #[cfg(feature = "ffmpeg_4_2")]
    VP4,
    #[cfg(feature = "ffmpeg_4_2")]
    ADPCM_AGM,
    #[cfg(feature = "ffmpeg_4_2")]
    HCOM,
    #[cfg(feature = "ffmpeg_4_2")]
    ARIB_CAPTION,

    #[cfg(feature = "ffmpeg_4_3")]
    IMM5,
    #[cfg(feature = "ffmpeg_4_3")]
    MVDV,
    #[cfg(feature = "ffmpeg_4_3")]
    MVHA,
    #[cfg(feature = "ffmpeg_4_3")]
    CDTOONS,
    #[cfg(feature = "ffmpeg_4_3")]
    MV30,
    #[cfg(feature = "ffmpeg_4_3")]
    NOTCHLC,
    #[cfg(feature = "ffmpeg_4_3")]
    PFM,
    #[cfg(feature = "ffmpeg_4_3")]
    ADPCM_ARGO,
    #[cfg(feature = "ffmpeg_4_3")]
    ADPCM_IMA_SSI,
    #[cfg(feature = "ffmpeg_4_3")]
    ADPCM_ZORK,
    #[cfg(feature = "ffmpeg_4_3")]
    ADPCM_IMA_APM,
    #[cfg(feature = "ffmpeg_4_3")]
    ADPCM_IMA_ALP,
    #[cfg(feature = "ffmpeg_4_3")]
    ADPCM_IMA_MTF,
    #[cfg(feature = "ffmpeg_4_3")]
    ADPCM_IMA_CUNNING,
    #[cfg(feature = "ffmpeg_4_3")]
    DERF_DPCM,
    #[cfg(feature = "ffmpeg_4_3")]
    ACELP_KELVIN,
    #[cfg(feature = "ffmpeg_4_3")]
    MPEGH_3D_AUDIO,
    #[cfg(feature = "ffmpeg_4_3")]
    SIREN,
    #[cfg(feature = "ffmpeg_4_3")]
    HCA,
    #[cfg(feature = "ffmpeg_4_3")]
    EPG,

    #[cfg(feature = "ffmpeg_4_4")]
    AVS3,
    #[cfg(feature = "ffmpeg_4_4")]
    PGX,
    #[cfg(feature = "ffmpeg_4_4")]
    MSP2,
    #[cfg(feature = "ffmpeg_4_4")]
    VVC,
    #[cfg(feature = "ffmpeg_4_4")]
    MOBICLIP,
    #[cfg(feature = "ffmpeg_4_4")]
    PHOTOCD,
    #[cfg(feature = "ffmpeg_4_4")]
    ARGO,
    #[cfg(feature = "ffmpeg_4_4")]
    CRI,
    #[cfg(feature = "ffmpeg_4_4")]
    IPU,
    #[cfg(feature = "ffmpeg_4_4")]
    SIMBIOSIS_IMX,
    #[cfg(feature = "ffmpeg_4_4")]
    SGA_VIDEO,
    #[cfg(feature = "ffmpeg_4_4")]
    PCM_SGA,
    #[cfg(feature = "ffmpeg_4_4")]
    ADPCM_IMA_MOFLEX,
    #[cfg(feature = "ffmpeg_4_4")]
    FASTAUDIO,

    #[cfg(feature = "ffmpeg_5_0")]
    GEM,
    #[cfg(feature = "ffmpeg_5_0")]
    ADPCM_IMA_ACORN,
    #[cfg(feature = "ffmpeg_5_0")]
    MSNSIREN,

    #[cfg(feature = "ffmpeg_5_1")]
    VBN,
    #[cfg(feature = "ffmpeg_5_1")]
    JPEGXL,
    #[cfg(feature = "ffmpeg_5_1")]
    QOI,
    #[cfg(feature = "ffmpeg_5_1")]
    PHM,
    #[cfg(feature = "ffmpeg_5_1")]
    DFPWM,

    #[cfg(feature = "ffmpeg_6_0")]
    RADIANCE_HDR,
    #[cfg(feature = "ffmpeg_6_0")]
    WBMP,
    #[cfg(feature = "ffmpeg_6_0")]
    MEDIA100,
    #[cfg(feature = "ffmpeg_6_0")]
    VQC,
    #[cfg(feature = "ffmpeg_6_0")]
    ADPCM_XMD,
    #[cfg(feature = "ffmpeg_6_0")]
    WADY_DPCM,
    #[cfg(feature = "ffmpeg_6_0")]
    CBD2_DPCM,
    #[cfg(feature = "ffmpeg_6_0")]
    BONK,
    #[cfg(feature = "ffmpeg_6_0")]
    MISC4,
    #[cfg(feature = "ffmpeg_6_0")]
    APAC,
    #[cfg(feature = "ffmpeg_6_0")]
    FTR,
    #[cfg(feature = "ffmpeg_6_0")]
    WAVARC,
    #[cfg(feature = "ffmpeg_6_0")]
    RKA,
    #[cfg(feature = "ffmpeg_6_0")]
    VNULL,
    #[cfg(feature = "ffmpeg_6_0")]
    ANULL,
    #[cfg(feature = "ffmpeg_6_1")]
    PDV,
    #[cfg(feature = "ffmpeg_6_1")]
    EVC,
    #[cfg(feature = "ffmpeg_6_1")]
    RTV1,
    #[cfg(feature = "ffmpeg_6_1")]
    VMIX,
    #[cfg(feature = "ffmpeg_6_1")]
    AC4,
    #[cfg(feature = "ffmpeg_6_1")]
    SMPTE_2038,
    #[cfg(feature = "ffmpeg_6_1")]
    OSQ,

    #[cfg(feature = "ffmpeg_7_0")]
    QOA,
    #[cfg(feature = "ffmpeg_7_0")]
    LEAD,

    #[cfg(feature = "ffmpeg_7_1")]
    LC3,
    #[cfg(feature = "ffmpeg_7_1")]
    LCEVC,
}

impl Id {
    #[cfg(feature = "ff_api_vima_decoder")]
    pub const VIMA: Id = Id::ADPCM_VIMA;

    pub fn medium(&self) -> media::Type {
        unsafe { media::Type::from(avcodec_get_type((*self).into())) }
    }

    pub fn name(&self) -> &'static str {
        unsafe { from_utf8_unchecked(CStr::from_ptr(avcodec_get_name((*self).into())).to_bytes()) }
    }
}

impl From<AVCodecID> for Id {
    fn from(value: AVCodecID) -> Self {
        match value {
            AV_CODEC_ID_NONE => Id::None,

            /* video codecs */
            AV_CODEC_ID_MPEG1VIDEO => Id::MPEG1VIDEO,
            AV_CODEC_ID_MPEG2VIDEO => Id::MPEG2VIDEO,
            #[cfg(all(feature = "ff_api_xvmc", not(feature = "ffmpeg_5_0")))]
            AV_CODEC_ID_MPEG2VIDEO_XVMC => Id::MPEG2VIDEO_XVMC,
            AV_CODEC_ID_H261 => Id::H261,
            AV_CODEC_ID_H263 => Id::H263,
            AV_CODEC_ID_RV10 => Id::RV10,
            AV_CODEC_ID_RV20 => Id::RV20,
            AV_CODEC_ID_MJPEG => Id::MJPEG,
            AV_CODEC_ID_MJPEGB => Id::MJPEGB,
            AV_CODEC_ID_LJPEG => Id::LJPEG,
            AV_CODEC_ID_SP5X => Id::SP5X,
            AV_CODEC_ID_JPEGLS => Id::JPEGLS,
            AV_CODEC_ID_MPEG4 => Id::MPEG4,
            AV_CODEC_ID_RAWVIDEO => Id::RAWVIDEO,
            AV_CODEC_ID_MSMPEG4V1 => Id::MSMPEG4V1,
            AV_CODEC_ID_MSMPEG4V2 => Id::MSMPEG4V2,
            AV_CODEC_ID_MSMPEG4V3 => Id::MSMPEG4V3,
            AV_CODEC_ID_WMV1 => Id::WMV1,
            AV_CODEC_ID_WMV2 => Id::WMV2,
            AV_CODEC_ID_H263P => Id::H263P,
            AV_CODEC_ID_H263I => Id::H263I,
            AV_CODEC_ID_FLV1 => Id::FLV1,
            AV_CODEC_ID_SVQ1 => Id::SVQ1,
            AV_CODEC_ID_SVQ3 => Id::SVQ3,
            AV_CODEC_ID_DVVIDEO => Id::DVVIDEO,
            AV_CODEC_ID_HUFFYUV => Id::HUFFYUV,
            AV_CODEC_ID_CYUV => Id::CYUV,
            AV_CODEC_ID_H264 => Id::H264,
            AV_CODEC_ID_INDEO3 => Id::INDEO3,
            AV_CODEC_ID_VP3 => Id::VP3,
            AV_CODEC_ID_THEORA => Id::THEORA,
            AV_CODEC_ID_ASV1 => Id::ASV1,
            AV_CODEC_ID_ASV2 => Id::ASV2,
            AV_CODEC_ID_FFV1 => Id::FFV1,
            AV_CODEC_ID_4XM => Id::XM4,
            AV_CODEC_ID_VCR1 => Id::VCR1,
            AV_CODEC_ID_CLJR => Id::CLJR,
            AV_CODEC_ID_MDEC => Id::MDEC,
            AV_CODEC_ID_ROQ => Id::ROQ,
            AV_CODEC_ID_INTERPLAY_VIDEO => Id::INTERPLAY_VIDEO,
            AV_CODEC_ID_XAN_WC3 => Id::XAN_WC3,
            AV_CODEC_ID_XAN_WC4 => Id::XAN_WC4,
            AV_CODEC_ID_RPZA => Id::RPZA,
            AV_CODEC_ID_CINEPAK => Id::CINEPAK,
            AV_CODEC_ID_WS_VQA => Id::WS_VQA,
            AV_CODEC_ID_MSRLE => Id::MSRLE,
            AV_CODEC_ID_MSVIDEO1 => Id::MSVIDEO1,
            AV_CODEC_ID_IDCIN => Id::IDCIN,
            AV_CODEC_ID_8BPS => Id::BPS8,
            AV_CODEC_ID_SMC => Id::SMC,
            AV_CODEC_ID_FLIC => Id::FLIC,
            AV_CODEC_ID_TRUEMOTION1 => Id::TRUEMOTION1,
            AV_CODEC_ID_VMDVIDEO => Id::VMDVIDEO,
            AV_CODEC_ID_MSZH => Id::MSZH,
            AV_CODEC_ID_ZLIB => Id::ZLIB,
            AV_CODEC_ID_QTRLE => Id::QTRLE,
            AV_CODEC_ID_TSCC => Id::TSCC,
            AV_CODEC_ID_ULTI => Id::ULTI,
            AV_CODEC_ID_QDRAW => Id::QDRAW,
            AV_CODEC_ID_VIXL => Id::VIXL,
            AV_CODEC_ID_QPEG => Id::QPEG,
            AV_CODEC_ID_PNG => Id::PNG,
            AV_CODEC_ID_PPM => Id::PPM,
            AV_CODEC_ID_PBM => Id::PBM,
            AV_CODEC_ID_PGM => Id::PGM,
            AV_CODEC_ID_PGMYUV => Id::PGMYUV,
            AV_CODEC_ID_PAM => Id::PAM,
            AV_CODEC_ID_FFVHUFF => Id::FFVHUFF,
            AV_CODEC_ID_RV30 => Id::RV30,
            AV_CODEC_ID_RV40 => Id::RV40,
            AV_CODEC_ID_VC1 => Id::VC1,
            AV_CODEC_ID_WMV3 => Id::WMV3,
            AV_CODEC_ID_LOCO => Id::LOCO,
            AV_CODEC_ID_WNV1 => Id::WNV1,
            AV_CODEC_ID_AASC => Id::AASC,
            AV_CODEC_ID_INDEO2 => Id::INDEO2,
            AV_CODEC_ID_FRAPS => Id::FRAPS,
            AV_CODEC_ID_TRUEMOTION2 => Id::TRUEMOTION2,
            AV_CODEC_ID_BMP => Id::BMP,
            AV_CODEC_ID_CSCD => Id::CSCD,
            AV_CODEC_ID_MMVIDEO => Id::MMVIDEO,
            AV_CODEC_ID_ZMBV => Id::ZMBV,
            AV_CODEC_ID_AVS => Id::AVS,
            AV_CODEC_ID_SMACKVIDEO => Id::SMACKVIDEO,
            AV_CODEC_ID_NUV => Id::NUV,
            AV_CODEC_ID_KMVC => Id::KMVC,
            AV_CODEC_ID_FLASHSV => Id::FLASHSV,
            AV_CODEC_ID_CAVS => Id::CAVS,
            AV_CODEC_ID_JPEG2000 => Id::JPEG2000,
            AV_CODEC_ID_VMNC => Id::VMNC,
            AV_CODEC_ID_VP5 => Id::VP5,
            AV_CODEC_ID_VP6 => Id::VP6,
            AV_CODEC_ID_VP6F => Id::VP6F,
            AV_CODEC_ID_TARGA => Id::TARGA,
            AV_CODEC_ID_DSICINVIDEO => Id::DSICINVIDEO,
            AV_CODEC_ID_TIERTEXSEQVIDEO => Id::TIERTEXSEQVIDEO,
            AV_CODEC_ID_TIFF => Id::TIFF,
            AV_CODEC_ID_GIF => Id::GIF,
            AV_CODEC_ID_DXA => Id::DXA,
            AV_CODEC_ID_DNXHD => Id::DNXHD,
            AV_CODEC_ID_THP => Id::THP,
            AV_CODEC_ID_SGI => Id::SGI,
            AV_CODEC_ID_C93 => Id::C93,
            AV_CODEC_ID_BETHSOFTVID => Id::BETHSOFTVID,
            AV_CODEC_ID_PTX => Id::PTX,
            AV_CODEC_ID_TXD => Id::TXD,
            AV_CODEC_ID_VP6A => Id::VP6A,
            AV_CODEC_ID_AMV => Id::AMV,
            AV_CODEC_ID_VB => Id::VB,
            AV_CODEC_ID_PCX => Id::PCX,
            AV_CODEC_ID_SUNRAST => Id::SUNRAST,
            AV_CODEC_ID_INDEO4 => Id::INDEO4,
            AV_CODEC_ID_INDEO5 => Id::INDEO5,
            AV_CODEC_ID_MIMIC => Id::MIMIC,
            AV_CODEC_ID_RL2 => Id::RL2,
            AV_CODEC_ID_ESCAPE124 => Id::ESCAPE124,
            AV_CODEC_ID_DIRAC => Id::DIRAC,
            AV_CODEC_ID_BFI => Id::BFI,
            AV_CODEC_ID_CMV => Id::CMV,
            AV_CODEC_ID_MOTIONPIXELS => Id::MOTIONPIXELS,
            AV_CODEC_ID_TGV => Id::TGV,
            AV_CODEC_ID_TGQ => Id::TGQ,
            AV_CODEC_ID_TQI => Id::TQI,
            AV_CODEC_ID_AURA => Id::AURA,
            AV_CODEC_ID_AURA2 => Id::AURA2,
            AV_CODEC_ID_V210X => Id::V210X,
            AV_CODEC_ID_TMV => Id::TMV,
            AV_CODEC_ID_V210 => Id::V210,
            AV_CODEC_ID_DPX => Id::DPX,
            AV_CODEC_ID_MAD => Id::MAD,
            AV_CODEC_ID_FRWU => Id::FRWU,
            AV_CODEC_ID_FLASHSV2 => Id::FLASHSV2,
            AV_CODEC_ID_CDGRAPHICS => Id::CDGRAPHICS,
            AV_CODEC_ID_R210 => Id::R210,
            AV_CODEC_ID_ANM => Id::ANM,
            AV_CODEC_ID_BINKVIDEO => Id::BINKVIDEO,
            AV_CODEC_ID_IFF_ILBM => Id::IFF_ILBM,
            AV_CODEC_ID_KGV1 => Id::KGV1,
            AV_CODEC_ID_YOP => Id::YOP,
            AV_CODEC_ID_VP8 => Id::VP8,
            AV_CODEC_ID_PICTOR => Id::PICTOR,
            AV_CODEC_ID_ANSI => Id::ANSI,
            AV_CODEC_ID_A64_MULTI => Id::A64_MULTI,
            AV_CODEC_ID_A64_MULTI5 => Id::A64_MULTI5,
            AV_CODEC_ID_R10K => Id::R10K,
            AV_CODEC_ID_MXPEG => Id::MXPEG,
            AV_CODEC_ID_LAGARITH => Id::LAGARITH,
            AV_CODEC_ID_PRORES => Id::PRORES,
            AV_CODEC_ID_JV => Id::JV,
            AV_CODEC_ID_DFA => Id::DFA,
            AV_CODEC_ID_WMV3IMAGE => Id::WMV3IMAGE,
            AV_CODEC_ID_VC1IMAGE => Id::VC1IMAGE,
            AV_CODEC_ID_UTVIDEO => Id::UTVIDEO,
            AV_CODEC_ID_BMV_VIDEO => Id::BMV_VIDEO,
            AV_CODEC_ID_VBLE => Id::VBLE,
            AV_CODEC_ID_DXTORY => Id::DXTORY,
            AV_CODEC_ID_V410 => Id::V410,
            AV_CODEC_ID_XWD => Id::XWD,
            AV_CODEC_ID_CDXL => Id::CDXL,
            AV_CODEC_ID_XBM => Id::XBM,
            AV_CODEC_ID_ZEROCODEC => Id::ZEROCODEC,
            AV_CODEC_ID_MSS1 => Id::MSS1,
            AV_CODEC_ID_MSA1 => Id::MSA1,
            AV_CODEC_ID_TSCC2 => Id::TSCC2,
            AV_CODEC_ID_MTS2 => Id::MTS2,
            AV_CODEC_ID_CLLC => Id::CLLC,
            AV_CODEC_ID_MSS2 => Id::MSS2,
            AV_CODEC_ID_VP9 => Id::VP9,
            AV_CODEC_ID_AIC => Id::AIC,
            AV_CODEC_ID_ESCAPE130 => Id::ESCAPE130,
            AV_CODEC_ID_G2M => Id::G2M,
            AV_CODEC_ID_WEBP => Id::WEBP,
            AV_CODEC_ID_HNM4_VIDEO => Id::HNM4_VIDEO,
            AV_CODEC_ID_HEVC => Id::HEVC,
            AV_CODEC_ID_FIC => Id::FIC,
            AV_CODEC_ID_ALIAS_PIX => Id::ALIAS_PIX,
            AV_CODEC_ID_BRENDER_PIX => Id::BRENDER_PIX,
            AV_CODEC_ID_PAF_VIDEO => Id::PAF_VIDEO,
            AV_CODEC_ID_EXR => Id::EXR,
            AV_CODEC_ID_VP7 => Id::VP7,
            AV_CODEC_ID_SANM => Id::SANM,
            AV_CODEC_ID_SGIRLE => Id::SGIRLE,
            AV_CODEC_ID_MVC1 => Id::MVC1,
            AV_CODEC_ID_MVC2 => Id::MVC2,
            AV_CODEC_ID_HQX => Id::HQX,
            AV_CODEC_ID_TDSC => Id::TDSC,
            AV_CODEC_ID_HQ_HQA => Id::HQ_HQA,
            AV_CODEC_ID_HAP => Id::HAP,
            AV_CODEC_ID_DDS => Id::DDS,
            AV_CODEC_ID_DXV => Id::DXV,
            AV_CODEC_ID_SCREENPRESSO => Id::SCREENPRESSO,
            AV_CODEC_ID_RSCC => Id::RSCC,

            AV_CODEC_ID_Y41P => Id::Y41P,
            AV_CODEC_ID_AVRP => Id::AVRP,
            AV_CODEC_ID_012V => Id::V012,
            AV_CODEC_ID_AVUI => Id::AVUI,
            #[cfg(not(feature = "ffmpeg_7_0"))]
            AV_CODEC_ID_AYUV => Id::AYUV,
            AV_CODEC_ID_TARGA_Y216 => Id::TARGA_Y216,
            AV_CODEC_ID_V308 => Id::V308,
            AV_CODEC_ID_V408 => Id::V408,
            AV_CODEC_ID_YUV4 => Id::YUV4,
            AV_CODEC_ID_AVRN => Id::AVRN,
            AV_CODEC_ID_CPIA => Id::CPIA,
            AV_CODEC_ID_XFACE => Id::XFACE,
            AV_CODEC_ID_SNOW => Id::SNOW,
            AV_CODEC_ID_SMVJPEG => Id::SMVJPEG,
            AV_CODEC_ID_APNG => Id::APNG,
            AV_CODEC_ID_DAALA => Id::DAALA,
            AV_CODEC_ID_CFHD => Id::CFHD,
            AV_CODEC_ID_TRUEMOTION2RT => Id::TRUEMOTION2RT,
            AV_CODEC_ID_M101 => Id::M101,
            AV_CODEC_ID_MAGICYUV => Id::MAGICYUV,
            AV_CODEC_ID_SHEERVIDEO => Id::SHEERVIDEO,
            AV_CODEC_ID_YLC => Id::YLC,

            /* various PCM "codecs" */
            AV_CODEC_ID_PCM_S16LE => Id::PCM_S16LE,
            AV_CODEC_ID_PCM_S16BE => Id::PCM_S16BE,
            AV_CODEC_ID_PCM_U16LE => Id::PCM_U16LE,
            AV_CODEC_ID_PCM_U16BE => Id::PCM_U16BE,
            AV_CODEC_ID_PCM_S8 => Id::PCM_S8,
            AV_CODEC_ID_PCM_U8 => Id::PCM_U8,
            AV_CODEC_ID_PCM_MULAW => Id::PCM_MULAW,
            AV_CODEC_ID_PCM_ALAW => Id::PCM_ALAW,
            AV_CODEC_ID_PCM_S32LE => Id::PCM_S32LE,
            AV_CODEC_ID_PCM_S32BE => Id::PCM_S32BE,
            AV_CODEC_ID_PCM_U32LE => Id::PCM_U32LE,
            AV_CODEC_ID_PCM_U32BE => Id::PCM_U32BE,
            AV_CODEC_ID_PCM_S24LE => Id::PCM_S24LE,
            AV_CODEC_ID_PCM_S24BE => Id::PCM_S24BE,
            AV_CODEC_ID_PCM_U24LE => Id::PCM_U24LE,
            AV_CODEC_ID_PCM_U24BE => Id::PCM_U24BE,
            AV_CODEC_ID_PCM_S24DAUD => Id::PCM_S24DAUD,
            AV_CODEC_ID_PCM_ZORK => Id::PCM_ZORK,
            AV_CODEC_ID_PCM_S16LE_PLANAR => Id::PCM_S16LE_PLANAR,
            AV_CODEC_ID_PCM_DVD => Id::PCM_DVD,
            AV_CODEC_ID_PCM_F32BE => Id::PCM_F32BE,
            AV_CODEC_ID_PCM_F32LE => Id::PCM_F32LE,
            AV_CODEC_ID_PCM_F64BE => Id::PCM_F64BE,
            AV_CODEC_ID_PCM_F64LE => Id::PCM_F64LE,
            AV_CODEC_ID_PCM_BLURAY => Id::PCM_BLURAY,
            AV_CODEC_ID_PCM_LXF => Id::PCM_LXF,
            AV_CODEC_ID_S302M => Id::S302M,
            AV_CODEC_ID_PCM_S8_PLANAR => Id::PCM_S8_PLANAR,
            AV_CODEC_ID_PCM_S24LE_PLANAR => Id::PCM_S24LE_PLANAR,
            AV_CODEC_ID_PCM_S32LE_PLANAR => Id::PCM_S32LE_PLANAR,
            AV_CODEC_ID_PCM_S16BE_PLANAR => Id::PCM_S16BE_PLANAR,

            AV_CODEC_ID_PCM_S64LE => Id::PCM_S64LE,
            AV_CODEC_ID_PCM_S64BE => Id::PCM_S64BE,

            /* various ADPCM codecs */
            AV_CODEC_ID_ADPCM_IMA_QT => Id::ADPCM_IMA_QT,
            AV_CODEC_ID_ADPCM_IMA_WAV => Id::ADPCM_IMA_WAV,
            AV_CODEC_ID_ADPCM_IMA_DK3 => Id::ADPCM_IMA_DK3,
            AV_CODEC_ID_ADPCM_IMA_DK4 => Id::ADPCM_IMA_DK4,
            AV_CODEC_ID_ADPCM_IMA_WS => Id::ADPCM_IMA_WS,
            AV_CODEC_ID_ADPCM_IMA_SMJPEG => Id::ADPCM_IMA_SMJPEG,
            AV_CODEC_ID_ADPCM_MS => Id::ADPCM_MS,
            AV_CODEC_ID_ADPCM_4XM => Id::ADPCM_4XM,
            AV_CODEC_ID_ADPCM_XA => Id::ADPCM_XA,
            AV_CODEC_ID_ADPCM_ADX => Id::ADPCM_ADX,
            AV_CODEC_ID_ADPCM_EA => Id::ADPCM_EA,
            AV_CODEC_ID_ADPCM_G726 => Id::ADPCM_G726,
            AV_CODEC_ID_ADPCM_CT => Id::ADPCM_CT,
            AV_CODEC_ID_ADPCM_SWF => Id::ADPCM_SWF,
            AV_CODEC_ID_ADPCM_YAMAHA => Id::ADPCM_YAMAHA,
            AV_CODEC_ID_ADPCM_SBPRO_4 => Id::ADPCM_SBPRO_4,
            AV_CODEC_ID_ADPCM_SBPRO_3 => Id::ADPCM_SBPRO_3,
            AV_CODEC_ID_ADPCM_SBPRO_2 => Id::ADPCM_SBPRO_2,
            AV_CODEC_ID_ADPCM_THP => Id::ADPCM_THP,
            AV_CODEC_ID_ADPCM_IMA_AMV => Id::ADPCM_IMA_AMV,
            AV_CODEC_ID_ADPCM_EA_R1 => Id::ADPCM_EA_R1,
            AV_CODEC_ID_ADPCM_EA_R3 => Id::ADPCM_EA_R3,
            AV_CODEC_ID_ADPCM_EA_R2 => Id::ADPCM_EA_R2,
            AV_CODEC_ID_ADPCM_IMA_EA_SEAD => Id::ADPCM_IMA_EA_SEAD,
            AV_CODEC_ID_ADPCM_IMA_EA_EACS => Id::ADPCM_IMA_EA_EACS,
            AV_CODEC_ID_ADPCM_EA_XAS => Id::ADPCM_EA_XAS,
            AV_CODEC_ID_ADPCM_EA_MAXIS_XA => Id::ADPCM_EA_MAXIS_XA,
            AV_CODEC_ID_ADPCM_IMA_ISS => Id::ADPCM_IMA_ISS,
            AV_CODEC_ID_ADPCM_G722 => Id::ADPCM_G722,
            AV_CODEC_ID_ADPCM_IMA_APC => Id::ADPCM_IMA_APC,
            AV_CODEC_ID_ADPCM_VIMA => Id::ADPCM_VIMA,

            AV_CODEC_ID_ADPCM_AFC => Id::ADPCM_AFC,
            AV_CODEC_ID_ADPCM_IMA_OKI => Id::ADPCM_IMA_OKI,
            AV_CODEC_ID_ADPCM_DTK => Id::ADPCM_DTK,
            AV_CODEC_ID_ADPCM_IMA_RAD => Id::ADPCM_IMA_RAD,
            AV_CODEC_ID_ADPCM_G726LE => Id::ADPCM_G726LE,
            AV_CODEC_ID_ADPCM_THP_LE => Id::ADPCM_THP_LE,
            AV_CODEC_ID_ADPCM_PSX => Id::ADPCM_PSX,
            AV_CODEC_ID_ADPCM_AICA => Id::ADPCM_AICA,
            AV_CODEC_ID_ADPCM_IMA_DAT4 => Id::ADPCM_IMA_DAT4,
            AV_CODEC_ID_ADPCM_MTAF => Id::ADPCM_MTAF,

            /* AMR */
            AV_CODEC_ID_AMR_NB => Id::AMR_NB,
            AV_CODEC_ID_AMR_WB => Id::AMR_WB,

            /* RealAudio codecs*/
            AV_CODEC_ID_RA_144 => Id::RA_144,
            AV_CODEC_ID_RA_288 => Id::RA_288,

            /* various DPCM codecs */
            AV_CODEC_ID_ROQ_DPCM => Id::ROQ_DPCM,
            AV_CODEC_ID_INTERPLAY_DPCM => Id::INTERPLAY_DPCM,
            AV_CODEC_ID_XAN_DPCM => Id::XAN_DPCM,
            AV_CODEC_ID_SOL_DPCM => Id::SOL_DPCM,

            AV_CODEC_ID_SDX2_DPCM => Id::SDX2_DPCM,

            /* audio codecs */
            AV_CODEC_ID_MP2 => Id::MP2,
            AV_CODEC_ID_MP3 => Id::MP3,
            AV_CODEC_ID_AAC => Id::AAC,
            AV_CODEC_ID_AC3 => Id::AC3,
            AV_CODEC_ID_DTS => Id::DTS,
            AV_CODEC_ID_VORBIS => Id::VORBIS,
            AV_CODEC_ID_DVAUDIO => Id::DVAUDIO,
            AV_CODEC_ID_WMAV1 => Id::WMAV1,
            AV_CODEC_ID_WMAV2 => Id::WMAV2,
            AV_CODEC_ID_MACE3 => Id::MACE3,
            AV_CODEC_ID_MACE6 => Id::MACE6,
            AV_CODEC_ID_VMDAUDIO => Id::VMDAUDIO,
            AV_CODEC_ID_FLAC => Id::FLAC,
            AV_CODEC_ID_MP3ADU => Id::MP3ADU,
            AV_CODEC_ID_MP3ON4 => Id::MP3ON4,
            AV_CODEC_ID_SHORTEN => Id::SHORTEN,
            AV_CODEC_ID_ALAC => Id::ALAC,
            AV_CODEC_ID_WESTWOOD_SND1 => Id::WESTWOOD_SND1,
            AV_CODEC_ID_GSM => Id::GSM,
            AV_CODEC_ID_QDM2 => Id::QDM2,
            AV_CODEC_ID_COOK => Id::COOK,
            AV_CODEC_ID_TRUESPEECH => Id::TRUESPEECH,
            AV_CODEC_ID_TTA => Id::TTA,
            AV_CODEC_ID_SMACKAUDIO => Id::SMACKAUDIO,
            AV_CODEC_ID_QCELP => Id::QCELP,
            AV_CODEC_ID_WAVPACK => Id::WAVPACK,
            AV_CODEC_ID_DSICINAUDIO => Id::DSICINAUDIO,
            AV_CODEC_ID_IMC => Id::IMC,
            AV_CODEC_ID_MUSEPACK7 => Id::MUSEPACK7,
            AV_CODEC_ID_MLP => Id::MLP,
            AV_CODEC_ID_GSM_MS => Id::GSM_MS,
            AV_CODEC_ID_ATRAC3 => Id::ATRAC3,
            #[cfg(feature = "ff_api_voxware")]
            AV_CODEC_ID_VOXWARE => Id::VOXWARE,
            AV_CODEC_ID_APE => Id::APE,
            AV_CODEC_ID_NELLYMOSER => Id::NELLYMOSER,
            AV_CODEC_ID_MUSEPACK8 => Id::MUSEPACK8,
            AV_CODEC_ID_SPEEX => Id::SPEEX,
            AV_CODEC_ID_WMAVOICE => Id::WMAVOICE,
            AV_CODEC_ID_WMAPRO => Id::WMAPRO,
            AV_CODEC_ID_WMALOSSLESS => Id::WMALOSSLESS,
            AV_CODEC_ID_ATRAC3P => Id::ATRAC3P,
            AV_CODEC_ID_EAC3 => Id::EAC3,
            AV_CODEC_ID_SIPR => Id::SIPR,
            AV_CODEC_ID_MP1 => Id::MP1,
            AV_CODEC_ID_TWINVQ => Id::TWINVQ,
            AV_CODEC_ID_TRUEHD => Id::TRUEHD,
            AV_CODEC_ID_MP4ALS => Id::MP4ALS,
            AV_CODEC_ID_ATRAC1 => Id::ATRAC1,
            AV_CODEC_ID_BINKAUDIO_RDFT => Id::BINKAUDIO_RDFT,
            AV_CODEC_ID_BINKAUDIO_DCT => Id::BINKAUDIO_DCT,
            AV_CODEC_ID_AAC_LATM => Id::AAC_LATM,
            AV_CODEC_ID_QDMC => Id::QDMC,
            AV_CODEC_ID_CELT => Id::CELT,
            AV_CODEC_ID_G723_1 => Id::G723_1,
            AV_CODEC_ID_G729 => Id::G729,
            AV_CODEC_ID_8SVX_EXP => Id::SVX_EXP8,
            AV_CODEC_ID_8SVX_FIB => Id::SVX_FIB8,
            AV_CODEC_ID_BMV_AUDIO => Id::BMV_AUDIO,
            AV_CODEC_ID_RALF => Id::RALF,
            AV_CODEC_ID_IAC => Id::IAC,
            AV_CODEC_ID_ILBC => Id::ILBC,
            AV_CODEC_ID_OPUS => Id::OPUS,
            AV_CODEC_ID_COMFORT_NOISE => Id::COMFORT_NOISE,
            AV_CODEC_ID_TAK => Id::TAK,
            AV_CODEC_ID_METASOUND => Id::METASOUND,
            AV_CODEC_ID_PAF_AUDIO => Id::PAF_AUDIO,
            AV_CODEC_ID_ON2AVC => Id::ON2AVC,
            AV_CODEC_ID_DSS_SP => Id::DSS_SP,

            #[cfg(feature = "ffmpeg_4_0")]
            AV_CODEC_ID_CODEC2 => Id::CODEC2,
            AV_CODEC_ID_FFWAVESYNTH => Id::FFWAVESYNTH,
            AV_CODEC_ID_SONIC => Id::SONIC,
            AV_CODEC_ID_SONIC_LS => Id::SONIC_LS,
            AV_CODEC_ID_EVRC => Id::EVRC,
            AV_CODEC_ID_SMV => Id::SMV,
            AV_CODEC_ID_DSD_LSBF => Id::DSD_LSBF,
            AV_CODEC_ID_DSD_MSBF => Id::DSD_MSBF,
            AV_CODEC_ID_DSD_LSBF_PLANAR => Id::DSD_LSBF_PLANAR,
            AV_CODEC_ID_DSD_MSBF_PLANAR => Id::DSD_MSBF_PLANAR,
            AV_CODEC_ID_4GV => Id::_4GV,
            AV_CODEC_ID_INTERPLAY_ACM => Id::INTERPLAY_ACM,
            AV_CODEC_ID_XMA1 => Id::XMA1,
            AV_CODEC_ID_XMA2 => Id::XMA2,
            AV_CODEC_ID_DST => Id::DST,

            /* subtitle codecs */
            AV_CODEC_ID_DVD_SUBTITLE => Id::DVD_SUBTITLE,
            AV_CODEC_ID_DVB_SUBTITLE => Id::DVB_SUBTITLE,
            AV_CODEC_ID_TEXT => Id::TEXT,
            AV_CODEC_ID_XSUB => Id::XSUB,
            AV_CODEC_ID_SSA => Id::SSA,
            AV_CODEC_ID_MOV_TEXT => Id::MOV_TEXT,
            AV_CODEC_ID_HDMV_PGS_SUBTITLE => Id::HDMV_PGS_SUBTITLE,
            AV_CODEC_ID_DVB_TELETEXT => Id::DVB_TELETEXT,
            AV_CODEC_ID_SRT => Id::SRT,

            AV_CODEC_ID_MICRODVD => Id::MICRODVD,
            AV_CODEC_ID_EIA_608 => Id::EIA_608,
            AV_CODEC_ID_JACOSUB => Id::JACOSUB,
            AV_CODEC_ID_SAMI => Id::SAMI,
            AV_CODEC_ID_REALTEXT => Id::REALTEXT,
            AV_CODEC_ID_STL => Id::STL,
            AV_CODEC_ID_SUBVIEWER1 => Id::SUBVIEWER1,
            AV_CODEC_ID_SUBVIEWER => Id::SUBVIEWER,
            AV_CODEC_ID_SUBRIP => Id::SUBRIP,
            AV_CODEC_ID_WEBVTT => Id::WEBVTT,
            AV_CODEC_ID_MPL2 => Id::MPL2,
            AV_CODEC_ID_VPLAYER => Id::VPLAYER,
            AV_CODEC_ID_PJS => Id::PJS,
            AV_CODEC_ID_ASS => Id::ASS,
            AV_CODEC_ID_HDMV_TEXT_SUBTITLE => Id::HDMV_TEXT_SUBTITLE,

            /* other specific kind of codecs (generally used for attachments) */
            AV_CODEC_ID_TTF => Id::TTF,

            AV_CODEC_ID_SCTE_35 => Id::SCTE_35,
            AV_CODEC_ID_BINTEXT => Id::BINTEXT,
            AV_CODEC_ID_XBIN => Id::XBIN,
            AV_CODEC_ID_IDF => Id::IDF,
            AV_CODEC_ID_OTF => Id::OTF,
            AV_CODEC_ID_SMPTE_KLV => Id::SMPTE_KLV,
            AV_CODEC_ID_DVD_NAV => Id::DVD_NAV,
            AV_CODEC_ID_TIMED_ID3 => Id::TIMED_ID3,
            AV_CODEC_ID_BIN_DATA => Id::BIN_DATA,

            AV_CODEC_ID_PROBE => Id::PROBE,

            AV_CODEC_ID_MPEG2TS => Id::MPEG2TS,
            AV_CODEC_ID_MPEG4SYSTEMS => Id::MPEG4SYSTEMS,
            AV_CODEC_ID_FFMETADATA => Id::FFMETADATA,
            AV_CODEC_ID_WRAPPED_AVFRAME => Id::WRAPPED_AVFRAME,
            AV_CODEC_ID_PSD => Id::PSD,
            AV_CODEC_ID_PIXLET => Id::PIXLET,
            AV_CODEC_ID_SPEEDHQ => Id::SPEEDHQ,
            AV_CODEC_ID_CLEARVIDEO => Id::CLEARVIDEO,
            AV_CODEC_ID_FMVC => Id::FMVC,
            AV_CODEC_ID_SCPR => Id::SCPR,
            AV_CODEC_ID_XPM => Id::XPM,
            AV_CODEC_ID_AV1 => Id::AV1,
            AV_CODEC_ID_PCM_F16LE => Id::PCM_F16LE,
            AV_CODEC_ID_PCM_F24LE => Id::PCM_F24LE,
            AV_CODEC_ID_ATRAC3AL => Id::ATRAC3AL,
            AV_CODEC_ID_ATRAC3PAL => Id::ATRAC3PAL,

            AV_CODEC_ID_BITPACKED => Id::BITPACKED,
            AV_CODEC_ID_MSCC => Id::MSCC,
            AV_CODEC_ID_SRGC => Id::SRGC,
            AV_CODEC_ID_SVG => Id::SVG,
            AV_CODEC_ID_GDV => Id::GDV,
            AV_CODEC_ID_FITS => Id::FITS,
            AV_CODEC_ID_GREMLIN_DPCM => Id::GREMLIN_DPCM,
            AV_CODEC_ID_DOLBY_E => Id::DOLBY_E,

            #[cfg(feature = "ffmpeg_4_0")]
            AV_CODEC_ID_APTX => Id::APTX,
            #[cfg(feature = "ffmpeg_4_0")]
            AV_CODEC_ID_APTX_HD => Id::APTX_HD,
            #[cfg(feature = "ffmpeg_4_0")]
            AV_CODEC_ID_SBC => Id::SBC,

            #[cfg(feature = "ffmpeg_4_1")]
            AV_CODEC_ID_AVS2 => Id::AVS2,
            #[cfg(feature = "ffmpeg_4_1")]
            AV_CODEC_ID_IMM4 => Id::IMM4,
            #[cfg(feature = "ffmpeg_4_1")]
            AV_CODEC_ID_PROSUMER => Id::PROSUMER,
            #[cfg(feature = "ffmpeg_4_1")]
            AV_CODEC_ID_MWSC => Id::MWSC,
            #[cfg(feature = "ffmpeg_4_1")]
            AV_CODEC_ID_WCMV => Id::WCMV,
            #[cfg(feature = "ffmpeg_4_1")]
            AV_CODEC_ID_RASC => Id::RASC,
            #[cfg(feature = "ffmpeg_4_1")]
            AV_CODEC_ID_PCM_VIDC => Id::PCM_VIDC,
            #[cfg(feature = "ffmpeg_4_1")]
            AV_CODEC_ID_ATRAC9 => Id::ATRAC9,
            #[cfg(feature = "ffmpeg_4_1")]
            AV_CODEC_ID_TTML => Id::TTML,

            #[cfg(feature = "ffmpeg_4_2")]
            AV_CODEC_ID_HYMT => Id::HYMT,
            #[cfg(feature = "ffmpeg_4_2")]
            AV_CODEC_ID_ARBC => Id::ARBC,
            #[cfg(feature = "ffmpeg_4_2")]
            AV_CODEC_ID_AGM => Id::AGM,
            #[cfg(feature = "ffmpeg_4_2")]
            AV_CODEC_ID_LSCR => Id::LSCR,
            #[cfg(feature = "ffmpeg_4_2")]
            AV_CODEC_ID_VP4 => Id::VP4,
            #[cfg(feature = "ffmpeg_4_2")]
            AV_CODEC_ID_ADPCM_AGM => Id::ADPCM_AGM,
            #[cfg(feature = "ffmpeg_4_2")]
            AV_CODEC_ID_HCOM => Id::HCOM,
            #[cfg(feature = "ffmpeg_4_2")]
            AV_CODEC_ID_ARIB_CAPTION => Id::ARIB_CAPTION,

            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_IMM5 => Id::IMM5,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_MVDV => Id::MVDV,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_MVHA => Id::MVHA,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_CDTOONS => Id::CDTOONS,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_MV30 => Id::MV30,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_NOTCHLC => Id::NOTCHLC,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_PFM => Id::PFM,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_ADPCM_ARGO => Id::ADPCM_ARGO,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_ADPCM_IMA_SSI => Id::ADPCM_IMA_SSI,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_ADPCM_ZORK => Id::ADPCM_ZORK,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_ADPCM_IMA_APM => Id::ADPCM_IMA_APM,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_ADPCM_IMA_ALP => Id::ADPCM_IMA_ALP,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_ADPCM_IMA_MTF => Id::ADPCM_IMA_MTF,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_ADPCM_IMA_CUNNING => Id::ADPCM_IMA_CUNNING,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_DERF_DPCM => Id::DERF_DPCM,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_ACELP_KELVIN => Id::ACELP_KELVIN,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_MPEGH_3D_AUDIO => Id::MPEGH_3D_AUDIO,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_SIREN => Id::SIREN,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_HCA => Id::HCA,
            #[cfg(feature = "ffmpeg_4_3")]
            AV_CODEC_ID_EPG => Id::EPG,

            #[cfg(feature = "ffmpeg_4_4")]
            AV_CODEC_ID_PGX => Id::PGX,
            #[cfg(feature = "ffmpeg_4_4")]
            AV_CODEC_ID_AVS3 => Id::AVS3,
            #[cfg(feature = "ffmpeg_4_4")]
            AV_CODEC_ID_MSP2 => Id::MSP2,
            #[cfg(feature = "ffmpeg_4_4")]
            AV_CODEC_ID_VVC => Id::VVC,
            #[cfg(feature = "ffmpeg_4_4")]
            AV_CODEC_ID_MOBICLIP => Id::MOBICLIP,
            #[cfg(feature = "ffmpeg_4_4")]
            AV_CODEC_ID_PHOTOCD => Id::PHOTOCD,
            #[cfg(feature = "ffmpeg_4_4")]
            AV_CODEC_ID_IPU => Id::IPU,
            #[cfg(feature = "ffmpeg_4_4")]
            AV_CODEC_ID_ARGO => Id::ARGO,
            #[cfg(feature = "ffmpeg_4_4")]
            AV_CODEC_ID_CRI => Id::CRI,
            #[cfg(feature = "ffmpeg_4_4")]
            AV_CODEC_ID_SIMBIOSIS_IMX => Id::SIMBIOSIS_IMX,
            #[cfg(feature = "ffmpeg_4_4")]
            AV_CODEC_ID_SGA_VIDEO => Id::SGA_VIDEO,
            #[cfg(feature = "ffmpeg_4_4")]
            AV_CODEC_ID_PCM_SGA => Id::PCM_SGA,
            #[cfg(feature = "ffmpeg_4_4")]
            AV_CODEC_ID_ADPCM_IMA_MOFLEX => Id::ADPCM_IMA_MOFLEX,
            #[cfg(feature = "ffmpeg_4_4")]
            AV_CODEC_ID_FASTAUDIO => Id::FASTAUDIO,

            #[cfg(feature = "ffmpeg_5_0")]
            AV_CODEC_ID_GEM => Id::GEM,
            #[cfg(feature = "ffmpeg_5_0")]
            AV_CODEC_ID_ADPCM_IMA_ACORN => Id::ADPCM_IMA_ACORN,
            #[cfg(feature = "ffmpeg_5_0")]
            AV_CODEC_ID_MSNSIREN => Id::MSNSIREN,

            #[cfg(feature = "ffmpeg_5_1")]
            AV_CODEC_ID_VBN => Id::VBN,
            #[cfg(feature = "ffmpeg_5_1")]
            AV_CODEC_ID_JPEGXL => Id::JPEGXL,
            #[cfg(feature = "ffmpeg_5_1")]
            AV_CODEC_ID_QOI => Id::QOI,
            #[cfg(feature = "ffmpeg_5_1")]
            AV_CODEC_ID_PHM => Id::PHM,
            #[cfg(feature = "ffmpeg_5_1")]
            AV_CODEC_ID_DFPWM => Id::DFPWM,

            #[cfg(feature = "ffmpeg_6_0")]
            AV_CODEC_ID_RADIANCE_HDR => Id::RADIANCE_HDR,
            #[cfg(feature = "ffmpeg_6_0")]
            AV_CODEC_ID_WBMP => Id::WBMP,
            #[cfg(feature = "ffmpeg_6_0")]
            AV_CODEC_ID_MEDIA100 => Id::MEDIA100,
            #[cfg(feature = "ffmpeg_6_0")]
            AV_CODEC_ID_VQC => Id::VQC,
            #[cfg(feature = "ffmpeg_6_0")]
            AV_CODEC_ID_ADPCM_XMD => Id::ADPCM_XMD,
            #[cfg(feature = "ffmpeg_6_0")]
            AV_CODEC_ID_WADY_DPCM => Id::WADY_DPCM,
            #[cfg(feature = "ffmpeg_6_0")]
            AV_CODEC_ID_CBD2_DPCM => Id::CBD2_DPCM,
            #[cfg(feature = "ffmpeg_6_0")]
            AV_CODEC_ID_BONK => Id::BONK,
            #[cfg(feature = "ffmpeg_6_0")]
            AV_CODEC_ID_MISC4 => Id::MISC4,
            #[cfg(feature = "ffmpeg_6_0")]
            AV_CODEC_ID_APAC => Id::APAC,
            #[cfg(feature = "ffmpeg_6_0")]
            AV_CODEC_ID_FTR => Id::FTR,
            #[cfg(feature = "ffmpeg_6_0")]
            AV_CODEC_ID_WAVARC => Id::WAVARC,
            #[cfg(feature = "ffmpeg_6_0")]
            AV_CODEC_ID_RKA => Id::RKA,
            #[cfg(feature = "ffmpeg_6_0")]
            AV_CODEC_ID_VNULL => Id::VNULL,
            #[cfg(feature = "ffmpeg_6_0")]
            AV_CODEC_ID_ANULL => Id::ANULL,
            #[cfg(feature = "ffmpeg_6_1")]
            AV_CODEC_ID_PDV => Id::PDV,
            #[cfg(feature = "ffmpeg_6_1")]
            AV_CODEC_ID_EVC => Id::EVC,
            #[cfg(feature = "ffmpeg_6_1")]
            AV_CODEC_ID_RTV1 => Id::RTV1,
            #[cfg(feature = "ffmpeg_6_1")]
            AV_CODEC_ID_VMIX => Id::VMIX,
            #[cfg(feature = "ffmpeg_6_1")]
            AV_CODEC_ID_AC4 => Id::AC4,
            #[cfg(feature = "ffmpeg_6_1")]
            AV_CODEC_ID_SMPTE_2038 => Id::SMPTE_2038,
            #[cfg(feature = "ffmpeg_6_1")]
            AV_CODEC_ID_OSQ => Id::OSQ,

            #[cfg(feature = "ffmpeg_7_0")]
            AV_CODEC_ID_QOA => Id::QOA,
            #[cfg(feature = "ffmpeg_7_0")]
            AV_CODEC_ID_LEAD => Id::LEAD,

            #[cfg(feature = "ffmpeg_7_1")]
            AV_CODEC_ID_LC3 => Id::LC3,
            #[cfg(feature = "ffmpeg_7_1")]
            AV_CODEC_ID_LCEVC => Id::LCEVC,
        }
    }
}

pub fn get_av_codec_id(id: Id) -> AVCodecID {
    id.into()
}

impl From<Id> for AVCodecID {
    fn from(value: Id) -> AVCodecID {
        match value {
            Id::None => AV_CODEC_ID_NONE,

            /* video codecs */
            Id::MPEG1VIDEO => AV_CODEC_ID_MPEG1VIDEO,
            Id::MPEG2VIDEO => AV_CODEC_ID_MPEG2VIDEO,
            #[cfg(all(feature = "ff_api_xvmc", not(feature = "ffmpeg_5_0")))]
            Id::MPEG2VIDEO_XVMC => AV_CODEC_ID_MPEG2VIDEO_XVMC,
            Id::H261 => AV_CODEC_ID_H261,
            Id::H263 => AV_CODEC_ID_H263,
            Id::RV10 => AV_CODEC_ID_RV10,
            Id::RV20 => AV_CODEC_ID_RV20,
            Id::MJPEG => AV_CODEC_ID_MJPEG,
            Id::MJPEGB => AV_CODEC_ID_MJPEGB,
            Id::LJPEG => AV_CODEC_ID_LJPEG,
            Id::SP5X => AV_CODEC_ID_SP5X,
            Id::JPEGLS => AV_CODEC_ID_JPEGLS,
            Id::MPEG4 => AV_CODEC_ID_MPEG4,
            Id::RAWVIDEO => AV_CODEC_ID_RAWVIDEO,
            Id::MSMPEG4V1 => AV_CODEC_ID_MSMPEG4V1,
            Id::MSMPEG4V2 => AV_CODEC_ID_MSMPEG4V2,
            Id::MSMPEG4V3 => AV_CODEC_ID_MSMPEG4V3,
            Id::WMV1 => AV_CODEC_ID_WMV1,
            Id::WMV2 => AV_CODEC_ID_WMV2,
            Id::H263P => AV_CODEC_ID_H263P,
            Id::H263I => AV_CODEC_ID_H263I,
            Id::FLV1 => AV_CODEC_ID_FLV1,
            Id::SVQ1 => AV_CODEC_ID_SVQ1,
            Id::SVQ3 => AV_CODEC_ID_SVQ3,
            Id::DVVIDEO => AV_CODEC_ID_DVVIDEO,
            Id::HUFFYUV => AV_CODEC_ID_HUFFYUV,
            Id::CYUV => AV_CODEC_ID_CYUV,
            Id::H264 => AV_CODEC_ID_H264,
            Id::INDEO3 => AV_CODEC_ID_INDEO3,
            Id::VP3 => AV_CODEC_ID_VP3,
            Id::THEORA => AV_CODEC_ID_THEORA,
            Id::ASV1 => AV_CODEC_ID_ASV1,
            Id::ASV2 => AV_CODEC_ID_ASV2,
            Id::FFV1 => AV_CODEC_ID_FFV1,
            Id::XM4 => AV_CODEC_ID_4XM,
            Id::VCR1 => AV_CODEC_ID_VCR1,
            Id::CLJR => AV_CODEC_ID_CLJR,
            Id::MDEC => AV_CODEC_ID_MDEC,
            Id::ROQ => AV_CODEC_ID_ROQ,
            Id::INTERPLAY_VIDEO => AV_CODEC_ID_INTERPLAY_VIDEO,
            Id::XAN_WC3 => AV_CODEC_ID_XAN_WC3,
            Id::XAN_WC4 => AV_CODEC_ID_XAN_WC4,
            Id::RPZA => AV_CODEC_ID_RPZA,
            Id::CINEPAK => AV_CODEC_ID_CINEPAK,
            Id::WS_VQA => AV_CODEC_ID_WS_VQA,
            Id::MSRLE => AV_CODEC_ID_MSRLE,
            Id::MSVIDEO1 => AV_CODEC_ID_MSVIDEO1,
            Id::IDCIN => AV_CODEC_ID_IDCIN,
            Id::BPS8 => AV_CODEC_ID_8BPS,
            Id::SMC => AV_CODEC_ID_SMC,
            Id::FLIC => AV_CODEC_ID_FLIC,
            Id::TRUEMOTION1 => AV_CODEC_ID_TRUEMOTION1,
            Id::VMDVIDEO => AV_CODEC_ID_VMDVIDEO,
            Id::MSZH => AV_CODEC_ID_MSZH,
            Id::ZLIB => AV_CODEC_ID_ZLIB,
            Id::QTRLE => AV_CODEC_ID_QTRLE,
            Id::TSCC => AV_CODEC_ID_TSCC,
            Id::ULTI => AV_CODEC_ID_ULTI,
            Id::QDRAW => AV_CODEC_ID_QDRAW,
            Id::VIXL => AV_CODEC_ID_VIXL,
            Id::QPEG => AV_CODEC_ID_QPEG,
            Id::PNG => AV_CODEC_ID_PNG,
            Id::PPM => AV_CODEC_ID_PPM,
            Id::PBM => AV_CODEC_ID_PBM,
            Id::PGM => AV_CODEC_ID_PGM,
            Id::PGMYUV => AV_CODEC_ID_PGMYUV,
            Id::PAM => AV_CODEC_ID_PAM,
            Id::FFVHUFF => AV_CODEC_ID_FFVHUFF,
            Id::RV30 => AV_CODEC_ID_RV30,
            Id::RV40 => AV_CODEC_ID_RV40,
            Id::VC1 => AV_CODEC_ID_VC1,
            Id::WMV3 => AV_CODEC_ID_WMV3,
            Id::LOCO => AV_CODEC_ID_LOCO,
            Id::WNV1 => AV_CODEC_ID_WNV1,
            Id::AASC => AV_CODEC_ID_AASC,
            Id::INDEO2 => AV_CODEC_ID_INDEO2,
            Id::FRAPS => AV_CODEC_ID_FRAPS,
            Id::TRUEMOTION2 => AV_CODEC_ID_TRUEMOTION2,
            Id::BMP => AV_CODEC_ID_BMP,
            Id::CSCD => AV_CODEC_ID_CSCD,
            Id::MMVIDEO => AV_CODEC_ID_MMVIDEO,
            Id::ZMBV => AV_CODEC_ID_ZMBV,
            Id::AVS => AV_CODEC_ID_AVS,
            Id::SMACKVIDEO => AV_CODEC_ID_SMACKVIDEO,
            Id::NUV => AV_CODEC_ID_NUV,
            Id::KMVC => AV_CODEC_ID_KMVC,
            Id::FLASHSV => AV_CODEC_ID_FLASHSV,
            Id::CAVS => AV_CODEC_ID_CAVS,
            Id::JPEG2000 => AV_CODEC_ID_JPEG2000,
            Id::VMNC => AV_CODEC_ID_VMNC,
            Id::VP5 => AV_CODEC_ID_VP5,
            Id::VP6 => AV_CODEC_ID_VP6,
            Id::VP6F => AV_CODEC_ID_VP6F,
            Id::TARGA => AV_CODEC_ID_TARGA,
            Id::DSICINVIDEO => AV_CODEC_ID_DSICINVIDEO,
            Id::TIERTEXSEQVIDEO => AV_CODEC_ID_TIERTEXSEQVIDEO,
            Id::TIFF => AV_CODEC_ID_TIFF,
            Id::GIF => AV_CODEC_ID_GIF,
            Id::DXA => AV_CODEC_ID_DXA,
            Id::DNXHD => AV_CODEC_ID_DNXHD,
            Id::THP => AV_CODEC_ID_THP,
            Id::SGI => AV_CODEC_ID_SGI,
            Id::C93 => AV_CODEC_ID_C93,
            Id::BETHSOFTVID => AV_CODEC_ID_BETHSOFTVID,
            Id::PTX => AV_CODEC_ID_PTX,
            Id::TXD => AV_CODEC_ID_TXD,
            Id::VP6A => AV_CODEC_ID_VP6A,
            Id::AMV => AV_CODEC_ID_AMV,
            Id::VB => AV_CODEC_ID_VB,
            Id::PCX => AV_CODEC_ID_PCX,
            Id::SUNRAST => AV_CODEC_ID_SUNRAST,
            Id::INDEO4 => AV_CODEC_ID_INDEO4,
            Id::INDEO5 => AV_CODEC_ID_INDEO5,
            Id::MIMIC => AV_CODEC_ID_MIMIC,
            Id::RL2 => AV_CODEC_ID_RL2,
            Id::ESCAPE124 => AV_CODEC_ID_ESCAPE124,
            Id::DIRAC => AV_CODEC_ID_DIRAC,
            Id::BFI => AV_CODEC_ID_BFI,
            Id::CMV => AV_CODEC_ID_CMV,
            Id::MOTIONPIXELS => AV_CODEC_ID_MOTIONPIXELS,
            Id::TGV => AV_CODEC_ID_TGV,
            Id::TGQ => AV_CODEC_ID_TGQ,
            Id::TQI => AV_CODEC_ID_TQI,
            Id::AURA => AV_CODEC_ID_AURA,
            Id::AURA2 => AV_CODEC_ID_AURA2,
            Id::V210X => AV_CODEC_ID_V210X,
            Id::TMV => AV_CODEC_ID_TMV,
            Id::V210 => AV_CODEC_ID_V210,
            Id::DPX => AV_CODEC_ID_DPX,
            Id::MAD => AV_CODEC_ID_MAD,
            Id::FRWU => AV_CODEC_ID_FRWU,
            Id::FLASHSV2 => AV_CODEC_ID_FLASHSV2,
            Id::CDGRAPHICS => AV_CODEC_ID_CDGRAPHICS,
            Id::R210 => AV_CODEC_ID_R210,
            Id::ANM => AV_CODEC_ID_ANM,
            Id::BINKVIDEO => AV_CODEC_ID_BINKVIDEO,
            Id::IFF_ILBM => AV_CODEC_ID_IFF_ILBM,
            Id::IFF_BYTERUN1 => AV_CODEC_ID_IFF_ILBM,
            Id::KGV1 => AV_CODEC_ID_KGV1,
            Id::YOP => AV_CODEC_ID_YOP,
            Id::VP8 => AV_CODEC_ID_VP8,
            Id::PICTOR => AV_CODEC_ID_PICTOR,
            Id::ANSI => AV_CODEC_ID_ANSI,
            Id::A64_MULTI => AV_CODEC_ID_A64_MULTI,
            Id::A64_MULTI5 => AV_CODEC_ID_A64_MULTI5,
            Id::R10K => AV_CODEC_ID_R10K,
            Id::MXPEG => AV_CODEC_ID_MXPEG,
            Id::LAGARITH => AV_CODEC_ID_LAGARITH,
            Id::PRORES => AV_CODEC_ID_PRORES,
            Id::JV => AV_CODEC_ID_JV,
            Id::DFA => AV_CODEC_ID_DFA,
            Id::WMV3IMAGE => AV_CODEC_ID_WMV3IMAGE,
            Id::VC1IMAGE => AV_CODEC_ID_VC1IMAGE,
            Id::UTVIDEO => AV_CODEC_ID_UTVIDEO,
            Id::BMV_VIDEO => AV_CODEC_ID_BMV_VIDEO,
            Id::VBLE => AV_CODEC_ID_VBLE,
            Id::DXTORY => AV_CODEC_ID_DXTORY,
            Id::V410 => AV_CODEC_ID_V410,
            Id::XWD => AV_CODEC_ID_XWD,
            Id::CDXL => AV_CODEC_ID_CDXL,
            Id::XBM => AV_CODEC_ID_XBM,
            Id::ZEROCODEC => AV_CODEC_ID_ZEROCODEC,
            Id::MSS1 => AV_CODEC_ID_MSS1,
            Id::MSA1 => AV_CODEC_ID_MSA1,
            Id::TSCC2 => AV_CODEC_ID_TSCC2,
            Id::MTS2 => AV_CODEC_ID_MTS2,
            Id::CLLC => AV_CODEC_ID_CLLC,
            Id::MSS2 => AV_CODEC_ID_MSS2,
            Id::VP9 => AV_CODEC_ID_VP9,
            Id::AIC => AV_CODEC_ID_AIC,
            Id::ESCAPE130 => AV_CODEC_ID_ESCAPE130,
            Id::G2M => AV_CODEC_ID_G2M,
            Id::WEBP => AV_CODEC_ID_WEBP,
            Id::HNM4_VIDEO => AV_CODEC_ID_HNM4_VIDEO,
            Id::HEVC => AV_CODEC_ID_HEVC,
            Id::H265 => AV_CODEC_ID_HEVC,
            Id::FIC => AV_CODEC_ID_FIC,
            Id::ALIAS_PIX => AV_CODEC_ID_ALIAS_PIX,
            Id::BRENDER_PIX => AV_CODEC_ID_BRENDER_PIX,
            Id::PAF_VIDEO => AV_CODEC_ID_PAF_VIDEO,
            Id::EXR => AV_CODEC_ID_EXR,
            Id::VP7 => AV_CODEC_ID_VP7,
            Id::SANM => AV_CODEC_ID_SANM,
            Id::SGIRLE => AV_CODEC_ID_SGIRLE,
            Id::MVC1 => AV_CODEC_ID_MVC1,
            Id::MVC2 => AV_CODEC_ID_MVC2,
            Id::HQX => AV_CODEC_ID_HQX,
            Id::TDSC => AV_CODEC_ID_TDSC,
            Id::HQ_HQA => AV_CODEC_ID_HQ_HQA,
            Id::HAP => AV_CODEC_ID_HAP,
            Id::DDS => AV_CODEC_ID_DDS,
            Id::DXV => AV_CODEC_ID_DXV,
            Id::SCREENPRESSO => AV_CODEC_ID_SCREENPRESSO,
            Id::RSCC => AV_CODEC_ID_RSCC,

            Id::Y41P => AV_CODEC_ID_Y41P,
            Id::AVRP => AV_CODEC_ID_AVRP,
            Id::V012 => AV_CODEC_ID_012V,
            Id::AVUI => AV_CODEC_ID_AVUI,
            #[cfg(not(feature = "ffmpeg_7_0"))]
            Id::AYUV => AV_CODEC_ID_AYUV,
            Id::TARGA_Y216 => AV_CODEC_ID_TARGA_Y216,
            Id::V308 => AV_CODEC_ID_V308,
            Id::V408 => AV_CODEC_ID_V408,
            Id::YUV4 => AV_CODEC_ID_YUV4,
            Id::AVRN => AV_CODEC_ID_AVRN,
            Id::CPIA => AV_CODEC_ID_CPIA,
            Id::XFACE => AV_CODEC_ID_XFACE,
            Id::SNOW => AV_CODEC_ID_SNOW,
            Id::SMVJPEG => AV_CODEC_ID_SMVJPEG,
            Id::APNG => AV_CODEC_ID_APNG,
            Id::DAALA => AV_CODEC_ID_DAALA,
            Id::CFHD => AV_CODEC_ID_CFHD,
            Id::TRUEMOTION2RT => AV_CODEC_ID_TRUEMOTION2RT,
            Id::M101 => AV_CODEC_ID_M101,
            Id::MAGICYUV => AV_CODEC_ID_MAGICYUV,
            Id::SHEERVIDEO => AV_CODEC_ID_SHEERVIDEO,
            Id::YLC => AV_CODEC_ID_YLC,

            /* various PCM "codecs" */
            Id::PCM_S16LE => AV_CODEC_ID_PCM_S16LE,
            Id::PCM_S16BE => AV_CODEC_ID_PCM_S16BE,
            Id::PCM_U16LE => AV_CODEC_ID_PCM_U16LE,
            Id::PCM_U16BE => AV_CODEC_ID_PCM_U16BE,
            Id::PCM_S8 => AV_CODEC_ID_PCM_S8,
            Id::PCM_U8 => AV_CODEC_ID_PCM_U8,
            Id::PCM_MULAW => AV_CODEC_ID_PCM_MULAW,
            Id::PCM_ALAW => AV_CODEC_ID_PCM_ALAW,
            Id::PCM_S32LE => AV_CODEC_ID_PCM_S32LE,
            Id::PCM_S32BE => AV_CODEC_ID_PCM_S32BE,
            Id::PCM_U32LE => AV_CODEC_ID_PCM_U32LE,
            Id::PCM_U32BE => AV_CODEC_ID_PCM_U32BE,
            Id::PCM_S24LE => AV_CODEC_ID_PCM_S24LE,
            Id::PCM_S24BE => AV_CODEC_ID_PCM_S24BE,
            Id::PCM_U24LE => AV_CODEC_ID_PCM_U24LE,
            Id::PCM_U24BE => AV_CODEC_ID_PCM_U24BE,
            Id::PCM_S24DAUD => AV_CODEC_ID_PCM_S24DAUD,
            Id::PCM_ZORK => AV_CODEC_ID_PCM_ZORK,
            Id::PCM_S16LE_PLANAR => AV_CODEC_ID_PCM_S16LE_PLANAR,
            Id::PCM_DVD => AV_CODEC_ID_PCM_DVD,
            Id::PCM_F32BE => AV_CODEC_ID_PCM_F32BE,
            Id::PCM_F32LE => AV_CODEC_ID_PCM_F32LE,
            Id::PCM_F64BE => AV_CODEC_ID_PCM_F64BE,
            Id::PCM_F64LE => AV_CODEC_ID_PCM_F64LE,
            Id::PCM_BLURAY => AV_CODEC_ID_PCM_BLURAY,
            Id::PCM_LXF => AV_CODEC_ID_PCM_LXF,
            Id::S302M => AV_CODEC_ID_S302M,
            Id::PCM_S8_PLANAR => AV_CODEC_ID_PCM_S8_PLANAR,
            Id::PCM_S24LE_PLANAR => AV_CODEC_ID_PCM_S24LE_PLANAR,
            Id::PCM_S32LE_PLANAR => AV_CODEC_ID_PCM_S32LE_PLANAR,
            Id::PCM_S16BE_PLANAR => AV_CODEC_ID_PCM_S16BE_PLANAR,

            Id::PCM_S64LE => AV_CODEC_ID_PCM_S64LE,
            Id::PCM_S64BE => AV_CODEC_ID_PCM_S64BE,

            /* various ADPCM codecs */
            Id::ADPCM_IMA_QT => AV_CODEC_ID_ADPCM_IMA_QT,
            Id::ADPCM_IMA_WAV => AV_CODEC_ID_ADPCM_IMA_WAV,
            Id::ADPCM_IMA_DK3 => AV_CODEC_ID_ADPCM_IMA_DK3,
            Id::ADPCM_IMA_DK4 => AV_CODEC_ID_ADPCM_IMA_DK4,
            Id::ADPCM_IMA_WS => AV_CODEC_ID_ADPCM_IMA_WS,
            Id::ADPCM_IMA_SMJPEG => AV_CODEC_ID_ADPCM_IMA_SMJPEG,
            Id::ADPCM_MS => AV_CODEC_ID_ADPCM_MS,
            Id::ADPCM_4XM => AV_CODEC_ID_ADPCM_4XM,
            Id::ADPCM_XA => AV_CODEC_ID_ADPCM_XA,
            Id::ADPCM_ADX => AV_CODEC_ID_ADPCM_ADX,
            Id::ADPCM_EA => AV_CODEC_ID_ADPCM_EA,
            Id::ADPCM_G726 => AV_CODEC_ID_ADPCM_G726,
            Id::ADPCM_CT => AV_CODEC_ID_ADPCM_CT,
            Id::ADPCM_SWF => AV_CODEC_ID_ADPCM_SWF,
            Id::ADPCM_YAMAHA => AV_CODEC_ID_ADPCM_YAMAHA,
            Id::ADPCM_SBPRO_4 => AV_CODEC_ID_ADPCM_SBPRO_4,
            Id::ADPCM_SBPRO_3 => AV_CODEC_ID_ADPCM_SBPRO_3,
            Id::ADPCM_SBPRO_2 => AV_CODEC_ID_ADPCM_SBPRO_2,
            Id::ADPCM_THP => AV_CODEC_ID_ADPCM_THP,
            Id::ADPCM_IMA_AMV => AV_CODEC_ID_ADPCM_IMA_AMV,
            Id::ADPCM_EA_R1 => AV_CODEC_ID_ADPCM_EA_R1,
            Id::ADPCM_EA_R3 => AV_CODEC_ID_ADPCM_EA_R3,
            Id::ADPCM_EA_R2 => AV_CODEC_ID_ADPCM_EA_R2,
            Id::ADPCM_IMA_EA_SEAD => AV_CODEC_ID_ADPCM_IMA_EA_SEAD,
            Id::ADPCM_IMA_EA_EACS => AV_CODEC_ID_ADPCM_IMA_EA_EACS,
            Id::ADPCM_EA_XAS => AV_CODEC_ID_ADPCM_EA_XAS,
            Id::ADPCM_EA_MAXIS_XA => AV_CODEC_ID_ADPCM_EA_MAXIS_XA,
            Id::ADPCM_IMA_ISS => AV_CODEC_ID_ADPCM_IMA_ISS,
            Id::ADPCM_G722 => AV_CODEC_ID_ADPCM_G722,
            Id::ADPCM_IMA_APC => AV_CODEC_ID_ADPCM_IMA_APC,
            Id::ADPCM_VIMA => AV_CODEC_ID_ADPCM_VIMA,

            Id::ADPCM_AFC => AV_CODEC_ID_ADPCM_AFC,
            Id::ADPCM_IMA_OKI => AV_CODEC_ID_ADPCM_IMA_OKI,
            Id::ADPCM_DTK => AV_CODEC_ID_ADPCM_DTK,
            Id::ADPCM_IMA_RAD => AV_CODEC_ID_ADPCM_IMA_RAD,
            Id::ADPCM_G726LE => AV_CODEC_ID_ADPCM_G726LE,
            Id::ADPCM_THP_LE => AV_CODEC_ID_ADPCM_THP_LE,
            Id::ADPCM_PSX => AV_CODEC_ID_ADPCM_PSX,
            Id::ADPCM_AICA => AV_CODEC_ID_ADPCM_AICA,
            Id::ADPCM_IMA_DAT4 => AV_CODEC_ID_ADPCM_IMA_DAT4,
            Id::ADPCM_MTAF => AV_CODEC_ID_ADPCM_MTAF,

            /* AMR */
            Id::AMR_NB => AV_CODEC_ID_AMR_NB,
            Id::AMR_WB => AV_CODEC_ID_AMR_WB,

            /* RealAudio codecs*/
            Id::RA_144 => AV_CODEC_ID_RA_144,
            Id::RA_288 => AV_CODEC_ID_RA_288,

            /* various DPCM codecs */
            Id::ROQ_DPCM => AV_CODEC_ID_ROQ_DPCM,
            Id::INTERPLAY_DPCM => AV_CODEC_ID_INTERPLAY_DPCM,
            Id::XAN_DPCM => AV_CODEC_ID_XAN_DPCM,
            Id::SOL_DPCM => AV_CODEC_ID_SOL_DPCM,

            Id::SDX2_DPCM => AV_CODEC_ID_SDX2_DPCM,

            /* audio codecs */
            Id::MP2 => AV_CODEC_ID_MP2,
            Id::MP3 => AV_CODEC_ID_MP3,
            Id::AAC => AV_CODEC_ID_AAC,
            Id::AC3 => AV_CODEC_ID_AC3,
            Id::DTS => AV_CODEC_ID_DTS,
            Id::VORBIS => AV_CODEC_ID_VORBIS,
            Id::DVAUDIO => AV_CODEC_ID_DVAUDIO,
            Id::WMAV1 => AV_CODEC_ID_WMAV1,
            Id::WMAV2 => AV_CODEC_ID_WMAV2,
            Id::MACE3 => AV_CODEC_ID_MACE3,
            Id::MACE6 => AV_CODEC_ID_MACE6,
            Id::VMDAUDIO => AV_CODEC_ID_VMDAUDIO,
            Id::FLAC => AV_CODEC_ID_FLAC,
            Id::MP3ADU => AV_CODEC_ID_MP3ADU,
            Id::MP3ON4 => AV_CODEC_ID_MP3ON4,
            Id::SHORTEN => AV_CODEC_ID_SHORTEN,
            Id::ALAC => AV_CODEC_ID_ALAC,
            Id::WESTWOOD_SND1 => AV_CODEC_ID_WESTWOOD_SND1,
            Id::GSM => AV_CODEC_ID_GSM,
            Id::QDM2 => AV_CODEC_ID_QDM2,
            Id::COOK => AV_CODEC_ID_COOK,
            Id::TRUESPEECH => AV_CODEC_ID_TRUESPEECH,
            Id::TTA => AV_CODEC_ID_TTA,
            Id::SMACKAUDIO => AV_CODEC_ID_SMACKAUDIO,
            Id::QCELP => AV_CODEC_ID_QCELP,
            Id::WAVPACK => AV_CODEC_ID_WAVPACK,
            Id::DSICINAUDIO => AV_CODEC_ID_DSICINAUDIO,
            Id::IMC => AV_CODEC_ID_IMC,
            Id::MUSEPACK7 => AV_CODEC_ID_MUSEPACK7,
            Id::MLP => AV_CODEC_ID_MLP,
            Id::GSM_MS => AV_CODEC_ID_GSM_MS,
            Id::ATRAC3 => AV_CODEC_ID_ATRAC3,
            #[cfg(feature = "ff_api_voxware")]
            Id::VOXWARE => AV_CODEC_ID_VOXWARE,
            Id::APE => AV_CODEC_ID_APE,
            Id::NELLYMOSER => AV_CODEC_ID_NELLYMOSER,
            Id::MUSEPACK8 => AV_CODEC_ID_MUSEPACK8,
            Id::SPEEX => AV_CODEC_ID_SPEEX,
            Id::WMAVOICE => AV_CODEC_ID_WMAVOICE,
            Id::WMAPRO => AV_CODEC_ID_WMAPRO,
            Id::WMALOSSLESS => AV_CODEC_ID_WMALOSSLESS,
            Id::ATRAC3P => AV_CODEC_ID_ATRAC3P,
            Id::EAC3 => AV_CODEC_ID_EAC3,
            Id::SIPR => AV_CODEC_ID_SIPR,
            Id::MP1 => AV_CODEC_ID_MP1,
            Id::TWINVQ => AV_CODEC_ID_TWINVQ,
            Id::TRUEHD => AV_CODEC_ID_TRUEHD,
            Id::MP4ALS => AV_CODEC_ID_MP4ALS,
            Id::ATRAC1 => AV_CODEC_ID_ATRAC1,
            Id::BINKAUDIO_RDFT => AV_CODEC_ID_BINKAUDIO_RDFT,
            Id::BINKAUDIO_DCT => AV_CODEC_ID_BINKAUDIO_DCT,
            Id::AAC_LATM => AV_CODEC_ID_AAC_LATM,
            Id::QDMC => AV_CODEC_ID_QDMC,
            Id::CELT => AV_CODEC_ID_CELT,
            Id::G723_1 => AV_CODEC_ID_G723_1,
            Id::G729 => AV_CODEC_ID_G729,
            Id::SVX_EXP8 => AV_CODEC_ID_8SVX_EXP,
            Id::SVX_FIB8 => AV_CODEC_ID_8SVX_FIB,
            Id::BMV_AUDIO => AV_CODEC_ID_BMV_AUDIO,
            Id::RALF => AV_CODEC_ID_RALF,
            Id::IAC => AV_CODEC_ID_IAC,
            Id::ILBC => AV_CODEC_ID_ILBC,
            Id::OPUS => AV_CODEC_ID_OPUS,
            Id::COMFORT_NOISE => AV_CODEC_ID_COMFORT_NOISE,
            Id::TAK => AV_CODEC_ID_TAK,
            Id::METASOUND => AV_CODEC_ID_METASOUND,
            Id::PAF_AUDIO => AV_CODEC_ID_PAF_AUDIO,
            Id::ON2AVC => AV_CODEC_ID_ON2AVC,
            Id::DSS_SP => AV_CODEC_ID_DSS_SP,

            #[cfg(feature = "ffmpeg_4_0")]
            Id::CODEC2 => AV_CODEC_ID_CODEC2,
            Id::FFWAVESYNTH => AV_CODEC_ID_FFWAVESYNTH,
            Id::SONIC => AV_CODEC_ID_SONIC,
            Id::SONIC_LS => AV_CODEC_ID_SONIC_LS,
            Id::EVRC => AV_CODEC_ID_EVRC,
            Id::SMV => AV_CODEC_ID_SMV,
            Id::DSD_LSBF => AV_CODEC_ID_DSD_LSBF,
            Id::DSD_MSBF => AV_CODEC_ID_DSD_MSBF,
            Id::DSD_LSBF_PLANAR => AV_CODEC_ID_DSD_LSBF_PLANAR,
            Id::DSD_MSBF_PLANAR => AV_CODEC_ID_DSD_MSBF_PLANAR,
            Id::_4GV => AV_CODEC_ID_4GV,
            Id::INTERPLAY_ACM => AV_CODEC_ID_INTERPLAY_ACM,
            Id::XMA1 => AV_CODEC_ID_XMA1,
            Id::XMA2 => AV_CODEC_ID_XMA2,
            Id::DST => AV_CODEC_ID_DST,

            /* subtitle codecs */
            Id::DVD_SUBTITLE => AV_CODEC_ID_DVD_SUBTITLE,
            Id::DVB_SUBTITLE => AV_CODEC_ID_DVB_SUBTITLE,
            Id::TEXT => AV_CODEC_ID_TEXT,
            Id::XSUB => AV_CODEC_ID_XSUB,
            Id::SSA => AV_CODEC_ID_SSA,
            Id::MOV_TEXT => AV_CODEC_ID_MOV_TEXT,
            Id::HDMV_PGS_SUBTITLE => AV_CODEC_ID_HDMV_PGS_SUBTITLE,
            Id::DVB_TELETEXT => AV_CODEC_ID_DVB_TELETEXT,
            Id::SRT => AV_CODEC_ID_SRT,

            Id::MICRODVD => AV_CODEC_ID_MICRODVD,
            Id::EIA_608 => AV_CODEC_ID_EIA_608,
            Id::JACOSUB => AV_CODEC_ID_JACOSUB,
            Id::SAMI => AV_CODEC_ID_SAMI,
            Id::REALTEXT => AV_CODEC_ID_REALTEXT,
            Id::STL => AV_CODEC_ID_STL,
            Id::SUBVIEWER1 => AV_CODEC_ID_SUBVIEWER1,
            Id::SUBVIEWER => AV_CODEC_ID_SUBVIEWER,
            Id::SUBRIP => AV_CODEC_ID_SUBRIP,
            Id::WEBVTT => AV_CODEC_ID_WEBVTT,
            Id::MPL2 => AV_CODEC_ID_MPL2,
            Id::VPLAYER => AV_CODEC_ID_VPLAYER,
            Id::PJS => AV_CODEC_ID_PJS,
            Id::ASS => AV_CODEC_ID_ASS,
            Id::HDMV_TEXT_SUBTITLE => AV_CODEC_ID_HDMV_TEXT_SUBTITLE,

            /* other specific kind of codecs (generally used for attachments) */
            Id::TTF => AV_CODEC_ID_TTF,

            Id::SCTE_35 => AV_CODEC_ID_SCTE_35,
            Id::BINTEXT => AV_CODEC_ID_BINTEXT,
            Id::XBIN => AV_CODEC_ID_XBIN,
            Id::IDF => AV_CODEC_ID_IDF,
            Id::OTF => AV_CODEC_ID_OTF,
            Id::SMPTE_KLV => AV_CODEC_ID_SMPTE_KLV,
            Id::DVD_NAV => AV_CODEC_ID_DVD_NAV,
            Id::TIMED_ID3 => AV_CODEC_ID_TIMED_ID3,
            Id::BIN_DATA => AV_CODEC_ID_BIN_DATA,

            Id::PROBE => AV_CODEC_ID_PROBE,

            Id::MPEG2TS => AV_CODEC_ID_MPEG2TS,
            Id::MPEG4SYSTEMS => AV_CODEC_ID_MPEG4SYSTEMS,
            Id::FFMETADATA => AV_CODEC_ID_FFMETADATA,
            Id::WRAPPED_AVFRAME => AV_CODEC_ID_WRAPPED_AVFRAME,

            Id::PSD => AV_CODEC_ID_PSD,
            Id::PIXLET => AV_CODEC_ID_PIXLET,
            Id::SPEEDHQ => AV_CODEC_ID_SPEEDHQ,
            Id::FMVC => AV_CODEC_ID_FMVC,
            Id::CLEARVIDEO => AV_CODEC_ID_CLEARVIDEO,
            Id::SCPR => AV_CODEC_ID_SCPR,
            Id::XPM => AV_CODEC_ID_XPM,
            Id::AV1 => AV_CODEC_ID_AV1,
            Id::PCM_F16LE => AV_CODEC_ID_PCM_F16LE,
            Id::PCM_F24LE => AV_CODEC_ID_PCM_F24LE,
            Id::ATRAC3AL => AV_CODEC_ID_ATRAC3AL,
            Id::ATRAC3PAL => AV_CODEC_ID_ATRAC3PAL,

            Id::BITPACKED => AV_CODEC_ID_BITPACKED,
            Id::MSCC => AV_CODEC_ID_MSCC,
            Id::SRGC => AV_CODEC_ID_SRGC,
            Id::SVG => AV_CODEC_ID_SVG,
            Id::GDV => AV_CODEC_ID_GDV,
            Id::FITS => AV_CODEC_ID_FITS,
            Id::GREMLIN_DPCM => AV_CODEC_ID_GREMLIN_DPCM,
            Id::DOLBY_E => AV_CODEC_ID_DOLBY_E,

            #[cfg(feature = "ffmpeg_4_0")]
            Id::APTX => AV_CODEC_ID_APTX,
            #[cfg(feature = "ffmpeg_4_0")]
            Id::APTX_HD => AV_CODEC_ID_APTX_HD,
            #[cfg(feature = "ffmpeg_4_0")]
            Id::SBC => AV_CODEC_ID_SBC,

            #[cfg(feature = "ffmpeg_4_1")]
            Id::AVS2 => AV_CODEC_ID_AVS2,
            #[cfg(feature = "ffmpeg_4_1")]
            Id::IMM4 => AV_CODEC_ID_IMM4,
            #[cfg(feature = "ffmpeg_4_1")]
            Id::PROSUMER => AV_CODEC_ID_PROSUMER,
            #[cfg(feature = "ffmpeg_4_1")]
            Id::MWSC => AV_CODEC_ID_MWSC,
            #[cfg(feature = "ffmpeg_4_1")]
            Id::WCMV => AV_CODEC_ID_WCMV,
            #[cfg(feature = "ffmpeg_4_1")]
            Id::RASC => AV_CODEC_ID_RASC,
            #[cfg(feature = "ffmpeg_4_1")]
            Id::PCM_VIDC => AV_CODEC_ID_PCM_VIDC,
            #[cfg(feature = "ffmpeg_4_1")]
            Id::ATRAC9 => AV_CODEC_ID_ATRAC9,
            #[cfg(feature = "ffmpeg_4_1")]
            Id::TTML => AV_CODEC_ID_TTML,

            #[cfg(feature = "ffmpeg_4_2")]
            Id::HYMT => AV_CODEC_ID_HYMT,
            #[cfg(feature = "ffmpeg_4_2")]
            Id::ARBC => AV_CODEC_ID_ARBC,
            #[cfg(feature = "ffmpeg_4_2")]
            Id::AGM => AV_CODEC_ID_AGM,
            #[cfg(feature = "ffmpeg_4_2")]
            Id::LSCR => AV_CODEC_ID_LSCR,
            #[cfg(feature = "ffmpeg_4_2")]
            Id::VP4 => AV_CODEC_ID_VP4,
            #[cfg(feature = "ffmpeg_4_2")]
            Id::ADPCM_AGM => AV_CODEC_ID_ADPCM_AGM,
            #[cfg(feature = "ffmpeg_4_2")]
            Id::HCOM => AV_CODEC_ID_HCOM,
            #[cfg(feature = "ffmpeg_4_2")]
            Id::ARIB_CAPTION => AV_CODEC_ID_ARIB_CAPTION,

            #[cfg(feature = "ffmpeg_4_3")]
            Id::IMM5 => AV_CODEC_ID_IMM5,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::MVDV => AV_CODEC_ID_MVDV,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::MVHA => AV_CODEC_ID_MVHA,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::CDTOONS => AV_CODEC_ID_CDTOONS,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::MV30 => AV_CODEC_ID_MV30,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::NOTCHLC => AV_CODEC_ID_NOTCHLC,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::PFM => AV_CODEC_ID_PFM,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::ADPCM_ARGO => AV_CODEC_ID_ADPCM_ARGO,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::ADPCM_IMA_SSI => AV_CODEC_ID_ADPCM_IMA_SSI,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::ADPCM_ZORK => AV_CODEC_ID_ADPCM_ZORK,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::ADPCM_IMA_APM => AV_CODEC_ID_ADPCM_IMA_APM,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::ADPCM_IMA_ALP => AV_CODEC_ID_ADPCM_IMA_ALP,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::ADPCM_IMA_MTF => AV_CODEC_ID_ADPCM_IMA_MTF,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::ADPCM_IMA_CUNNING => AV_CODEC_ID_ADPCM_IMA_CUNNING,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::DERF_DPCM => AV_CODEC_ID_DERF_DPCM,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::ACELP_KELVIN => AV_CODEC_ID_ACELP_KELVIN,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::MPEGH_3D_AUDIO => AV_CODEC_ID_MPEGH_3D_AUDIO,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::SIREN => AV_CODEC_ID_SIREN,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::HCA => AV_CODEC_ID_HCA,
            #[cfg(feature = "ffmpeg_4_3")]
            Id::EPG => AV_CODEC_ID_EPG,

            #[cfg(feature = "ffmpeg_4_4")]
            Id::PGX => AV_CODEC_ID_PGX,
            #[cfg(feature = "ffmpeg_4_4")]
            Id::AVS3 => AV_CODEC_ID_AVS3,
            #[cfg(feature = "ffmpeg_4_4")]
            Id::MSP2 => AV_CODEC_ID_MSP2,
            #[cfg(feature = "ffmpeg_4_4")]
            Id::VVC => AV_CODEC_ID_VVC,
            #[cfg(feature = "ffmpeg_4_4")]
            Id::MOBICLIP => AV_CODEC_ID_MOBICLIP,
            #[cfg(feature = "ffmpeg_4_4")]
            Id::PHOTOCD => AV_CODEC_ID_PHOTOCD,
            #[cfg(feature = "ffmpeg_4_4")]
            Id::IPU => AV_CODEC_ID_IPU,
            #[cfg(feature = "ffmpeg_4_4")]
            Id::ARGO => AV_CODEC_ID_ARGO,
            #[cfg(feature = "ffmpeg_4_4")]
            Id::CRI => AV_CODEC_ID_CRI,
            #[cfg(feature = "ffmpeg_4_4")]
            Id::SIMBIOSIS_IMX => AV_CODEC_ID_SIMBIOSIS_IMX,
            #[cfg(feature = "ffmpeg_4_4")]
            Id::SGA_VIDEO => AV_CODEC_ID_SGA_VIDEO,
            #[cfg(feature = "ffmpeg_4_4")]
            Id::PCM_SGA => AV_CODEC_ID_PCM_SGA,
            #[cfg(feature = "ffmpeg_4_4")]
            Id::ADPCM_IMA_MOFLEX => AV_CODEC_ID_ADPCM_IMA_MOFLEX,
            #[cfg(feature = "ffmpeg_4_4")]
            Id::FASTAUDIO => AV_CODEC_ID_FASTAUDIO,

            #[cfg(feature = "ffmpeg_5_0")]
            Id::GEM => AV_CODEC_ID_GEM,
            #[cfg(feature = "ffmpeg_5_0")]
            Id::ADPCM_IMA_ACORN => AV_CODEC_ID_ADPCM_IMA_ACORN,
            #[cfg(feature = "ffmpeg_5_0")]
            Id::MSNSIREN => AV_CODEC_ID_MSNSIREN,

            #[cfg(feature = "ffmpeg_5_1")]
            Id::VBN => AV_CODEC_ID_VBN,
            #[cfg(feature = "ffmpeg_5_1")]
            Id::JPEGXL => AV_CODEC_ID_JPEGXL,
            #[cfg(feature = "ffmpeg_5_1")]
            Id::QOI => AV_CODEC_ID_QOI,
            #[cfg(feature = "ffmpeg_5_1")]
            Id::PHM => AV_CODEC_ID_PHM,
            #[cfg(feature = "ffmpeg_5_1")]
            Id::DFPWM => AV_CODEC_ID_DFPWM,

            #[cfg(feature = "ffmpeg_6_0")]
            Id::RADIANCE_HDR => AV_CODEC_ID_RADIANCE_HDR,
            #[cfg(feature = "ffmpeg_6_0")]
            Id::WBMP => AV_CODEC_ID_WBMP,
            #[cfg(feature = "ffmpeg_6_0")]
            Id::MEDIA100 => AV_CODEC_ID_MEDIA100,
            #[cfg(feature = "ffmpeg_6_0")]
            Id::VQC => AV_CODEC_ID_VQC,
            #[cfg(feature = "ffmpeg_6_0")]
            Id::ADPCM_XMD => AV_CODEC_ID_ADPCM_XMD,
            #[cfg(feature = "ffmpeg_6_0")]
            Id::WADY_DPCM => AV_CODEC_ID_WADY_DPCM,
            #[cfg(feature = "ffmpeg_6_0")]
            Id::CBD2_DPCM => AV_CODEC_ID_CBD2_DPCM,
            #[cfg(feature = "ffmpeg_6_0")]
            Id::BONK => AV_CODEC_ID_BONK,
            #[cfg(feature = "ffmpeg_6_0")]
            Id::MISC4 => AV_CODEC_ID_MISC4,
            #[cfg(feature = "ffmpeg_6_0")]
            Id::APAC => AV_CODEC_ID_APAC,
            #[cfg(feature = "ffmpeg_6_0")]
            Id::FTR => AV_CODEC_ID_FTR,
            #[cfg(feature = "ffmpeg_6_0")]
            Id::WAVARC => AV_CODEC_ID_WAVARC,
            #[cfg(feature = "ffmpeg_6_0")]
            Id::RKA => AV_CODEC_ID_RKA,
            #[cfg(feature = "ffmpeg_6_0")]
            Id::VNULL => AV_CODEC_ID_VNULL,
            #[cfg(feature = "ffmpeg_6_0")]
            Id::ANULL => AV_CODEC_ID_ANULL,
            #[cfg(feature = "ffmpeg_6_1")]
            Id::PDV => AV_CODEC_ID_PDV,
            #[cfg(feature = "ffmpeg_6_1")]
            Id::EVC => AV_CODEC_ID_EVC,
            #[cfg(feature = "ffmpeg_6_1")]
            Id::RTV1 => AV_CODEC_ID_RTV1,
            #[cfg(feature = "ffmpeg_6_1")]
            Id::VMIX => AV_CODEC_ID_VMIX,
            #[cfg(feature = "ffmpeg_6_1")]
            Id::AC4 => AV_CODEC_ID_AC4,
            #[cfg(feature = "ffmpeg_6_1")]
            Id::SMPTE_2038 => AV_CODEC_ID_SMPTE_2038,
            #[cfg(feature = "ffmpeg_6_1")]
            Id::OSQ => AV_CODEC_ID_OSQ,

            #[cfg(feature = "ffmpeg_7_0")]
            Id::QOA => AV_CODEC_ID_QOA,
            #[cfg(feature = "ffmpeg_7_0")]
            Id::LEAD => AV_CODEC_ID_LEAD,

            #[cfg(feature = "ffmpeg_7_1")]
            Id::LC3 => AV_CODEC_ID_LC3,
            #[cfg(feature = "ffmpeg_7_1")]
            Id::LCEVC => AV_CODEC_ID_LCEVC,
        }
    }
}
