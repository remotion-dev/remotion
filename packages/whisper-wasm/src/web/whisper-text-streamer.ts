import type {WhisperTokenizer} from '@huggingface/transformers';
import {TextStreamer} from './text-streamer';

export class WhisperTextStreamer extends TextStreamer {
	timestamp_begin: number;
	on_chunk_start: null | ((time: number) => void);
	on_chunk_end: null | ((time: number) => void);
	on_finalize: null | (() => void);
	time_precision: number;
	waiting_for_timestamp: boolean;

	constructor(
		tokenizer: WhisperTokenizer,
		{
			skip_prompt = false,
			callback_function = null,
			token_callback_function = null,
			on_chunk_start = null,
			on_chunk_end = null,
			on_finalize = null,
			time_precision = 0.02,
			skip_special_tokens = true,
			decode_kwargs = {},
		} = {},
	) {
		super(tokenizer, {
			skip_prompt,
			callback_function,
			token_callback_function,
			decode_kwargs: {skip_special_tokens, ...decode_kwargs},
		});
		this.timestamp_begin = tokenizer.timestamp_begin;

		this.on_chunk_start = on_chunk_start;
		this.on_chunk_end = on_chunk_end;
		this.on_finalize = on_finalize;

		this.time_precision = time_precision;

		this.waiting_for_timestamp = false;
	}

	/**
	 * @param {bigint[][]} value
	 */
	put(value: bigint[][]) {
		if (value.length > 1) {
			throw Error('WhisperTextStreamer only supports batch size of 1');
		}

		const tokens = value[0];

		// Check if the token is a timestamp
		if (tokens.length === 1) {
			const offset = Number(tokens[0]) - this.timestamp_begin;
			if (offset >= 0) {
				const time = offset * this.time_precision;
				if (this.waiting_for_timestamp) {
					this.on_chunk_end?.(time);
				} else {
					this.on_chunk_start?.(time);
				}

				this.waiting_for_timestamp = !this.waiting_for_timestamp; // Toggle
				value = [[]]; // Skip timestamp
			}
		}

		return super.put(value);
	}

	end() {
		super.end();
		this.on_finalize?.();
	}
}
