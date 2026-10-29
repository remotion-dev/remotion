extern crate ffmpeg_next as ffmpeg;

use std::env;

fn main() {
    ffmpeg::init().unwrap();

    match ffmpeg::format::input(&env::args().nth(1).expect("missing input file name")) {
        Ok(ictx) => {
            println!("Nb chapters: {}", ictx.nb_chapters());

            for chapter in ictx.chapters() {
                println!("chapter id {}:", chapter.id());
                println!("\ttime_base: {}", chapter.time_base());
                println!("\tstart: {}", chapter.start());
                println!("\tend: {}", chapter.end());

                for (k, v) in chapter.metadata().iter() {
                    println!("\t{}: {}", k, v);
                }
            }

            let mut octx = ffmpeg::format::output(&"test.mkv").expect("Couldn't open test file");

            for chapter in ictx.chapters() {
                let title = match chapter.metadata().get("title") {
                    Some(title) => String::from(title),
                    None => String::new(),
                };

                match octx.add_chapter(
                    chapter.id(),
                    chapter.time_base(),
                    chapter.start(),
                    chapter.end(),
                    &title,
                ) {
                    Ok(chapter) => println!("Added chapter with id {} to output", chapter.id()),
                    Err(error) => {
                        println!("Error adding chapter with id: {} - {}", chapter.id(), error)
                    }
                }
            }

            println!("\nOuput: nb chapters: {}", octx.nb_chapters());
            for chapter in octx.chapters() {
                println!("chapter id {}:", chapter.id());
                println!("\ttime_base: {}", chapter.time_base());
                println!("\tstart: {}", chapter.start());
                println!("\tend: {}", chapter.end());
                for (k, v) in chapter.metadata().iter() {
                    println!("\t{}: {}", k, v);
                }
            }
        }

        Err(error) => println!("error: {}", error),
    }
}
