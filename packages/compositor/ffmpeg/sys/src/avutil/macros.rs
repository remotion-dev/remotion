#[macro_export]
macro_rules! MKBETAG {
    ($a:expr, $b:expr, $c:expr, $d:expr) => {
        ($d as isize) | (($c as isize) << 8) | (($b as isize) << 16) | (($a as isize) << 24)
    };
}

#[macro_export]
macro_rules! MKTAG {
    ($a:expr, $b:expr, $c:expr, $d:expr) => {
        ($a as isize) | (($b as isize) << 8) | (($c as isize) << 16) | (($d as isize) << 24)
    };
}
