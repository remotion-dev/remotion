use ffmpeg_next::{
    color::{self, transfer_characteristic, Primaries, TransferCharacteristic},
    filter::{self, Graph},
    Rational,
};

use crate::global_printer::_print_verbose;

pub fn make_tone_map_filtergraph(
    original_width: u32,
    original_height: u32,
    format: &str,
    time_base: Rational,
    video_primaries: Primaries,
    transfer_characteristic: transfer_characteristic::TransferCharacteristic,
    space: color::Space,
    color_range: color::Range,
    aspect_ratio: Rational,
) -> Result<Graph, ffmpeg_next::Error> {
    let mut filter = filter::Graph::new();
    let args = format!(
        "width={}:height={}:pix_fmt={}:time_base={}/{}:sar={}/{}",
        original_width,
        original_height,
        format,
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
        TransferCharacteristic::Unspecified => "input",
        _ => "input",
    };

    let matrix_in = match space {
        color::Space::BT2020NCL => "2020_ncl",
        color::Space::BT2020CL => "2020_cl",
        color::Space::BT470BG => "470bg",
        color::Space::BT709 => "709",
        color::Space::SMPTE170M => "170m",
        color::Space::Unspecified => "input",
        _ => "input",
    };

    let range_in = match color_range {
        color::Range::MPEG => "tv",
        color::Range::JPEG => "pc",
        _ => "input",
    };

    let is_bt_601 = matrix_in == "input" && transfer_in == "input" && primaries == "input";

    let filter_string  = match  is_bt_601 {
        false => format!(
          "zscale=t=linear:npl=100,format=gbrpf32le,zscale=primaries={},tonemap=tonemap=hable:desat=0,zscale=transferin={}:transfer=709:matrixin={}:matrix=bt709:rangein={}:range=pc,format=bgr24", 
          primaries,
          transfer_in,
          matrix_in,
          range_in
        ),
        true => "copy".to_string()
    };

    _print_verbose(&format!("Creating tone-mapping filter {}", filter_string)).unwrap();

    filter
        .output("in", 0)?
        .input("out", 0)?
        .parse(&filter_string)?;

    filter.validate()?;

    Ok(filter)
}
