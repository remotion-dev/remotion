use std::sync::mpsc::{Receiver, Sender};

use crate::{
    errors::ErrorWithBacktrace,
    ffmpeg,
    frame_cache_manager::make_frame_cache_manager,
    global_printer::{self, print_error},
    max_cache_size,
    memory::is_about_to_run_out_of_memory,
    opened_video_manager::make_opened_stream_manager,
    payloads::payloads::{CliInputCommand, CliInputCommandPayload, OpenVideoStats},
};

pub fn run_on_thread(
    thread_index: usize,
    send_close_video_to_main_thread: Sender<()>,
    receive_in_thread: Receiver<CliInputCommand>,
    send_video_stats_to_main_thread: Sender<OpenVideoStats>,
    send_free_to_main_thread: Sender<()>,
) -> () {
    let mut frame_cache_manager = make_frame_cache_manager().unwrap();
    let mut opened_video_manager = make_opened_stream_manager().unwrap();

    loop {
        let _message = receive_in_thread.recv();
        if _message.is_err() {
            break;
        }
        let message = _message.unwrap();
        let current_maximum_cache_size = max_cache_size::get_instance().lock().unwrap().get_value();

        if is_about_to_run_out_of_memory() && current_maximum_cache_size.is_some() {
            ffmpeg::emergency_memory_free_up(&mut frame_cache_manager, thread_index).unwrap();
            max_cache_size::get_instance()
                .lock()
                .unwrap()
                .set_value(Some(current_maximum_cache_size.unwrap() / 2));
        }

        match message.payload {
            CliInputCommandPayload::Eof(_) => {
                break;
            }
            _ => {}
        };

        let res = (|| -> Result<(), ErrorWithBacktrace> {
            match message.payload {
                CliInputCommandPayload::CloseAllVideos(_) => {
                    opened_video_manager.close_all_videos(&mut frame_cache_manager)?;
                    send_close_video_to_main_thread.send(()).map_err(|e| {
                        ErrorWithBacktrace::from(std::io::Error::new(
                            std::io::ErrorKind::Other,
                            format!("Failed to send close video message: {}", e),
                        ))
                    })?;
                    Ok(())
                }
                CliInputCommandPayload::ExtractFrame(command) => {
                    let res = ffmpeg::extract_frame(
                        command.src,
                        command.original_src,
                        command.time,
                        command.transparent,
                        command.tone_mapped,
                        current_maximum_cache_size,
                        thread_index,
                        &mut opened_video_manager,
                        &mut frame_cache_manager,
                    )?;
                    global_printer::synchronized_write_buf(0, &message.nonce, &res)?;
                    if let Some(cache_size) = current_maximum_cache_size {
                        ffmpeg::keep_only_latest_frames_and_close_videos(
                            cache_size,
                            &mut opened_video_manager,
                            &mut frame_cache_manager,
                            thread_index,
                        )?;
                    }
                    Ok(())
                }
                CliInputCommandPayload::FreeUpMemory(payload) => {
                    ffmpeg::keep_only_latest_frames_and_close_videos(
                        payload.remaining_bytes,
                        &mut opened_video_manager,
                        &mut frame_cache_manager,
                        thread_index,
                    )?;
                    send_free_to_main_thread.send(()).map_err(|e| {
                        ErrorWithBacktrace::from(std::io::Error::new(
                            std::io::ErrorKind::Other,
                            format!("Failed to send free memory message: {}", e),
                        ))
                    })?;
                    Ok(())
                }
                CliInputCommandPayload::GetOpenVideoStats(_) => {
                    let res = ffmpeg::get_open_video_stats(
                        &mut frame_cache_manager,
                        &mut opened_video_manager,
                    )?;
                    send_video_stats_to_main_thread
                        .send(res.clone())
                        .map_err(|e| {
                            ErrorWithBacktrace::from(std::io::Error::new(
                                std::io::ErrorKind::Other,
                                format!("Failed to send video stats message: {}", e),
                            ))
                        })?;
                    Ok(())
                }
                _ => panic!("Command cannot be executed on thread"),
            }
        })();
        if res.is_err() {
            print_error(&message.nonce, res.err().unwrap())
        }
    }
}
