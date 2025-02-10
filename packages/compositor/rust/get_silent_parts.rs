extern crate ffmpeg_next as ffmpeg;

use std::os::raw::{c_char, c_int, c_void};
use std::{io::ErrorKind, sync::Mutex};

use ffmpeg::log::VaListLoggerArg;
use ffmpeg::{codec, filter, format, frame, media};
use lazy_static::lazy_static;

use crate::errors::ErrorWithBacktrace;
use crate::logger::print_message;
use crate::payloads::payloads::{GetSilentPartsResponse, SilentParts};

fn filter(spec: &str, decoder: &codec::decoder::Audio) -> Result<filter::Graph, ffmpeg::Error> {
    let mut filter = filter::Graph::new();

    let args = format!(
        "time_base={}:sample_rate={}:sample_fmt={}:channel_layout=0x{:x}",
        decoder.time_base(),
        decoder.rate(),
        decoder.format().name(),
        decoder.channel_layout().bits()
    );

    let abuffer_filter = filter::find("abuffer").expect("Expected abuffer filter");
    let abuffer_sink_filter = filter::find("abuffersink").expect("Expected abuffersink filter");

    filter.add(&abuffer_filter, "in", &args)?;
    filter.add(&abuffer_sink_filter, "out", "")?;

    filter.output("in", 0)?.input("out", 0)?.parse(spec)?;
    filter.validate()?;

    Ok(filter)
}

struct Transcoder {
    stream: usize,
    filter: filter::Graph,
    decoder: codec::decoder::Audio,
    in_time_base: ffmpeg::Rational,
}

fn transcoder(
    ictx: &mut format::context::Input,
    src: &str,
    filter_spec: &str,
) -> Result<Transcoder, ErrorWithBacktrace> {
    let input = match ictx.streams().best(media::Type::Audio) {
        Some(stream) => stream,
        None => {
            return Err(ErrorWithBacktrace::from(std::io::Error::new(
                ErrorKind::Other,
                format!("Could not find audio stream in {}", src),
            )));
        }
    };

    let context = ffmpeg::codec::context::Context::from_parameters(input.parameters())?;
    let mut decoder = context.decoder().audio()?;

    decoder.set_parameters(input.parameters())?;

    let filter = filter(filter_spec, &decoder)?;

    let in_time_base = decoder.time_base();

    Ok(Transcoder {
        stream: input.index(),
        filter,
        decoder,
        in_time_base,
    })
}

impl Transcoder {
    fn add_frame_to_filter(&mut self, frame: &ffmpeg::Frame) -> Result<(), ErrorWithBacktrace> {
        let in_filter = self.filter.get("in");
        match in_filter {
            Some(mut f) => {
                f.source().add(frame)?;
                Ok(())
            }
            None => Err(ErrorWithBacktrace::from(std::io::Error::new(
                ErrorKind::Other,
                "Could not get in filter".to_string(),
            ))),
        }
    }

    fn flush_filter(&mut self) -> Result<(), ErrorWithBacktrace> {
        let in_filter = self.filter.get("in");
        match in_filter {
            Some(mut f) => {
                f.source().flush()?;
                Ok(())
            }
            None => Err(ErrorWithBacktrace::from(std::io::Error::new(
                ErrorKind::Other,
                "Could not get in filter".to_string(),
            ))),
        }
    }

    fn get_and_process_filtered_frames(&mut self) {
        let mut filtered = frame::Audio::empty();
        while self
            .filter
            .get("out")
            .unwrap()
            .sink()
            .frame(&mut filtered)
            .is_ok()
        {}
    }

    fn send_packet_to_decoder(&mut self, packet: &ffmpeg::Packet) -> Result<(), ffmpeg::Error> {
        self.decoder.send_packet(packet)
    }

    fn send_eof_to_decoder(&mut self) {
        self.decoder.send_eof().unwrap();
    }

    fn receive_and_process_decoded_frames(&mut self) -> Result<(), ErrorWithBacktrace> {
        let mut decoded = frame::Audio::empty();
        while self.decoder.receive_frame(&mut decoded).is_ok() {
            let timestamp = decoded.timestamp();
            decoded.set_pts(timestamp);
            self.add_frame_to_filter(&decoded)?;
            self.get_and_process_filtered_frames();
        }
        Ok(())
    }
}

lazy_static! {
    pub static ref FFMPEG_SILENCES: Mutex<Vec<String>> = Mutex::new(Vec::new());
}

#[derive(PartialEq)]
enum LastOccurrence {
    Start,
    End,
    None,
}

const SILENCE_START: &str = "silence_start: ";
const SILENCE_END: &str = "silence_end: ";

pub fn get_silent_parts(
    input: String,
    filter: String,
) -> Result<GetSilentPartsResponse, ErrorWithBacktrace> {
    // This function is not thread-safe, the FFmpeg messages are stored in a global array.

    ffmpeg::init()?;
    FFMPEG_SILENCES.lock().unwrap().clear();
    ffmpeg::log::set_callback(Some(silence_detection_log_callback));

    let mut ictx = format::input(&input)?;
    let duration = ictx.duration() as f64 / ffmpeg::ffi::AV_TIME_BASE as f64;

    let mut transcoder = transcoder(&mut ictx, &input, &filter)?;

    loop {
        match ictx.get_next_packet() {
            Ok((stream, mut packet)) => {
                if stream.index() == transcoder.stream {
                    packet.rescale_ts(stream.time_base(), transcoder.in_time_base);
                    transcoder.send_packet_to_decoder(&packet)?;
                    transcoder.receive_and_process_decoded_frames()?;
                }
            }
            Err(ffmpeg::Error::Eof) => {
                break;
            }
            Err(err) => Err(std::io::Error::new(ErrorKind::Other, err.to_string()))?,
        };
    }

    transcoder.send_eof_to_decoder();
    transcoder.receive_and_process_decoded_frames()?;

    transcoder.flush_filter()?;
    transcoder.get_and_process_filtered_frames();

    // Wait for last message to be silence end

    let mut silent_parts: Vec<SilentParts> = Vec::new();

    let mut last_occurrence = LastOccurrence::None;
    let mut start = 0.0;

    for silence in &FFMPEG_SILENCES.lock().unwrap().to_vec() {
        if silence.starts_with(SILENCE_START) {
            start = silence
                .trim_start_matches(SILENCE_START)
                .trim()
                .parse::<f64>()
                .unwrap();
            last_occurrence = LastOccurrence::Start;
        }
        if silence.starts_with(SILENCE_END) {
            let end_str = silence.trim_start_matches(SILENCE_END);

            let first_pipe = end_str.split('|').nth(0).expect("Expected pipe");
            if first_pipe.trim().is_empty() {
                continue;
            }
            let end = first_pipe.trim().parse::<f64>().expect("Expected float");
            if last_occurrence == LastOccurrence::Start {
                silent_parts.push(SilentParts {
                    endInSeconds: end,
                    startInSeconds: start.max(0.0),
                });
            }

            last_occurrence = LastOccurrence::End;
        }
    }

    if last_occurrence == LastOccurrence::Start {
        silent_parts.push(SilentParts {
            endInSeconds: duration,
            startInSeconds: start.max(0.0),
        });
    }

    Ok(GetSilentPartsResponse {
        durationInSeconds: duration,
        silentParts: silent_parts,
    })
}

pub unsafe extern "C" fn silence_detection_log_callback(
    _arg1: *mut c_void,
    level: c_int,
    fmt: *const c_char,
    list: VaListLoggerArg,
) {
    let message = ffmpeg_next::log::make_log_message(fmt, list).unwrap();

    if message.starts_with(SILENCE_START) {
        FFMPEG_SILENCES.lock().unwrap().push(message.clone());
        return;
    }

    if message.starts_with(SILENCE_END) {
        FFMPEG_SILENCES.lock().unwrap().push(message.clone());
        return;
    }

    print_message(level, &message)
}
