/**
 * Measures similarity between two temporal sequences (e.g., input audio and output tokens
 * to generate token-level timestamps).
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
export function dynamic_time_warping(matrix: number[][]) {
	const output_length = matrix.length;
	const input_length = matrix[0].length;

	const outputShape = [output_length + 1, input_length + 1];

	const cost = Array.from({length: outputShape[0]}, () =>
		Array(outputShape[1]).fill(Infinity),
	);
	cost[0][0] = 0;

	const trace = Array.from({length: outputShape[0]}, () =>
		Array(outputShape[1]).fill(-1),
	);

	for (let j = 1; j < outputShape[1]; ++j) {
		for (let i = 1; i < outputShape[0]; ++i) {
			const c0 = cost[i - 1][j - 1];
			const c1 = cost[i - 1][j];
			const c2 = cost[i][j - 1];

			let c;
			let t;
			if (c0 < c1 && c0 < c2) {
				c = c0;
				t = 0;
			} else if (c1 < c0 && c1 < c2) {
				c = c1;
				t = 1;
			} else {
				c = c2;
				t = 2;
			}

			cost[i][j] = matrix[i - 1][j - 1] + c;
			trace[i][j] = t;
		}
	}

	for (let i = 0; i < outputShape[1]; ++i) {
		// trace[0, :] = 2
		trace[0][i] = 2;
	}

	for (let i = 0; i < outputShape[0]; ++i) {
		// trace[:, 0] = 1
		trace[i][0] = 1;
	}

	// backtrace
	let i = output_length;
	let j = input_length;
	const text_indices = [];
	const time_indices = [];
	while (i > 0 || j > 0) {
		text_indices.push(i - 1);
		time_indices.push(j - 1);

		switch (trace[i][j]) {
			case 0:
				--i;
				--j;
				break;
			case 1:
				--i;
				break;
			case 2:
				--j;
				break;
			default:
				throw new Error(
					`Internal error in dynamic time warping. Unexpected trace[${i}, ${j}]. Please file a bug report.`,
				);
		}
	}

	text_indices.reverse();
	time_indices.reverse();

	return [text_indices, time_indices];
}
