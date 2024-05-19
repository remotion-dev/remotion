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
		getUint32: () => {
			const val = view.getUint32(counter.getOffset());
			counter.increment(4);
			return val;
		},
	};
};
