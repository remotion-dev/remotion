#[cfg(feature = "software-scaling")]
pub mod scaling;

#[cfg(feature = "software-scaling")]
#[inline]
pub fn scaler(
    format: ::format::Pixel,
    flags: scaling::Flags,
    (in_width, in_height): (u32, u32),
    (out_width, out_height): (u32, u32),
) -> Result<scaling::Context, ::Error> {
    scaling::Context::get(
        format, in_width, in_height, format, out_width, out_height, flags,
    )
}

#[cfg(feature = "software-scaling")]
#[inline]
pub fn converter(
    (width, height): (u32, u32),
    input: ::format::Pixel,
    output: ::format::Pixel,
) -> Result<scaling::Context, ::Error> {
    scaling::Context::get(
        input,
        width,
        height,
        output,
        width,
        height,
        scaling::flag::Flags::FAST_BILINEAR,
    )
}

#[cfg(feature = "software-resampling")]
pub mod resampling;

#[cfg(feature = "software-resampling")]
#[inline]
pub fn resampler(
    (in_format, in_layout, in_rate): (::format::Sample, ::ChannelLayout, u32),
    (out_format, out_layout, out_rate): (::format::Sample, ::ChannelLayout, u32),
) -> Result<resampling::Context, ::Error> {
    resampling::Context::get(
        in_format, in_layout, in_rate, out_format, out_layout, out_rate,
    )
}
