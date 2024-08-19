import {getVariableInt} from './ebml';
import type {
	Ebml,
	EbmlWithChildren,
	EbmlWithString,
	EbmlWithUint8,
	EmblTypes,
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

type ChildFields<Struct extends HeaderStructure> = {
	[key in keyof Struct &
		Numbers as Struct[key]['name']]: EmblTypes[Struct[key]['type']];
};

type SerializeValue<Struct extends Ebml> = Struct extends EbmlWithChildren
	? ChildFields<Struct['children']>
	: Struct extends EbmlWithString
		? string
		: Struct extends EbmlWithUint8
			? number
			: undefined;

const makeFromHeaderStructure = <Struct extends Ebml>(
	struct: Struct,
	fields: SerializeValue<Struct>,
): Uint8Array => {
	const arrays: Uint8Array[] = [];

	if (struct.type === 'children') {
		for (const item of struct.children) {
			arrays.push(
				makeMatroskaHeader(
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

	if (struct.type === 'uint-8') {
		return new Uint8Array([fields as number]);
	}

	if (struct.type === 'void') {
		throw new Error('Serializing Void is not implemented');
	}

	throw new Error('Unexpected type');
};

export const makeMatroskaHeader = <Struct extends Ebml>(
	struct: Struct,
	fields: SerializeValue<Struct>,
) => {
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
