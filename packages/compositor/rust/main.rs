mod cache_references;
mod commands;
mod errors;
mod extract_audio;
mod ffmpeg;
mod frame_cache;
mod frame_cache_manager;
mod get_silent_parts;
mod get_video_metadata;
mod global_printer;
mod image;
mod logger;
mod max_cache_size;
mod memory;
mod opened_stream;
mod opened_video;
mod opened_video_manager;
mod payloads;
mod rotation;
mod scalable_frame;
mod select_right_thread;
mod thread;
mod tone_map;

use commands::execute_command_and_print;
use errors::ErrorWithBacktrace;
use global_printer::{_print_verbose, print_error, set_verbose_logging};
use memory::get_ideal_maximum_frame_cache_size;
use select_right_thread::THREAD_MAP;
use std::sync::mpsc::{self, Sender};
use std::sync::Mutex;
use std::{env, thread::JoinHandle};
use thread::run_on_thread;

use payloads::payloads::{parse_cli, CliInputCommand, CliInputCommandPayload, Eof, OpenVideoStats};

extern crate png;

fn mainfn() -> Result<(), ErrorWithBacktrace> {
    let args = env::args();

    let first_arg =
        args.skip(1)
            .next()
            .ok_or(errors::ErrorWithBacktrace::from(std::io::Error::new(
                std::io::ErrorKind::Other,
                "No input",
            )))?;

    let opts: CliInputCommand = parse_init_command(&first_arg)?;

    match opts.payload {
        CliInputCommandPayload::StartLongRunningProcess(payload) => {
            set_verbose_logging(payload.verbose);

            let max_video_cache_size = payload
                .maximum_frame_cache_size_in_bytes
                .unwrap_or(get_ideal_maximum_frame_cache_size());

            _print_verbose(&format!(
                "Starting Rust process. Max video cache size: {}MB, max concurrency = {}",
                max_video_cache_size / 1024 / 1024,
                payload.concurrency
            ))?;

            let mut long_running_process =
                LongRunningProcess::new(payload.concurrency, max_video_cache_size);
            long_running_process.start()
        }
        _ => {
            panic!("only supports long running compositor")
        }
    }
}

pub fn parse_init_command(json: &str) -> Result<CliInputCommand, ErrorWithBacktrace> {
    let cli_input: CliInputCommand = serde_json::from_str(json)?;

    Ok(cli_input)
}

pub struct LongRunningProcess {
    maximum_frame_cache_size_in_bytes: u64,
    send_to_thread_handles: Vec<Sender<CliInputCommand>>,
    receive_video_stats_in_main_thread_handles: Vec<mpsc::Receiver<OpenVideoStats>>,
    receive_close_video_in_main_thread_handles: Vec<mpsc::Receiver<()>>,
    receive_free_in_main_thread_handles: Vec<mpsc::Receiver<()>>,
    finish_thread_handles: Mutex<Vec<JoinHandle<()>>>,
}

impl LongRunningProcess {
    pub fn new(threads: usize, max_cache_size: u64) -> Self {
        let send_to_thread_handles = vec![];
        let receive_video_stats_in_main_thread_handles: Vec<mpsc::Receiver<OpenVideoStats>> =
            vec![];
        let receive_close_video_in_main_thread_handles: Vec<mpsc::Receiver<()>> = vec![];
        let receive_free_in_main_thread_handles: Vec<mpsc::Receiver<()>> = vec![];
        THREAD_MAP.lock().unwrap().set_max_thread_count(threads);
        let finish_thread_handles = Mutex::new(vec![]);

        let map = LongRunningProcess {
            maximum_frame_cache_size_in_bytes: max_cache_size,
            send_to_thread_handles,
            receive_video_stats_in_main_thread_handles,
            receive_close_video_in_main_thread_handles,
            receive_free_in_main_thread_handles,
            finish_thread_handles,
        };
        map
    }

    fn start_thread(&mut self, thread_index: usize) -> JoinHandle<()> {
        let (send_to_thread, receive_in_thread) = mpsc::channel::<CliInputCommand>();
        let (send_video_stats_to_main_thread, receive_video_stats_in_main_thread) =
            mpsc::channel::<OpenVideoStats>();
        let (send_free_to_main_thread, receive_free_in_main_thread) = mpsc::channel::<()>();
        let (send_close_video_to_main_thread, receive_close_video_in_main_thread) =
            mpsc::channel::<()>();

        self.receive_video_stats_in_main_thread_handles
            .push(receive_video_stats_in_main_thread);
        self.send_to_thread_handles.push(send_to_thread);
        self.receive_close_video_in_main_thread_handles
            .push(receive_close_video_in_main_thread);
        self.receive_free_in_main_thread_handles
            .push(receive_free_in_main_thread);

        std::thread::spawn(move || {
            run_on_thread(
                thread_index,
                send_close_video_to_main_thread,
                receive_in_thread,
                send_video_stats_to_main_thread,
                send_free_to_main_thread,
            );
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

    fn start(&mut self) -> Result<(), ErrorWithBacktrace> {
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

    fn run_main_thread_command(
        &mut self,
        opts: CliInputCommand,
        input: String,
        nonce: String,
    ) -> Result<(), ErrorWithBacktrace> {
        let _result: Result<(), ErrorWithBacktrace> = match opts.payload {
            CliInputCommandPayload::ExtractFrame(command) => {
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
            CliInputCommandPayload::GetOpenVideoStats(_) => {
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
            CliInputCommandPayload::FreeUpMemory(_) => {
                for handle in &self.send_to_thread_handles {
                    handle.send(opts.clone())?;
                }

                for handle in &self.receive_free_in_main_thread_handles {
                    handle.recv()?;
                }
                global_printer::synchronized_write_buf(0, &nonce, &format!("hi").as_bytes())?;
                Ok(())
            }
            CliInputCommandPayload::CloseAllVideos(_) => {
                for handle in &self.send_to_thread_handles {
                    handle.send(opts.clone())?;
                }

                for handle in &self.receive_close_video_in_main_thread_handles {
                    handle.recv()?;
                }
                global_printer::synchronized_write_buf(0, &nonce, &format!("hi").as_bytes())?;
                Ok(())
            }
            _ => {
                execute_command_and_print(opts)?;
                Ok(())
            }
        };
        if _result.is_err() {
            print_error(&nonce, _result.err().unwrap())
        }
        Ok(())
    }
}

fn main() {
    match mainfn() {
        Ok(_) => (),
        Err(err) => errors::handle_global_error(err),
    }
}
