// Must keep this file synced with payload.ts!

extern crate serde;
extern crate serde_json;

pub mod payloads {
    use crate::errors::PossibleErrors;
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
    pub struct ExtractFrameCommand {
        pub input: String,
        pub output: String,
        pub time: f64,
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub struct StartPayLoad {}

    #[derive(Serialize, Deserialize, Debug)]
    #[serde(tag = "type", content = "params")]
    pub enum CliInputCommand {
        ExtractFrame(ExtractFrameCommand),
        Compose(CliGenerateImageCommand),
        StartLongRunningProcess(StartPayLoad),
    }

    pub fn parse_cli(json: &str) -> Result<CliInputCommand, PossibleErrors> {
        let cli_input: CliInputCommand = serde_json::from_str(json)?;

        return Ok(cli_input);
    }
}
