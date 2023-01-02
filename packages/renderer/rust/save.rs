use std::{
    fs::File,
    io::{self, BufWriter, Write},
    path::Path,
    time::Instant,
};

use byteorder::{LittleEndian, WriteBytesExt};
use jpeg_encoder::Encoder;
use tiff::encoder::{colortype, TiffEncoder};

fn create_bitmap_header(width: u32, height: u32, data: &[u8]) -> Vec<u8> {
    let mut header = Vec::new();
    const BITMAP_HEADER_SIZE: u32 = 14;
    const BITMAP_INFO_HEADER_SIZE: u32 = 40;

    // Bitmap file header
    header.write_all(b"BM").unwrap(); // Magic number
    header
        .write_u32::<LittleEndian>(BITMAP_HEADER_SIZE + BITMAP_INFO_HEADER_SIZE + data.len() as u32)
        .unwrap(); // File size
    header.write_u16::<LittleEndian>(0).unwrap(); // Reserved
    header.write_u16::<LittleEndian>(0).unwrap(); // Reserved
    header
        .write_u32::<LittleEndian>(BITMAP_HEADER_SIZE + BITMAP_INFO_HEADER_SIZE)
        .unwrap(); // Pixel data offset

    // Bitmap info header
    header
        .write_u32::<LittleEndian>(BITMAP_INFO_HEADER_SIZE)
        .unwrap(); // Header size
    header.write_i32::<LittleEndian>(width as i32).unwrap(); // Width
    header.write_i32::<LittleEndian>(height as i32).unwrap(); // Height
    header.write_u16::<LittleEndian>(1).unwrap(); // Number of planes
    header.write_u16::<LittleEndian>(32).unwrap(); // Bits per pixel
    header.write_u32::<LittleEndian>(0).unwrap(); // Compression
    header.write_u32::<LittleEndian>(data.len() as u32).unwrap(); // Image size
    header.write_i32::<LittleEndian>(0).unwrap(); // X pixels per meter
    header.write_i32::<LittleEndian>(0).unwrap(); // Y pixels per meter
    header.write_u32::<LittleEndian>(0).unwrap(); // Number of colors
    header.write_u32::<LittleEndian>(0).unwrap(); // Important colors

    header
}

pub fn save_as_bmp(width: u32, height: u32, data: &[u8], output: String) -> io::Result<()> {
    println!("Saving as BMP");
    let mut file = match File::create(output) {
        Ok(content) => content,
        Err(err) => return Err(err),
    };

    match file.write_all(&create_bitmap_header(width, height, data)) {
        Ok(_) => (),
        Err(err) => return Err(err),
    };

    let mut bgra = vec![0; data.len()];

    for i in (0..data.len()).step_by(4) {
        bgra[i] = data[i / 4 * 4 + 2];
        bgra[i + 1] = data[i / 4 * 4 + 1];
        bgra[i + 2] = data[i / 4 * 4];
        bgra[i + 3] = data[i / 4 * 4 + 3]
    }

    match file.write_all(&bgra) {
        Ok(_) => (),
        Err(err) => return Err(err),
    };
    file.flush()
}

pub fn save_as_tiff(width: u32, height: u32, data: &[u8], output: String) -> io::Result<()> {
    let mut file = match File::create(output) {
        Ok(content) => content,
        Err(err) => return Err(err),
    };

    let mut tiff = TiffEncoder::new(&mut file).unwrap();

    let mut image = tiff.new_image::<colortype::RGBA8>(width, height).unwrap();
    image.encoder();
    image.write_data(&data).unwrap();
    Ok(())
}

pub fn save_as_jpeg(
    width: u32,
    height: u32,
    data: &[u8],
    output: String,
) -> Result<(), std::io::Error> {
    let start = Instant::now();

    let encoder = match Encoder::new_file(output, 80) {
        Ok(content) => content,
        Err(_) => {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "could not create JPEG encoder",
            ))
        }
    };

    let width_u16: u16 = match width.try_into() {
        Ok(content) => content,
        Err(_) => {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "could not convert width to u16",
            ))
        }
    };
    let height_u16: u16 = match height.try_into() {
        Ok(content) => content,
        Err(_) => {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "could not convert height to u16",
            ))
        }
    };

    match encoder.encode(&data, width_u16, height_u16, jpeg_encoder::ColorType::Rgba) {
        Ok(_) => (),
        Err(_) => {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "could not encode into JPEG",
            ))
        }
    };

    let duration = start.elapsed();
    println!("Save as JPEG: {:?}", duration);

    Ok(())
}

pub fn save_as_png(
    width: u32,
    height: u32,
    data: &[u8],
    output: String,
) -> Result<(), std::io::Error> {
    let path = Path::new(&output);
    let file = match File::create(path) {
        Ok(content) => content,
        Err(err) => return Err(err),
    };
    let ref mut w = BufWriter::new(file);

    let mut encoder = png::Encoder::new(w, width, height);
    encoder.set_color(png::ColorType::Rgba);
    encoder.set_depth(png::BitDepth::Eight);
    encoder.set_source_gamma(png::ScaledFloat::from_scaled(45455)); // 1.0 / 2.2, scaled by 100000
    encoder.set_source_gamma(png::ScaledFloat::new(1.0 / 2.2)); // 1.0 / 2.2, unscaled, but rounded
    let source_chromaticities = png::SourceChromaticities::new(
        // Using unscaled instantiation here
        (0.31270, 0.32900),
        (0.64000, 0.33000),
        (0.30000, 0.60000),
        (0.15000, 0.06000),
    );
    encoder.set_source_chromaticities(source_chromaticities);
    let mut writer = match encoder.write_header() {
        Ok(content) => content,
        Err(err) => return Err(err.into()),
    };

    match writer.write_image_data(&data) {
        Ok(_) => (),
        Err(err) => return Err(err.into()),
    };
    Ok(())
}
