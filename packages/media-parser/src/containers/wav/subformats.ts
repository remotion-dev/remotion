export const WMMEDIASUBTYPE_PCM = [
	1, 0, 0, 0, 0, 0, 16, 0, 128, 0, 0, 170, 0, 56, 155, 113,
];
export const KSDATAFORMAT_SUBTYPE_IEEE_FLOAT = [
	3, 0, 0, 0, 0, 0, 16, 0, 128, 0, 0, 170, 0, 56, 155, 113,
];

export const subformatIsPcm = (subformat: Uint8Array) => {
	return subformat.every((value, index) => value === WMMEDIASUBTYPE_PCM[index]);
};

export const subformatIsIeeeFloat = (subformat: Uint8Array) => {
	return subformat.every(
		(value, index) => value === KSDATAFORMAT_SUBTYPE_IEEE_FLOAT[index],
	);
};
