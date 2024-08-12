import type {BufferIterator} from '../../../../buffer-iterator';

export const uvlc = (stream: BufferIterator) => {
	let leadingZeroBits = 0;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const done = stream.getBits(1);
		if (done) {
			break;
		}

		leadingZeroBits++;
	}

	if (leadingZeroBits >= 32) {
		return (1 << 32) - 1;
	}

	const value = stream.getBits(leadingZeroBits);

	return value + (1 << leadingZeroBits) - 1;
};
