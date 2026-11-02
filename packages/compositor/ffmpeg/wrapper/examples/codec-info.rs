extern crate ffmpeg_next as ffmpeg;

use std::env;

fn main() {
    ffmpeg::init().unwrap();

    for arg in env::args().skip(1) {
        if let Some(codec) = ffmpeg::decoder::find_by_name(&arg) {
            println!("type: decoder");
            println!("\t id: {:?}", codec.id());
            println!("\t name: {}", codec.name());
            println!("\t description: {}", codec.description());
            println!("\t medium: {:?}", codec.medium());
            println!("\t capabilities: {:?}", codec.capabilities());

            if let Some(profiles) = codec.profiles() {
                println!("\t profiles: {:?}", profiles.collect::<Vec<_>>());
            } else {
                println!("\t profiles: none");
            }

            if let Ok(video) = codec.video() {
                if let Some(rates) = video.rates() {
                    println!("\t rates: {:?}", rates.collect::<Vec<_>>());
                } else {
                    println!("\t rates: any");
                }

                if let Some(formats) = video.formats() {
                    println!("\t formats: {:?}", formats.collect::<Vec<_>>());
                } else {
                    println!("\t formats: any");
                }
            }

            if let Ok(audio) = codec.audio() {
                if let Some(rates) = audio.rates() {
                    println!("\t rates: {:?}", rates.collect::<Vec<_>>());
                } else {
                    println!("\t rates: any");
                }

                if let Some(formats) = audio.formats() {
                    println!("\t formats: {:?}", formats.collect::<Vec<_>>());
                } else {
                    println!("\t formats: any");
                }

                if let Some(layouts) = audio.channel_layouts() {
                    println!("\t channel_layouts: {:?}", layouts.collect::<Vec<_>>());
                } else {
                    println!("\t channel_layouts: any");
                }
            }

            println!("\t max_lowres: {:?}", codec.max_lowres());
        }

        if let Some(codec) = ffmpeg::encoder::find_by_name(&arg) {
            println!();
            println!("type: encoder");
            println!("\t id: {:?}", codec.id());
            println!("\t name: {}", codec.name());
            println!("\t description: {}", codec.description());
            println!("\t medium: {:?}", codec.medium());
            println!("\t capabilities: {:?}", codec.capabilities());

            if let Some(profiles) = codec.profiles() {
                println!("\t profiles: {:?}", profiles.collect::<Vec<_>>());
            }

            if let Ok(video) = codec.video() {
                if let Some(rates) = video.rates() {
                    println!("\t rates: {:?}", rates.collect::<Vec<_>>());
                } else {
                    println!("\t rates: any");
                }

                if let Some(formats) = video.formats() {
                    println!("\t formats: {:?}", formats.collect::<Vec<_>>());
                } else {
                    println!("\t formats: any");
                }
            }

            if let Ok(audio) = codec.audio() {
                if let Some(rates) = audio.rates() {
                    println!("\t rates: {:?}", rates.collect::<Vec<_>>());
                } else {
                    println!("\t rates: any");
                }

                if let Some(formats) = audio.formats() {
                    println!("\t formats: {:?}", formats.collect::<Vec<_>>());
                } else {
                    println!("\t formats: any");
                }

                if let Some(layouts) = audio.channel_layouts() {
                    println!("\t channel_layouts: {:?}", layouts.collect::<Vec<_>>());
                } else {
                    println!("\t channel_layouts: any");
                }
            }

            println!("\t max_lowres: {:?}", codec.max_lowres());
        }
    }
}
