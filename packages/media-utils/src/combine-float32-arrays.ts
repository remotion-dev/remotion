export const combineFloat32Arrays = (arrays: Float32Array[]) => {
	if (arrays.length === 0) {
		return new Float32Array([]);
	}

	if (arrays.length === 1) {
		return arrays[0];
	}

	let totalLength = 0;
	for (const array of arrays) {
		totalLength += array.length;
	}

	const result = new Float32Array(totalLength);
	let offset = 0;
	for (const array of arrays) {
		result.set(array, offset);
		offset += array.length;
	}

	return result;
};
