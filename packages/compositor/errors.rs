pub fn handle_error(err: &dyn std::error::Error) -> ! {
    print!("Error {}", err);
    std::process::exit(1);
}
