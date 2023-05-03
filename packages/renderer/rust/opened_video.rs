use remotionffmpeg::{codec::Id, format::Pixel, media::Type, Dictionary, Rational};
use std::sync::{Arc, Mutex};

use crate::{
    errors::ErrorWithBacktrace,
    frame_cache::FrameCache,
    opened_stream::{
        calculate_display_video_size, get_display_aspect_ratio, LastSeek, OpenedStream,
    },
};
extern crate ffmpeg_next as remotionffmpeg;

pub struct OpenedVideo {
    pub opened_streams: Vec<Arc<Mutex<OpenedStream>>>,
    pub transparent_frame_cache: Arc<Mutex<FrameCache>>,
    pub opaque_frame_cache: Arc<Mutex<FrameCache>>,
    pub fps: Rational,
    pub time_base: Rational,
    pub src: String,
}

pub fn open_video(src: &str, transparent: bool) -> Result<OpenedVideo, ErrorWithBacktrace> {
    let (opened_stream, fps, time_base) = open_stream(src, transparent)?;

    let opened_video = OpenedVideo {
        opened_streams: vec![(Arc::new(Mutex::new(opened_stream)))],
        transparent_frame_cache: Arc::new(Mutex::new(FrameCache::new())),
        opaque_frame_cache: Arc::new(Mutex::new(FrameCache::new())),
        fps,
        time_base,
        src: src.to_string(),
    };

    Ok(opened_video)
}

fn open_stream(
    src: &str,
    transparent: bool,
) -> Result<(OpenedStream, Rational, Rational), ErrorWithBacktrace> {
    let mut dictionary = Dictionary::new();
    dictionary.set("fflags", "+genpts");
    let mut input = remotionffmpeg::format::input_with_dictionary(&src, dictionary)?;

    // TODO: Don't open stream and stream_mut, might need to adapt rust-ffmpeg for it
    let stream = match input
        .streams()
        .find(|s| s.parameters().medium() == Type::Video)
    {
        Some(stream) => stream,
        None => {
            return Err(ErrorWithBacktrace::from(
                "No video stream found in input file",
            ));
        }
    };

    let stream_index = stream.index();

    drop(stream);

    let mut_stream = input
        .stream_mut(stream_index)
        .ok_or(ErrorWithBacktrace::from(
            "No video stream found in input file",
        ))?;
    let duration_or_zero = mut_stream.duration().max(0);

    let time_base = mut_stream.time_base();
    let parameters = mut_stream.parameters();

    let mut parameters_cloned = parameters.clone();
    let is_vp8_or_vp9_and_transparent = match transparent {
        true => unsafe {
            let codec_id = (*(*(mut_stream).as_ptr()).codecpar).codec_id;
            let is_vp8 = codec_id == remotionffmpeg::codec::id::get_av_codec_id(Id::VP8);
            let is_vp9 = codec_id == remotionffmpeg::codec::id::get_av_codec_id(Id::VP9);

            if is_vp8 || is_vp9 {
                (*parameters_cloned.as_mut_ptr()).format =
                    remotionffmpeg::util::format::pixel::to_av_pixel_format(Pixel::YUVA420P) as i32;
            }

            if is_vp8 {
                Some("vp8")
            } else if is_vp9 {
                Some("vp9")
            } else {
                None
            }
        },
        false => None,
    };

    let video = remotionffmpeg::codec::context::Context::from_parameters(parameters_cloned)?;

    let decoder = match is_vp8_or_vp9_and_transparent {
        Some("vp8") => video.decoder().video_with_codec("libvpx")?,
        Some("vp9") => video.decoder().video_with_codec("libvpx-vp9")?,
        Some(_) => unreachable!(),
        None => video.decoder().video()?,
    };

    let format = decoder.format();

    let original_width = decoder.width();
    let original_height = decoder.height();
    let fps = mut_stream.avg_frame_rate();

    let aspect_ratio = get_display_aspect_ratio(&mut_stream);

    let (scaled_width, scaled_height) = calculate_display_video_size(
        aspect_ratio.0,
        aspect_ratio.1,
        original_width,
        original_height,
    );

    let opened_stream = OpenedStream {
        stream_index,
        original_height,
        original_width,
        scaled_height,
        scaled_width,
        format,
        video: decoder,
        src: src.to_string(),
        input,
        last_position: LastSeek { resolved_pts: 0 },
        duration_or_zero,
        reached_eof: false,
        transparent,
        pts_offset: None,
    };

    Ok((opened_stream, fps, time_base))
}

impl OpenedVideo {
    pub fn close(&mut self) -> Result<(), ErrorWithBacktrace> {
        self.opened_streams = vec![];

        Ok(())
    }
    pub fn open_new_stream(&mut self, transparent: bool) -> Result<usize, ErrorWithBacktrace> {
        let (opened_stream, _, _) = open_stream(&self.src, transparent)?;
        let arc_mutex = Arc::new(Mutex::new(opened_stream));
        self.opened_streams.push(arc_mutex);
        return Ok(self.opened_streams.len() - 1);
    }

    pub fn close_video_if_frame_cache_empty(&mut self) -> Result<bool, ErrorWithBacktrace> {
        if self.transparent_frame_cache.lock()?.is_empty()
            && self.opaque_frame_cache.lock()?.is_empty()
        {
            self.close()?;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    pub fn get_frame_cache(&self, transparent: bool) -> Arc<Mutex<FrameCache>> {
        if transparent {
            self.transparent_frame_cache.clone()
        } else {
            self.opaque_frame_cache.clone()
        }
    }

    pub fn get_cache_size(&self) -> Result<usize, ErrorWithBacktrace> {
        Ok(self
            .transparent_frame_cache
            .lock()?
            .get_cache_item_count()
            .saturating_add(self.opaque_frame_cache.lock()?.get_cache_item_count()))
    }

    pub fn get_cache_item_from_id(
        &self,
        transparent: bool,
        frame_id: usize,
    ) -> Result<Vec<u8>, ErrorWithBacktrace> {
        match self
            .get_frame_cache(transparent)
            .lock()?
            .get_item_from_id(frame_id)?
        {
            Some(item) => Ok(item),
            None => Err(ErrorWithBacktrace::from("No item found in cache")),
        }
    }

    pub fn get_cache_item_id(
        &self,
        transparent: bool,
        time: i64,
        threshold: i64,
    ) -> Result<Option<usize>, ErrorWithBacktrace> {
        Ok(self
            .get_frame_cache(transparent)
            .lock()?
            .get_item_id(time, threshold)?)
    }
}
