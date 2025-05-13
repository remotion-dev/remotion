import {safeIndex, Tensor} from './tensor';

/**
 * Concatenates an array of tensors along a specified dimension.
 * @param {Tensor[]} tensors The array of tensors to concatenate.
 * @param {number} dim The dimension to concatenate along.
 * @returns {Tensor} The concatenated tensor.
 */
export function cat(tensors: Tensor[], dim: number = 0) {
	dim = safeIndex(dim, tensors[0].dims.length);

	// TODO do validation of shapes

	const resultDims = tensors[0].dims.slice();
	resultDims[dim] = tensors.reduce((a, b) => a + b.dims[dim], 0);

	// Create a new array to store the accumulated values
	const resultSize = resultDims.reduce((a, b) => a * b, 1);
	const result = new tensors[0].data.constructor(resultSize);

	// Create output tensor of same type as first
	const resultType = tensors[0].type;

	if (dim === 0) {
		// Handle special case for performance reasons

		let offset = 0;
		for (const tensor of tensors) {
			const tensorData = tensor.data;
			result.set(tensorData, offset);
			offset += tensorData.length;
		}
	} else {
		let currentDim = 0;

		for (let t = 0; t < tensors.length; ++t) {
			const {data, dims} = tensors[t];

			// Iterate over the data array
			for (let i = 0; i < data.length; ++i) {
				// Calculate the index in the resulting array
				let resultIndex = 0;

				for (
					let j = dims.length - 1, num = i, resultMultiplier = 1;
					j >= 0;
					--j
				) {
					const size = dims[j];
					let index = num % size;
					if (j === dim) {
						index += currentDim;
					}

					resultIndex += index * resultMultiplier;
					resultMultiplier *= resultDims[j];
					num = Math.floor(num / size);
				}

				// Accumulate the value at the current index
				result[resultIndex] = data[i];
			}

			currentDim += dims[dim];
		}
	}

	return new Tensor(resultType, result, resultDims);
}

/**
 * Stack an array of tensors along a specified dimension.
 * @param {Tensor[]} tensors The array of tensors to stack.
 * @param {number} dim The dimension to stack along.
 * @returns {Tensor} The stacked tensor.
 */
export function stack(tensors: Tensor[], dim: number = 0) {
	// TODO do validation of shapes
	// NOTE: stack expects each tensor to be equal size
	return cat(
		tensors.map((t) => t.unsqueeze(dim)),
		dim,
	);
}
