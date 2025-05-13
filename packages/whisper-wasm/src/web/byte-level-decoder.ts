/* eslint-disable @typescript-eslint/no-use-before-define */
import {BYTES_TO_UNICODE} from './byte-level-pre-tokenizer';
import {Callable} from './callable';

export function reverseDictionary(data: any) {
	// https://ultimatecourses.com/blog/reverse-object-keys-and-values-in-javascript
	return Object.fromEntries(
		Object.entries(data).map(([key, value]) => [value, key]),
	);
}

const UNICODE_TO_BYTES = reverseDictionary(BYTES_TO_UNICODE);

/**
 * The base class for token decoders.
 * @extends Callable
 */
export class Decoder extends Callable {
	/**
	 * Creates an instance of `Decoder`.
	 *
	 * @param {Object} config The configuration object.
	 */
	config: any;
	added_tokens: any[];
	end_of_word_suffix: any;
	trim_offsets: any;
	constructor(config: any) {
		super();
		this.config = config;

		/** @type {AddedToken[]} */
		this.added_tokens = [];
		this.end_of_word_suffix = null;
		this.trim_offsets = config.trim_offsets;
	}

	/**
	 * Creates a decoder instance based on the provided configuration.
	 *
	 * @param {Object} config The configuration object.
	 * @returns {Decoder} A decoder instance.
	 * @throws {Error} If an unknown decoder type is provided.
	 */
	static fromConfig(config: any) {
		return new ByteLevelDecoder(config);
	}

	/**
	 * Calls the `decode` method.
	 *
	 * @param {string[]} tokens The list of tokens.
	 * @returns {string} The decoded string.
	 */
	_call(tokens: string[]) {
		return this.decode(tokens);
	}

	/**
	 * Decodes a list of tokens.
	 * @param {string[]} tokens The list of tokens.
	 * @returns {string} The decoded string.
	 */
	decode(tokens: string[]) {
		return this.decode_chain(tokens).join('');
	}

	/**
	 * Apply the decoder to a list of tokens.
	 *
	 * @param {string[]} tokens The list of tokens.
	 * @returns {string[]} The decoded list of tokens.
	 * @throws {Error} If the `decode_chain` method is not implemented in the subclass.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	decode_chain(_tokens: string[]): string[] {
		throw Error('`decode_chain` should be implemented in subclass.');
	}
}

/**
 * Byte-level decoder for tokenization output. Inherits from the `Decoder` class.
 * @extends Decoder
 */
export class ByteLevelDecoder extends Decoder {
	/**
	 * Create a `ByteLevelDecoder` object.
	 * @param {Object} config Configuration object.
	 */
	byte_decoder: any;
	text_decoder: any;
	constructor(config: any) {
		super(config);

		this.byte_decoder = UNICODE_TO_BYTES;
		this.text_decoder = new TextDecoder('utf-8', {
			fatal: false,
			ignoreBOM: true,
		});

		this.end_of_word_suffix = null;
	}

	/**
	 * Convert an array of tokens to string by decoding each byte.
	 * @param {string[]} tokens Array of tokens to be decoded.
	 * @returns {string} The decoded string.
	 */
	convert_tokens_to_string(tokens: string[]): string {
		const text = tokens.join('');
		const byteArray = new Uint8Array(
			[...text].map((c) => this.byte_decoder[c]),
		);
		const decoded_text = this.text_decoder.decode(byteArray);
		return decoded_text;
	}

	/** @type {Decoder['decode_chain']} */
	decode_chain(tokens: string[]): string[] {
		// TODO move to base class (like HF)
		// tokens === filtered_tokens

		// To avoid mixing byte-level and unicode for byte-level BPT
		// we need to build string separately for added tokens and byte-level tokens
		// cf. https://github.com/huggingface/transformers/issues/1133
		const sub_texts = [];
		let current_sub_text = [];
		for (const token of tokens) {
			// tokens sent here are already filtered, so we don't need to do this
			// if (skip_special_tokens && this.all_special_ids.includes(token)) {
			//     continue;
			// }

			if (this.added_tokens.find((x) => x.content === token) !== undefined) {
				if (current_sub_text.length > 0) {
					sub_texts.push(this.convert_tokens_to_string(current_sub_text));
					current_sub_text = [];
				}

				sub_texts.push(token);
			} else {
				current_sub_text.push(token);
			}
		}

		if (current_sub_text.length > 0) {
			sub_texts.push(this.convert_tokens_to_string(current_sub_text));
		}

		// TODO add spaces_between_special_tokens and clean_up_tokenization_spaces options

		return sub_texts;
	}
}
