import type {BufferIterator} from '../../iterator/buffer-iterator';

// https://www.rfc-editor.org/rfc/rfc9639.html#name-channels-bits
export const getChannelCount = (iterator: BufferIterator) => {
	const bits = iterator.getBits(4);
	if (bits === 0b0000) {
		return 1;
	}

	if (bits === 0b0001) {
		return 2;
	}

	if (bits === 0b0010) {
		return 3;
	}

	if (bits === 0b0011) {
		return 4;
	}

	if (bits === 0b0100) {
		return 5;
	}

	if (bits === 0b0101) {
		return 6;
	}

	if (bits === 0b0110) {
		return 7;
	}

	if (bits === 0b0111) {
		return 8;
	}

	if (bits === 0b1000 || bits === 0b1001 || bits === 0b1010) {
		return 2;
	}

	// 0b1011..0b1111 are reserved per RFC 9639 §9.1.3 (Channels Bits).
	// Some encoders/files in the wild may nonetheless use these values.
	// Be lenient and treat them as stereo (2 channels) to keep parsing robust.
	if (bits >= 0b1011 && bits <= 0b1111) {
		return 2;
	}

	throw new Error(`Invalid channel count: ${bits.toString(2)}`);
};
