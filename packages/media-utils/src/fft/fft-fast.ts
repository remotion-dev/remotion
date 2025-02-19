// https://pastebin.com/raw/D42RbPe5

// Function to reverse bits in an integer
function reverseBits(num: number, numBits: number) {
	let result = 0;
	for (let i = 0; i < numBits; i++) {
		result = (result << 1) | ((num >> i) & 1);
	}

	return result;
}

// Hamming window function
function hammingWindow(N: number) {
	const win = new Array(N);
	for (let i = 0; i < N; i++) {
		win[i] = 0.8 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1));
	}

	return win;
}

// Function to calculate the bit-reversed permutation indices
function bitReversePermutation(N: number) {
	const bitReversed = new Array(N);

	for (let i = 0; i < N; i++) {
		bitReversed[i] = reverseBits(i, Math.log2(N));
	}

	return bitReversed;
}

export const fftFast = function (vector: Int16Array): [number, number][] {
	const N = vector.length;

	const X: [number, number][] = new Array(N);

	if (N <= 1) {
		for (let i = 0; i < vector.length; i++) {
			const value = vector[i];
			X[i] = [value * 2, 0];
		}

		return X;
	}

	// Apply a windowing function to the input data
	const window = hammingWindow(N); // You can choose a different window function if needed
	for (let i = 0; i < N; i++) {
		X[i] = [vector[i] * window[i], 0];
	}

	// Bit-Reversal Permutation
	const bitReversed = bitReversePermutation(N);

	for (let i = 0; i < N; i++) {
		X[i] = [vector[bitReversed[i]], 0];
	}

	// Cooley-Tukey FFT
	for (let s = 1; s <= Math.log2(N); s++) {
		const m = 1 << s; // Number of elements in each subarray
		const mHalf = m / 2; // Half the number of elements in each subarray
		const angleIncrement = (2 * Math.PI) / m;

		for (let k = 0; k < N; k += m) {
			let omegaReal = 1.0;
			let omegaImag = 0.0;

			for (let j = 0; j < mHalf; j++) {
				const tReal =
					omegaReal * X[k + j + mHalf][0] - omegaImag * X[k + j + mHalf][1];
				const tImag =
					omegaReal * X[k + j + mHalf][1] + omegaImag * X[k + j + mHalf][0];

				const uReal = X[k + j][0];
				const uImag = X[k + j][1];

				X[k + j] = [uReal + tReal, uImag + tImag];
				X[k + j + mHalf] = [uReal - tReal, uImag - tImag];

				// Twiddle factor update
				const tempReal =
					omegaReal * Math.cos(angleIncrement) -
					omegaImag * Math.sin(angleIncrement);
				omegaImag =
					omegaReal * Math.sin(angleIncrement) +
					omegaImag * Math.cos(angleIncrement);
				omegaReal = tempReal;
			}
		}
	}

	return X;
};
