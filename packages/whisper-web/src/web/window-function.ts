function generalized_cosine_window(M: number, a_0: number) {
	if (M < 1) {
		return new Float64Array();
	}

	if (M === 1) {
		return new Float64Array([1]);
	}

	const a_1 = 1 - a_0;
	const factor = (2 * Math.PI) / (M - 1);

	const cos_vals = new Float64Array(M);
	for (let i = 0; i < M; ++i) {
		cos_vals[i] = a_0 - a_1 * Math.cos(i * factor);
	}

	return cos_vals;
}

function hanning(M: number) {
	return generalized_cosine_window(M, 0.5);
}

export function window_function(
	window_length: number,
	name: 'hann',
	{periodic = true, frame_length = null} = {},
) {
	const length = periodic ? window_length + 1 : window_length;
	let window;
	switch (name) {
		case 'hann':
			window = hanning(length);
			break;
		default:
			throw new Error(`Unknown window type ${name}.`);
	}

	if (periodic) {
		window = window.subarray(0, window_length);
	}

	if (frame_length === null) {
		return window;
	}

	if (window_length > frame_length) {
		throw new Error(
			`Length of the window (${window_length}) may not be larger than frame_length (${frame_length})`,
		);
	}

	return window;
}
