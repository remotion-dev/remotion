use std::{
    sync::{
        mpsc::{self, Sender},
        Mutex,
    },
    thread::JoinHandle,
};

use crate::{
    commands::execute_command_and_print,
    errors::ErrorWithBacktrace,
    global_printer::{self, print_error},
    memory::is_about_to_run_out_of_memory,
    payloads::payloads::{
        parse_cli, CliInputAndMaxCacheSize, CliInputCommand, CliInputCommandPayload,
        DeleteFramesFromCache, Eof, ExtractFrameCommand, FreeUpMemory, OpenVideoStats,
    },
    select_right_thread::THREAD_MAP,
    thread::WorkerThread,
};

pub struct LongRunningProcess {
    maximum_frame_cache_size_in_bytes: u64,
    send_to_thread_handles: Vec<Sender<CliInputAndMaxCacheSize>>,
    receive_video_stats_in_main_thread_handles: Vec<mpsc::Receiver<OpenVideoStats>>,
    receive_close_video_in_main_thread_handles: Vec<mpsc::Receiver<()>>,
    finish_thread_handles: Mutex<Vec<JoinHandle<()>>>,
    max_thread: usize,
}

impl LongRunningProcess {
    pub fn new(threads: usize, max_cache_size: u64) -> Self {
        let send_to_thread_handles = vec![];
        let receive_video_stats_in_main_thread_handles: Vec<mpsc::Receiver<OpenVideoStats>> =
            vec![];
        let receive_close_video_in_main_thread_handles: Vec<mpsc::Receiver<()>> = vec![];
        THREAD_MAP.lock().unwrap().set_max_thread_count(threads);
        let finish_thread_handles = Mutex::new(vec![]);

        let map = LongRunningProcess {
            maximum_frame_cache_size_in_bytes: max_cache_size,
            send_to_thread_handles,
            receive_video_stats_in_main_thread_handles,
            receive_close_video_in_main_thread_handles,
            finish_thread_handles,
            max_thread: threads,
        };
        map
    }

    fn start_thread(&mut self, thread_index: usize) -> JoinHandle<()> {
        let (send_to_thread, receive_in_thread) = mpsc::channel::<CliInputAndMaxCacheSize>();
        let (send_video_stats_to_main_thread, receive_video_stats_in_main_thread) =
            mpsc::channel::<OpenVideoStats>();
        let (send_close_video_to_main_thread, receive_close_video_in_main_thread) =
            mpsc::channel::<()>();

        self.receive_video_stats_in_main_thread_handles
            .push(receive_video_stats_in_main_thread);
        self.send_to_thread_handles.push(send_to_thread);
        self.receive_close_video_in_main_thread_handles
            .push(receive_close_video_in_main_thread);

        std::thread::spawn(move || {
            let mut worker_thread = WorkerThread::new(
                thread_index,
                send_close_video_to_main_thread,
                receive_in_thread,
                send_video_stats_to_main_thread,
            );
            worker_thread.run_on_thread();
        })
    }

    fn start_new_thread(&mut self, thread_index: usize) -> Result<(), ErrorWithBacktrace> {
        let wait_for_thread_finish = self.start_thread(thread_index);
        self.finish_thread_handles
            .lock()
            .unwrap()
            .push(wait_for_thread_finish);
        Ok(())
    }

    pub fn start(&mut self) -> Result<(), ErrorWithBacktrace> {
        loop {
            let mut input = String::new();
            let matched = match std::io::stdin().read_line(&mut input) {
                Ok(_) => input,
                Err(_) => {
                    break;
                }
            };

            input = matched.trim().to_string();
            if input == "EOF" {
                for i in 0..self.send_to_thread_handles.len() {
                    self.send_to_thread_handles[i].send(CliInputAndMaxCacheSize {
                        cli_input: CliInputCommand {
                            payload: CliInputCommandPayload::Eof(Eof {}),
                            nonce: "".to_string(),
                        },
                        max_cache_size: self.maximum_frame_cache_size_in_bytes,
                    })?;
                }
                break;
            }

            let opts = parse_cli(&input)?;
            let nonce = opts.nonce.clone();
            self.run_main_thread_command(opts, input, nonce)?;
        }

        let mut handles = self.finish_thread_handles.lock().unwrap();
        while let Some(handle) = handles.pop() {
            handle.join().unwrap();
        }

        Ok(())
    }

    fn extract_frame_command(
        &mut self,
        command: ExtractFrameCommand,
        input: String,
    ) -> Result<(), ErrorWithBacktrace> {
        let thread_to_use = THREAD_MAP.lock().unwrap().select_right_thread(
            &command.src,
            &command.original_src,
            command.time,
            command.transparent,
        )?;
        THREAD_MAP.lock().unwrap().update_thread_map(
            thread_to_use.thread_id,
            thread_to_use.stream_id,
            command.src,
            command.time,
            command.transparent,
        );

        if thread_to_use.thread_id == self.send_to_thread_handles.len() {
            self.start_new_thread(thread_to_use.thread_id)?;
        }

        let input_to_send = parse_cli(&input)?;
        self.send_to_thread_handles[thread_to_use.thread_id].send(CliInputAndMaxCacheSize {
            cli_input: input_to_send,
            max_cache_size: self.maximum_frame_cache_size_in_bytes / self.max_thread as u64,
        })?;
        Ok(())
    }

    fn get_open_video_stats_command(
        &mut self,
        opts: CliInputCommand,
        nonce: String,
    ) -> Result<(), ErrorWithBacktrace> {
        for handle in &self.send_to_thread_handles {
            handle.send(CliInputAndMaxCacheSize {
                cli_input: opts.clone(),
                max_cache_size: self.maximum_frame_cache_size_in_bytes,
            })?;
        }

        let mut open_video_stats_all: Vec<OpenVideoStats> = vec![];
        for handle in &self.receive_video_stats_in_main_thread_handles {
            let data = handle.recv()?;
            open_video_stats_all.push(data.clone());
        }
        let concated: OpenVideoStats = OpenVideoStats {
            frames_in_cache: open_video_stats_all.iter().map(|x| x.frames_in_cache).sum(),
            open_streams: open_video_stats_all.iter().map(|x| x.open_streams).sum(),
        };
        let str = serde_json::to_string(&concated)?;
        global_printer::synchronized_write_buf(0, &nonce, &str.as_bytes())?;
        Ok(())
    }

    fn free_up_memory_command(
        &mut self,
        opts: FreeUpMemory,
        nonce: String,
    ) -> Result<(), ErrorWithBacktrace> {
        self.prune(opts.remaining_bytes)?;
        global_printer::synchronized_write_buf(0, &nonce, format!("Done").as_bytes())?;

        Ok(())
    }

    fn close_all_videos_command(
        &mut self,
        opts: CliInputCommand,
        nonce: String,
    ) -> Result<(), ErrorWithBacktrace> {
        for handle in &self.send_to_thread_handles {
            handle.send(CliInputAndMaxCacheSize {
                cli_input: opts.clone(),
                max_cache_size: self.maximum_frame_cache_size_in_bytes,
            })?;
        }

        for handle in &self.receive_close_video_in_main_thread_handles {
            handle.recv()?;
        }
        global_printer::synchronized_write_buf(0, &nonce, &format!("hi").as_bytes())?;
        Ok(())
    }

    fn prune(&mut self, maximum_frame_cache_size_in_bytes: u64) -> Result<(), ErrorWithBacktrace> {
        let threads = self.send_to_thread_handles.len();
        for i in 0..threads {
            self.send_to_thread_handles[i].send(CliInputAndMaxCacheSize {
                cli_input: CliInputCommand {
                    payload: CliInputCommandPayload::DeleteFramesFromCache(DeleteFramesFromCache {
                        maximum_frame_cache_size_in_bytes: maximum_frame_cache_size_in_bytes
                            / threads as u64,
                    }),
                    nonce: "".to_string(),
                },
                max_cache_size: maximum_frame_cache_size_in_bytes / threads as u64,
            })?;
        }

        Ok(())
    }

    fn emergency_memory_free_up(&mut self) -> Result<(), ErrorWithBacktrace> {
        self.prune(self.maximum_frame_cache_size_in_bytes / 2)?;
        self.maximum_frame_cache_size_in_bytes /= 2;
        Ok(())
    }
    fn keep_only_latest_frames(&mut self) -> Result<(), ErrorWithBacktrace> {
        self.prune(self.maximum_frame_cache_size_in_bytes)?;

        Ok(())
    }

    fn run_main_thread_command(
        &mut self,
        opts: CliInputCommand,
        input: String,
        nonce: String,
    ) -> Result<(), ErrorWithBacktrace> {
        let _result: Result<(), ErrorWithBacktrace> = match opts.payload {
            CliInputCommandPayload::ExtractFrame(command) => {
                self.extract_frame_command(command, input)?;
                self.keep_only_latest_frames()
            }
            CliInputCommandPayload::GetOpenVideoStats(_) => {
                self.get_open_video_stats_command(opts, nonce.clone())
            }
            CliInputCommandPayload::FreeUpMemory(payload) => {
                self.free_up_memory_command(payload, nonce.clone())
            }
            CliInputCommandPayload::CloseAllVideos(_) => {
                self.close_all_videos_command(opts, nonce.clone())
            }
            _ => {
                execute_command_and_print(opts)?;
                Ok(())
            }
        };
        if _result.is_err() {
            print_error(&nonce, _result.err().unwrap())
        }

        if is_about_to_run_out_of_memory() {
            self.emergency_memory_free_up()?;
        }

        Ok(())
    }
}
