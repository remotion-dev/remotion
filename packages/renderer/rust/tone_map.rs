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

pub fn make_tone_map_filtergraph(graph: FilterGraph) -> Result<(Graph, bool), ffmpeg_next::Error> {
    let mut filter = filter::Graph::new();

    let original_width = graph.original_width;
    let original_height = graph.original_height;
    let pixel_format = graph.format;
    let time_base = graph.time_base;
    let aspect_ratio = graph.aspect_ratio;
    let video_primaries = graph.video_primaries;
    let transfer_characteristic = graph.transfer_characteristic;
    let color_range = graph.color_range;
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
        TransferCharacteristic::Unspecified => "input",
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

    let range_in = match color_range {
        color::Range::MPEG => "tv",
        color::Range::JPEG => "pc",
        _ => "input",
    };

    let matrix_is_target =
        matrix_in == "input" || matrix_in == "470bg" || matrix_in == "709" || matrix_in == "170m";
    let transfer_is_target = transfer_in == "input" || transfer_in == "709";
    let primaries_is_target = primaries == "input" || primaries == "709" || primaries == "170m";

    let is_bt_601 = matrix_is_target && transfer_is_target && primaries_is_target;

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

    Ok((filter, !is_bt_601))
}
