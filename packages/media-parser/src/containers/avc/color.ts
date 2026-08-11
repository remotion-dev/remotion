// https://w3c.github.io/webcodecs/#videomatrixcoefficients
// But we may support more than that
export type MediaParserMatrixCoefficients =
	| 'rgb'
	| 'bt709'
	| 'bt470bg'
	| 'smpte170m'
	| 'bt2020-ncl';

export const getMatrixCoefficientsFromIndex = (
	index: number,
): MediaParserMatrixCoefficients | null => {
	if (index === 0) {
		return 'rgb';
	}

	if (index === 1) {
		return 'bt709';
	}

	if (index === 5) {
		return 'bt470bg';
	}

	if (index === 6) {
		return 'smpte170m';
	}

	if (index === 9) {
		return 'bt2020-ncl';
	}

	return null;
};

export type MediaParserTransferCharacteristics =
	| 'bt709'
	| 'smpte170m'
	| 'iec61966-2-1'
	| 'linear'
	| 'pq'
	| 'hlg';

// https://w3c.github.io/webcodecs/#videotransfercharacteristics
// But we may support more than that
export const getTransferCharacteristicsFromIndex = (
	index: number,
): MediaParserTransferCharacteristics | null => {
	if (index === 1) {
		return 'bt709';
	}

	if (index === 6) {
		return 'smpte170m';
	}

	if (index === 8) {
		return 'linear';
	}

	if (index === 13) {
		return 'iec61966-2-1';
	}

	if (index === 16) {
		return 'pq';
	}

	if (index === 18) {
		return 'hlg';
	}

	return null;
};

// https://w3c.github.io/webcodecs/#videocolorprimaries
// But we may support more than that
export type MediaParserPrimaries =
	| 'bt709'
	| 'bt470bg'
	| 'smpte170m'
	| 'bt2020'
	| 'smpte432'
	| null;

export const getPrimariesFromIndex = (
	index: number,
): MediaParserPrimaries | null => {
	if (index === 1) {
		return 'bt709';
	}

	if (index === 5) {
		return 'bt470bg';
	}

	if (index === 6) {
		return 'smpte170m';
	}

	if (index === 9) {
		return 'bt2020';
	}

	if (index === 12) {
		return 'smpte432';
	}

	return null;
};
