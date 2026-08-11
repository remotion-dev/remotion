export const fftFast = function (vector: Int16Array): [number, number][] {
	const N = vector.length;

	if (N <= 1) {
		const base: [number, number][] = new Array(N);
		for (let i = 0; i < vector.length; i++) {
			const value = vector[i];
			base[i] = [value * 2, 0];
		}

		return base;
	}

	// Use typed arrays for calculation to avoid tuple property access overhead.
	const real = new Float64Array(N);
	const imag = new Float64Array(N);

	const halfN = N >> 1;
	let rev = 0;
	// Combined bit-reversal and the first stage (s=1) to reduce passes and allocations.
	for (let i = 0; i < N; i += 2) {
		const v1 = vector[rev];
		const v2 = vector[rev + halfN];
		real[i] = v1 + v2;
		imag[i] = 0;
		real[i + 1] = v1 - v2;
		imag[i + 1] = 0;

		// Efficiently advance the bit-reversal index for the next even i (i+2).
		let bit = halfN >> 1;
		while (rev & bit) {
			rev ^= bit;
			bit >>= 1;
		}

		rev ^= bit;
	}

	const logN = Math.log2(N);
	for (let s = 2; s <= logN; s++) {
		const m = 1 << s;
		const mHalf = m >> 1;
		const angleIncrement = (2 * Math.PI) / m;
		const cosA = Math.cos(angleIncrement);
		const sinA = Math.sin(angleIncrement);
		const m2 = m << 1;

		// Hoist j=0 butterfly to eliminate multiplications.
		if (s < logN) {
			for (let k = 0; k < N; k += m2) {
				const r10 = real[k];
				const r11 = imag[k];
				const r20 = real[k + mHalf];
				const r21 = imag[k + mHalf];
				real[k] = r10 + r20;
				imag[k] = r11 + r21;
				real[k + mHalf] = r10 - r20;
				imag[k + mHalf] = r11 - r21;

				const km = k + m;
				const r30 = real[km];
				const r31 = imag[km];
				const r40 = real[km + mHalf];
				const r41 = imag[km + mHalf];
				real[km] = r30 + r40;
				imag[km] = r31 + r41;
				real[km + mHalf] = r30 - r40;
				imag[km + mHalf] = r31 - r41;
			}
		} else {
			const r10 = real[0];
			const r11 = imag[0];
			const r20 = real[mHalf];
			const r21 = imag[mHalf];
			real[0] = r10 + r20;
			imag[0] = r11 + r21;
			real[mHalf] = r10 - r20;
			imag[mHalf] = r11 - r21;
		}

		// First twiddle factor update for j=0 -> j=1.
		let omegaReal = cosA;
		let omegaImag = sinA;

		for (let j = 1; j < mHalf; j++) {
			if (s < logN) {
				for (let k = j; k < N; k += m2) {
					const r10 = real[k];
					const r11 = imag[k];
					const r20 = real[k + mHalf];
					const r21 = imag[k + mHalf];
					const tR1 = omegaReal * r20 - omegaImag * r21;
					const tI1 = omegaReal * r21 + omegaImag * r20;
					real[k] = r10 + tR1;
					imag[k] = r11 + tI1;
					real[k + mHalf] = r10 - tR1;
					imag[k + mHalf] = r11 - tI1;

					const km = k + m;
					const r30 = real[km];
					const r31 = imag[km];
					const r40 = real[km + mHalf];
					const r41 = imag[km + mHalf];
					const tR2 = omegaReal * r40 - omegaImag * r41;
					const tI2 = omegaReal * r41 + omegaImag * r40;
					real[km] = r30 + tR2;
					imag[km] = r31 + tI2;
					real[km + mHalf] = r30 - tR2;
					imag[km + mHalf] = r31 - tI2;
				}
			} else {
				const r10 = real[j];
				const r11 = imag[j];
				const r20 = real[j + mHalf];
				const r21 = imag[j + mHalf];
				const tR = omegaReal * r20 - omegaImag * r21;
				const tI = omegaReal * r21 + omegaImag * r20;
				real[j] = r10 + tR;
				imag[j] = r11 + tI;
				real[j + mHalf] = r10 - tR;
				imag[j + mHalf] = r11 - tI;
			}

			// Bit-exact twiddle factor update.
			const tempReal = omegaReal * cosA - omegaImag * sinA;
			omegaImag = omegaReal * sinA + omegaImag * cosA;
			omegaReal = tempReal;
		}
	}

	// Final conversion to the required [number, number][] return type.
	const X: [number, number][] = new Array(N);
	for (let i = 0; i < N; i++) {
		X[i] = [real[i], imag[i]];
	}

	return X;
};
