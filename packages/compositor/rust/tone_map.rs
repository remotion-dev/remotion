use ffmpeg_next::{
    color::{self, transfer_characteristic, Primaries, TransferCharacteristic},
    filter::{self, Graph},
    util::format,
    Rational,
};

use crate::global_printer::_print_verbose;

#[derive(Clone, Copy)]
pub struct FilterGraph {
    pub original_width: u32,
    pub original_height: u32,
    pub format: format::Pixel,
    pub time_base: Rational,
    pub video_primaries: Primaries,
    pub transfer_characteristic: transfer_characteristic::TransferCharacteristic,
    pub color_space: color::Space,
    pub color_range: color::Range,
    pub aspect_ratio: Rational,
}

pub fn make_tone_map_filtergraph(graph: FilterGraph) -> Result<Option<Graph>, ffmpeg_next::Error> {
    let mut filter = filter::Graph::new();

    let original_width = graph.original_width;
    let original_height = graph.original_height;
    let pixel_format = graph.format;

    if pixel_format == format::Pixel::None {
        return Ok(None);
    }

    let time_base = graph.time_base;
    let aspect_ratio = graph.aspect_ratio;
    let video_primaries = graph.video_primaries;
    let transfer_characteristic = graph.transfer_characteristic;
    let color_space = graph.color_space;

    let args = format!(
        "width={}:height={}:pix_fmt={}:time_base={}/{}:sar={}/{}",
        original_width,
        original_height,
        format!("{:?}", pixel_format).to_lowercase(),
        time_base.0,
        time_base.1,
        aspect_ratio.0,
        aspect_ratio.1
    );

    filter.add(&filter::find("buffer").unwrap(), "in", &args)?;
    filter.add(&filter::find("buffersink").unwrap(), "out", "")?;

    let primaries = match video_primaries {
        Primaries::BT709 => "709",
        Primaries::BT2020 => "2020",
        Primaries::SMPTE240M => "240m",
        Primaries::SMPTE170M => "170m",
        Primaries::Unspecified => "input",
        _ => "input",
    };

    let transfer_in = match transfer_characteristic {
        TransferCharacteristic::BT2020_10 => "2020_10",
        TransferCharacteristic::BT2020_12 => "2020_12",
        TransferCharacteristic::BT709 => "709",
        TransferCharacteristic::Linear => "linear",
        TransferCharacteristic::ARIB_STD_B67 => "arib-std-b67",
        // Handle file that was not tagged with transfer characteristic
        // by z0w0 on Discord (03/21/2024)
        TransferCharacteristic::Unspecified => match video_primaries {
            Primaries::BT2020 => "2020_10",
            _ => "input",
        },
        _ => "input",
    };

    let matrix_in = match color_space {
        color::Space::BT2020NCL => "2020_ncl",
        color::Space::BT2020CL => "2020_cl",
        color::Space::BT470BG => "470bg",
        color::Space::BT709 => "709",
        color::Space::SMPTE170M => "170m",
        color::Space::Unspecified => "input",
        _ => "input",
    };

    let matrix_is_target = matrix_in == "input"
        || matrix_in == "470bg"
        || matrix_in == "709"
        || matrix_in == "170m"
        || matrix_in == "2020_ncl"; // adding matrix_in == 2020_ncl and primaries == 2020 after this message: https://discord.com/channels/809501355504959528/990308056627806238/1256183797041336370
                                    // shampoo-bt2020ncl.mp4 in testbed
    let transfer_is_target = transfer_in == "input" || transfer_in == "709";
    let primaries_is_target =
        primaries == "input" || primaries == "709" || primaries == "170m" || primaries == "2020";

    // zimg does not yet support HLG
    // Submitted video: hlg.mp4 by Augie

    // we get a crash on
    // > matrix_in: input transfer_in: input primaries: 2020 transfer_characteristic: ARIB_STD_B67
    // but actually this is supported (clean_shoes.mp4 in testbed):
    // > matrix_in: 2020_ncl transfer_in: input primaries: 2020 transfer_characteristic: ARIB_STD_B67

    // Potentially fixed in zimg 3.0
    // https://github.com/sekrit-twc/zimg/blob/master/ChangeLog

    let is_unsupported =
        transfer_characteristic == TransferCharacteristic::ARIB_STD_B67 && matrix_in == "input";
    let should_convert =
        !(matrix_is_target && transfer_is_target && primaries_is_target) && !is_unsupported;

    let filter_string = match should_convert {
        false => "copy".to_string(),
        true => {
            let tin_value = match transfer_characteristic {
                // Handle file that was not tagged with transfer characteristic
                // If a file is not tagged with transfer characteristic, but the primaries are BT2020, we assume it's BT2020_10
                // Otherwise, we found it is better to leave the defaults
                // by z0w0 on Discord (03/21/2024)
                TransferCharacteristic::Unspecified => match video_primaries {
                    Primaries::BT2020 => "2020_10",
                    _ => "input",
                },
                _ => "input",
            };
            format!("zscale=tin={}:t=linear:npl=100,format=gbrpf32le,zscale=primaries=709,tonemap=tonemap=hable:desat=0,zscale=transfer=709:matrix=bt709:range=pc,format=bgr24", tin_value).to_string()
        }
    };

    if filter_string != "copy" {
        _print_verbose(&format!("Creating tone-mapping filter {}", filter_string)).unwrap();
    }

    filter
        .output("in", 0)?
        .input("out", 0)?
        .parse(&filter_string)?;

    filter.validate()?;

    if should_convert {
        return Ok(Some(filter));
    } else {
        return Ok(None);
    }
}
