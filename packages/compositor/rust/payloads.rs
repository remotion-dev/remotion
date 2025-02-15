// Must keep this file synced with payload.ts!

extern crate serde;
extern crate serde_json;

pub mod payloads {
    use crate::errors::ErrorWithBacktrace;
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize, Debug)]
    pub struct ImageLayer {
        pub src: String,
        pub x: u32,
        pub y: u32,
        pub width: u32,
        pub height: u32,
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub struct SolidLayer {
        pub fill: [u8; 4],
        pub x: u32,
        pub y: u32,
        pub width: u32,
        pub height: u32,
    }

    #[derive(Serialize, Debug)]
    pub struct ErrorPayload {
        pub error: String,
        pub backtrace: String,
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub enum ImageFormat {
        Png,
        Jpeg,
    }

    #[derive(Serialize, Deserialize, Debug, Clone)]
    pub struct ExtractFrameCommand {
        pub src: String,
        pub original_src: String,
        pub time: f64,
        pub transparent: bool,
        pub tone_mapped: bool,
    }

    #[derive(Serialize, Deserialize, Debug, Clone)]
    #[allow(non_snake_case)]
    pub struct GetSilences {
        pub src: String,
        pub noiseThresholdInDecibels: f64,
        pub minDurationInSeconds: f64,
    }

    #[derive(Serialize, Deserialize, Debug, Clone)]
    pub struct StartPayLoad {
        pub concurrency: usize,
        pub maximum_frame_cache_size_in_bytes: Option<u64>,
        pub verbose: bool,
    }

    #[derive(Serialize, Deserialize, Debug, Clone)]
    pub struct GetOpenVideoStats {}

    #[derive(Serialize, Deserialize, Debug, Clone)]
    pub struct DeliberatePanic {}

    #[derive(Serialize, Deserialize, Debug, Clone)]
    pub struct CloseAllVideos {}

    #[derive(Serialize, Deserialize, Debug, Clone)]
    pub struct OpenVideoStats {
        pub open_streams: usize,
        pub frames_in_cache: usize,
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub enum KnownCodecs {
        #[serde(rename = "h264")]
        H264,
        #[serde(rename = "h265")]
        H265,
        #[serde(rename = "vp8")]
        Vp8,
        #[serde(rename = "vp9")]
        Vp9,
        #[serde(rename = "av1")]
        Av1,
        #[serde(rename = "prores")]
        ProRes,
        #[serde(rename = "unknown")]
        Unknown,
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub enum KnownAudioCodecs {
        #[serde(rename = "opus")]
        Opus,
        #[serde(rename = "aac")]
        Aac,
        #[serde(rename = "mp3")]
        Mp3,
        #[serde(rename = "pcm-f16le")]
        PcmF16Le,
        #[serde(rename = "pcm-f24le")]
        PcmF24Le,
        #[serde(rename = "pcm-f32be")]
        PcmF32be,
        #[serde(rename = "pcm-s16be")]
        PcmS16be,
        #[serde(rename = "pcm-s16le")]
        PcmS16le,
        #[serde(rename = "pcm-f32le")]
        PcmF32le,
        #[serde(rename = "pcm-s32be")]
        PcmS32be,
        #[serde(rename = "pcm-s32le")]
        PcmS32le,
        #[serde(rename = "pcm-s64be")]
        PcmS64be,
        #[serde(rename = "pcm-s64le")]
        PcmS64le,
        #[serde(rename = "pcm-u16be")]
        PcmU16be,
        #[serde(rename = "pcm-u16le")]
        PcmU16le,
        #[serde(rename = "pcm-u24be")]
        PcmU24be,
        #[serde(rename = "pcm-u24le")]
        PcmU24le,
        #[serde(rename = "pcm-u32be")]
        PcmU32be,
        #[serde(rename = "pcm-u32le")]
        PcmU32le,
        #[serde(rename = "pcm-u8")]
        PcmU8,
        #[serde(rename = "pcm-f64be")]
        PcmF64be,
        #[serde(rename = "pcm-s24be")]
        PcmS24be,
        #[serde(rename = "pcm-s24le")]
        PcmS24le,
        #[serde(rename = "pcm-s8")]
        PcmS8,
        #[serde(rename = "pcm-s16be-planar")]
        PcmS16bePlanar,
        #[serde(rename = "pcm-s8-planar")]
        PcmS8Planar,
        #[serde(rename = "pcm-s24le-planar")]
        PcmS24lePlanar,
        #[serde(rename = "pcm-s32le-planar")]
        PcmS32lePlanar,
        #[serde(rename = "vorbis")]
        Vorbis,
        #[serde(rename = "unknown")]
        Unknown,
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub enum KnownColorSpaces {
        #[serde(rename = "rgb")]
        RGB,
        #[serde(rename = "bt601")]
        BT601,
        #[serde(rename = "bt709")]
        BT709,
        #[serde(rename = "bt2020-ncl")]
        BT2020NCL,
        #[serde(rename = "bt2020-cl")]
        BT2020CL,
        #[serde(rename = "fcc")]
        FCC,
        #[serde(rename = "bt470bg")]
        BT470BG,
        #[serde(rename = "smpte170m")]
        SMPTE170M,
        #[serde(rename = "smpte240m")]
        SMPTE240M,
        #[serde(rename = "ycgco")]
        YCGCO,
        #[serde(rename = "smpte2085")]
        SMPTE2085,
        #[serde(rename = "chroma-derived-ncl")]
        CHROMADERIVEDNCL,
        #[serde(rename = "chroma-derived-cl")]
        CHROMADERIVEDCL,
        #[serde(rename = "ictcp")]
        ICTCP,
        #[serde(rename = "unknown")]
        Unknown,
    }

    #[derive(Serialize, Deserialize, Debug)]
    #[allow(non_snake_case)]
    pub struct VideoMetadata {
        pub fps: f32,
        pub width: u32,
        pub height: u32,
        pub durationInSeconds: Option<f64>,
        pub codec: KnownCodecs,
        pub canPlayInVideoTag: bool,
        pub supportsSeeking: bool,
        pub colorSpace: KnownColorSpaces,
        pub audioCodec: Option<KnownAudioCodecs>,
        pub audioFileExtension: Option<String>,
        pub pixelFormat: Option<String>,
    }

    #[derive(Serialize, Deserialize, Debug)]
    #[allow(non_snake_case)]
    pub struct SilentParts {
        pub startInSeconds: f64,
        pub endInSeconds: f64,
    }

    #[derive(Serialize, Deserialize, Debug)]
    #[allow(non_snake_case)]
    pub struct GetSilentPartsResponse {
        pub silentParts: Vec<SilentParts>,
        pub durationInSeconds: f64,
    }

    #[derive(Serialize, Deserialize, Debug, Clone)]
    pub struct FreeUpMemory {
        pub remaining_bytes: u64,
    }

    #[derive(Serialize, Deserialize, Debug, Clone)]
    pub struct EchoPayload {
        pub message: String,
    }

    #[derive(Serialize, Deserialize, Debug, Clone)]
    pub struct GetVideoMetadata {
        pub src: String,
    }

    #[derive(Serialize, Deserialize, Debug, Clone)]
    pub struct ExtractAudio {
        pub input_path: String,
        pub output_path: String,
    }

    #[derive(Clone, Serialize, Deserialize, Debug)]
    pub struct DeleteFramesFromCache {
        pub maximum_frame_cache_size_in_bytes: u64,
    }

    #[derive(Serialize, Deserialize, Debug, Clone)]
    pub struct Eof {}

    #[derive(Serialize, Deserialize, Debug, Clone)]
    #[serde(tag = "type", content = "params")]
    pub enum CliInputCommandPayload {
        ExtractFrame(ExtractFrameCommand),
        StartLongRunningProcess(StartPayLoad),
        DeliberatePanic(DeliberatePanic),
        CloseAllVideos(CloseAllVideos),
        GetOpenVideoStats(GetOpenVideoStats),
        FreeUpMemory(FreeUpMemory),
        Echo(EchoPayload),
        GetVideoMetadata(GetVideoMetadata),
        GetSilences(GetSilences),
        ExtractAudio(ExtractAudio),
        Eof(Eof),
        DeleteFramesFromCache(DeleteFramesFromCache),
    }

    #[derive(Serialize, Deserialize, Debug, Clone)]
    pub struct CliInputCommand {
        pub payload: CliInputCommandPayload,
        pub nonce: String,
    }

    #[derive(Serialize, Deserialize, Debug, Clone)]
    pub struct CliInputAndMaxCacheSize {
        pub cli_input: CliInputCommand,
        pub max_cache_size: u64,
    }

    pub fn parse_cli(json: &str) -> Result<CliInputCommand, ErrorWithBacktrace> {
        let cli_input: CliInputCommand = serde_json::from_str(json)?;

        return Ok(cli_input);
    }
}
