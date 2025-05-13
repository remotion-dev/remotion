/* eslint-disable @typescript-eslint/no-unused-vars */
import {Callable} from './callable';
import type {Tensor} from './tensor';

export class LogitsWarper extends Callable {
	/**
	 * Apply the processor to the input logits.
	 *
	 * @abstract
	 * @param {bigint[][]} input_ids The input ids.
	 * @param {Tensor} logits The logits to process.
	 * @throws {Error} Throws an error if `_call` is not implemented in the subclass.
	 */
	_call(_input_ids: bigint[][], _logits: Tensor) {
		throw Error('`_call` should be implemented in a subclass');
	}
}

/**
 * [`LogitsWarper`] that performs top-k, i.e. restricting to the k highest probability elements.
 * Often used together with [`TemperatureLogitsWarper`] and [`TopPLogitsWarper`].
 */
export class TopKLogitsWarper extends LogitsWarper {
	top_k: number;
	filter_value: number;

	/**
	 * Create a `TopKLogitsWarper`.
	 * @param {number} top_k If set to > 0, only the top `top_k` tokens are kept for generation.
	 * @param {Object} options Additional options for the top-k sampling.
	 * @param {number} [options.filter_value=-Infinity] All filtered values will be set to this float value.
	 * @param {number} [options.min_tokens_to_keep=1] Minimum number of tokens that cannot be filtered.
	 */
	constructor(
		top_k: number,
		{filter_value = -Infinity, min_tokens_to_keep = 1} = {},
	) {
		super();
		if (!Number.isInteger(top_k) || top_k < 0) {
			throw new Error(`\`top_k\` must be a positive integer, but is ${top_k}`);
		}

		this.top_k = Math.max(top_k, min_tokens_to_keep);
		this.filter_value = filter_value;
	}
}
