// Default stream and parsers for Uint8TypedArray data type

import type {GifSchema} from './parser';

export type Stream = {
	data: Uint8Array;
	pos: number;
};

export const buildStream = (uint8Data: Uint8Array) => ({
	data: uint8Data,
	pos: 0,
});

export const readByte = () => (stream: Stream) => {
	return stream.data[stream.pos++];
};

export const peekByte =
	(offset = 0) =>
	(stream: Stream) => {
		return stream.data[stream.pos + offset];
	};

export const readBytes = (length: number) => (stream: Stream) => {
	// eslint-disable-next-line no-return-assign
	return stream.data.subarray(stream.pos, (stream.pos += length));
};

export const peekBytes = (length: number) => (stream: Stream) => {
	return stream.data.subarray(stream.pos, stream.pos + length);
};

export const readString = (length: number) => (stream: Stream) => {
	return Array.from(readBytes(length)(stream))
		.map((value) => String.fromCharCode(value))
		.join('');
};

export const readUnsigned = (littleEndian: boolean) => (stream: Stream) => {
	const bytes = readBytes(2)(stream);
	return littleEndian ? (bytes[1] << 8) + bytes[0] : (bytes[0] << 8) + bytes[1];
};

export const readArray =
	<T>(
		byteSize: number,
		totalOrFunc: number | ((st: Stream, r: T, p: T) => number),
	) =>
	(stream: Stream, result: T, parent: T) => {
		const total =
			typeof totalOrFunc === 'function'
				? totalOrFunc(stream, result, parent)
				: totalOrFunc;

		const parser = readBytes(byteSize);
		const arr = new Array(total);
		for (let i = 0; i < total; i++) {
			arr[i] = parser(stream);
		}

		return arr;
	};

const subBitsTotal = (
	bits: boolean[],
	startIndex: number,
	length: number,
): number => {
	let result = 0;
	for (let i = 0; i < length; i++) {
		result += Number(bits[startIndex + i] && 2 ** (length - i - 1));
	}

	return result;
};

export const readBits =
	(schema: GifSchema) =>
	(stream: Stream): Record<string, number | boolean> => {
		const byte = readByte()(stream);
		// convert the byte to bit array
		const bits = new Array<boolean>(8);
		for (let i = 0; i < 8; i++) {
			bits[7 - i] = Boolean(byte & (1 << i));
		}

		// convert the bit array to values based on the schema
		// @ts-expect-error
		return Object.keys(schema).reduce(
			(res, key) => {
				// @ts-expect-error
				const def = schema[key];
				if (def.length) {
					res[key] = subBitsTotal(bits, def.index, def.length);
				} else {
					res[key] = bits[def.index];
				}

				return res;
			},
			{} as Record<string, number | boolean>,
		) as Record<string, number | boolean>;
	};
