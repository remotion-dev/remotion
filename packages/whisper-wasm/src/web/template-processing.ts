import {mergeArrays} from './merge-arrays';
import {PostProcessor} from './post-processor';

/**
 * Post processor that replaces special tokens in a template with actual tokens.
 * @extends PostProcessor
 */
export class TemplateProcessing extends PostProcessor {
	single: any;
	pair: any;
	/**
	 * Creates a new instance of `TemplateProcessing`.
	 * @param {Object} config The configuration options for the post processor.
	 * @param {Array} config.single The template for a single sequence of tokens.
	 * @param {Array} config.pair The template for a pair of sequences of tokens.
	 */
	constructor(config: any) {
		super(config);

		this.single = config.single;
		this.pair = config.pair;
	}

	/**
	 * Replaces special tokens in the template with actual tokens.
	 * @param {string[]} tokens The list of tokens for the first sequence.
	 * @param {string[]} [tokens_pair=null] The list of tokens for the second sequence (optional).
	 * @returns {PostProcessedOutput} An object containing the list of tokens with the special tokens replaced with actual tokens.
	 */
	post_process(
		tokens: any,
		tokens_pair: any = null,
		{add_special_tokens = true} = {},
	) {
		const type = tokens_pair === null ? this.single : this.pair;

		let processedTokens: any[] = [];
		let types: any[] = [];
		for (const item of type) {
			if ('SpecialToken' in item) {
				if (add_special_tokens) {
					processedTokens.push(item.SpecialToken.id);
					types.push(item.SpecialToken.type_id);
				}
			} else if ('Sequence' in item) {
				if (item.Sequence.id === 'A') {
					processedTokens = mergeArrays(processedTokens, tokens);
					types = mergeArrays(
						types,
						new Array(tokens.length).fill(item.Sequence.type_id),
					);
				} else if (item.Sequence.id === 'B') {
					processedTokens = mergeArrays(processedTokens, tokens_pair);
					types = mergeArrays(
						types,
						new Array(tokens_pair.length).fill(item.Sequence.type_id),
					);
				}
			}
		}

		return {tokens: processedTokens, token_type_ids: types};
	}
}
