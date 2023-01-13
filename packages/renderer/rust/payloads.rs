// Must keep this file synced with payload.ts!

extern crate serde;
extern crate serde_json;

pub mod payloads {
    use crate::errors;
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize, Debug)]
    pub struct SvgLayer {
        pub markup: String,
        pub x: u32,
        pub y: u32,
        pub width: u32,
        pub height: u32,
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub struct VideoLayer {
        pub src: String,
        pub frame: u32,
        pub x: u32,
        pub y: u32,
        pub width: u32,
        pub height: u32,
    }

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
        VideoFrame(VideoLayer),
        SvgImage(SvgLayer),
        PngImage(ImageLayer),
        JpgImage(ImageLayer),
        Solid(SolidLayer),
    }

    #[derive(Serialize, Debug)]
    pub struct ErrorPayload {
        pub error: String,
        pub backtrace: String,
        pub msg_type: String,
    }

    #[derive(Serialize, Debug)]
    pub struct TaskDonePayload {
        pub nonce: u32,
        pub time: u128,
        pub msg_type: String,
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub enum ImageFormat {
        Png,
        Jpeg,
        Bmp,
        Tiff,
        AddToH264,
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub struct CompositorCommand {
        v: u8,
        pub nonce: u32,
        pub output: String,
        pub width: u32,
        pub height: u32,
        pub layers: Vec<Layer>,
        pub output_format: ImageFormat,
    }

    pub fn parse_command(json: &str) -> CompositorCommand {
        let cli_input: CompositorCommand = match serde_json::from_str(json) {
            Ok(content) => content,
            Err(err) => errors::handle_error(&err),
        };

        return cli_input;
    }
}
