/**
 * Performs median filter on the provided data. Padding is done by mirroring the data.
 * @param {AnyTypedArray} data The input array
 * @param {number} windowSize The window size
 */
export function medianFilter(
	data: Float32Array | Float64Array,
	windowSize: number,
) {
	if (windowSize % 2 === 0 || windowSize <= 0) {
		throw new Error('Window size must be a positive odd number');
	}

	// @ts-expect-error
	const outputArray = new data.constructor(data.length);

	// @ts-expect-error
	const buffer = new data.constructor(windowSize); // Reusable array for storing values

	const halfWindowSize = Math.floor(windowSize / 2);

	for (let i = 0; i < data.length; ++i) {
		let valuesIndex = 0;

		for (let j = -halfWindowSize; j <= halfWindowSize; ++j) {
			let index = i + j;
			if (index < 0) {
				index = Math.abs(index);
			} else if (index >= data.length) {
				index = 2 * (data.length - 1) - index;
			}

			buffer[valuesIndex++] = data[index];
		}

		buffer.sort();
		outputArray[i] = buffer[halfWindowSize];
	}

	return outputArray;
}
