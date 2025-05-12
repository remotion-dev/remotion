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
