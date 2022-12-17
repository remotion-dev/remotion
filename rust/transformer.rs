use image::{ImageBuffer, Rgba, RgbaImage};
use std::env;
use std::fs::File;

extern crate png;

fn main() -> Result<(), std::io::Error> {
    let args: Vec<String> = env::args().collect();

    let query = &args[1];
    let canvas_width = args[2].parse::<u32>().unwrap();
    let canvas_height = args[3].parse::<u32>().unwrap();

    let mut _img: RgbaImage = ImageBuffer::new(canvas_width, canvas_height);

    let decoder = png::Decoder::new(File::open(query).unwrap());
    let mut reader = decoder.read_info().unwrap();

    let mut buf = vec![0; reader.output_buffer_size()];
    let info = reader.next_frame(&mut buf).unwrap();

    let bytes = &buf[..info.buffer_size()];

    let len = bytes.len();

    for y in 0..info.height {
        for x in 0..info.width {
            let r = bytes[((y * info.width + x) * 4) as usize];
            let g = bytes[((y * info.width + x) * 4 + 1) as usize];
            let b = bytes[((y * info.width + x) * 4 + 2) as usize];
            let a = bytes[((y * info.width + x) * 4 + 3) as usize];

            let array: [u8; 4] = [r, g, b, a];
            let px: Rgba<u8> = Rgba(array);
            _img.put_pixel(x, y, px)
        }
    }

    println!("{}", len);

    let height = info.height;
    let width = info.width;

    // TODO: Handle error
    let res = _img.save("img.png");

    print!("{} {} {} {}\n", height, width, canvas_width, canvas_height);

    Ok(())
}
