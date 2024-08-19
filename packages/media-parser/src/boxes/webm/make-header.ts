import {getVariableInt} from './ebml';
import type {
	Ebml,
	EmblTypes,
	HeaderStructure,
	matroskaElements,
} from './segments/all-segments';
import {getIdForName, matroskaHeaderStructure} from './segments/all-segments';

export const webmPattern = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]);

const matroskaToHex = (
	matrId: (typeof matroskaElements)[keyof typeof matroskaElements],
) => {
	const numbers: Uint8Array = new Uint8Array(2);

	for (let i = 2; i < matrId.length; i += 2) {
		const hex = matrId.substring(i, i + 2);
		numbers[(i - 2) / 2] = parseInt(hex, 16);
	}

	return numbers;
};

const makeField = <T extends Ebml>(element: T, value: EmblTypes[T['type']]) => {
	let val;
	if (typeof value === 'string') {
		val = new TextEncoder().encode(value);
	} else if (typeof value === 'number') {
		val = new Uint8Array([value]);
	} else {
		throw new Error('element value');
	}

	return combineUint8Arrays([
		matroskaToHex(getIdForName(element.name)),
		getVariableInt(val.byteLength),
		val,
	]);
};

type Numbers = '0' | '1' | '2' | '3' | '4' | '5' | '6';

const makeFromHeaderStructure = <Struct extends HeaderStructure>(
	struct: Struct,
	fields: {
		[key in keyof Struct &
			Numbers as Struct[key]['name']]: EmblTypes[Struct[key]['type']];
	},
) => {
	const arrays: Uint8Array[] = [];

	for (const item of struct) {
		// @ts-expect-error
		arrays.push(makeField(item, fields[item.name]));
	}

	return combineUint8Arrays(arrays);
};

export const makeMatroskaHeader = () => {
	const fields = makeFromHeaderStructure(matroskaHeaderStructure, {
		DocType: 'matroska',
		DocTypeVersion: 4,
		DocTypeReadVersion: 2,
		EBMLMaxIDLength: 4,
		EBMLMaxSizeLength: 8,
		EBMLReadVersion: 1,
		EBMLVersion: 1,
	});

	return combineUint8Arrays([
		webmPattern,
		getVariableInt(fields.length),
		fields,
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
