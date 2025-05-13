import {mean, reduce_helper, safeIndex, Tensor} from './tensor';

/**
 * Calculates the standard deviation and mean over the dimensions specified by dim. dim can be a single dimension or `null` to reduce over all dimensions.
 * @param {Tensor} input the input tenso
 * @param {number|null} dim the dimension to reduce. If None, all dimensions are reduced.
 * @param {number} correction difference between the sample size and sample degrees of freedom. Defaults to Bessel's correction, correction=1.
 * @param {boolean} keepdim whether the output tensor has dim retained or not.
 * @returns {Tensor[]} A tuple of (std, mean) tensors.
 */
export function std_mean(
	input: Tensor,
	dim: number | null = null,
	correction = 1,
	keepdim = false,
) {
	const inputData = /** @type {Float32Array} */ input.data;
	const inputDims = input.dims;

	if (dim === null) {
		// None to reduce over all dimensions.
		const sum = inputData.reduce((a: number, b: number) => a + b, 0);
		const _mean = sum / inputData.length;
		const std = Math.sqrt(
			inputData.reduce((a: number, b: number) => a + (b - _mean) ** 2, 0) /
				(inputData.length - correction),
		);

		const _meanTensor = new Tensor(
			input.type,
			[_mean],
			[
				/* scalar */
			],
		);
		const _stdTensor = new Tensor(
			input.type,
			[std],
			[
				/* scalar */
			],
		);

		return [_stdTensor, _meanTensor];
	}

	dim = safeIndex(dim, inputDims.length);
	const meanTensor = mean(input, dim, keepdim);
	const meanTensorData = meanTensor.data;

	// Compute squared sum
	const [type, result, resultDims] = reduce_helper(
		(a, b, _i, j) => a + (b - meanTensorData[j!]) ** 2,
		input,
		dim,
		keepdim,
	);

	// Square root of the squared sum
	for (let i = 0; i < result.length; ++i) {
		result[i] = Math.sqrt(result[i] / (inputDims[dim] - correction));
	}

	const stdTensor = new Tensor(type, result, resultDims);

	return [stdTensor, meanTensor];
}
