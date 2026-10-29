use std::ops;

pub trait Range<T> {
    fn start(&self) -> Option<&T> {
        None
    }

    fn end(&self) -> Option<&T> {
        None
    }
}

impl<T> Range<T> for ops::Range<T> {
    fn start(&self) -> Option<&T> {
        Some(&self.start)
    }

    fn end(&self) -> Option<&T> {
        Some(&self.end)
    }
}

impl<T> Range<T> for ops::RangeTo<T> {
    fn end(&self) -> Option<&T> {
        Some(&self.end)
    }
}

impl<T> Range<T> for ops::RangeFrom<T> {
    fn start(&self) -> Option<&T> {
        Some(&self.start)
    }
}

impl<T> Range<T> for ops::RangeFull {}
