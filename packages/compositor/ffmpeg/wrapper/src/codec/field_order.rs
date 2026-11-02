use ffi::AVFieldOrder::*;
use ffi::*;

#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum FieldOrder {
    Unknown,
    Progressive,
    TT,
    BB,
    TB,
    BT,
}

impl From<AVFieldOrder> for FieldOrder {
    fn from(value: AVFieldOrder) -> Self {
        match value {
            AV_FIELD_UNKNOWN => FieldOrder::Unknown,
            AV_FIELD_PROGRESSIVE => FieldOrder::Progressive,
            AV_FIELD_TT => FieldOrder::TT,
            AV_FIELD_BB => FieldOrder::BB,
            AV_FIELD_TB => FieldOrder::TB,
            AV_FIELD_BT => FieldOrder::BT,
        }
    }
}

impl From<FieldOrder> for AVFieldOrder {
    fn from(value: FieldOrder) -> AVFieldOrder {
        match value {
            FieldOrder::Unknown => AV_FIELD_UNKNOWN,
            FieldOrder::Progressive => AV_FIELD_PROGRESSIVE,
            FieldOrder::TT => AV_FIELD_TT,
            FieldOrder::BB => AV_FIELD_BB,
            FieldOrder::TB => AV_FIELD_TB,
            FieldOrder::BT => AV_FIELD_BT,
        }
    }
}
