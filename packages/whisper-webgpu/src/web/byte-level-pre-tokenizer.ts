import {PreTokenizer} from './pre-tokenizer';

/**
 * Returns list of utf-8 byte and a mapping to unicode strings.
 * Specifically avoids mapping to whitespace/control characters the BPE code barfs on.
 * @returns {Object} Object with utf-8 byte keys and unicode string values.
 */
export const BYTES_TO_UNICODE = (() => {
	// Returns list of utf-8 byte and a mapping to unicode strings.
	// We specifically avoids mapping to whitespace/control characters
	// the bpe code barfs on.

	const bs = [
		...Array.from(
			{length: '~'.charCodeAt(0) - '!'.charCodeAt(0) + 1},
			(_, i) => i + '!'.charCodeAt(0),
		),
		...Array.from(
			{length: '¬'.charCodeAt(0) - '¡'.charCodeAt(0) + 1},
			(_, i) => i + '¡'.charCodeAt(0),
		),
		...Array.from(
			{length: 'ÿ'.charCodeAt(0) - '®'.charCodeAt(0) + 1},
			(_, i) => i + '®'.charCodeAt(0),
		),
	];
	const cs = bs.slice();
	let n = 0;
	for (let b = 0; b < 256; ++b) {
		if (!bs.includes(b)) {
			bs.push(b);
			cs.push(256 + n);
			n += 1;
		}
	}

	const ccs = cs.map((_n) => String.fromCharCode(_n));
	return Object.fromEntries(bs.map((b, i) => [b, ccs[i]]));
})();

/**
 * A pre-tokenizer that splits text into Byte-Pair-Encoding (BPE) subwords.
 * @extends PreTokenizer
 */
export class ByteLevelPreTokenizer extends PreTokenizer {
	/**
	 * Creates a new instance of the `ByteLevelPreTokenizer` class.
	 * @param {Object} config The configuration object.
	 */
	config: any;
	add_prefix_space: boolean;
	trim_offsets: boolean;
	use_regex: boolean;
	pattern: RegExp;
	byte_encoder: Record<string, string>;
	text_encoder: TextEncoder;
	constructor(config: any) {
		super();
		this.config = config;

		/**
		 * @type {boolean} Whether to add a leading space to the first word.
		 * This allows to treat the leading word just as any other word.
		 */
		this.add_prefix_space = this.config.add_prefix_space;

		/**
		 * @type {boolean} Whether the post processing step should trim offsets
		 * to avoid including whitespaces.
		 * @todo Use this in the pretokenization step.
		 */
		this.trim_offsets = this.config.trim_offsets;

		/**
		 * @type {boolean} Whether to use the standard GPT2 regex for whitespace splitting.
		 * Set it to False if you want to use your own splitting. Defaults to true.
		 */
		this.use_regex = this.config.use_regex ?? true;
		this.pattern =
			/'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;

		this.byte_encoder = BYTES_TO_UNICODE;
		this.text_encoder = new TextEncoder();
	}

	/**
	 * Tokenizes a single piece of text using byte-level tokenization.
	 * @param {string} text The text to tokenize.
	 * @param {Object} [options] Additional options for the pre-tokenization logic.
	 * @returns {string[]} An array of tokens.
	 */
	pre_tokenize_text(text: string): string[] {
		// Add a leading space if the option is enabled
		if (this.add_prefix_space && !text.startsWith(' ')) {
			text = ' ' + text;
		}

		// Split on whitespace and punctuation
		const tokens = this.use_regex ? text.match(this.pattern) || [] : [text];

		// Maps all our bytes to unicode strings, avoiding control tokens of the BPE (spaces in our case)
		return tokens.map((token) =>
			Array.from(
				this.text_encoder.encode(token),
				(byte) => this.byte_encoder[byte],
			).join(''),
		);
	}
}
