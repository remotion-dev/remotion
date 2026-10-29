use super::{decoder, encoder};
use codec::{Audio, Id, Video};
use Codec;

pub trait Decoder {
    fn decoder(self) -> Option<Codec>;
}

impl<'a> Decoder for &'a str {
    fn decoder(self) -> Option<Codec> {
        decoder::find_by_name(self)
    }
}

impl Decoder for Id {
    fn decoder(self) -> Option<Codec> {
        decoder::find(self)
    }
}

impl Decoder for Codec {
    fn decoder(self) -> Option<Codec> {
        if self.is_decoder() {
            Some(self)
        } else {
            None
        }
    }
}

impl Decoder for Option<Codec> {
    fn decoder(self) -> Option<Codec> {
        self.and_then(|c| c.decoder())
    }
}

impl Decoder for Audio {
    fn decoder(self) -> Option<Codec> {
        if self.is_decoder() {
            Some(*self)
        } else {
            None
        }
    }
}

impl Decoder for Video {
    fn decoder(self) -> Option<Codec> {
        if self.is_decoder() {
            Some(*self)
        } else {
            None
        }
    }
}

pub trait Encoder {
    fn encoder(self) -> Option<Codec>;
}

impl<'a> Encoder for &'a str {
    fn encoder(self) -> Option<Codec> {
        encoder::find_by_name(self)
    }
}

impl Encoder for Id {
    fn encoder(self) -> Option<Codec> {
        encoder::find(self)
    }
}

impl Encoder for Codec {
    fn encoder(self) -> Option<Codec> {
        if self.is_encoder() {
            Some(self)
        } else {
            None
        }
    }
}

impl Encoder for Option<Codec> {
    fn encoder(self) -> Option<Codec> {
        self.and_then(|c| c.encoder())
    }
}

impl Encoder for Audio {
    fn encoder(self) -> Option<Codec> {
        if self.is_encoder() {
            Some(*self)
        } else {
            None
        }
    }
}

impl Encoder for Video {
    fn encoder(self) -> Option<Codec> {
        if self.is_encoder() {
            Some(*self)
        } else {
            None
        }
    }
}
