use ffi::AVRounding::*;
use ffi::*;

#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum Rounding {
    Zero,
    Infinity,
    Down,
    Up,
    NearInfinity,
    PassMinMax,
}

impl From<AVRounding> for Rounding {
    #[inline(always)]
    fn from(value: AVRounding) -> Self {
        match value {
            AV_ROUND_ZERO => Rounding::Zero,
            AV_ROUND_INF => Rounding::Infinity,
            AV_ROUND_DOWN => Rounding::Down,
            AV_ROUND_UP => Rounding::Up,
            AV_ROUND_NEAR_INF => Rounding::NearInfinity,
            AV_ROUND_PASS_MINMAX => Rounding::PassMinMax,
        }
    }
}

impl From<Rounding> for AVRounding {
    #[inline(always)]
    fn from(value: Rounding) -> AVRounding {
        match value {
            Rounding::Zero => AV_ROUND_ZERO,
            Rounding::Infinity => AV_ROUND_INF,
            Rounding::Down => AV_ROUND_DOWN,
            Rounding::Up => AV_ROUND_UP,
            Rounding::NearInfinity => AV_ROUND_NEAR_INF,
            Rounding::PassMinMax => AV_ROUND_PASS_MINMAX,
        }
    }
}
