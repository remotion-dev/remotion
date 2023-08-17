use std::fs::File;

use arboard::Clipboard;

use crate::errors::ErrorWithBacktrace;

pub fn copy_to_clipboard(src: String) -> Result<Vec<u8>, ErrorWithBacktrace> {
    let mut clipboard = Clipboard::new().unwrap();

    let file = File::open(src)?;
    let decoder = png::Decoder::new(file);
    let mut reader = decoder.read_info()?;

    let size = reader.output_buffer_size();
    let mut buf = vec![0; size];
    let info = reader.next_frame(&mut buf)?;
    let bytes = &buf[..info.buffer_size()];

    match clipboard.set_image(arboard::ImageData {
        width: info.width as usize,
        height: info.height as usize,
        bytes: std::borrow::Cow::Borrowed(bytes),
    }) {
        Ok(_) => {}
        Err(e) => Err(ErrorWithBacktrace::from(std::io::Error::new(
            std::io::ErrorKind::Other,
            e.to_string(),
        )))?,
    };
    Ok(Vec::new())
}
