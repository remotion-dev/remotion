use std::fs::File;

use arboard::Clipboard;

use crate::errors::ErrorWithBacktrace;

struct ImageBitmap {
    width: usize,
    height: usize,
    bytes: Vec<u8>,
}

fn from_png(src: String) -> Result<ImageBitmap, ErrorWithBacktrace> {
    let file = File::open(src)?;
    let decoder = png::Decoder::new(file);
    let mut reader = decoder.read_info()?;

    let size = reader.output_buffer_size();
    let mut buf = vec![0; size];
    let info = reader.next_frame(&mut buf)?;
    let bytes = buf[..info.buffer_size()].to_vec();

    Ok(ImageBitmap {
        width: info.width as usize,
        height: info.height as usize,
        bytes,
    })
}

fn from_jpeg(src: String) -> Result<ImageBitmap, ErrorWithBacktrace> {
    let file = File::open(src)?;
    let mut decoder = jpeg_decoder::Decoder::new(file);

    let bytes = decoder.decode()?;
    let info = match decoder.info() {
        Some(i) => i,
        None => Err(ErrorWithBacktrace::from(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Could not get info from jpeg",
        )))?,
    };
    Ok(ImageBitmap {
        width: info.width as usize,
        height: info.height as usize,
        bytes: bytes
            .chunks(3)
            .flat_map(|chunk| {
                let mut rgba = Vec::with_capacity(4);
                rgba.extend_from_slice(chunk);
                rgba.push(255); // setting alpha value
                rgba
            })
            .collect(),
    })
}

pub fn copy_to_clipboard(src: String) -> Result<Vec<u8>, ErrorWithBacktrace> {
    let mut clipboard = Clipboard::new().unwrap();

    let suffix = match src.split(".").last() {
        Some(s) => s,
        None => Err(ErrorWithBacktrace::from(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Invalid file suffix",
        )))?,
    };

    let bitmap = match suffix {
        "png" => from_png(src),
        "jpg" => from_jpeg(src),
        "jpeg" => from_jpeg(src),
        _ => Err(ErrorWithBacktrace::from(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("File suffix {} not handled", suffix),
        )))?,
    }?;

    match clipboard.set_image(arboard::ImageData {
        width: bitmap.width,
        height: bitmap.height,
        bytes: std::borrow::Cow::Borrowed(&bitmap.bytes),
    }) {
        Ok(_) => Ok(Vec::new()),
        Err(e) => Err(ErrorWithBacktrace::from(std::io::Error::new(
            std::io::ErrorKind::Other,
            e.to_string(),
        )))?,
    }
}
