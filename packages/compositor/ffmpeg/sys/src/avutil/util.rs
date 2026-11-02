use libc::c_int;
use {AVRational, AV_TIME_BASE};

pub const AV_NOPTS_VALUE: i64 = 0x8000000000000000u64 as i64;
pub const AV_TIME_BASE_Q: AVRational = AVRational {
    num: 1,
    den: AV_TIME_BASE as c_int,
};
