// Must keep this file synced with payload.ts!

extern crate serde;
extern crate serde_json;

pub mod payloads {
    use crate::errors;
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
        Image(ImageLayer),
        Solid(SolidLayer),
    }

    #[derive(Serialize, Deserialize, Debug)]
    pub struct CliInput {
        v: u8,
        pub output: String,
        pub width: u32,
        pub height: u32,
        pub layers: Vec<Layer>,
    }

    pub fn parse_cli(json: &str) -> CliInput {
        let cli_input: CliInput = match serde_json::from_str(json) {
            Ok(content) => content,
            Err(err) => errors::handle_error(&err),
        };

        return cli_input;
    }
}
