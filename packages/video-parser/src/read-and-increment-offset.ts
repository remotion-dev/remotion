export class OffsetCounter {
	#offset: number;
	constructor(initial: number) {
		this.#offset = initial;
	}

	increment(amount: number) {
		this.#offset += amount;
	}

	getOffset(): number {
		return this.#offset;
	}
}

const makeOffsetCounter = (initial: number): OffsetCounter => {
	return new OffsetCounter(initial);
};

export const getArrayBufferIterator = (
	data: ArrayBuffer,
	initialOffset: number,
) => {
	const view = new DataView(data);
	const counter = makeOffsetCounter(initialOffset);

	const getSlice = (amount: number) => {
		const value = data.slice(counter.getOffset(), counter.getOffset() + amount);
		counter.increment(amount);
		return value;
	};

	const getUint8 = () => {
		const val = view.getUint8(counter.getOffset());
		counter.increment(1);
		return val;
	};

	const getUint32 = () => {
		const val = view.getUint32(counter.getOffset());
		counter.increment(4);
		return val;
	};

	return {
		view,
		counter,
		data,
		discard: (length: number) => {
			counter.increment(length);
		},
		getSlice,
		getAtom: () => {
			const atom = getSlice(4);
			return new TextDecoder().decode(atom);
		},
		getMatroskaSegmentId: () => {
			const first = getSlice(1);
			const firstOneString = `0x${Array.from(new Uint8Array(first))
				.map((b) => {
					return b.toString(16).padStart(2, '0');
				})
				.join('')}`;

			// Catch void block
			const knownIdsWithOneLength = ['0xec'];
			if (knownIdsWithOneLength.includes(firstOneString)) {
				return firstOneString;
			}

			const firstTwo = getSlice(1);

			const knownIdsWithTwoLength = ['0x4dbb', '0x53ac', '0xec01'];

			const firstTwoString = `${firstOneString}${Array.from(
				new Uint8Array(firstTwo),
			)
				.map((b) => {
					return b.toString(16).padStart(2, '0');
				})
				.join('')}`;

			if (knownIdsWithTwoLength.includes(firstTwoString)) {
				return firstTwoString;
			}

			const segmentId = getSlice(2);

			return `${firstTwoString}${Array.from(new Uint8Array(segmentId))
				.map((b) => {
					return b.toString(16).padStart(2, '0');
				})
				.join('')}`;
		},
		getVint: (bytes: number) => {
			const d = [...Array.from(new Uint8Array(getSlice(bytes)))];
			const totalLength = d[0];

			if (totalLength === 0) {
				return 0;
			}

			// Calculate the actual length of the data based on the first set bit
			let actualLength = 0;
			while (((totalLength >> (7 - actualLength)) & 0x01) === 0) {
				actualLength++;
			}

			actualLength += 1; // Include the first byte set as 1

			// Combine the numbers to form the integer value
			let value = 0;

			// Mask the first byte properly then start combining
			value = totalLength & (0xff >> actualLength);
			for (let i = 1; i < actualLength; i++) {
				value = (value << 8) | d[i];
			}

			return value;
		},
		getUint8,
		getEBML: () => {
			const val = getUint8();

			// https://darkcoding.net/software/reading-mediarecorders-webm-opus-output/#:~:text=The%20first%20four%20bytes%20(%201A,%E2%80%93%20read%20on%20for%20why).
			// You drop the initial 0 bits and the first 1 bit to get the value. 0x81 is 0b10000001, so there are zero inital 0 bits, meaning length one byte, and the value is 1. The 0x9F value for length of the EBML header we saw earlier is 0b10011111, still one byte, value is 0b0011111, which is 31 (the python repl is very helpful for these conversions).
			const actualValue = val & 0x7f; // 0x7F is binary 01111111, which masks out the first bit

			return actualValue;
		},
		getInt8: () => {
			const val = view.getInt8(counter.getOffset());
			counter.increment(1);
			return val;
		},
		getUint16: () => {
			const val = view.getUint16(counter.getOffset());
			counter.increment(2);
			return val;
		},
		getInt16: () => {
			const val = view.getInt16(counter.getOffset());
			counter.increment(2);
			return val;
		},
		getUint32,
		// https://developer.apple.com/documentation/quicktime-file-format/sound_sample_description_version_1
		// A 32-bit unsigned fixed-point number (16.16) that indicates the rate at which the sound samples were obtained.
		getFixedPoint1616Number: () => {
			const val = getUint32();
			return val / 2 ** 16;
		},
		getPascalString: () => {
			const val = getSlice(32);
			return [...Array.from(new Uint8Array(val))];
		},
		getDecimalBytes(length: number): number {
			const bytes = getSlice(length);
			const numbers = [...Array.from(new Uint8Array(bytes))];
			return numbers.reduce(
				(acc, byte, index) =>
					acc + (byte << (8 * (numbers.length - index - 1))),
				0,
			);
		},
	};
};

export type BufferIterator = ReturnType<typeof getArrayBufferIterator>;
