use std::io::ErrorKind;

use crate::{errors::ErrorWithBacktrace, global_printer::_print_verbose};
use ffmpeg_next::{self as remotionffmpeg, codec::Id, encoder, format, media, Rational};

pub fn extract_audio(input_path: &str, output_path: &str) -> Result<(), ErrorWithBacktrace> {
    remotionffmpeg::init().map_err(|e| format!("Initialization error: {}", e))?;

    _print_verbose(&format!(
        "Extracting audio from {} {}",
        input_path, output_path
    ))?;

    let mut ictx = format::input(&input_path)
        .map_err(|e| format!("Error reading input from '{}': {}", input_path, e))?;
    let mut octx = format::output(&output_path)
        .map_err(|e| format!("Error setting up output to '{}': {}", output_path, e))?;

    // Determine the audio codec of the input file
    let audio_stream = match ictx.streams().best(remotionffmpeg::media::Type::Audio) {
        Some(audio_stream) => audio_stream,
        None => Err(std::io::Error::new(
            ErrorKind::Other,
            format!(
                "No audio stream found in '{}'. Ensure the video contains an audio track.",
                input_path
            ),
        ))?,
    };

    let audio_codec_id = unsafe { (*(*(audio_stream).as_ptr()).codecpar).codec_id };

    let mut stream_mapping = vec![-1; ictx.nb_streams() as _];
    let mut ist_time_bases = vec![Rational(0, 1); ictx.nb_streams() as _];
    let mut ost_index = 0;
    for (ist_index, ist) in ictx.streams().enumerate() {
        if ist.parameters().medium() != media::Type::Audio {
            continue;
        }
        stream_mapping[ist_index] = ost_index;
        ist_time_bases[ist_index] = ist.time_base();
        ost_index += 1;
        let mut ost = octx
            .add_stream(encoder::find(Id::None))
            .map_err(|e| format!("Error adding stream: {}", e))?;
        ost.set_parameters(ist.parameters());
        unsafe {
            (*ost.parameters().as_mut_ptr()).codec_tag = 0;
        }
    }

    octx.write_header().map_err(|e| {
        if e.to_string().contains("ADTS muxer")
            && audio_codec_id != remotionffmpeg::ffi::AVCodecID::AV_CODEC_ID_AAC
        {
            format!(
                "Error: The audio format in '{}' is not AAC, and cannot be saved as an .aac file.",
                input_path
            )
        } else {
            format!(
                "Error writing header to '{}'. Input audio codec: '{:?}'. Error: {}",
                output_path, audio_codec_id, e
            )
        }
    })?;

    loop {
        match ictx.get_next_packet() {
            Ok((stream, mut packet)) => {
                let ist_index = stream.index();
                let ost_index = stream_mapping[ist_index];
                if ost_index < 0 {
                    continue;
                }
                let ost = octx.stream(ost_index as _).unwrap(); // This unwrap can be left as is, since we've ensured the stream exists
                packet.rescale_ts(ist_time_bases[ist_index], ost.time_base());
                packet.set_position(-1);
                packet.set_stream(ost_index as _);
                packet
                    .write_interleaved(&mut octx)
                    .map_err(|e| format!("Error writing packet: {}", e))?;
            }
            Err(remotionffmpeg::Error::Eof) => break, // Break on end of file.
            Err(err) => {
                return Err(ErrorWithBacktrace::from(format!(
                    "Error processing packet: {}",
                    err
                )))
            }
        };
    }

    octx.write_trailer()
        .map_err(|e| format!("Error writing trailer: {}", e))?;
    Ok(())
}
