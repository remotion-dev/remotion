import {getVariableInt} from './ebml';
import type {Prettify} from './parse-ebml';
import type {
	Ebml,
	EbmlWithChildren,
	EbmlWithHexString,
	EbmlWithString,
	EbmlWithUint8,
	HeaderStructure,
	matroskaElements,
} from './segments/all-segments';
import {getIdForName} from './segments/all-segments';

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

type Numbers = '0' | '1' | '2' | '3' | '4' | '5' | '6';

type ChildFields<StructArray extends HeaderStructure> = {
	[key in keyof StructArray &
		Numbers as StructArray[key]['name']]: SerializeValue<StructArray[key]>;
};

type SerializeValue<Struct extends Ebml> =
	| Uint8Array
	| (Struct extends EbmlWithChildren
			? Prettify<ChildFields<Struct['children']>>
			: Struct extends EbmlWithString
				? string
				: Struct extends EbmlWithUint8
					? number
					: Struct extends EbmlWithHexString
						? string
						: undefined);

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

const makeFromHeaderStructure = <Struct extends Ebml>(
	struct: Struct,
	fields: SerializeValue<Struct>,
): Uint8Array => {
	const arrays: Uint8Array[] = [];

	if (struct.type === 'children') {
		for (const item of struct.children) {
			arrays.push(
				makeMatroskaBytes(
					item,
					// @ts-expect-error
					fields[item.name],
				),
			);
		}

		return combineUint8Arrays(arrays);
	}

	if (struct.type === 'string') {
		return new TextEncoder().encode(fields as string);
	}

	if (struct.type === 'uint') {
		return putUintDynamic(fields as number);
	}

	if (struct.type === 'hex-string') {
		const hex = (fields as string).substring(2);
		const arr = new Uint8Array(hex.length / 2);
		for (let i = 0; i < hex.length; i += 2) {
			const byte = parseInt(hex.substring(i, i + 2), 16);
			arr[i / 2] = byte;
		}

		return arr;
	}

	if (struct.type === 'void') {
		throw new Error('Serializing Void is not implemented');
	}

	throw new Error('Unexpected type');
};

export const makeMatroskaBytes = <Struct extends Ebml>(
	struct: Struct,
	fields: SerializeValue<Struct>,
) => {
	if (fields instanceof Uint8Array) {
		return fields;
	}

	const value = makeFromHeaderStructure(struct, fields);

	return combineUint8Arrays([
		matroskaToHex(getIdForName(struct.name)),
		getVariableInt(value.length),
		value,
	]);
};

const combineUint8Arrays = (arrays: Uint8Array[]) => {
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
