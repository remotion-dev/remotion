extern crate ffmpeg_next as ffmpeg;

use std::os::raw::{c_char, c_int, c_void};
use std::path::Path;
use std::sync::Arc;
use std::time;
use std::{io::ErrorKind, sync::Mutex};

use ffmpeg::log::VaListLoggerArg;
use ffmpeg::{codec, filter, format, frame, media};
use lazy_static::lazy_static;

use crate::errors::ErrorWithBacktrace;
use crate::global_printer::_print_verbose;
use crate::logger::print_message;
use crate::payloads::payloads::SilentParts;

fn filter(
    spec: &str,
    decoder: &codec::decoder::Audio,
    encoder: &codec::encoder::Audio,
) -> Result<filter::Graph, ffmpeg::Error> {
    let mut filter = filter::Graph::new();

    let args = format!(
        "time_base={}:sample_rate={}:sample_fmt={}:channel_layout=0x{:x}",
        decoder.time_base(),
        decoder.rate(),
        decoder.format().name(),
        decoder.channel_layout().bits()
    );

    filter.add(&filter::find("abuffer").unwrap(), "in", &args)?;
    filter.add(&filter::find("abuffersink").unwrap(), "out", "")?;

    {
        let mut out = filter.get("out").unwrap();

        out.set_sample_format(encoder.format());
        out.set_channel_layout(encoder.channel_layout());
        out.set_sample_rate(encoder.rate());
    }

    filter.output("in", 0)?.input("out", 0)?.parse(spec)?;
    filter.validate()?;

    println!("{}", filter.dump());

    if let Some(codec) = encoder.codec() {
        if !codec
            .capabilities()
            .contains(ffmpeg::codec::capabilities::Capabilities::VARIABLE_FRAME_SIZE)
        {
            filter
                .get("out")
                .unwrap()
                .sink()
                .set_frame_size(encoder.frame_size());
        }
    }

    Ok(filter)
}

struct Transcoder {
    stream: usize,
    filter: filter::Graph,
    decoder: codec::decoder::Audio,
    encoder: codec::encoder::Audio,
    in_time_base: ffmpeg::Rational,
    out_time_base: ffmpeg::Rational,
}

fn transcoder<P: AsRef<Path>>(
    ictx: &mut format::context::Input,
    octx: &mut format::context::Output,
    path: &P,
    filter_spec: &str,
) -> Result<Transcoder, ffmpeg::Error> {
    let input = ictx
        .streams()
        .best(media::Type::Audio)
        .expect("could not find best audio stream");
    let context = ffmpeg::codec::context::Context::from_parameters(input.parameters())?;
    let mut decoder = context.decoder().audio()?;
    let codec = ffmpeg::encoder::find(octx.format().codec(path, media::Type::Audio))
        .expect("failed to find encoder")
        .audio()?;
    let global = octx
        .format()
        .flags()
        .contains(ffmpeg::format::flag::Flags::GLOBAL_HEADER);

    decoder.set_parameters(input.parameters())?;

    let mut output = octx.add_stream(codec)?;
    let context = ffmpeg::codec::context::Context::from_parameters(output.parameters())?;
    let mut encoder = context.encoder().audio()?;

    let channel_layout = codec
        .channel_layouts()
        .map(|cls| cls.best(decoder.channel_layout().channels()))
        .unwrap_or(ffmpeg::channel_layout::ChannelLayout::STEREO);

    if global {
        encoder.set_flags(ffmpeg::codec::flag::Flags::GLOBAL_HEADER);
    }

    encoder.set_rate(decoder.rate() as i32);
    encoder.set_channel_layout(channel_layout);
    encoder.set_channels(channel_layout.channels());
    encoder.set_format(
        codec
            .formats()
            .expect("unknown supported formats")
            .next()
            .unwrap(),
    );
    encoder.set_bit_rate(decoder.bit_rate());
    encoder.set_max_bit_rate(decoder.max_bit_rate());

    encoder.set_time_base((1, decoder.rate() as i32));
    output.set_time_base((1, decoder.rate() as i32));

    let encoder = encoder.open_as(codec)?;
    output.set_parameters(&encoder);

    let filter = filter(filter_spec, &decoder, &encoder)?;

    let in_time_base = decoder.time_base();
    let out_time_base = output.time_base();

    Ok(Transcoder {
        stream: input.index(),
        filter,
        decoder,
        encoder,
        in_time_base,
        out_time_base,
    })
}

impl Transcoder {
    fn send_frame_to_encoder(&mut self, frame: &ffmpeg::Frame) {
        self.encoder.send_frame(frame).unwrap();
    }

    fn send_eof_to_encoder(&mut self) {
        self.encoder.send_eof().unwrap();
    }

    fn receive_and_process_encoded_packets(&mut self, octx: &mut format::context::Output) {
        let mut encoded = ffmpeg::Packet::empty();
        while self.encoder.receive_packet(&mut encoded).is_ok() {
            encoded.set_stream(0);
            encoded.rescale_ts(self.in_time_base, self.out_time_base);
            encoded.write_interleaved(octx).unwrap();
        }
    }

    fn add_frame_to_filter(&mut self, frame: &ffmpeg::Frame) {
        self.filter.get("in").unwrap().source().add(frame).unwrap();
    }

    fn flush_filter(&mut self) {
        self.filter.get("in").unwrap().source().flush().unwrap();
    }

    fn get_and_process_filtered_frames(&mut self, octx: &mut format::context::Output) {
        let mut filtered = frame::Audio::empty();
        while self
            .filter
            .get("out")
            .unwrap()
            .sink()
            .frame(&mut filtered)
            .is_ok()
        {
            self.send_frame_to_encoder(&filtered);
            self.receive_and_process_encoded_packets(octx);
        }
    }

    fn send_packet_to_decoder(&mut self, packet: &ffmpeg::Packet) {
        self.decoder.send_packet(packet).unwrap();
    }

    fn send_eof_to_decoder(&mut self) {
        self.decoder.send_eof().unwrap();
    }

    fn receive_and_process_decoded_frames(&mut self, octx: &mut format::context::Output) {
        let mut decoded = frame::Audio::empty();
        while self.decoder.receive_frame(&mut decoded).is_ok() {
            let timestamp = decoded.timestamp();
            decoded.set_pts(timestamp);
            self.add_frame_to_filter(&decoded);
            self.get_and_process_filtered_frames(octx);
        }
    }
}

lazy_static! {
    static ref LOCK: Mutex<()> = Mutex::new(());
    pub static ref FFMPEG_SILENCES: Arc<Mutex<Vec<String>>> = Arc::new(Mutex::new(Vec::new()));
}

#[derive(PartialEq)]
enum LastOccurrence {
    Start,
    End,
    None,
}

const SILENCE_START: &str = "silence_start: ";
const SILENCE_END: &str = "silence_end: ";

pub fn get_silences(
    input: String,
    output: String,
    filter: String,
) -> Result<Vec<SilentParts>, ErrorWithBacktrace> {
    // This function is not thread-safe, the FFmpeg messages are stored in a global array.
    let _guard = LOCK.lock().unwrap();

    ffmpeg::init()?;
    FFMPEG_SILENCES.lock().unwrap().clear();
    ffmpeg::log::set_callback(Some(silence_detection_log_callback));

    let mut ictx = format::input(&input).unwrap();
    let mut octx = format::output(&output).unwrap();
    let mut transcoder = transcoder(&mut ictx, &mut octx, &output, &filter).unwrap();

    octx.set_metadata(ictx.metadata().to_owned());
    octx.write_header().unwrap();

    loop {
        match ictx.get_next_packet() {
            Ok((stream, mut packet)) => {
                if stream.index() == transcoder.stream {
                    packet.rescale_ts(stream.time_base(), transcoder.in_time_base);
                    transcoder.send_packet_to_decoder(&packet);
                    transcoder.receive_and_process_decoded_frames(&mut octx);
                }
            }
            Err(ffmpeg::Error::Eof) => {
                break;
            }
            Err(err) => Err(std::io::Error::new(ErrorKind::Other, err.to_string()))?,
        };
    }

    transcoder.send_eof_to_decoder();
    transcoder.receive_and_process_decoded_frames(&mut octx);

    transcoder.flush_filter();
    transcoder.get_and_process_filtered_frames(&mut octx);

    transcoder.send_eof_to_encoder();
    transcoder.receive_and_process_encoded_packets(&mut octx);

    octx.write_trailer().unwrap();

    // Wait for last message to be silence end

    std::thread::spawn(|| loop {
        std::thread::sleep(time::Duration::from_millis(100));
        _print_verbose("sleep");
        let last = FFMPEG_SILENCES.lock().unwrap().last().cloned();

        match last {
            None => {}
            Some(msg) => {
                if msg.contains(SILENCE_END) {
                    break;
                }
            }
        }
    })
    .join()?;

    let mut silent_parts: Vec<SilentParts> = Vec::new();

    let silences: Vec<String> = Vec::new();

    let mut last_occurrence = LastOccurrence::None;
    let mut start = 0.0;

    for silence in &silences {
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

            let end = end_str
                .split('|')
                .nth(0)
                .unwrap()
                .trim()
                .parse::<f64>()
                .unwrap();

            if last_occurrence == LastOccurrence::Start {
                silent_parts.push(SilentParts { end, start });
            }

            last_occurrence = LastOccurrence::End;
        }
    }

    Ok(silent_parts)
}

lazy_static::lazy_static! {}

pub unsafe extern "C" fn silence_detection_log_callback(
    _arg1: *mut c_void,
    level: c_int,
    fmt: *const c_char,
    list: VaListLoggerArg,
) {
    let message = ffmpeg_next::log::make_log_message(fmt, list).unwrap();
    print_message(level, &message);

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
