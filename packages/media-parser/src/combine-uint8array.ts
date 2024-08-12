export const combineUint8Arrays = (
	array1: Uint8Array | null,
	array2: Uint8Array,
) => {
	if (!array1) {
		return array2;
	}

	const combined = new Uint8Array(array1.length + array2.length);
	combined.set(array1);
	combined.set(array2, array1.length);
	return combined;
};
