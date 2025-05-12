export function max(arr: number[] | Float32Array | Float64Array) {
	if (arr.length === 0) throw Error('Array must not be empty');
	let _max = arr[0];
	let indexOfMax = 0;
	for (let i = 1; i < arr.length; ++i) {
		if (arr[i] > _max) {
			_max = arr[i];
			indexOfMax = i;
		}
	}

	return [Number(_max), indexOfMax];
}

export function round(num: number, decimals: number) {
	const pow = 10 ** decimals;
	return Math.round(num * pow) / pow;
}

/**
 * Returns the value and index of the minimum element in an array.
 * @template {number[]|bigint[]|AnyTypedArray} T
 * @param {T} arr array of numbers.
 * @returns {T extends bigint[]|BigTypedArray ? [bigint, number] : [number, number]} the value and index of the minimum element, of the form: [valueOfMin, indexOfMin]
 * @throws {Error} If array is empty.
 */
export function min(arr: number[] | bigint[] | Float32Array | Float64Array) {
	if (arr.length === 0) throw Error('Array must not be empty');
	let _min = arr[0];
	let indexOfMin = 0;
	for (let i = 1; i < arr.length; ++i) {
		if (arr[i] < _min) {
			_min = arr[i];
			indexOfMin = i;
		}
	}

	return /** @type {T extends bigint[]|BigTypedArray ? [bigint, number] : [number, number]} */ [
		_min,
		indexOfMin,
	];
}
