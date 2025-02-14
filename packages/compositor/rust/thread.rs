use std::sync::mpsc::{Receiver, Sender};

use crate::{
    errors::ErrorWithBacktrace,
    ffmpeg,
    frame_cache_manager::{make_frame_cache_manager, FrameCacheManager},
    global_printer::{self, print_error},
    opened_video_manager::{make_opened_stream_manager, OpenedVideoManager},
    payloads::payloads::{
        CliInputAndMaxCacheSize, CliInputCommandPayload, DeleteFramesFromCache,
        ExtractFrameCommand, OpenVideoStats,
    },
};

pub struct WorkerThread {
    thread_index: usize,
    frame_cache_manager: FrameCacheManager,
    opened_video_manager: OpenedVideoManager,
    send_close_video_to_main_thread: Sender<()>,
    receive_in_thread: Receiver<CliInputAndMaxCacheSize>,
    send_video_stats_to_main_thread: Sender<OpenVideoStats>,
}

impl WorkerThread {
    pub fn new(
        thread_index: usize,
        send_close_video_to_main_thread: Sender<()>,
        receive_in_thread: Receiver<CliInputAndMaxCacheSize>,
        send_video_stats_to_main_thread: Sender<OpenVideoStats>,
    ) -> Self {
        let frame_cache_manager = make_frame_cache_manager(thread_index).unwrap();
        let opened_video_manager = make_opened_stream_manager().unwrap();

        WorkerThread {
            thread_index,
            frame_cache_manager,
            opened_video_manager,
            receive_in_thread,
            send_close_video_to_main_thread,
            send_video_stats_to_main_thread,
        }
    }

    fn close_all_videos(&mut self) -> Result<(), ErrorWithBacktrace> {
        self.opened_video_manager
            .close_all_videos(&mut self.frame_cache_manager)?;
        self.send_close_video_to_main_thread.send(()).map_err(|e| {
            ErrorWithBacktrace::from(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to send close video message: {}", e),
            ))
        })?;
        Ok(())
    }

    fn handle_extract_frame(
        &mut self,
        command: ExtractFrameCommand,
        nonce: String,
        max_cache_size: u64,
    ) -> Result<(), ErrorWithBacktrace> {
        let res = ffmpeg::extract_frame(
            command.src,
            command.original_src,
            command.time,
            command.transparent,
            command.tone_mapped,
            self.thread_index,
            &mut self.opened_video_manager,
            &mut self.frame_cache_manager,
            max_cache_size,
        )?;

        global_printer::synchronized_write_buf(0, &nonce, &res)?;
        Ok(())
    }

    fn handle_get_open_video_stats(&mut self) -> Result<(), ErrorWithBacktrace> {
        let res = ffmpeg::get_open_video_stats(
            &mut self.frame_cache_manager,
            &mut self.opened_video_manager,
        )?;
        self.send_video_stats_to_main_thread
            .send(res.clone())
            .map_err(|e| {
                ErrorWithBacktrace::from(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    format!("Failed to send video stats message: {}", e),
                ))
            })?;
        Ok(())
    }

    fn delete_frames_from_cache(
        &mut self,
        cache_references: DeleteFramesFromCache,
    ) -> Result<(), ErrorWithBacktrace> {
        self.frame_cache_manager
            .prune_on_thread(cache_references.maximum_frame_cache_size_in_bytes)?;
        self.opened_video_manager
            .close_videos_if_cache_empty(&mut self.frame_cache_manager)
    }

    pub fn run_on_thread(&mut self) -> () {
        loop {
            let _message = self.receive_in_thread.recv();
            if _message.is_err() {
                break;
            }
            let msg = _message.unwrap();
            let message = msg.cli_input;

            match message.payload {
                CliInputCommandPayload::Eof(_) => {
                    break;
                }
                _ => {}
            };

            let res = (|| -> Result<(), ErrorWithBacktrace> {
                match message.payload {
                    CliInputCommandPayload::CloseAllVideos(_) => self.close_all_videos(),
                    CliInputCommandPayload::ExtractFrame(command) => self.handle_extract_frame(
                        command,
                        message.nonce.clone(),
                        msg.max_cache_size,
                    ),
                    CliInputCommandPayload::GetOpenVideoStats(_) => {
                        self.handle_get_open_video_stats()
                    }
                    CliInputCommandPayload::DeleteFramesFromCache(payload) => {
                        self.delete_frames_from_cache(payload)
                    }
                    _ => panic!("Command cannot be executed on thread"),
                }
            })();
            if res.is_err() {
                print_error(&message.nonce, res.err().unwrap())
            }
        }
    }
}
