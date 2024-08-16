import {webmPattern} from './boxes/webm/make-header';
import {
	knownIdsWithOneLength,
	knownIdsWithThreeLength,
	knownIdsWithTwoLength,
} from './boxes/webm/segments/all-segments';

export class OffsetCounter {
	#offset: number;
	#discardedBytes: number;
	constructor(initial: number) {
		this.#offset = initial;
		this.#discardedBytes = 0;
	}

	increment(amount: number) {
		if (amount < 0) {
			throw new Error('Cannot increment by a negative amount: ' + amount);
		}

		this.#offset += amount;
	}

	getOffset(): number {
		return this.#offset;
	}

	getDiscardedOffset(): number {
		return this.#offset - this.#discardedBytes;
	}

	setDiscardedOffset(offset: number) {
		this.#discardedBytes = offset;
	}

	discardBytes(amount: number) {
		this.#discardedBytes += amount;
	}

	decrement(amount: number) {
		if (amount < 0) {
			throw new Error('Cannot decrement by a negative amount');
		}

		this.#offset -= amount;
	}
}

const isoBaseMediaMp4Pattern = new TextEncoder().encode('ftyp');
const mpegPattern = new Uint8Array([0xff, 0xf3, 0xe4, 0x64]);

const matchesPattern = (pattern: Uint8Array) => {
	return (data: Uint8Array) => {
		return pattern.every((value, index) => data[index] === value);
	};
};

const makeOffsetCounter = (): OffsetCounter => {
	return new OffsetCounter(0);
};

export const getArrayBufferIterator = (
	initialData: Uint8Array,
	maxBytes?: number,
) => {
	const buf = new ArrayBuffer(initialData.byteLength, {
		maxByteLength: maxBytes ?? 1_000_000_000,
	});
	if (!buf.resize) {
		throw new Error(
			'`ArrayBuffer.resize` is not supported in this Runtime. On the server: Use at least Node.js 20 or Bun. In the browser: Chrome 111, Edge 111, Safari 16.4, Firefox 128, Opera 111',
		);
	}

	let data = new Uint8Array(buf);
	data.set(initialData);

	let view = new DataView(data.buffer);
	const counter = makeOffsetCounter();

	const getSlice = (amount: number) => {
		const value = data.slice(
			counter.getDiscardedOffset(),
			counter.getDiscardedOffset() + amount,
		);
		counter.increment(amount);

		return value;
	};

	const getUint8 = () => {
		const val = view.getUint8(counter.getDiscardedOffset());
		counter.increment(1);

		return val;
	};

	const getFourByteNumber = () => {
		return (
			(getUint8() << 24) | (getUint8() << 16) | (getUint8() << 8) | getUint8()
		);
	};

	const getPaddedFourByteNumber = () => {
		let lastInt = 128;
		while (((lastInt = getUint8()), lastInt === 128)) {
			// Do nothing
		}

		return lastInt;
	};

	const getUint32 = () => {
		const val = view.getUint32(counter.getDiscardedOffset());
		counter.increment(4);
		return val;
	};

	const getUint32Le = () => {
		const val = view.getUint32(counter.getDiscardedOffset(), true);
		counter.increment(4);
		return val;
	};

	const getInt32Le = () => {
		const val = view.getInt32(counter.getDiscardedOffset(), true);
		counter.increment(4);
		return val;
	};

	const getInt32 = () => {
		const val = view.getInt32(counter.getDiscardedOffset());
		counter.increment(4);
		return val;
	};

	const addData = (newData: Uint8Array) => {
		const oldLength = buf.byteLength;
		const newLength = oldLength + newData.byteLength;
		buf.resize(newLength);
		const newArray = new Uint8Array(buf);
		newArray.set(newData, oldLength);
		data = newArray;
		view = new DataView(data.buffer);
	};

	const byteLength = () => {
		return data.byteLength;
	};

	const bytesRemaining = () => {
		return data.byteLength - counter.getDiscardedOffset();
	};

	const isIsoBaseMedia = () => {
		return matchesPattern(isoBaseMediaMp4Pattern)(data.subarray(4, 8));
	};

	const isWebm = () => {
		return matchesPattern(webmPattern)(data.subarray(0, 4));
	};

	const isMp3 = () => {
		return matchesPattern(mpegPattern)(data.subarray(0, 4));
	};

	const removeBytesRead = () => {
		const bytesToRemove = counter.getDiscardedOffset();

		// Only to this operation if it is really worth it 😇
		if (bytesToRemove < 100_000) {
			return;
		}

		counter.discardBytes(bytesToRemove);
		const newData = data.slice(bytesToRemove);
		data.set(newData);
		buf.resize(newData.byteLength);
		view = new DataView(data.buffer);
	};

	const skipTo = (offset: number) => {
		const becomesSmaller = offset < counter.getOffset();
		if (becomesSmaller) {
			buf.resize(0);
			counter.decrement(counter.getOffset() - offset);
			counter.setDiscardedOffset(offset);
		} else {
			buf.resize(offset);
			const currentOffset = counter.getOffset();
			counter.increment(offset - currentOffset);
			removeBytesRead();
		}
	};

	const peekB = (length: number) => {
		// eslint-disable-next-line no-console
		console.log(
			[...getSlice(length)].map((b) => b.toString(16).padStart(2, '0')),
		);
		counter.decrement(length);
	};

	const peekD = (length: number) => {
		// eslint-disable-next-line no-console
		console.log([...getSlice(length)].map((b) => b));
		counter.decrement(length);
	};

	const leb128 = () => {
		let result = 0;
		let shift = 0;
		let byte;

		do {
			byte = getBits(8);
			result |= (byte & 0x7f) << shift;
			shift += 7;
		} while (byte >= 0x80); // Continue if the high bit is set

		return result;
	};

	let bitIndex = 0;

	const stopReadingBits = () => {
		bitIndex = 0;
	};

	let byteToShift = 0;

	const startReadingBits = () => {
		byteToShift = getUint8();
	};

	const getBits = (bits: number) => {
		let result = 0;
		let bitsCollected = 0;

		while (bitsCollected < bits) {
			if (bitIndex >= 8) {
				bitIndex = 0;
				byteToShift = getUint8();
			}

			const remainingBitsInByte = 8 - bitIndex;
			const bitsToReadNow = Math.min(bits - bitsCollected, remainingBitsInByte);
			const mask = (1 << bitsToReadNow) - 1;
			const shift = remainingBitsInByte - bitsToReadNow;

			result <<= bitsToReadNow;
			result |= (byteToShift >> shift) & mask;

			bitsCollected += bitsToReadNow;
			bitIndex += bitsToReadNow;
		}

		return result;
	};

	const destroy = () => {
		data = new Uint8Array(0);
		buf.resize(0);
	};

	return {
		startReadingBits,
		stopReadingBits,
		skipTo,
		addData,
		counter,
		peekB,
		peekD,
		getBits,
		byteLength,
		bytesRemaining,
		isIsoBaseMedia,
		leb128,
		discardFirstBytes: removeBytesRead,
		isWebm,
		discard: (length: number) => {
			counter.increment(length);
		},
		getFourByteNumber,
		getSlice,
		getAtom: () => {
			const atom = getSlice(4);
			return new TextDecoder().decode(atom);
		},
		getPaddedFourByteNumber,
		getMatroskaSegmentId: () => {
			const first = getSlice(1);
			const firstOneString = `0x${Array.from(new Uint8Array(first))
				.map((b) => {
					return b.toString(16).padStart(2, '0');
				})
				.join('')}`;

			// Catch void block
			// https://www.matroska.org/technical/elements.html

			if (knownIdsWithOneLength.includes(firstOneString)) {
				return firstOneString;
			}

			const firstTwo = getSlice(1);

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

			const firstThree = getSlice(1);

			const firstThreeString = `${firstTwoString}${Array.from(
				new Uint8Array(firstThree),
			)
				.map((b) => {
					return b.toString(16).padStart(2, '0');
				})
				.join('')}`;

			if (knownIdsWithThreeLength.includes(firstThreeString)) {
				return firstThreeString;
			}

			const segmentId = getSlice(1);

			return `${firstThreeString}${Array.from(new Uint8Array(segmentId))
				.map((b) => {
					return b.toString(16).padStart(2, '0');
				})
				.join('')}`;
		},
		getVint: () => {
			const firstByte = getUint8();
			const totalLength = firstByte;

			if (totalLength === 0) {
				return 0;
			}

			// Calculate the actual length of the data based on the first set bit
			let actualLength = 0;
			while (((totalLength >> (7 - actualLength)) & 0x01) === 0) {
				actualLength++;
			}

			const slice = getSlice(actualLength);
			const d = [firstByte, ...Array.from(new Uint8Array(slice))];

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
			const val = view.getInt8(counter.getDiscardedOffset());
			counter.increment(1);
			return val;
		},
		getUint16: () => {
			const val = view.getUint16(counter.getDiscardedOffset());
			counter.increment(2);
			return val;
		},
		getUint24: () => {
			const val1 = view.getUint8(counter.getDiscardedOffset());
			const val2 = view.getUint8(counter.getDiscardedOffset());
			const val3 = view.getUint8(counter.getDiscardedOffset());
			counter.increment(3);
			return (val1 << 16) | (val2 << 8) | val3;
		},

		getInt16: () => {
			const val = view.getInt16(counter.getDiscardedOffset());
			counter.increment(2);
			return val;
		},
		getUint32,
		// https://developer.apple.com/documentation/quicktime-file-format/sound_sample_description_version_1
		// A 32-bit unsigned fixed-point number (16.16) that indicates the rate at which the sound samples were obtained.
		getFixedPointUnsigned1616Number: () => {
			const val = getUint32();
			return val / 2 ** 16;
		},
		getFixedPointSigned1616Number: () => {
			const val = getInt32();
			return val / 2 ** 16;
		},
		getFixedPointSigned230Number: () => {
			const val = getInt32();
			return val / 2 ** 30;
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
		getByteString(length: number): string {
			const bytes = getSlice(length);
			return new TextDecoder().decode(bytes).trim();
		},
		getFloat64: () => {
			const val = view.getFloat64(counter.getDiscardedOffset());
			counter.increment(8);
			return val;
		},
		getFloat32: () => {
			const val = view.getFloat32(counter.getDiscardedOffset());
			counter.increment(4);
			return val;
		},
		getUint32Le,
		getInt32Le,
		destroy,
		isMp3,
	};
};

export type BufferIterator = ReturnType<typeof getArrayBufferIterator>;
