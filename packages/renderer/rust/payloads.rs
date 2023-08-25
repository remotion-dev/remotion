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

    #[derive(Serialize, Deserialize, Debug)]
    #[serde(tag = "type", content = "params")]
    pub enum Layer {
        PngImage(ImageLayer),
        JpgImage(ImageLayer),
        Solid(SolidLayer),
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

    #[derive(Serialize, Deserialize, Debug)]
    pub struct CliGenerateImageCommand {
        pub width: u32,
        pub height: u32,
        pub layers: Vec<Layer>,
        pub output_format: ImageFormat,
        pub output: String,
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub struct CopyImageToClipboard {
        pub src: String,
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub struct ExtractFrameCommand {
        pub src: String,
        pub original_src: String,
        pub time: f64,
        pub transparent: bool,
    }

    #[derive(Serialize, Deserialize, Debug)]
    #[allow(non_snake_case)]
    pub struct GetSilences {
        pub src: String,
        pub noiseThresholdInDecibels: f64,
        pub minDurationInSeconds: f64,
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub struct StartPayLoad {
        pub concurrency: usize,
        pub maximum_frame_cache_size_in_bytes: u128,
        pub verbose: bool,
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub struct GetOpenVideoStats {}

    #[derive(Serialize, Deserialize, Debug)]
    pub struct DeliberatePanic {}

    #[derive(Serialize, Deserialize, Debug)]
    pub struct CloseAllVideos {}

    #[derive(Serialize, Deserialize, Debug)]
    pub struct OpenVideoStats {
        pub open_videos: usize,
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
    #[allow(non_snake_case)]
    pub struct VideoMetadata {
        pub fps: i32,
        pub width: u32,
        pub height: u32,
        pub durationInSeconds: f64,
        pub codec: KnownCodecs,
        pub canPlayInVideoTag: bool,
        pub supportsSeeking: bool,
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

    #[derive(Serialize, Deserialize, Debug)]
    pub struct FreeUpMemory {
        pub remaining_bytes: u128,
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub struct EchoPayload {
        pub message: String,
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub struct GetVideoMetadata {
        pub src: String,
    }

    #[derive(Serialize, Deserialize, Debug)]
    #[serde(tag = "type", content = "params")]
    pub enum CliInputCommandPayload {
        ExtractFrame(ExtractFrameCommand),
        Compose(CliGenerateImageCommand),
        StartLongRunningProcess(StartPayLoad),
        DeliberatePanic(DeliberatePanic),
        CloseAllVideos(CloseAllVideos),
        GetOpenVideoStats(GetOpenVideoStats),
        FreeUpMemory(FreeUpMemory),
        Echo(EchoPayload),
        GetVideoMetadata(GetVideoMetadata),
        CopyImageToClipboard(CopyImageToClipboard),
        GetSilences(GetSilences),
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub struct CliInputCommand {
        pub payload: CliInputCommandPayload,
        pub nonce: String,
    }

    pub fn parse_cli(json: &str) -> Result<CliInputCommand, ErrorWithBacktrace> {
        let cli_input: CliInputCommand = serde_json::from_str(json)?;

        return Ok(cli_input);
    }
}
