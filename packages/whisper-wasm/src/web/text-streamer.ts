import {BaseStreamer} from './base-streamer';
import {is_chinese_char} from './is-chinese-char';
import {mergeArrays} from './merge-arrays';
import type {PreTrainedTokenizer} from './pretrained-tokenizer';

export class TextStreamer extends BaseStreamer {
	tokenizer: PreTrainedTokenizer;
	skip_prompt: boolean;
	callback_function: (text: string) => void;
	token_callback_function: ((tokens: bigint[]) => void) | null;
	decode_kwargs: Record<string, unknown>;
	token_cache: bigint[];
	print_len: number;
	next_tokens_are_prompt: boolean;
	constructor(
		tokenizer: PreTrainedTokenizer,
		{
			skip_prompt = false,
			callback_function,
			token_callback_function = null,
			decode_kwargs = {},
			...kwargs
		}: {
			skip_prompt?: boolean;
			callback_function: (text: string) => void;
			token_callback_function?: ((tokens: bigint[]) => void) | null;
			decode_kwargs?: Record<string, unknown>;
			[key: string]: unknown;
		},
	) {
		super();
		this.tokenizer = tokenizer;
		this.skip_prompt = skip_prompt;
		this.callback_function = callback_function;
		this.token_callback_function = token_callback_function;
		this.decode_kwargs = {...decode_kwargs, ...kwargs};

		// variables used in the streaming process
		this.token_cache = [];
		this.print_len = 0;
		this.next_tokens_are_prompt = true;
	}

	/**
	 * Receives tokens, decodes them, and prints them to stdout as soon as they form entire words.
	 * @param {bigint[][]} value
	 */
	put(value: bigint[][]) {
		if (value.length > 1) {
			throw Error('TextStreamer only supports batch size of 1');
		}

		if (this.skip_prompt && this.next_tokens_are_prompt) {
			this.next_tokens_are_prompt = false;
			return;
		}

		const tokens = value[0];
		this.token_callback_function?.(tokens);

		// Add the new token to the cache and decodes the entire thing.
		this.token_cache = mergeArrays(this.token_cache, tokens);
		const text = this.tokenizer.decode(this.token_cache, this.decode_kwargs);

		let printable_text;
		if (text.endsWith('\n')) {
			// After the symbol for a new line, we flush the cache.
			printable_text = text.slice(this.print_len);
			this.token_cache = [];
			this.print_len = 0;
		} else if (
			text.length > 0 &&
			is_chinese_char(text.charCodeAt(text.length - 1))
		) {
			// If the last token is a CJK character, we print the characters.
			printable_text = text.slice(this.print_len);
			this.print_len += printable_text.length;
		} else {
			// Otherwise, prints until the last space char (simple heuristic to avoid printing incomplete words,
			// which may change with the subsequent token -- there are probably smarter ways to do this!)
			printable_text = text.slice(this.print_len, text.lastIndexOf(' ') + 1);
			this.print_len += printable_text.length;
		}

		this.on_finalized_text(printable_text);
	}

	/**
	 * Flushes any remaining cache and prints a newline to stdout.
	 */
	end() {
		let printable_text;
		if (this.token_cache.length > 0) {
			const text = this.tokenizer.decode(this.token_cache, this.decode_kwargs);
			printable_text = text.slice(this.print_len);
			this.token_cache = [];
			this.print_len = 0;
		} else {
			printable_text = '';
		}

		this.next_tokens_are_prompt = true;
		this.on_finalized_text(printable_text);
	}

	/**
	 * Prints the new text to stdout. If the stream is ending, also prints a newline.
	 * @param {string} text
	 * @param {boolean} stream_end
	 */
	on_finalized_text(text: string) {
		if (text.length > 0) {
			this.callback_function?.(text);
		}
	}
}
