extern crate bindgen;
extern crate ffmpeg_next as ffmpeg;

fn main() {
    ffmpeg::init().unwrap();

    println!("Hello, world!");
}
