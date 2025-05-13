import {createInferenceSession, isONNXProxy} from './onnx.js';
import {Tensor} from './tensor.js';

const IS_WEB_ENV: boolean = true;

type SessionBytes = number[];
type TensorInputs = Record<string, Tensor>;
type TensorOutput<T> = T extends string
	? Tensor
	: T extends string[]
		? {[K in keyof T]: Tensor}
		: never;
type WrapperFunction<T> = (inputs: TensorInputs) => Promise<TensorOutput<T>>;

/**
 * Asynchronously creates a wrapper function for running an ONNX inference session.
 *
 * @param {SessionBytes} session_bytes The session data in bytes.
 * @param {SessionOptions} session_options The options for the ONNX session.
 * @template {string | [string] | string[]} T
 * @param {T} names The name(s) of the output tensor(s).
 *
 * @returns {Promise<WrapperFunction<T>>}
 * The wrapper function for running the ONNX inference session.
 */
const wrap = async <T extends string | [string] | string[]>(
	session_bytes: SessionBytes,
	session_options: any,
	names: T,
): Promise<WrapperFunction<T>> => {
	const session = await createInferenceSession(
		new Uint8Array(session_bytes),
		session_options,
		{},
	);

	let chain: Promise<any> = Promise.resolve();

	return async (inputs: TensorInputs): Promise<TensorOutput<T>> => {
		const proxied: boolean | undefined = isONNXProxy();
		const ortFeed = Object.fromEntries(
			Object.entries(inputs).map(([k, v]) => [
				k,
				(proxied ? v.clone() : v).ort_tensor,
			]),
		);

		// When running in-browser via WASM, we need to chain calls to session.run to avoid "Error: Session already started"
		const outputs = await (chain = IS_WEB_ENV
			? chain.then(() => session.run(ortFeed))
			: session.run(ortFeed));

		if (Array.isArray(names)) {
			return names.map((n) => new Tensor(outputs[n])) as TensorOutput<T>;
		}

		return new Tensor(outputs[names as string]) as TensorOutput<T>;
	};
};

// In-memory registry of initialized ONNX operators
export class TensorOpRegistry {
	private static _nearest_interpolate_4d: Promise<WrapperFunction<'y'>>;
	private static _bilinear_interpolate_4d: Promise<WrapperFunction<'y'>>;
	private static _bicubic_interpolate_4d: Promise<WrapperFunction<'y'>>;
	private static _matmul: Promise<WrapperFunction<'c'>>;
	private static _stft: Promise<WrapperFunction<'o'>>;
	private static _rfft: Promise<WrapperFunction<'y'>>;
	private static _top_k: Promise<WrapperFunction<['v', 'i']>>;
	private static _slice: Promise<WrapperFunction<'y'>>;

	static session_options = {
		// TODO: Allow for multiple execution providers
		executionProviders: ['webgpu'],
	};

	static get nearest_interpolate_4d(): Promise<WrapperFunction<'y'>> {
		if (!this._nearest_interpolate_4d) {
			this._nearest_interpolate_4d = wrap(
				[
					8, 10, 18, 0, 58, 129, 1, 10, 41, 10, 1, 120, 10, 0, 10, 0, 10, 1,
					115, 18, 1, 121, 34, 6, 82, 101, 115, 105, 122, 101, 42, 18, 10, 4,
					109, 111, 100, 101, 34, 7, 110, 101, 97, 114, 101, 115, 116, 160, 1,
					3, 18, 1, 114, 90, 31, 10, 1, 120, 18, 26, 10, 24, 8, 1, 18, 20, 10,
					3, 18, 1, 98, 10, 3, 18, 1, 99, 10, 3, 18, 1, 104, 10, 3, 18, 1, 119,
					90, 15, 10, 1, 115, 18, 10, 10, 8, 8, 7, 18, 4, 10, 2, 8, 4, 98, 31,
					10, 1, 121, 18, 26, 10, 24, 8, 1, 18, 20, 10, 3, 18, 1, 98, 10, 3, 18,
					1, 99, 10, 3, 18, 1, 104, 10, 3, 18, 1, 119, 66, 2, 16, 21,
				],
				this.session_options,
				'y',
			);
		}

		return Promise.resolve(this._nearest_interpolate_4d);
	}

	static get bilinear_interpolate_4d(): Promise<WrapperFunction<'y'>> {
		if (!this._bilinear_interpolate_4d) {
			this._bilinear_interpolate_4d = wrap(
				[
					8, 9, 18, 0, 58, 128, 1, 10, 40, 10, 1, 120, 10, 0, 10, 0, 10, 1, 115,
					18, 1, 121, 34, 6, 82, 101, 115, 105, 122, 101, 42, 17, 10, 4, 109,
					111, 100, 101, 34, 6, 108, 105, 110, 101, 97, 114, 160, 1, 3, 18, 1,
					114, 90, 31, 10, 1, 120, 18, 26, 10, 24, 8, 1, 18, 20, 10, 3, 18, 1,
					98, 10, 3, 18, 1, 99, 10, 3, 18, 1, 104, 10, 3, 18, 1, 119, 90, 15,
					10, 1, 115, 18, 10, 10, 8, 8, 7, 18, 4, 10, 2, 8, 4, 98, 31, 10, 1,
					121, 18, 26, 10, 24, 8, 1, 18, 20, 10, 3, 18, 1, 98, 10, 3, 18, 1, 99,
					10, 3, 18, 1, 104, 10, 3, 18, 1, 119, 66, 2, 16, 20,
				],
				this.session_options,
				'y',
			);
		}

		return this._bilinear_interpolate_4d;
	}

	static get bicubic_interpolate_4d(): Promise<WrapperFunction<'y'>> {
		if (!this._bicubic_interpolate_4d) {
			this._bicubic_interpolate_4d = wrap(
				[
					8, 9, 18, 0, 58, 127, 10, 39, 10, 1, 120, 10, 0, 10, 0, 10, 1, 115,
					18, 1, 121, 34, 6, 82, 101, 115, 105, 122, 101, 42, 16, 10, 4, 109,
					111, 100, 101, 34, 5, 99, 117, 98, 105, 99, 160, 1, 3, 18, 1, 114, 90,
					31, 10, 1, 120, 18, 26, 10, 24, 8, 1, 18, 20, 10, 3, 18, 1, 98, 10, 3,
					18, 1, 99, 10, 3, 18, 1, 104, 10, 3, 18, 1, 119, 90, 15, 10, 1, 115,
					18, 10, 10, 8, 8, 7, 18, 4, 10, 2, 8, 4, 98, 31, 10, 1, 121, 18, 26,
					10, 24, 8, 1, 18, 20, 10, 3, 18, 1, 98, 10, 3, 18, 1, 99, 10, 3, 18,
					1, 104, 10, 3, 18, 1, 119, 66, 2, 16, 20,
				],
				this.session_options,
				'y',
			);
		}

		return this._bicubic_interpolate_4d;
	}

	static get matmul(): Promise<WrapperFunction<'c'>> {
		if (!this._matmul) {
			this._matmul = wrap(
				[
					8, 9, 18, 0, 58, 55, 10, 17, 10, 1, 97, 10, 1, 98, 18, 1, 99, 34, 6,
					77, 97, 116, 77, 117, 108, 18, 1, 114, 90, 9, 10, 1, 97, 18, 4, 10, 2,
					8, 1, 90, 9, 10, 1, 98, 18, 4, 10, 2, 8, 1, 98, 9, 10, 1, 99, 18, 4,
					10, 2, 8, 1, 66, 2, 16, 20,
				],
				this.session_options,
				'c',
			);
		}

		return this._matmul;
	}

	static get stft(): Promise<WrapperFunction<'o'>> {
		if (!this._stft) {
			this._stft = wrap(
				[
					8, 7, 18, 0, 58, 148, 1, 10, 38, 10, 1, 115, 10, 1, 106, 10, 1, 119,
					10, 1, 108, 18, 1, 111, 34, 4, 83, 84, 70, 84, 42, 15, 10, 8, 111,
					110, 101, 115, 105, 100, 101, 100, 24, 1, 160, 1, 2, 18, 1, 115, 90,
					26, 10, 1, 115, 18, 21, 10, 19, 8, 1, 18, 15, 10, 3, 18, 1, 98, 10, 3,
					18, 1, 115, 10, 3, 18, 1, 99, 90, 11, 10, 1, 106, 18, 6, 10, 4, 8, 7,
					18, 0, 90, 16, 10, 1, 119, 18, 11, 10, 9, 8, 1, 18, 5, 10, 3, 18, 1,
					119, 90, 11, 10, 1, 108, 18, 6, 10, 4, 8, 7, 18, 0, 98, 31, 10, 1,
					111, 18, 26, 10, 24, 8, 1, 18, 20, 10, 3, 18, 1, 98, 10, 3, 18, 1,
					102, 10, 3, 18, 1, 100, 10, 3, 18, 1, 99, 66, 2, 16, 17,
				],
				this.session_options,
				'o',
			);
		}

		return this._stft;
	}

	static get rfft(): Promise<WrapperFunction<'y'>> {
		if (!this._rfft) {
			this._rfft = wrap(
				[
					8, 9, 18, 0, 58, 97, 10, 33, 10, 1, 120, 10, 0, 10, 1, 97, 18, 1, 121,
					34, 3, 68, 70, 84, 42, 15, 10, 8, 111, 110, 101, 115, 105, 100, 101,
					100, 24, 1, 160, 1, 2, 18, 1, 100, 90, 21, 10, 1, 120, 18, 16, 10, 14,
					8, 1, 18, 10, 10, 3, 18, 1, 115, 10, 3, 18, 1, 99, 90, 11, 10, 1, 97,
					18, 6, 10, 4, 8, 7, 18, 0, 98, 21, 10, 1, 121, 18, 16, 10, 14, 8, 1,
					18, 10, 10, 3, 18, 1, 115, 10, 3, 18, 1, 99, 66, 2, 16, 20,
				],
				this.session_options,
				'y',
			);
		}

		return this._rfft;
	}

	static get top_k(): Promise<WrapperFunction<['v', 'i']>> {
		if (!this._top_k) {
			this._top_k = wrap(
				[
					8, 10, 18, 0, 58, 73, 10, 18, 10, 1, 120, 10, 1, 107, 18, 1, 118, 18,
					1, 105, 34, 4, 84, 111, 112, 75, 18, 1, 116, 90, 9, 10, 1, 120, 18, 4,
					10, 2, 8, 1, 90, 15, 10, 1, 107, 18, 10, 10, 8, 8, 7, 18, 4, 10, 2, 8,
					1, 98, 9, 10, 1, 118, 18, 4, 10, 2, 8, 1, 98, 9, 10, 1, 105, 18, 4,
					10, 2, 8, 7, 66, 2, 16, 21,
				],
				this.session_options,
				[/* Values */ 'v', /* Indices */ 'i'],
			);
		}

		return this._top_k;
	}

	static get slice(): Promise<WrapperFunction<'y'>> {
		if (!this._slice) {
			this._slice = wrap(
				[
					8, 7, 18, 0, 58, 96, 10, 25, 10, 1, 120, 10, 1, 115, 10, 1, 101, 10,
					1, 97, 10, 1, 116, 18, 1, 121, 34, 5, 83, 108, 105, 99, 101, 18, 1,
					114, 90, 9, 10, 1, 120, 18, 4, 10, 2, 8, 1, 90, 9, 10, 1, 115, 18, 4,
					10, 2, 8, 7, 90, 9, 10, 1, 101, 18, 4, 10, 2, 8, 7, 90, 9, 10, 1, 97,
					18, 4, 10, 2, 8, 7, 90, 9, 10, 1, 116, 18, 4, 10, 2, 8, 7, 98, 9, 10,
					1, 121, 18, 4, 10, 2, 8, 1, 66, 2, 16, 13,
				],
				this.session_options,
				'y',
			);
		}

		return this._slice;
	}
}

export async function matmul(a: Tensor, b: Tensor) {
	const op = await TensorOpRegistry.matmul;
	return op({a, b});
}
