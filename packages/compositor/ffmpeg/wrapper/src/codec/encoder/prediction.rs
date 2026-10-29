use ffi::*;
use libc::c_int;

#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum Prediction {
    Left,
    Plane,
    Median,
}

impl From<c_int> for Prediction {
    fn from(value: c_int) -> Prediction {
        match value {
            FF_PRED_LEFT => Prediction::Left,
            FF_PRED_PLANE => Prediction::Plane,
            FF_PRED_MEDIAN => Prediction::Median,

            _ => Prediction::Left,
        }
    }
}

impl From<Prediction> for c_int {
    fn from(value: Prediction) -> c_int {
        match value {
            Prediction::Left => FF_PRED_LEFT,
            Prediction::Plane => FF_PRED_PLANE,
            Prediction::Median => FF_PRED_MEDIAN,
        }
    }
}
