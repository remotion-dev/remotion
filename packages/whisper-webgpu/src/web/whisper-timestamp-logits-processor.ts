import {Callable} from './callable';
import {log_softmax, max} from './maths';
import type {Tensor} from './tensor';
import type {WhisperGenerationConfig} from './whisper-generation-config';

export class LogitsProcessor extends Callable {
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
 * A LogitsProcessor that handles adding timestamps to generated text.
 */
export class WhisperTimeStampLogitsProcessor extends LogitsProcessor {
	eos_token_id: number | null;
	no_timestamps_token_id: number | null;
	timestamp_begin: number;
	begin_index: number;
	max_initial_timestamp_index: number | null;

	/**
	 * Constructs a new WhisperTimeStampLogitsProcessor.
	 * @param {import('../models/whisper/generation_whisper.js').WhisperGenerationConfig} generate_config The config object passed to the `generate()` method of a transformer model.
	 * @param {number[]} init_tokens The initial tokens of the input sequence.
	 */
	constructor(generate_config: WhisperGenerationConfig, init_tokens: number[]) {
		super();
		this.eos_token_id = Array.isArray(generate_config.eos_token_id)
			? generate_config.eos_token_id[0]
			: generate_config.eos_token_id;

		this.no_timestamps_token_id = generate_config.no_timestamps_token_id;
		this.timestamp_begin = this.no_timestamps_token_id! + 1;

		this.begin_index = init_tokens.length;
		if (init_tokens.at(-1) === this.no_timestamps_token_id) {
			this.begin_index -= 1;
		}

		this.max_initial_timestamp_index =
			generate_config.max_initial_timestamp_index;
	}

	/**
	 * Modify the logits to handle timestamp tokens.
	 * @param {bigint[][]} input_ids The input sequence of tokens.
	 * @param {Tensor} logits The logits output by the model.
	 * @returns {Tensor} The modified logits.
	 */
	_call(input_ids: bigint[][], logits: Tensor) {
		for (let i = 0; i < input_ids.length; ++i) {
			// @ts-expect-error
			const batch_logits_data = /** @type {Float32Array} */ logits[i].data;

			// suppress <|notimestamps|> which is handled by without_timestamps
			batch_logits_data[this.no_timestamps_token_id!] = -Infinity;

			if (input_ids[i].length === this.begin_index - 1) {
				batch_logits_data.fill(-Infinity);
				batch_logits_data[this.timestamp_begin] = 0;
				continue;
			}

			// timestamps have to appear in pairs, except directly before eos_token; mask logits accordingly
			const seq = input_ids[i].slice(this.begin_index);
			const last_was_timestamp =
				seq.length >= 1 && seq[seq.length - 1] >= this.timestamp_begin;
			const penultimate_was_timestamp =
				seq.length < 2 || seq[seq.length - 2] >= this.timestamp_begin;

			if (last_was_timestamp) {
				if (penultimate_was_timestamp) {
					// has to be non-timestamp
					batch_logits_data.subarray(this.timestamp_begin).fill(-Infinity);
				} else {
					// cannot be normal text tokens
					batch_logits_data.subarray(0, this.eos_token_id).fill(-Infinity);
				}
			}

			// apply the `max_initial_timestamp` option
			if (
				input_ids[i].length === this.begin_index &&
				this.max_initial_timestamp_index !== null
			) {
				const last_allowed =
					this.timestamp_begin + this.max_initial_timestamp_index;
				batch_logits_data.subarray(last_allowed + 1).fill(-Infinity);
			}

			// if sum of probability over timestamps is above any other token, sample timestamp
			const logprobs = log_softmax(batch_logits_data) as
				| Float64Array<ArrayBuffer>
				| Float32Array<ArrayBuffer>;
			const timestamp_logprob = Math.log(
				(
					logprobs
						.subarray(this.timestamp_begin)
						.map(Math.exp) as unknown as number[]
				).reduce((a, b) => a + b),
			);
			const max_text_token_logprob = max(
				logprobs.subarray(0, this.timestamp_begin),
			)[0];

			if (timestamp_logprob > max_text_token_logprob) {
				batch_logits_data.subarray(0, this.timestamp_begin).fill(-Infinity);
			}
		}

		return logits;
	}
}
