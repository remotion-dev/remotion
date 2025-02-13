use std::{
    sync::{
        mpsc::{self, Sender},
        Mutex,
    },
    thread::JoinHandle,
};

use crate::{
    cache_references::FRAME_CACHE_REFERENCES,
    commands::execute_command_and_print,
    errors::ErrorWithBacktrace,
    global_printer::{self, print_error},
    max_cache_size,
    memory::is_about_to_run_out_of_memory,
    payloads::payloads::{
        parse_cli, CliInputCommand, CliInputCommandPayload, DeleteFramesFromCache, Eof,
        ExtractFrameCommand, FreeUpMemory, OpenVideoStats,
    },
    select_right_thread::THREAD_MAP,
    thread::WorkerThread,
};

pub struct LongRunningProcess {
    maximum_frame_cache_size_in_bytes: u64,
    send_to_thread_handles: Vec<Sender<CliInputCommand>>,
    receive_video_stats_in_main_thread_handles: Vec<mpsc::Receiver<OpenVideoStats>>,
    receive_close_video_in_main_thread_handles: Vec<mpsc::Receiver<()>>,
    finish_thread_handles: Mutex<Vec<JoinHandle<()>>>,
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
        };
        map
    }

    fn start_thread(&mut self, thread_index: usize) -> JoinHandle<()> {
        let (send_to_thread, receive_in_thread) = mpsc::channel::<CliInputCommand>();
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
        max_cache_size::get_instance()
            .lock()
            .unwrap()
            .set_value(Some(self.maximum_frame_cache_size_in_bytes));

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
                    self.send_to_thread_handles[i].send(CliInputCommand {
                        payload: CliInputCommandPayload::Eof(Eof {}),
                        nonce: "".to_string(),
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
            command.time,
            command.transparent,
        )?;
        if thread_to_use.thread_id == self.send_to_thread_handles.len() {
            self.start_new_thread(thread_to_use.thread_id)?;
        }

        let input_to_send = parse_cli(&input)?;
        self.send_to_thread_handles[thread_to_use.thread_id].send(input_to_send)?;
        Ok(())
    }

    fn get_open_video_stats_command(
        &mut self,
        opts: CliInputCommand,
        nonce: String,
    ) -> Result<(), ErrorWithBacktrace> {
        for handle in &self.send_to_thread_handles {
            handle.send(opts.clone())?;
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
            handle.send(opts.clone())?;
        }

        for handle in &self.receive_close_video_in_main_thread_handles {
            handle.recv()?;
        }
        global_printer::synchronized_write_buf(0, &nonce, &format!("hi").as_bytes())?;
        Ok(())
    }

    fn prune(&mut self, maximum_frame_cache_size_in_bytes: u64) -> Result<(), ErrorWithBacktrace> {
        let frames_to_prune = FRAME_CACHE_REFERENCES
            .lock()
            .unwrap()
            .get_frames_to_prune(maximum_frame_cache_size_in_bytes, None)?;

        for thread in frames_to_prune {
            if thread.is_empty() {
                continue;
            }
            let first_item = thread.get(0).unwrap();
            self.send_to_thread_handles[first_item.thread_index].send(CliInputCommand {
                payload: CliInputCommandPayload::DeleteFramesFromCache(DeleteFramesFromCache {
                    cache_references: thread,
                }),
                nonce: "".to_string(),
            })?;
        }
        Ok(())
    }

    fn emergency_memory_free_up(&mut self) -> Result<(), ErrorWithBacktrace> {
        self.prune(self.maximum_frame_cache_size_in_bytes / 2)?;
        max_cache_size::get_instance()
            .lock()
            .unwrap()
            .set_value(Some(self.maximum_frame_cache_size_in_bytes / 2));
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

        let current_maximum_cache_size = max_cache_size::get_instance().lock().unwrap().get_value();

        if is_about_to_run_out_of_memory() && current_maximum_cache_size.is_some() {
            self.emergency_memory_free_up()?;
        }

        Ok(())
    }
}
