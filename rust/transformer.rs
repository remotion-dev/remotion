use image::{GenericImage, GenericImageView, ImageBuffer, RgbImage};
use std::env;
use std::fs::File;

extern crate png;

fn main() {
    let args: Vec<String> = env::args().collect();

    let query = &args[1];
    let canvas_width = args[2].parse::<u32>().unwrap();
    let canvas_height = args[3].parse::<u32>().unwrap();

    let decoder = png::Decoder::new(File::open(query).unwrap());
    let reader = decoder.read_info().unwrap();

    let info = reader.info();

    let height = info.height;
    let width = info.width;

    print!("{} {} {} {}\n", height, width, canvas_width, canvas_height);
}
