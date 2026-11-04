use ffi::SwrFilterType::*;
use ffi::*;

#[derive(Eq, PartialEq, Copy, Clone, Debug)]
pub enum Filter {
    Cubic,
    BlackmanNuttall,
    Kaiser,
}

impl From<SwrFilterType> for Filter {
    fn from(value: SwrFilterType) -> Filter {
        match value {
            SWR_FILTER_TYPE_CUBIC => Filter::Cubic,
            SWR_FILTER_TYPE_BLACKMAN_NUTTALL => Filter::BlackmanNuttall,
            SWR_FILTER_TYPE_KAISER => Filter::Kaiser,
        }
    }
}

impl From<Filter> for SwrFilterType {
    fn from(value: Filter) -> SwrFilterType {
        match value {
            Filter::Cubic => SWR_FILTER_TYPE_CUBIC,
            Filter::BlackmanNuttall => SWR_FILTER_TYPE_BLACKMAN_NUTTALL,
            Filter::Kaiser => SWR_FILTER_TYPE_KAISER,
        }
    }
}
