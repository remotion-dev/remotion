use ffi::*;
use libc::c_int;

#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum Comparison {
    SAD,
    SSE,
    SATD,
    DCT,
    PSNR,
    BIT,
    RD,
    ZERO,
    VSAD,
    VSSE,
    NSSE,
    W53,
    W97,
    DCTMAX,
    DCT264,
    CHROMA,
}

impl From<c_int> for Comparison {
    fn from(value: c_int) -> Comparison {
        match value {
            FF_CMP_SAD => Comparison::SAD,
            FF_CMP_SSE => Comparison::SSE,
            FF_CMP_SATD => Comparison::SATD,
            FF_CMP_DCT => Comparison::DCT,
            FF_CMP_PSNR => Comparison::PSNR,
            FF_CMP_BIT => Comparison::BIT,
            FF_CMP_RD => Comparison::RD,
            FF_CMP_ZERO => Comparison::ZERO,
            FF_CMP_VSAD => Comparison::VSAD,
            FF_CMP_VSSE => Comparison::VSSE,
            FF_CMP_NSSE => Comparison::NSSE,
            FF_CMP_W53 => Comparison::W53,
            FF_CMP_W97 => Comparison::W97,
            FF_CMP_DCTMAX => Comparison::DCTMAX,
            FF_CMP_DCT264 => Comparison::DCT264,
            FF_CMP_CHROMA => Comparison::CHROMA,

            _ => Comparison::ZERO,
        }
    }
}

impl From<Comparison> for c_int {
    fn from(value: Comparison) -> c_int {
        match value {
            Comparison::SAD => FF_CMP_SAD,
            Comparison::SSE => FF_CMP_SSE,
            Comparison::SATD => FF_CMP_SATD,
            Comparison::DCT => FF_CMP_DCT,
            Comparison::PSNR => FF_CMP_PSNR,
            Comparison::BIT => FF_CMP_BIT,
            Comparison::RD => FF_CMP_RD,
            Comparison::ZERO => FF_CMP_ZERO,
            Comparison::VSAD => FF_CMP_VSAD,
            Comparison::VSSE => FF_CMP_VSSE,
            Comparison::NSSE => FF_CMP_NSSE,
            Comparison::W53 => FF_CMP_W53,
            Comparison::W97 => FF_CMP_W97,
            Comparison::DCTMAX => FF_CMP_DCTMAX,
            Comparison::DCT264 => FF_CMP_DCT264,
            Comparison::CHROMA => FF_CMP_CHROMA,
        }
    }
}
