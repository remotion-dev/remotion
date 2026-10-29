#![allow(non_upper_case_globals)]
#![allow(non_camel_case_types)]
#![allow(non_snake_case)]
#![allow(clippy::approx_constant)]
#![allow(clippy::missing_safety_doc)]
#![allow(clippy::redundant_static_lifetimes)]
#![allow(clippy::too_many_arguments)]
#![allow(clippy::type_complexity)]

extern crate libc;

include!(concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/bindings/",
    env!("TARGET"),
    ".rs"
));
#[macro_use]
mod avutil;
pub use avutil::*;
