import {getVariableInt} from './ebml';
import type {
	FloatWithSize,
	PossibleEbml,
	PossibleEbmlOrUint8Array,
	matroskaElements,
} from './segments/all-segments';
import {ebmlMap, getIdForName} from './segments/all-segments';

export const webmPattern = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]);

const matroskaToHex = (
	matrId: (typeof matroskaElements)[keyof typeof matroskaElements],
) => {
	const numbers: Uint8Array = new Uint8Array((matrId.length - 2) / 2);

	for (let i = 2; i < matrId.length; i += 2) {
		const hex = matrId.substring(i, i + 2);
		numbers[(i - 2) / 2] = parseInt(hex, 16);
	}

	return numbers;
};

function putUintDynamic(number: number) {
	if (number < 0) {
		throw new Error(
			'This function is designed for non-negative integers only.',
		);
	}

	// Calculate the minimum number of bytes needed to store the integer
	const length = Math.ceil(Math.log2(number + 1) / 8);
	const bytes = new Uint8Array(length);

	for (let i = 0; i < length; i++) {
		// Extract each byte from the number
		bytes[length - 1 - i] = (number >> (8 * i)) & 0xff;
	}

	return bytes;
}

const makeFromHeaderStructure = (
	fields: PossibleEbmlOrUint8Array,
): Uint8Array => {
	if (fields instanceof Uint8Array) {
		return fields;
	}

	const arrays: Uint8Array[] = [];

	const struct = ebmlMap[getIdForName(fields.type)];

	if (struct.type === 'uint8array') {
		return fields.value as Uint8Array;
	}

	if (struct.type === 'children') {
		for (const item of fields.value as PossibleEbml[]) {
			arrays.push(makeMatroskaBytes(item));
		}

		return combineUint8Arrays(arrays);
	}

	if (struct.type === 'string') {
		return new TextEncoder().encode(fields.value as string);
	}

	if (struct.type === 'uint') {
		return putUintDynamic(fields.value as number);
	}

	if (struct.type === 'hex-string') {
		const hex = (fields.value as string).substring(2);
		const arr = new Uint8Array(hex.length / 2);
		for (let i = 0; i < hex.length; i += 2) {
			const byte = parseInt(hex.substring(i, i + 2), 16);
			arr[i / 2] = byte;
		}

		return arr;
	}

	if (struct.type === 'float') {
		const value = fields.value as FloatWithSize;
		if (value.size === '32') {
			const dataView = new DataView(new ArrayBuffer(4));
			dataView.setFloat32(0, value.value);
			return new Uint8Array(dataView.buffer);
		}

		const dataView2 = new DataView(new ArrayBuffer(8));
		dataView2.setFloat64(0, fields.value as number);
		return new Uint8Array(dataView2.buffer);
	}

	throw new Error('Unexpected type');
};

export const makeMatroskaBytes = (fields: PossibleEbmlOrUint8Array) => {
	if (fields instanceof Uint8Array) {
		return fields;
	}

	const value = makeFromHeaderStructure(fields);

	return combineUint8Arrays([
		matroskaToHex(getIdForName(fields.type)),
		getVariableInt(value.length),
		value,
	]);
};

export const combineUint8Arrays = (arrays: Uint8Array[]) => {
	if (arrays.length === 0) {
		return new Uint8Array([]);
	}

	if (arrays.length === 1) {
		return arrays[0];
	}

	let totalLength = 0;
	for (const array of arrays) {
		totalLength += array.length;
	}

	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (const array of arrays) {
		result.set(array, offset);
		offset += array.length;
	}

	return result;
};
