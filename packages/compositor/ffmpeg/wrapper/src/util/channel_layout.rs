use ffi::*;

#[repr(transparent)]
#[derive(Copy, Clone)]
pub struct ChannelLayout(pub AVChannelLayout);

impl PartialEq for ChannelLayout {
    // TODO this can actually return an error if < 0
    fn eq(&self, other: &Self) -> bool {
        unsafe {
            av_channel_layout_compare(
                &self.0 as *const AVChannelLayout,
                &other.0 as *const AVChannelLayout,
            ) == 0
        }
    }
}
impl Eq for ChannelLayout {}

impl std::fmt::Debug for ChannelLayout {
    fn fmt(&self, fmt: &mut std::fmt::Formatter) -> std::fmt::Result {
        let mut s = fmt.debug_struct("ChannelLayout");
        s.field("is_empty", &self.is_empty());
        s.field("channels", &self.channels());
        s.field("u.mask", &unsafe { self.0.u.mask });
        s.finish()
    }
}

macro_rules! define_layout {
    ($name:ident, $nb:expr, $mask:expr) => {
        pub const $name: ChannelLayout = ChannelLayout(AVChannelLayout {
            order: AVChannelOrder::AV_CHANNEL_ORDER_NATIVE,
            nb_channels: $nb,
            u: AVChannelLayout__bindgen_ty_1 { mask: $mask },
            opaque: std::ptr::null_mut(),
        });
    };
}

impl ChannelLayout {
    define_layout!(MONO, 1, AV_CH_LAYOUT_MONO);
    define_layout!(STEREO, 2, AV_CH_LAYOUT_STEREO);
    define_layout!(_2POINT1, 3, AV_CH_LAYOUT_2POINT1);
    define_layout!(_2_1, 3, AV_CH_LAYOUT_2_1);
    define_layout!(SURROUND, 3, AV_CH_LAYOUT_SURROUND);
    define_layout!(_3POINT1, 4, AV_CH_LAYOUT_3POINT1);
    define_layout!(_4POINT0, 4, AV_CH_LAYOUT_4POINT0);
    define_layout!(_4POINT1, 5, AV_CH_LAYOUT_4POINT1);
    define_layout!(_2_2, 4, AV_CH_LAYOUT_2_2);
    define_layout!(QUAD, 4, AV_CH_LAYOUT_QUAD);
    define_layout!(_5POINT0, 5, AV_CH_LAYOUT_5POINT0);
    define_layout!(_5POINT1, 6, AV_CH_LAYOUT_5POINT1);
    define_layout!(_5POINT0_BACK, 5, AV_CH_LAYOUT_5POINT0_BACK);
    define_layout!(_5POINT1_BACK, 6, AV_CH_LAYOUT_5POINT1_BACK);
    define_layout!(_6POINT0, 6, AV_CH_LAYOUT_6POINT0);
    define_layout!(_6POINT0_FRONT, 6, AV_CH_LAYOUT_6POINT0_FRONT);
    define_layout!(_3POINT1POINT2, 6, AV_CH_LAYOUT_3POINT1POINT2);
    define_layout!(HEXAGONAL, 6, AV_CH_LAYOUT_HEXAGONAL);
    define_layout!(_6POINT1, 7, AV_CH_LAYOUT_6POINT1);
    define_layout!(_6POINT1_BACK, 7, AV_CH_LAYOUT_6POINT1_BACK);
    define_layout!(_6POINT1_FRONT, 7, AV_CH_LAYOUT_6POINT1_FRONT);
    define_layout!(_7POINT0, 7, AV_CH_LAYOUT_7POINT0);
    define_layout!(_7POINT0_FRONT, 7, AV_CH_LAYOUT_7POINT0_FRONT);
    define_layout!(_7POINT1, 8, AV_CH_LAYOUT_7POINT1);
    define_layout!(_7POINT1_WIDE, 8, AV_CH_LAYOUT_7POINT1_WIDE);
    define_layout!(_7POINT1_WIDE_BACK, 8, AV_CH_LAYOUT_7POINT1_WIDE_BACK);
    define_layout!(_5POINT1POINT2_BACK, 8, AV_CH_LAYOUT_5POINT1POINT2_BACK);
    define_layout!(OCTAGONAL, 8, AV_CH_LAYOUT_OCTAGONAL);
    define_layout!(CUBE, 8, AV_CH_LAYOUT_CUBE);
    define_layout!(_5POINT1POINT4_BACK, 10, AV_CH_LAYOUT_5POINT1POINT4_BACK);
    define_layout!(_7POINT1POINT2, 10, AV_CH_LAYOUT_7POINT1POINT2);
    define_layout!(_7POINT1POINT4_BACK, 12, AV_CH_LAYOUT_7POINT1POINT4_BACK);
    define_layout!(_7POINT2POINT3, 12, AV_CH_LAYOUT_7POINT2POINT3);
    define_layout!(_9POINT1POINT4_BACK, 14, AV_CH_LAYOUT_9POINT1POINT4_BACK);
    define_layout!(HEXADECAGONAL, 16, AV_CH_LAYOUT_HEXADECAGONAL);
    define_layout!(STEREO_DOWNMIX, 2, AV_CH_LAYOUT_STEREO_DOWNMIX);
    define_layout!(_22POINT2, 24, AV_CH_LAYOUT_22POINT2);
    define_layout!(_7POINT1_TOP_BACK, 8, AV_CH_LAYOUT_5POINT1POINT2_BACK);

    #[inline]
    pub fn channels(&self) -> i32 {
        self.0.nb_channels
    }

    #[inline]
    pub fn bits(&self) -> u64 {
        unsafe { self.0.u.mask }
    }

    pub fn default(number: i32) -> ChannelLayout {
        unsafe {
            let mut channel_layout = std::mem::zeroed();
            av_channel_layout_default(&mut channel_layout, number);
            ChannelLayout(channel_layout)
        }
    }

    // See https://ffmpeg.org/doxygen/trunk/group__lavu__audio__channels.html#gaa4a685b5c38835392552a7f96ee24a3e,
    // AV_CH_UNUSED
    pub fn is_empty(&self) -> bool {
        self.0.order == AVChannelOrder::AV_CHANNEL_ORDER_UNSPEC
    }
}

impl From<AVChannelLayout> for ChannelLayout {
    fn from(value: AVChannelLayout) -> Self {
        Self(value)
    }
}

impl From<ChannelLayout> for AVChannelLayout {
    fn from(value: ChannelLayout) -> Self {
        value.0
    }
}
