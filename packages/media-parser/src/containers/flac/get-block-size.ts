import type {BufferIterator} from '../../iterator/buffer-iterator';

export const getBlockSize = (
	iterator: BufferIterator,
): number | 'uncommon-u16' | 'uncommon-u8' | null => {
	const bits = iterator.getBits(4);
	if (bits === 0b0000) {
		// Probably we are in the wrong spot overall, and just landed on a spot that incidentially hit the syncword.
		// Don't throw an error, in the parent function just keep reading.
		// Internal message with repro: https://discord.com/channels/@me/1314232261008162876/1410312296709881988
		return null;
	}

	if (bits === 0b0001) {
		return 192;
	}

	if (bits >= 0b0010 && bits <= 0b0101) {
		return 144 * 2 ** bits;
	}

	if (bits === 0b0110) {
		return 'uncommon-u8';
	}

	if (bits === 0b0111) {
		return 'uncommon-u16';
	}

	if (bits >= 0b1000 && bits <= 0b1111) {
		return 2 ** bits;
	}

	throw new Error('Invalid block size');
};
