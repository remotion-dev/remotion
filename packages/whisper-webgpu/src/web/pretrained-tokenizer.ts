/**
 * @typedef {Object} Message
 * @property {string} role The role of the message (e.g., "user" or "assistant" or "system").
 * @property {string} content The content of the message.
 */

import {AddedToken} from './added-token';
import type {Decoder} from './byte-level-decoder';
import {ByteLevelDecoder} from './byte-level-decoder';
import {ByteLevelPreTokenizer} from './byte-level-pre-tokenizer';
import {Callable} from './callable';
import {DictionarySplitter} from './dictionary-splitter';
import {padHelper, truncateHelper} from './helper';
import {loadTokenizer} from './load-tokenizer';
import {mergeArrays} from './merge-arrays';
import {prepareTensorForDecode} from './prepare-tensor-for-decode';
import {TemplateProcessing} from './template-processing';
import {Tensor} from './tensor';
import type {tokenizerConfig} from './tokenizer-config';
import {TokenizerModel} from './tokenizer-model';

// Type definitions for special objects
export type Message = {
	role: string;
	content: string;
};

function clean_up_tokenization(text: string) {
	// Clean up a list of simple English tokenization artifacts
	// like spaces before punctuations and abbreviated forms
	return text
		.replace(/ \./g, '.')
		.replace(/ \?/g, '?')
		.replace(/ !/g, '!')
		.replace(/ ,/g, ',')
		.replace(/ ' /g, "'")
		.replace(/ n't/g, "n't")
		.replace(/ 'm/g, "'m")
		.replace(/ 's/g, "'s")
		.replace(/ 've/g, "'ve")
		.replace(/ 're/g, "'re");
}

export type PretrainedTokenizerOptions = {
	progress_callback?: ((progress: number) => void) | null;
	config?: any | null;
	cache_dir?: string | null;
	local_files_only?: boolean;
	revision?: string;
	legacy?: boolean | null;
};

export type BatchEncodingItem = number[] | number[][] | any;
export type BatchEncoding = {
	input_ids: BatchEncodingItem;
	attention_mask: BatchEncodingItem;
	token_type_ids?: BatchEncodingItem;
};

export type EncodingSingle = {
	input_ids: number[];
	attention_mask: number[];
	token_type_ids?: number[];
};

export type TokenizerConfig = typeof tokenizerConfig & {[key: string]: any};

function remove_accents(text: string) {
	return text.replace(/\p{M}/gu, '');
}

function lowercase_and_remove_accent(text: string) {
	return remove_accents(text.toLowerCase());
}

/**
 * Check if a value is an integer.
 * @param {*} x The value to check.
 * @returns {boolean} True if the value is a string, false otherwise.
 */
export function isIntegralNumber(x: unknown) {
	return Number.isInteger(x) || typeof x === 'bigint';
}

export class PreTrainedTokenizer extends Callable {
	return_token_type_ids: boolean = false;
	padding_side: string = 'right';
	_tokenizer_config: TokenizerConfig;
	normalizer: any;
	pre_tokenizer: any;
	model: any;
	post_processor: any;
	decoder: Decoder;
	special_tokens: string[];
	all_special_ids: number[];
	added_tokens: any[];
	additional_special_tokens: string[];
	added_tokens_splitter: any;
	added_tokens_map: Map<string, any>;
	mask_token: string | null | undefined;
	mask_token_id: number | undefined;
	pad_token: string | null | undefined;
	pad_token_id: number | undefined;
	sep_token: string | null | undefined;
	sep_token_id: number | undefined;
	unk_token: string | null | undefined;
	unk_token_id: number | undefined;
	bos_token: string | null | undefined;
	bos_token_id: number | undefined;
	eos_token: string | null | undefined;
	eos_token_id: number | undefined;
	model_max_length: number;
	remove_space: boolean;
	clean_up_tokenization_spaces: boolean;
	do_lowercase_and_remove_accent: boolean;
	legacy: boolean;
	chat_template: any;
	_compiled_template_cache: Map<string, any>;

	constructor(tokenizerJSON: any, tokenizerConfig: TokenizerConfig) {
		super();

		this._tokenizer_config = tokenizerConfig;

		// Construct parts of the tokenizer from the JSON
		this.normalizer = null;
		this.pre_tokenizer = new ByteLevelPreTokenizer(tokenizerJSON.pre_tokenizer);
		this.model = TokenizerModel.fromConfig(
			tokenizerJSON.model,
			tokenizerConfig,
		);
		this.post_processor = new TemplateProcessing(tokenizerJSON.post_processor);
		this.decoder = new ByteLevelDecoder(tokenizerJSON.decoder);

		// Add added_tokens to model
		this.special_tokens = [];
		this.all_special_ids = [];

		/** @type {AddedToken[]} */
		this.added_tokens = [];
		for (const addedToken of tokenizerJSON.added_tokens) {
			const token = new AddedToken(addedToken);
			this.added_tokens.push(token);

			this.model.tokens_to_ids.set(token.content, token.id);
			this.model.vocab[token.id] = token.content;

			if (token.special) {
				this.special_tokens.push(token.content);
				this.all_special_ids.push(token.id);
			}
		}

		// Update additional_special_tokens
		this.additional_special_tokens =
			(tokenizerConfig as any).additional_special_tokens ?? [];
		this.special_tokens.push(...this.additional_special_tokens);
		this.special_tokens = [...new Set(this.special_tokens)]; // Remove duplicates

		if (this.decoder) {
			// Slight hack, but it prevents code duplication:
			this.decoder.added_tokens = this.added_tokens;

			// Another slight hack to add `end_of_word_suffix` (if present) to the decoder
			// This is needed for cases where BPE model and ByteLevel decoder are used
			// For more information, see https://github.com/huggingface/transformers.js/issues/74
			// TODO: save this to the decoder when exporting?
			this.decoder.end_of_word_suffix = this.model.end_of_word_suffix;
		}

		this.added_tokens_splitter = new DictionarySplitter(
			this.added_tokens.map((x: any) => x.content),
		);

		/** @type {Map<string, AddedToken>} */
		this.added_tokens_map = new Map(
			this.added_tokens.map((x: any) => [x.content, x]),
		);

		// Set mask token if present (otherwise will be undefined, which is fine)
		this.mask_token = this.getToken('mask_token');
		this.mask_token_id = this.model.tokens_to_ids.get(this.mask_token);

		this.pad_token = this.getToken('pad_token', 'eos_token');
		this.pad_token_id = this.model.tokens_to_ids.get(this.pad_token);

		this.sep_token = this.getToken('sep_token');
		this.sep_token_id = this.model.tokens_to_ids.get(this.sep_token);

		this.unk_token = this.getToken('unk_token');
		this.unk_token_id = this.model.tokens_to_ids.get(this.unk_token);

		this.bos_token = this.getToken('bos_token');
		this.bos_token_id = this.model.tokens_to_ids.get(this.bos_token);

		this.eos_token = this.getToken('eos_token');
		this.eos_token_id = this.model.tokens_to_ids.get(this.eos_token);

		this.model_max_length = (tokenizerConfig as any).model_max_length;

		/** @type {boolean} Whether or not to strip the text when tokenizing (removing excess spaces before and after the string). */
		this.remove_space = (tokenizerConfig as any).remove_space;

		this.clean_up_tokenization_spaces =
			(tokenizerConfig as any).clean_up_tokenization_spaces ?? true;
		this.do_lowercase_and_remove_accent =
			(tokenizerConfig as any).do_lowercase_and_remove_accent ?? false;

		if ((tokenizerConfig as any).padding_side) {
			this.padding_side = (tokenizerConfig as any).padding_side;
		}

		this.legacy = false;

		this.chat_template = (tokenizerConfig as any).chat_template ?? null;
		if (Array.isArray(this.chat_template)) {
			// Chat templates are stored as lists of dicts with fixed key names,
			// we reconstruct that into a single dict while loading them.
			const chat_template: any = Object.create(null);
			for (const {name, template} of this.chat_template as any) {
				if (typeof name !== 'string' || typeof template !== 'string') {
					throw new Error(
						'Chat template must be a list of objects with "name" and "template" properties',
					);
				}

				chat_template[name] = template;
			}

			this.chat_template = chat_template;
		}

		this._compiled_template_cache = new Map();
	}

	/**
	 * Returns the value of the first matching key in the tokenizer config object.
	 * @param {...string} keys One or more keys to search for in the tokenizer config object.
	 * @returns {string|null} The value associated with the first matching key, or null if no match is found.
	 * @private
	 */
	getToken(...keys: string[]): string | null {
		for (const key of keys) {
			const item = this._tokenizer_config[key];

			if (!item) continue;

			if (typeof item === 'object') {
				if (item.__type === 'AddedToken') {
					return item.content;
				}

				throw Error(`Unknown token: ${item}`);
			} else {
				return item;
			}
		}

		return null;
	}

	/**
	 * Loads a pre-trained tokenizer from the given `pretrained_model_name_or_path`.
	 *
	 * @param {string} pretrained_model_name_or_path The path to the pre-trained tokenizer.
	 * @param {PretrainedTokenizerOptions} options Additional options for loading the tokenizer.
	 *
	 * @throws {Error} Throws an error if the tokenizer.json or tokenizer_config.json files are not found in the `pretrained_model_name_or_path`.
	 * @returns {Promise<PreTrainedTokenizer>} A new instance of the `PreTrainedTokenizer` class.
	 */
	static async from_pretrained(): Promise<PreTrainedTokenizer> {
		const info = await loadTokenizer();

		return new this(...(info as [any, TokenizerConfig]));
	}

	/**
	 * @typedef {number[]|number[][]|Tensor} BatchEncodingItem
	 *
	 * @typedef {Object} BatchEncoding Holds the output of the tokenizer's call function.
	 * @property {BatchEncodingItem} input_ids List of token ids to be fed to a model.
	 * @property {BatchEncodingItem} attention_mask List of indices specifying which tokens should be attended to by the model.
	 * @property {BatchEncodingItem} [token_type_ids] List of token type ids to be fed to a model.
	 */

	/**
	 * Encode/tokenize the given text(s).
	 * @param {string|string[]} text The text to tokenize.
	 * @param {Object} options An optional object containing the following properties:
	 * @param {string|string[]} [options.text_pair=null] Optional second sequence to be encoded. If set, must be the same type as text.
	 * @param {boolean|'max_length'} [options.padding=false] Whether to pad the input sequences.
	 * @param {boolean} [options.add_special_tokens=true] Whether or not to add the special tokens associated with the corresponding model.
	 * @param {boolean} [options.truncation=null] Whether to truncate the input sequences.
	 * @param {number} [options.max_length=null] Maximum length of the returned list and optionally padding length.
	 * @param {boolean} [options.return_tensor=true] Whether to return the results as Tensors or arrays.
	 * @param {boolean} [options.return_token_type_ids=null] Whether to return the token type ids.
	 * @returns {BatchEncoding} Object to be passed to the model.
	 */
	_call(
		// Required positional arguments
		text: string | string[],

		// Optional keyword arguments
		{
			text_pair = null,
			add_special_tokens = true,
			padding = false,
			truncation = null,
			max_length = null,
			return_tensor = true, // Different to HF
			return_token_type_ids = null,
		}: {
			text_pair?: string | string[] | null;
			add_special_tokens?: boolean;
			padding?: boolean | 'max_length';
			truncation?: boolean | null;
			max_length?: number | null;
			return_tensor?: boolean;
			return_token_type_ids?: boolean | null;
		} = {},
	): BatchEncoding {
		const isBatched = Array.isArray(text);

		/** @type {EncodingSingle[]} */
		let encodedTokens;

		if (isBatched) {
			if (text.length === 0) {
				throw Error('text array must be non-empty');
			}

			if (text_pair !== null) {
				if (!Array.isArray(text_pair)) {
					throw Error('text_pair must also be an array');
				} else if (text.length !== text_pair.length) {
					throw Error('text and text_pair must have the same length');
				}

				encodedTokens = text.map((t, i) =>
					this._encode_plus(t, {
						text_pair: text_pair[i],
						add_special_tokens,
						return_token_type_ids,
					}),
				);
			} else {
				encodedTokens = text.map((x) =>
					this._encode_plus(x, {add_special_tokens, return_token_type_ids}),
				);
			}
		} else {
			if (text === null || text === undefined) {
				throw Error('text may not be null or undefined');
			}

			if (Array.isArray(text_pair)) {
				throw Error(
					'When specifying `text_pair`, since `text` is a string, `text_pair` must also be a string (i.e., not an array).',
				);
			}

			// For single input, we just wrap in an array, and then unwrap later.
			encodedTokens = [
				this._encode_plus(text, {
					text_pair,
					add_special_tokens,
					return_token_type_ids,
				}),
			];
		}

		// At this point, `encodedTokens` is batched, of shape [batch_size, tokens].
		// However, array may be jagged. So, we may need pad to max_length.
		if (max_length === null) {
			max_length = this.model_max_length;
		} else if (truncation === null) {
			if (padding === true) {
				// eslint-disable-next-line no-console
				console.warn(
					'`max_length` is ignored when `padding: true` and there is no truncation strategy. ' +
						"To pad to max length, use `padding: 'max_length'`.",
				);
				max_length = this.model_max_length;
			} else if (padding === false) {
				// eslint-disable-next-line no-console
				console.warn(
					'Truncation was not explicitly activated but `max_length` is provided a specific value, please use `truncation: true` to explicitly truncate examples to max length.',
				);
				truncation = true;
			}
		}

		// padding: 'max_length' doesn't require any additional calculation
		// but padding: true has to calculate max_length from the sequences
		if (padding === true) {
			const maxLen = Math.max(
				...encodedTokens.map((x: any) => x.input_ids.length),
			);
			max_length = Math.min(maxLen, max_length ?? Infinity);
		}

		// Ensure it is less than model max length
		max_length = Math.min(max_length, this.model_max_length ?? Infinity);

		if (padding || truncation) {
			// Perform padding and/or truncation
			for (let i = 0; i < encodedTokens.length; ++i) {
				if (encodedTokens[i].input_ids.length === max_length) {
					continue;
				} else if (encodedTokens[i].input_ids.length > max_length) {
					// possibly truncate
					if (truncation) {
						truncateHelper(encodedTokens[i], max_length);
					}
				} else {
					// t.length < max_length
					// possibly pad
					// eslint-disable-next-line no-lonely-if
					if (padding) {
						padHelper(
							encodedTokens[i],
							max_length,
							(key: string) => (key === 'input_ids' ? this.pad_token_id : 0),
							this.padding_side,
						);
					}
				}
			}
		}

		const result: Record<string, any> = {};

		if (return_tensor) {
			if (!(padding && truncation)) {
				// Not, guaranteed that all items have same length, so
				// we perform additional check

				if (
					encodedTokens.some((x) => {
						for (const key of Object.keys(x)) {
							if (
								(x as any)[key].length !==
								(encodedTokens[0] as any)[key]?.length
							) {
								return true;
							}
						}

						return false;
					})
				) {
					throw Error(
						'Unable to create tensor, you should probably activate truncation and/or padding ' +
							"with 'padding=true' and 'truncation=true' to have batched tensors with the same length.",
					);
				}
			}

			// Now we actually convert to tensor
			// NOTE: In the same way as the python library, we return a batched tensor, regardless of
			// whether we have a single input or multiple inputs.
			const dims = [encodedTokens.length, encodedTokens[0].input_ids.length];

			for (const key of Object.keys(encodedTokens[0])) {
				result[key] = new Tensor(
					'int64',
					BigInt64Array.from(
						encodedTokens
							.flatMap((x) => x[key as keyof EncodingSingle])
							.map((x) => BigInt(x as number)),
					),
					dims,
				);
			}
		} else {
			for (const key of Object.keys(encodedTokens[0])) {
				result[key] = encodedTokens.map((x: any) => x[key]);
			}

			// If not returning a tensor, we match the input type
			if (!isBatched) {
				// Input was not batched, so we unwrap
				for (const key of Object.keys(result)) {
					(result as any)[key] = (result as any)[key][0];
				}
			}
		}

		return result as BatchEncoding;
	}

	/**
	 * Encodes a single text using the preprocessor pipeline of the tokenizer.
	 *
	 * @param {string|null} text The text to encode.
	 * @returns {string[]|null} The encoded tokens.
	 */
	_encode_text(text: string | null): string[] | null {
		if (text === null) return null;

		// Actual function which does encoding, for a single text
		// First, we take care of special tokens. Needed to avoid issues arising from
		// normalization and/or pretokenization (which may not preserve special tokens)
		const sections = this.added_tokens_splitter.split(text);

		// Process left/right stripping of added tokens
		for (let i = 0; i < sections.length; ++i) {
			const addedToken = this.added_tokens_map.get(sections[i]);
			if (addedToken) {
				if (addedToken.lstrip && i > 0) {
					sections[i - 1] = sections[i - 1].trimEnd();
				}

				if (addedToken.rstrip && i < sections.length - 1) {
					sections[i + 1] = sections[i + 1].trimStart();
				}
			}
		}

		const tokens = sections.flatMap((x: any, section_index: number) => {
			if (x.length === 0) return [];
			if (this.added_tokens_map.has(x)) return [x]; // Return added tokens unchanged

			if (this.remove_space === true) {
				x = x.trim().split(/\s+/).join(' ');
			}

			if (this.do_lowercase_and_remove_accent) {
				x = lowercase_and_remove_accent(x);
			}

			if (this.normalizer !== null) {
				x = this.normalizer(x);
			}

			// If, after normalization, this section is empty (e.g., trimming whitespace),
			// we return an empty array
			if (x.length === 0) {
				return [];
			}

			const sectionTokens =
				this.pre_tokenizer !== null
					? this.pre_tokenizer(x, {
							section_index,
						})
					: [x];

			const _tokens = this.model(sectionTokens);

			return _tokens;
		});

		return tokens;
	}

	/**
	 * Encodes a single text or a pair of texts using the model's tokenizer.
	 *
	 * @param {string} text The text to encode.
	 * @param {Object} options An optional object containing the following properties:
	 * @param {string} [options.text_pair=null] The optional second text to encode.
	 * @param {boolean} [options.add_special_tokens=true] Whether or not to add the special tokens associated with the corresponding model.
	 * @param {boolean} [options.return_token_type_ids=null] Whether to return token_type_ids.
	 * @returns {EncodingSingle} An object containing the encoded text.
	 * @private
	 */
	_encode_plus(
		text: string,
		{
			text_pair = null,
			add_special_tokens = true,
			return_token_type_ids = null,
		}: {
			text_pair?: string | null;
			add_special_tokens?: boolean;
			return_token_type_ids?: boolean | null;
		} = {},
	): EncodingSingle {
		const {tokens, token_type_ids} = this._tokenize_helper(text, {
			pair: text_pair,
			add_special_tokens,
		});

		const input_ids = this.model.convert_tokens_to_ids(tokens);

		const result: {
			input_ids: number[];
			attention_mask: number[];
			token_type_ids?: number[];
		} = {
			input_ids,
			attention_mask: new Array(input_ids.length).fill(1),
		};
		if (
			(return_token_type_ids ?? this.return_token_type_ids) &&
			token_type_ids
		) {
			result.token_type_ids = token_type_ids;
		}

		return result;
	}

	/**
	 * Internal helper function to tokenize a text, and optionally a pair of texts.
	 * @param {string} text The text to tokenize.
	 * @param {Object} options An optional object containing the following properties:
	 * @param {string} [options.pair=null] The optional second text to tokenize.
	 * @param {boolean} [options.add_special_tokens=false] Whether or not to add the special tokens associated with the corresponding model.
	 * @returns {{tokens: string[], token_type_ids?: number[]}} An object containing the tokens and optionally the token type IDs.
	 */
	_tokenize_helper(
		text: string,
		{
			pair = null,
			add_special_tokens = false,
		}: {pair?: string | null; add_special_tokens?: boolean} = {},
	): {tokens: string[]; token_type_ids?: number[]} {
		const tokens = this._encode_text(text);
		const tokens2 = this._encode_text(pair);

		return this.post_processor
			? this.post_processor(tokens, tokens2, {add_special_tokens})
			: {tokens: mergeArrays(tokens ?? [], tokens2 ?? [])};
	}

	/**
	 * Converts a string into a sequence of tokens.
	 * @param {string} text The sequence to be encoded.
	 * @param {Object} options An optional object containing the following properties:
	 * @param {string} [options.pair] A second sequence to be encoded with the first.
	 * @param {boolean} [options.add_special_tokens=false] Whether or not to add the special tokens associated with the corresponding model.
	 * @returns {string[]} The list of tokens.
	 */
	tokenize(
		text: string,
		{
			pair = null,
			add_special_tokens = false,
		}: {pair?: string | null; add_special_tokens?: boolean} = {},
	): string[] {
		return this._tokenize_helper(text, {pair, add_special_tokens}).tokens;
	}

	/**
	 * Encodes a single text or a pair of texts using the model's tokenizer.
	 *
	 * @param {string} text The text to encode.
	 * @param {Object} options An optional object containing the following properties:
	 * @param {string} [options.text_pair=null] The optional second text to encode.
	 * @param {boolean} [options.add_special_tokens=true] Whether or not to add the special tokens associated with the corresponding model.
	 * @param {boolean} [options.return_token_type_ids=null] Whether to return token_type_ids.
	 * @returns {number[]} An array of token IDs representing the encoded text(s).
	 */
	encode(
		text: string,
		{
			text_pair = null,
			add_special_tokens = true,
			return_token_type_ids = null,
		}: {
			text_pair?: string | null;
			add_special_tokens?: boolean;
			return_token_type_ids?: boolean | null;
		} = {},
	): number[] {
		return this._encode_plus(text, {
			text_pair,
			add_special_tokens,
			return_token_type_ids,
		}).input_ids;
	}

	/**
	 * Decode a batch of tokenized sequences.
	 * @param {number[][]|Tensor} batch List/Tensor of tokenized input sequences.
	 * @param {Object} decode_args (Optional) Object with decoding arguments.
	 * @returns {string[]} List of decoded sequences.
	 */
	batch_decode(
		batch: number[][] | any,
		decode_args: {
			skip_special_tokens?: boolean;
			clean_up_tokenization_spaces?: boolean;
		} = {},
	): string[] {
		if (batch instanceof Tensor) {
			batch = batch.tolist();
		}

		return batch.map((x: any) => this.decode(x, decode_args));
	}

	/**
	 * Decodes a sequence of token IDs back to a string.
	 *
	 * @param {number[]|bigint[]|Tensor} token_ids List/Tensor of token IDs to decode.
	 * @param {Object} [decode_args={}]
	 * @param {boolean} [decode_args.skip_special_tokens=false] If true, special tokens are removed from the output string.
	 * @param {boolean} [decode_args.clean_up_tokenization_spaces=true] If true, spaces before punctuations and abbreviated forms are removed.
	 *
	 * @returns {string} The decoded string.
	 * @throws {Error} If `token_ids` is not a non-empty array of integers.
	 */
	decode(
		token_ids: number[] | bigint[] | any,
		decode_args: {
			skip_special_tokens?: boolean;
			clean_up_tokenization_spaces?: boolean;
		} = {},
	): string {
		if (token_ids instanceof Tensor) {
			token_ids = prepareTensorForDecode(token_ids);
		}

		if (
			!Array.isArray(token_ids) ||
			token_ids.length === 0 ||
			!isIntegralNumber(token_ids[0])
		) {
			throw Error('token_ids must be a non-empty array of integers.');
		}

		return this.decode_single(token_ids, decode_args);
	}

	/**
	 * Decode a single list of token ids to a string.
	 * @param {number[]|bigint[]} token_ids List of token ids to decode
	 * @param {Object} decode_args Optional arguments for decoding
	 * @param {boolean} [decode_args.skip_special_tokens=false] Whether to skip special tokens during decoding
	 * @param {boolean} [decode_args.clean_up_tokenization_spaces=null] Whether to clean up tokenization spaces during decoding.
	 * If null, the value is set to `this.decoder.cleanup` if it exists, falling back to `this.clean_up_tokenization_spaces` if it exists, falling back to `true`.
	 * @returns {string} The decoded string
	 */
	decode_single(
		token_ids: number[] | bigint[],
		{
			skip_special_tokens = false,
			clean_up_tokenization_spaces = null,
		}: {
			skip_special_tokens?: boolean;
			clean_up_tokenization_spaces?: boolean | null;
		},
	): string {
		let tokens = this.model.convert_ids_to_tokens(token_ids);
		if (skip_special_tokens) {
			tokens = tokens.filter((x: string) => !this.special_tokens.includes(x));
		}

		// If `this.decoder` is null, we just join tokens with a space:
		// https://github.com/huggingface/tokenizers/blob/8edec536a737cb04494b454805be16c020abb14f/tokenizers/src/tokenizer/mod.rs#L835
		/** @type {string} */
		let decoded = this.decoder ? this.decoder._call(tokens) : tokens.join(' ');

		// Slight hack, but prevents having to pass `skip_special_tokens` to
		// each call to `decode`, which would lead to code duplication.
		if (this.decoder && this.decoder.end_of_word_suffix) {
			decoded = decoded.replaceAll(this.decoder.end_of_word_suffix, ' ');
			if (skip_special_tokens) {
				decoded = decoded.trim();
			}
		}

		if (clean_up_tokenization_spaces ?? this.clean_up_tokenization_spaces) {
			decoded = clean_up_tokenization(decoded);
		}

		return decoded;
	}

	get_chat_template({chat_template = null, tools = null} = {}) {
		// First, handle the cases when the model has a dict of multiple templates
		if (this.chat_template && typeof this.chat_template === 'object') {
			const template_dict = this.chat_template;

			if (
				chat_template !== null &&
				Object.hasOwn(template_dict, chat_template)
			) {
				// The user can pass the name of a template to the chat template argument instead of an entire template
				chat_template = template_dict[chat_template];
			} else if (chat_template === null) {
				if (tools !== null && 'tool_use' in template_dict) {
					chat_template = template_dict.tool_use;
				} else if ('default' in template_dict) {
					chat_template = template_dict.default;
				} else {
					throw Error(
						`This model has multiple chat templates with no default specified! Please either pass a chat ` +
							`template or the name of the template you wish to use to the 'chat_template' argument. Available ` +
							`template names are ${Object.keys(template_dict).sort()}.`,
					);
				}
			}
		} else if (chat_template === null) {
			// These are the cases when the model has a single template
			// priority: `chat_template` argument > `tokenizer.chat_template`
			if (this.chat_template) {
				chat_template = this.chat_template;
			} else {
				throw Error(
					'Cannot use apply_chat_template() because tokenizer.chat_template is not set and no template ' +
						'argument was passed! For information about writing templates and setting the ' +
						'tokenizer.chat_template attribute, please see the documentation at ' +
						'https://huggingface.co/docs/transformers/main/en/chat_templating',
				);
			}
		}

		return chat_template;
	}
}
