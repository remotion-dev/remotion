use ffi::*;
use libc::c_int;

#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum Decision {
    Simple,
    Bits,
    RateDistortion,
}

impl From<c_int> for Decision {
    fn from(value: c_int) -> Decision {
        match value {
            FF_MB_DECISION_SIMPLE => Decision::Simple,
            FF_MB_DECISION_BITS => Decision::Bits,
            FF_MB_DECISION_RD => Decision::RateDistortion,

            _ => Decision::Simple,
        }
    }
}

impl From<Decision> for c_int {
    fn from(value: Decision) -> c_int {
        match value {
            Decision::Simple => FF_MB_DECISION_SIMPLE,
            Decision::Bits => FF_MB_DECISION_BITS,
            Decision::RateDistortion => FF_MB_DECISION_RD,
        }
    }
}
