import {getVariableInt} from './ebml';
import type {Ebml, EmblTypes, matroskaElements} from './segments/all-segments';
import {
	docType,
	docTypeReadVersion,
	docTypeVersion,
	ebmlMaxIdLength,
	ebmlMaxSizeLength,
	ebmlReadVersion,
	ebmlVersion,
} from './segments/all-segments';

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
		matroskaToHex(element.value),
		getVariableInt(val.byteLength),
		val,
	]);
};

export const makeMatroskaHeader = () => {
	const fields = combineUint8Arrays([
		makeField(ebmlVersion, 1),
		makeField(ebmlReadVersion, 1),
		makeField(ebmlMaxIdLength, 4),
		makeField(ebmlMaxSizeLength, 8),
		makeField(docType, 'matroska'),
		makeField(docTypeVersion, 4),
		makeField(docTypeReadVersion, 2),
	]);

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
