function isPowerOfTwo(number: number): boolean {
	// Check if the number is greater than 0 and has only one bit set to 1
	return number > 0 && (number & (number - 1)) === 0;
}

class NP2FFT {
	bufferSize: number;
	private _a: number;
	private _chirpBuffer: Float64Array;
	private _buffer1: Float64Array;
	private _buffer2: Float64Array;
	private _outBuffer1: Float64Array;
	private _outBuffer2: Float64Array;
	private _slicedChirpBuffer: Float64Array;
	private _f: P2FFT;

	/**
	 * Constructs a new NP2FFT object.
	 * @param {number} fft_length The length of the FFT
	 */
	constructor(fft_length: number) {
		// Helper variables
		const a: number = 2 * (fft_length - 1);
		const b: number = 2 * (2 * fft_length - 1);
		const nextP2: number = 2 ** Math.ceil(Math.log2(b));
		this.bufferSize = nextP2;
		this._a = a;

		// Define buffers
		// Compute chirp for transform
		const chirp: Float64Array = new Float64Array(b);
		const ichirp: Float64Array = new Float64Array(nextP2);
		this._chirpBuffer = new Float64Array(nextP2);
		this._buffer1 = new Float64Array(nextP2);
		this._buffer2 = new Float64Array(nextP2);
		this._outBuffer1 = new Float64Array(nextP2);
		this._outBuffer2 = new Float64Array(nextP2);

		// Compute complex exponentiation
		const theta: number = (-2 * Math.PI) / fft_length;
		const baseR: number = Math.cos(theta);
		const baseI: number = Math.sin(theta);

		// Precompute helper for chirp-z transform
		for (let i: number = 0; i < b >> 1; ++i) {
			// Compute complex power:
			const e: number = (i + 1 - fft_length) ** 2 / 2.0;

			// Compute the modulus and argument of the result
			const result_mod: number = Math.sqrt(baseR ** 2 + baseI ** 2) ** e;
			const result_arg: number = e * Math.atan2(baseI, baseR);

			// Convert the result back to rectangular form
			// and assign to chirp and ichirp
			const i2: number = 2 * i;
			chirp[i2] = result_mod * Math.cos(result_arg);
			chirp[i2 + 1] = result_mod * Math.sin(result_arg);

			// conjugate
			ichirp[i2] = chirp[i2];
			ichirp[i2 + 1] = -chirp[i2 + 1];
		}

		this._slicedChirpBuffer = chirp.subarray(a, b);

		// create object to perform Fast Fourier Transforms
		// with `nextP2` complex numbers
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		this._f = new P2FFT(nextP2 >> 1);
		this._f.transform(this._chirpBuffer, ichirp);
	}

	private _transform(
		output: Float64Array,
		input: Float64Array,
		real: boolean,
	): void {
		const ib1: Float64Array = this._buffer1;
		const ib2: Float64Array = this._buffer2;
		const ob2: Float64Array = this._outBuffer1;
		const ob3: Float64Array = this._outBuffer2;
		const cb: Float64Array = this._chirpBuffer;
		const sb: Float64Array = this._slicedChirpBuffer;
		const a: number = this._a;

		if (real) {
			// Real multiplication
			for (let j: number = 0; j < sb.length; j += 2) {
				const j2: number = j + 1;
				const j3: number = j >> 1;

				const a_real: number = input[j3];
				ib1[j] = a_real * sb[j];
				ib1[j2] = a_real * sb[j2];
			}
		} else {
			// Complex multiplication
			for (let j: number = 0; j < sb.length; j += 2) {
				const j2: number = j + 1;
				ib1[j] = input[j] * sb[j] - input[j2] * sb[j2];
				ib1[j2] = input[j] * sb[j2] + input[j2] * sb[j];
			}
		}

		this._f.transform(ob2, ib1);

		for (let j: number = 0; j < cb.length; j += 2) {
			const j2: number = j + 1;

			ib2[j] = ob2[j] * cb[j] - ob2[j2] * cb[j2];
			ib2[j2] = ob2[j] * cb[j2] + ob2[j2] * cb[j];
		}

		this._f.inverseTransform(ob3, ib2);

		for (let j: number = 0; j < ob3.length; j += 2) {
			const a_real: number = ob3[j + a];
			const a_imag: number = ob3[j + a + 1];
			const b_real: number = sb[j];
			const b_imag: number = sb[j + 1];

			output[j] = a_real * b_real - a_imag * b_imag;
			output[j + 1] = a_real * b_imag + a_imag * b_real;
		}
	}

	transform(output: Float64Array, input: Float64Array): void {
		this._transform(output, input, false);
	}

	realTransform(output: Float64Array, input: Float64Array): void {
		this._transform(output, input, true);
	}
}

/**
 * Implementation of Radix-4 FFT.
 *
 * P2FFT class provides functionality for performing Fast Fourier Transform on arrays
 * which are a power of two in length.
 * Code adapted from https://www.npmjs.com/package/fft.js
 */
class P2FFT {
	private size: number;
	private _csize: number;
	private table: Float64Array;
	private _width: number;
	private _bitrev: Int32Array;

	/**
	 * @param {number} size The size of the input array. Must be a power of two larger than 1.
	 * @throws {Error} FFT size must be a power of two larger than 1.
	 */
	constructor(size: number) {
		this.size = size | 0; // convert to a 32-bit signed integer
		if (this.size <= 1 || !isPowerOfTwo(this.size))
			throw new Error('FFT size must be a power of two larger than 1');

		this._csize = size << 1;

		this.table = new Float64Array(this.size * 2);
		for (let i: number = 0; i < this.table.length; i += 2) {
			const angle: number = (Math.PI * i) / this.size;
			this.table[i] = Math.cos(angle);
			this.table[i + 1] = -Math.sin(angle);
		}

		// Find size's power of two
		let power: number = 0;
		for (let t: number = 1; this.size > t; t <<= 1) ++power;

		// Calculate initial step's width:
		//   * If we are full radix-4, it is 2x smaller to give inital len=8
		//   * Otherwise it is the same as `power` to give len=4
		this._width = power % 2 === 0 ? power - 1 : power;

		// Pre-compute bit-reversal patterns
		this._bitrev = new Int32Array(1 << this._width);
		for (let j: number = 0; j < this._bitrev.length; ++j) {
			this._bitrev[j] = 0;
			for (let shift: number = 0; shift < this._width; shift += 2) {
				const revShift: number = this._width - shift - 2;
				this._bitrev[j] |= ((j >>> shift) & 3) << revShift;
			}
		}
	}

	/**
	 * Create a complex number array with size `2 * size`
	 *
	 * @returns {Float64Array} A complex number array with size `2 * size`
	 */
	createComplexArray(): Float64Array {
		return new Float64Array(this._csize);
	}

	/**
	 * Converts a complex number representation stored in a Float64Array to an array of real numbers.
	 *
	 * @param {Float64Array} complex The complex number representation to be converted.
	 * @param {number[]} [storage] An optional array to store the result in.
	 * @returns {number[]} An array of real numbers representing the input complex number representation.
	 */
	fromComplexArray(complex: Float64Array, storage?: number[]): number[] {
		const res: number[] = storage || new Array(complex.length >>> 1);
		for (let i: number = 0; i < complex.length; i += 2)
			res[i >>> 1] = complex[i];
		return res;
	}

	/**
	 * Convert a real-valued input array to a complex-valued output array.
	 * @param {Float64Array} input The real-valued input array.
	 * @param {Float64Array} [storage] Optional buffer to store the output array.
	 * @returns {Float64Array} The complex-valued output array.
	 */
	toComplexArray(input: Float64Array, storage?: Float64Array): Float64Array {
		const res: Float64Array = storage || this.createComplexArray();
		for (let i: number = 0; i < res.length; i += 2) {
			res[i] = input[i >>> 1];
			res[i + 1] = 0;
		}

		return res;
	}

	/**
	 * Performs a Fast Fourier Transform (FFT) on the given input data and stores the result in the output buffer.
	 *
	 * @param {Float64Array} out The output buffer to store the result.
	 * @param {Float64Array} data The input data to transform.
	 *
	 * @throws {Error} Input and output buffers must be different.
	 *
	 * @returns {void}
	 */
	transform(out: Float64Array, data: Float64Array): void {
		if (out === data)
			throw new Error('Input and output buffers must be different');

		this._transform4(out, data, 1 /* DONE */);
	}

	/**
	 * Performs a real-valued forward FFT on the given input buffer and stores the result in the given output buffer.
	 * The input buffer must contain real values only, while the output buffer will contain complex values. The input and
	 * output buffers must be different.
	 *
	 * @param {Float64Array} out The output buffer.
	 * @param {Float64Array} data The input buffer containing real values.
	 *
	 * @throws {Error} If the input and output buffers are the same.
	 */
	realTransform(out: Float64Array, data: Float64Array): void {
		if (out === data)
			throw new Error('Input and output buffers must be different');

		this._realTransform4(out, data, 1 /* DONE */);
	}

	/**
	 * Performs an inverse FFT transformation on the given `data` array, and stores the result in `out`.
	 * The `out` array must be a different buffer than the `data` array. The `out` array will contain the
	 * result of the transformation. The `data` array will not be modified.
	 *
	 * @param {Float64Array} out The output buffer for the transformed data.
	 * @param {Float64Array} data The input data to transform.
	 * @throws {Error} If `out` and `data` refer to the same buffer.
	 * @returns {void}
	 */
	inverseTransform(out: Float64Array, data: Float64Array): void {
		if (out === data)
			throw new Error('Input and output buffers must be different');

		this._transform4(out, data, -1 /* DONE */);
		for (let i: number = 0; i < out.length; ++i) out[i] /= this.size;
	}

	/**
	 * Performs a radix-4 implementation of a discrete Fourier transform on a given set of data.
	 *
	 * @param {Float64Array} out The output buffer for the transformed data.
	 * @param {Float64Array} data The input buffer of data to be transformed.
	 * @param {number} inv A scaling factor to apply to the transform.
	 * @returns {void}
	 */
	private _transform4(
		out: Float64Array,
		data: Float64Array,
		inv: number,
	): void {
		// radix-4 implementation

		const size: number = this._csize;

		// Initial step (permute and transform)
		const width: number = this._width;
		let step: number = 1 << width;
		let len: number = (size / step) << 1;

		let outOff: number;
		let t: number;
		const bitrev: Int32Array = this._bitrev;
		if (len === 4) {
			for (outOff = 0, t = 0; outOff < size; outOff += len, ++t) {
				const off: number = bitrev[t];
				this._singleTransform2(data, out, outOff, off, step);
			}
		} else {
			// len === 8
			for (outOff = 0, t = 0; outOff < size; outOff += len, ++t) {
				const off: number = bitrev[t];
				this._singleTransform4(data, out, outOff, off, step, inv);
			}
		}

		// Loop through steps in decreasing order
		const {table} = this;
		for (step >>= 2; step >= 2; step >>= 2) {
			len = (size / step) << 1;
			const quarterLen: number = len >>> 2;

			// Loop through offsets in the data
			for (outOff = 0; outOff < size; outOff += len) {
				// Full case
				const limit: number = outOff + quarterLen - 1;
				for (
					let i: number = outOff, k: number = 0;
					i < limit;
					i += 2, k += step
				) {
					const A: number = i;
					const B: number = A + quarterLen;
					const C: number = B + quarterLen;
					const D: number = C + quarterLen;

					// Original values
					const Ar: number = out[A];
					const Ai: number = out[A + 1];
					const Br: number = out[B];
					const Bi: number = out[B + 1];
					const Cr: number = out[C];
					const Ci: number = out[C + 1];
					const Dr: number = out[D];
					const Di: number = out[D + 1];

					const tableBr: number = table[k];
					const tableBi: number = inv * table[k + 1];
					const MBr: number = Br * tableBr - Bi * tableBi;
					const MBi: number = Br * tableBi + Bi * tableBr;

					const tableCr: number = table[2 * k];
					const tableCi: number = inv * table[2 * k + 1];
					const MCr: number = Cr * tableCr - Ci * tableCi;
					const MCi: number = Cr * tableCi + Ci * tableCr;

					const tableDr: number = table[3 * k];
					const tableDi: number = inv * table[3 * k + 1];
					const MDr: number = Dr * tableDr - Di * tableDi;
					const MDi: number = Dr * tableDi + Di * tableDr;

					// Pre-Final values
					const T0r: number = Ar + MCr;
					const T0i: number = Ai + MCi;
					const T1r: number = Ar - MCr;
					const T1i: number = Ai - MCi;
					const T2r: number = MBr + MDr;
					const T2i: number = MBi + MDi;
					const T3r: number = inv * (MBr - MDr);
					const T3i: number = inv * (MBi - MDi);

					// Final values
					out[A] = T0r + T2r;
					out[A + 1] = T0i + T2i;
					out[B] = T1r + T3i;
					out[B + 1] = T1i - T3r;
					out[C] = T0r - T2r;
					out[C + 1] = T0i - T2i;
					out[D] = T1r - T3i;
					out[D + 1] = T1i + T3r;
				}
			}
		}
	}

	/**
	 * Performs a radix-2 implementation of a discrete Fourier transform on a given set of data.
	 *
	 * @param {Float64Array} data The input buffer of data to be transformed.
	 * @param {Float64Array} out The output buffer for the transformed data.
	 * @param {number} outOff The offset at which to write the output data.
	 * @param {number} off The offset at which to begin reading the input data.
	 * @param {number} step The step size for indexing the input data.
	 * @returns {void}
	 */
	private _singleTransform2(
		data: Float64Array,
		out: Float64Array,
		outOff: number,
		off: number,
		step: number,
	): void {
		// radix-2 implementation
		// NOTE: Only called for len=4

		const evenR: number = data[off];
		const evenI: number = data[off + 1];
		const oddR: number = data[off + step];
		const oddI: number = data[off + step + 1];

		out[outOff] = evenR + oddR;
		out[outOff + 1] = evenI + oddI;
		out[outOff + 2] = evenR - oddR;
		out[outOff + 3] = evenI - oddI;
	}

	/**
	 * Performs radix-4 transformation on input data of length 8
	 *
	 * @param {Float64Array} data Input data array of length 8
	 * @param {Float64Array} out Output data array of length 8
	 * @param {number} outOff Index of output array to start writing from
	 * @param {number} off Index of input array to start reading from
	 * @param {number} step Step size between elements in input array
	 * @param {number} inv Scaling factor for inverse transform
	 *
	 * @returns {void}
	 */
	private _singleTransform4(
		data: Float64Array,
		out: Float64Array,
		outOff: number,
		off: number,
		step: number,
		inv: number,
	): void {
		// radix-4
		// NOTE: Only called for len=8
		const step2: number = step * 2;
		const step3: number = step * 3;

		// Original values
		const Ar: number = data[off];
		const Ai: number = data[off + 1];
		const Br: number = data[off + step];
		const Bi: number = data[off + step + 1];
		const Cr: number = data[off + step2];
		const Ci: number = data[off + step2 + 1];
		const Dr: number = data[off + step3];
		const Di: number = data[off + step3 + 1];

		// Pre-Final values
		const T0r: number = Ar + Cr;
		const T0i: number = Ai + Ci;
		const T1r: number = Ar - Cr;
		const T1i: number = Ai - Ci;
		const T2r: number = Br + Dr;
		const T2i: number = Bi + Di;
		const T3r: number = inv * (Br - Dr);
		const T3i: number = inv * (Bi - Di);

		// Final values
		out[outOff] = T0r + T2r;
		out[outOff + 1] = T0i + T2i;
		out[outOff + 2] = T1r + T3i;
		out[outOff + 3] = T1i - T3r;
		out[outOff + 4] = T0r - T2r;
		out[outOff + 5] = T0i - T2i;
		out[outOff + 6] = T1r - T3i;
		out[outOff + 7] = T1i + T3r;
	}

	/**
	 * Real input radix-4 implementation
	 * @param {Float64Array} out Output array for the transformed data
	 * @param {Float64Array} data Input array of real data to be transformed
	 * @param {number} inv The scale factor used to normalize the inverse transform
	 */
	private _realTransform4(
		out: Float64Array,
		data: Float64Array,
		inv: number,
	): void {
		// Real input radix-4 implementation
		const size: number = this._csize;

		// Initial step (permute and transform)
		const width: number = this._width;
		let step: number = 1 << width;
		let len: number = (size / step) << 1;

		let outOff: number;
		let t: number;
		const bitrev: Int32Array = this._bitrev;
		if (len === 4) {
			for (outOff = 0, t = 0; outOff < size; outOff += len, ++t) {
				const off: number = bitrev[t];
				this._singleRealTransform2(data, out, outOff, off >>> 1, step >>> 1);
			}
		} else {
			// len === 8
			for (outOff = 0, t = 0; outOff < size; outOff += len, ++t) {
				const off: number = bitrev[t];
				this._singleRealTransform4(
					data,
					out,
					outOff,
					off >>> 1,
					step >>> 1,
					inv,
				);
			}
		}

		// Loop through steps in decreasing order
		const {table} = this;
		for (step >>= 2; step >= 2; step >>= 2) {
			len = (size / step) << 1;
			const halfLen: number = len >>> 1;
			const quarterLen: number = halfLen >>> 1;
			const hquarterLen: number = quarterLen >>> 1;

			// Loop through offsets in the data
			for (outOff = 0; outOff < size; outOff += len) {
				for (
					let i: number = 0, k: number = 0;
					i <= hquarterLen;
					i += 2, k += step
				) {
					const A: number = outOff + i;
					const B: number = A + quarterLen;
					const C: number = B + quarterLen;
					const D: number = C + quarterLen;

					// Original values
					const Ar: number = out[A];
					const Ai: number = out[A + 1];
					const Br: number = out[B];
					const Bi: number = out[B + 1];
					const Cr: number = out[C];
					const Ci: number = out[C + 1];
					const Dr: number = out[D];
					const Di: number = out[D + 1];

					// Middle values
					const MAr: number = Ar;
					const MAi: number = Ai;

					const tableBr: number = table[k];
					const tableBi: number = inv * table[k + 1];
					const MBr: number = Br * tableBr - Bi * tableBi;
					const MBi: number = Br * tableBi + Bi * tableBr;

					const tableCr: number = table[2 * k];
					const tableCi: number = inv * table[2 * k + 1];
					const MCr: number = Cr * tableCr - Ci * tableCi;
					const MCi: number = Cr * tableCi + Ci * tableCr;

					const tableDr: number = table[3 * k];
					const tableDi: number = inv * table[3 * k + 1];
					const MDr: number = Dr * tableDr - Di * tableDi;
					const MDi: number = Dr * tableDi + Di * tableDr;

					// Pre-Final values
					const T0r: number = MAr + MCr;
					const T0i: number = MAi + MCi;
					const T1r: number = MAr - MCr;
					const T1i: number = MAi - MCi;
					const T2r: number = MBr + MDr;
					const T2i: number = MBi + MDi;
					const T3r: number = inv * (MBr - MDr);
					const T3i: number = inv * (MBi - MDi);

					// Final values
					out[A] = T0r + T2r;
					out[A + 1] = T0i + T2i;
					out[B] = T1r + T3i;
					out[B + 1] = T1i - T3r;

					// Output final middle point
					if (i === 0) {
						out[C] = T0r - T2r;
						out[C + 1] = T0i - T2i;
						continue;
					}

					// Do not overwrite ourselves
					if (i === hquarterLen) continue;

					const SA: number = outOff + quarterLen - i;
					const SB: number = outOff + halfLen - i;

					out[SA] = T1r - inv * T3i;
					out[SA + 1] = -T1i - inv * T3r;
					out[SB] = T0r - inv * T2r;
					out[SB + 1] = -T0i + inv * T2i;
				}
			}
		}

		// Complete the spectrum by adding its mirrored negative frequency components.
		const half: number = size >>> 1;
		for (let i: number = 2; i < half; i += 2) {
			out[size - i] = out[i];
			out[size - i + 1] = -out[i + 1];
		}
	}

	/**
	 * Performs a single real input radix-2 transformation on the provided data
	 *
	 * @param {Float64Array} data The input data array
	 * @param {Float64Array} out The output data array
	 * @param {number} outOff The output offset
	 * @param {number} off The input offset
	 * @param {number} step The step
	 *
	 * @returns {void}
	 */
	private _singleRealTransform2(
		data: Float64Array,
		out: Float64Array,
		outOff: number,
		off: number,
		step: number,
	): void {
		// radix-2 implementation
		// NOTE: Only called for len=4

		const evenR: number = data[off];
		const oddR: number = data[off + step];

		out[outOff] = evenR + oddR;
		out[outOff + 1] = 0;
		out[outOff + 2] = evenR - oddR;
		out[outOff + 3] = 0;
	}

	/**
	 * Computes a single real-valued transform using radix-4 algorithm.
	 * This method is only called for len=8.
	 *
	 * @param {Float64Array} data The input data array.
	 * @param {Float64Array} out The output data array.
	 * @param {number} outOff The offset into the output array.
	 * @param {number} off The offset into the input array.
	 * @param {number} step The step size for the input array.
	 * @param {number} inv The value of inverse.
	 */
	private _singleRealTransform4(
		data: Float64Array,
		out: Float64Array,
		outOff: number,
		off: number,
		step: number,
		inv: number,
	): void {
		// radix-4
		// NOTE: Only called for len=8
		const step2: number = step * 2;
		const step3: number = step * 3;

		// Original values
		const Ar: number = data[off];
		const Br: number = data[off + step];
		const Cr: number = data[off + step2];
		const Dr: number = data[off + step3];

		// Pre-Final values
		const T0r: number = Ar + Cr;
		const T1r: number = Ar - Cr;
		const T2r: number = Br + Dr;
		const T3r: number = inv * (Br - Dr);

		// Final values
		out[outOff] = T0r + T2r;
		out[outOff + 1] = 0;
		out[outOff + 2] = T1r;
		out[outOff + 3] = -T3r;
		out[outOff + 4] = T0r - T2r;
		out[outOff + 5] = 0;
		out[outOff + 6] = T1r;
		out[outOff + 7] = T3r;
	}
}

export class FFT {
	private isPowerOfTwo: boolean;
	private fft: P2FFT | NP2FFT;
	public outputBufferSize: number;

	constructor(fft_length: number) {
		this.isPowerOfTwo = isPowerOfTwo(fft_length);
		if (this.isPowerOfTwo) {
			this.fft = new P2FFT(fft_length);
			this.outputBufferSize = 2 * fft_length;
		} else {
			this.fft = new NP2FFT(fft_length);
			this.outputBufferSize = this.fft.bufferSize;
		}
	}

	realTransform(out: Float64Array, input: Float64Array): void {
		this.fft.realTransform(out, input);
	}

	transform(out: Float64Array, input: Float64Array): void {
		this.fft.transform(out, input);
	}
}
