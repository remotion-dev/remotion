# FFmpeg C bindings

The `ffmpeg-sys-next` crate exposes FFmpeg’s C API to the Rust wrapper in `../wrapper` through a local Cargo dependency.
See [the FFmpeg workflow](../README.md) for downloading archives and updating all seven targets together.

`bindings/` contains one generated Rust file per target. `build.rs` extracts the matching archive into Cargo's output directory and links its shared libraries. `zips/*.gz` are verified downloads, not tracked source files.
