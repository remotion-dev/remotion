import type {BufferIterator} from '../../buffer-iterator';
import type {Mp3Structure} from '../../parse-result';

function combine28Bits(a: number, b: number, c: number, d: number): number {
	// Mask each number to ignore first bit (& 0x7F)
	const val1 = a & 0x7f; // 7 bits from first byte
	const val2 = b & 0x7f; // 7 bits from second byte
	const val3 = c & 0x7f; // 7 bits from third byte
	const val4 = d & 0x7f; // 7 bits from fourth byte

	// Combine all values using bitwise operations
	return (val1 << 21) | (val2 << 14) | (val3 << 7) | val4;
}

export const parseId3 = (iterator: BufferIterator, structure: Mp3Structure) => {
	const versionMajor = iterator.getUint8();
	const versionMinor = iterator.getUint8();
	const flags = iterator.getUint8();
	const sizeArr = iterator.getSlice(4);
	const size = combine28Bits(sizeArr[0], sizeArr[1], sizeArr[2], sizeArr[3]);
	// TODO: What if not enough data is available, don't do it
	iterator.getSlice(size);

	structure.boxes.push({
		type: 'id3-header',
		flags,
		size,
		versionMajor,
		versionMinor,
	});
};
