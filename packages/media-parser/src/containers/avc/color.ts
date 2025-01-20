export type MatrixCoefficients =
	| 'bt709'
	| 'bt470bg'
	| 'rgb'
	| 'smpte170m'
	| 'bt2020';

export const getMatrixCoefficientsFromIndex = (
	index: number,
): MatrixCoefficients | null => {
	return index === 1
		? 'bt709'
		: index === 5
			? 'bt470bg'
			: index === 6
				? 'smpte170m'
				: index === 9
					? 'bt2020'
					: null;
};

export type TransferCharacteristics =
	| 'bt709'
	| 'smpte170m'
	| 'iec61966-2-1'
	| 'arib-std-b67';

export const getTransferCharacteristicsFromIndex = (
	index: number,
): TransferCharacteristics | null => {
	return index === 1
		? 'bt709'
		: index === 6
			? 'smpte170m'
			: index === 13
				? 'iec61966-2-1'
				: index === 18
					? 'arib-std-b67'
					: null;
};

export type Primaries = 'bt709' | 'smpte170m' | 'bt470bg' | 'bt2020' | null;

export const getPrimariesFromIndex = (index: number): Primaries | null => {
	return index === 1
		? 'bt709'
		: index === 5
			? 'bt470bg'
			: index === 6
				? 'smpte170m'
				: index === 9
					? 'bt2020'
					: null;
};
