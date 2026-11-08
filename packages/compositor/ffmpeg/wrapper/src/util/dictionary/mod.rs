mod immutable;
pub use self::immutable::Ref;

mod mutable;
pub use self::mutable::Ref as Mut;

mod owned;
pub use self::owned::Owned;

mod iter;
pub use self::iter::Iter;

#[macro_export]
macro_rules! dict {
	( $($key:expr => $value:expr),* $(,)*) => ({
			let mut dict = ::ffmpeg::Dictionary::new();

			$(
				dict.set($key, $value);
			)*

			dict
		}
	);
}
