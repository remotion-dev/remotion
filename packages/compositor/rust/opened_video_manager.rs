extern crate ffmpeg_next as remotionffmpeg;

use ffmpeg_next::Rational;

use crate::{
    errors::ErrorWithBacktrace,
    frame_cache_manager::FrameCacheManager,
    global_printer::_print_debug,
    logger::log_callback,
    opened_stream::{self, calc_position, OpenedStream},
    opened_video::is_frame_cache_empty,
    select_right_thread::{OpenStream, THREAD_MAP},
};

pub struct OpenedVideoManager {
    streams: Vec<OpenedStream>,
}

pub fn make_opened_stream_manager() -> Result<OpenedVideoManager, ErrorWithBacktrace> {
    remotionffmpeg::init()?;
    remotionffmpeg::log::set_callback(Some(log_callback));
    Ok(OpenedVideoManager { streams: vec![] })
}

impl OpenedVideoManager {
    pub fn get_open_video_streams(&self) -> Result<usize, ErrorWithBacktrace> {
        return Ok(self.streams.len());
    }

    pub fn get_any_stream_with_src(
        &mut self,
        src: &str,
    ) -> Result<Option<&OpenedStream>, ErrorWithBacktrace> {
        for i in 0..self.streams.len() {
            let stream = self.streams.get(i).unwrap();
            if stream.src != src {
                continue;
            }
            return Ok(Some(stream));
        }
        Ok(None)
    }

    pub fn get_position_and_threshold_of_video(
        &mut self,
        time: f64,
        src: &str,
    ) -> Result<Option<(i64, i64)>, ErrorWithBacktrace> {
        let opt = self.get_any_stream_with_src(src)?;
        if opt.is_none() {
            return Ok(None);
        }
        let vid = opt.unwrap();

        // The requested position in the video.
        let position = calc_position(time, vid.time_base);

        let is_variable_fps = vid.fps.denominator() == 0 || vid.fps.numerator() == 0;
        let time_of_one_frame_in_seconds =
            1.0 / (vid.fps.numerator() as f64 / vid.fps.denominator() as f64);

        // How much the distance between 1 frame is in the videos internal time format.
        let one_frame_in_time_base = calc_position(time_of_one_frame_in_seconds, vid.time_base);

        // If a video has no FPS, take a high threshold, like 10fps
        let threshold = match is_variable_fps {
            true => calc_position(1.0, vid.time_base),
            false => one_frame_in_time_base,
        };
        Ok(Some((position, threshold)))
    }

    pub fn get_video_index(
        &mut self,
        src: &str,
        original_src: &str,
        transparent: bool,
        time: f64,
        thread_index: usize,
    ) -> Result<usize, ErrorWithBacktrace> {
        for i in 0..self.streams.len() {
            let stream = self.streams.get(i).unwrap();
            let max_stream_position = calc_position(time + 5.0, stream.time_base);
            let min_stream_position = calc_position(time - 5.0, stream.time_base);

            if stream.src != src {
                continue;
            }
            if stream.reached_eof {
                continue;
            }
            if transparent != stream.transparent {
                continue;
            }
            if stream.last_position.unwrap_or(0) > max_stream_position {
                continue;
            }
            if stream.last_position.unwrap_or(0) < min_stream_position {
                continue;
            }
            return Ok(i);
        }

        let stream = opened_stream::open_stream(src, original_src, transparent)?;
        self.streams.push(stream);
        let stream_index = self.streams.len() - 1;
        _print_debug(&format!(
            "Opening new stream on thread {}, src = {}, index = {}, desired time = {}",
            thread_index, original_src, stream_index, time
        ))?;

        Ok(stream_index)
    }

    pub fn get_video(&mut self, index: usize) -> Result<&OpenedStream, ErrorWithBacktrace> {
        Ok(&self.streams.get(index).unwrap())
    }

    pub fn get_frame_id(
        &mut self,
        stream_index: usize,
        time: f64,
        target_position: i64,
        time_base: Rational,
        one_frame_in_time_base: i64,
        threshold: i64,
        tone_mapped: bool,
        frame_cache_manager: &mut FrameCacheManager,
        thread_index: usize,
        max_cache_size: u64,
    ) -> Result<usize, ErrorWithBacktrace> {
        let video = self.streams.get_mut(stream_index).unwrap();
        let frame = video.get_frame(
            stream_index,
            time,
            target_position,
            time_base,
            one_frame_in_time_base,
            threshold,
            tone_mapped,
            frame_cache_manager,
            thread_index,
            max_cache_size,
        )?;
        THREAD_MAP.lock().unwrap().update_stream(
            thread_index,
            stream_index,
            OpenStream {
                src: video.src.clone(),
                last_time: video.last_position.unwrap_or(0) as f64
                    / (video.time_base.1 as f64 / video.time_base.0 as f64),
                id: stream_index,
                transparent: video.transparent,
                duration_in_seconds: frame_cache_manager.get_last_timestamp_in_sec(
                    &video.src,
                    &video.original_src,
                    video.transparent,
                    tone_mapped,
                    video.time_base,
                ),
            },
        );

        Ok(frame)
    }

    pub fn remove_video(
        &mut self,
        src: &str,
        frame_cache_manager: &mut FrameCacheManager,
    ) -> Result<(), ErrorWithBacktrace> {
        self.streams.retain(|stream| stream.src != src);

        frame_cache_manager.remove_frame_cache(src);

        Ok(())
    }

    pub fn close_all_videos(
        &mut self,
        frame_cache_manager: &mut FrameCacheManager,
    ) -> Result<(), ErrorWithBacktrace> {
        self.streams.clear();
        frame_cache_manager.remove_all();

        Ok(())
    }

    pub fn close_videos_if_cache_empty(
        &mut self,
        frame_cache_manager: &mut FrameCacheManager,
    ) -> Result<(), ErrorWithBacktrace> {
        self.streams.retain(|stream_locked| {
            let stream = stream_locked;
            !is_frame_cache_empty(&stream.src, &stream.original_src, frame_cache_manager).unwrap()
        });
        Ok(())
    }
}
