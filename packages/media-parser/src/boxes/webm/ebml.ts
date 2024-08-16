// https://github.com/Vanilagy/webm-muxer/blob/main/src/ebml.ts#L101

export const measureEBMLVarInt = (value: number) => {
	if (value < (1 << 7) - 1) {
		/** Top bit is set, leaving 7 bits to hold the integer, but we can't store
		 * 127 because "all bits set to one" is a reserved value. Same thing for the
		 * other cases below:
		 */
		return 1;
	}

	if (value < (1 << 14) - 1) {
		return 2;
	}

	if (value < (1 << 21) - 1) {
		return 3;
	}

	if (value < (1 << 28) - 1) {
		return 4;
	}

	if (value < 2 ** 35 - 1) {
		return 5;
	}

	if (value < 2 ** 42 - 1) {
		return 6;
	}

	throw new Error('EBML VINT size not supported ' + value);
};

export const getVariableInt = (
	value: number,
	width: number = measureEBMLVarInt(value),
) => {
	switch (width) {
		case 1:
			return new Uint8Array([(1 << 7) | value]);
		case 2:
			return new Uint8Array([(1 << 6) | (value >> 8), value]);
		case 3:
			return new Uint8Array([(1 << 5) | (value >> 16), value >> 8, value]);
		case 4:
			return new Uint8Array([
				(1 << 4) | (value >> 24),
				value >> 16,
				value >> 8,
				value,
			]);
		case 5:
			/**
			 * JavaScript converts its doubles to 32-bit integers for bitwise
			 * operations, so we need to do a division by 2^32 instead of a
			 * right-shift of 32 to retain those top 3 bits
			 */
			return new Uint8Array([
				(1 << 3) | ((value / 2 ** 32) & 0x7),
				value >> 24,
				value >> 16,
				value >> 8,
				value,
			]);
		case 6:
			return new Uint8Array([
				(1 << 2) | ((value / 2 ** 40) & 0x3),
				(value / 2 ** 32) | 0,
				value >> 24,
				value >> 16,
				value >> 8,
				value,
			]);
		default:
			throw new Error('Bad EBML VINT size ' + width);
	}
};
