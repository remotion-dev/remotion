import {getVariableInt} from './ebml';
import {matroskaElements} from './segments/all-segments';

export const webmPattern = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]);

const matroskaToHex = (
	matrId: (typeof matroskaElements)[keyof typeof matroskaElements],
) => {
	const numbers: number[] = [];
	for (let i = 2; i < matrId.length; i += 2) {
		const hex = matrId.substr(i, 2);
		numbers.push(parseInt(hex, 16));
	}

	return numbers;
};

export const makeMatroskaHeader = () => {
	const size = 0x23;

	const array = new Uint8Array([
		...webmPattern,
		...getVariableInt(size),
		...matroskaToHex(matroskaElements.EBMLVersion),
		...getVariableInt(1),
		1,
		...matroskaToHex(matroskaElements.EBMLReadVersion),
		...getVariableInt(1),
		1,
		...matroskaToHex(matroskaElements.EBMLMaxIDLength),
		...getVariableInt(1),
		4,
		...matroskaToHex(matroskaElements.EBMLMaxSizeLength),
		...getVariableInt(1),
		8,
		...matroskaToHex(matroskaElements.DocType),
		...getVariableInt(8),
		...new TextEncoder().encode('matroska'),
		...matroskaToHex(matroskaElements.DocTypeVersion),
		...getVariableInt(1),
		4,
		...matroskaToHex(matroskaElements.DocTypeReadVersion),
		...getVariableInt(1),
		2,
	]);

	return array;
};
