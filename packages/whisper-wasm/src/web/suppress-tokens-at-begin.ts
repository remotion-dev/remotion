import type {Tensor} from './tensor';
import {LogitsProcessor} from './whisper-timestamp-logits-processor';

/**
 * A LogitsProcessor that suppresses a list of tokens as soon as the `generate` function starts
 * generating using `begin_index` tokens. This should ensure that the tokens defined by
 * `begin_suppress_tokens` at not sampled at the begining of the generation.
 */
export class SuppressTokensAtBeginLogitsProcessor extends LogitsProcessor {
	begin_suppress_tokens: number[];
	begin_index: number;

	/**
	 * Create a SuppressTokensAtBeginLogitsProcessor.
	 * @param {number[]} begin_suppress_tokens The IDs of the tokens to suppress.
	 * @param {number} begin_index The number of tokens to generate before suppressing tokens.
	 */
	constructor(begin_suppress_tokens: number[], begin_index: number) {
		super();
		this.begin_suppress_tokens = begin_suppress_tokens;
		this.begin_index = begin_index;
	}

	/**
	 * Apply the BOS token forcing to the logits.
	 * @param {bigint[][]} input_ids The input IDs.
	 * @param {Tensor} logits The logits.
	 * @returns {Tensor} The logits with BOS token forcing.
	 */
	_call(input_ids: bigint[][], logits: Tensor) {
		for (let i = 0; i < input_ids.length; ++i) {
			if (input_ids[i].length === this.begin_index) {
				// @ts-expect-error
				const batch_logits_data = /** @type {Float32Array} */ logits[i].data;
				for (const token_id of this.begin_suppress_tokens) {
					batch_logits_data[token_id] = -Infinity;
				}
			}
		}

		return logits;
	}
}
