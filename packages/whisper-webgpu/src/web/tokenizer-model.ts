/* eslint-disable @typescript-eslint/no-unused-vars */
import {Callable} from './callable';
import {LRUCache} from './lru-cache';
import {PriorityQueue} from './priority-queue';

type BPENode = {
	token: string;
	bias: number;
	prev: BPENode | null;
	next: BPENode | null;
	deleted?: boolean;
	score?: number;
};

/**
 * Helper function to fuse consecutive unknown tokens.
 * @param {string[]} arr The list of input tokens
 * @param {Map<string, any>} tokens_to_ids The mapping from tokens to token ids.
 * @param {number} unk_token_id The value to fuse on.
 * @private
 */
function fuse_unk(
	arr: string[],
	tokens_to_ids: Map<string, any>,
	unk_token_id: number,
) {
	const fused = [];
	let i = 0;
	while (i < arr.length) {
		fused.push(arr[i]);
		if ((tokens_to_ids.get(arr[i]) ?? unk_token_id) !== unk_token_id) {
			++i;
			continue;
		}

		while (
			++i < arr.length &&
			(tokens_to_ids.get(arr[i]) ?? unk_token_id) === unk_token_id
		) {
			if (tokens_to_ids.get(fused.at(-1)!) !== unk_token_id) {
				fused[fused.length - 1] += arr[i];
			}
		}
	}

	return fused;
}

/**
 * Abstract base class for tokenizer models.
 *
 * @extends Callable
 */
export class TokenizerModel extends Callable {
	/**
	 * Creates a new instance of TokenizerModel.
	 * @param {Object} config The configuration object for the TokenizerModel.
	 */
	config: any;
	vocab: string[];
	tokens_to_ids: Map<string, number>;
	unk_token_id: number | undefined;
	unk_token: string | undefined;
	end_of_word_suffix: string | undefined;
	fuse_unk: boolean;

	constructor(config: any) {
		super();
		this.config = config;

		/** @type {string[]} */
		this.vocab = [];

		/**
		 * A mapping of tokens to ids.
		 * @type {Map<string, number>}
		 */
		this.tokens_to_ids = new Map();

		this.unk_token_id = undefined;
		this.unk_token = undefined;
		this.end_of_word_suffix = undefined;

		/** @type {boolean} Whether to fuse unknown tokens when encoding. Defaults to false. */
		this.fuse_unk = this.config.fuse_unk ?? false;
	}

	/**
	 * Instantiates a new TokenizerModel instance based on the configuration object provided.
	 * @param {Object} config The configuration object for the TokenizerModel.
	 * @param {...*} _args Optional arguments to pass to the specific TokenizerModel constructor.
	 * @returns {TokenizerModel} A new instance of a TokenizerModel.
	 * @throws Will throw an error if the TokenizerModel type in the config is not recognized.
	 */
	static fromConfig(config: any, ..._args: any[]) {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		return new BPE(config);
	}

	/**
	 * Internal function to call the TokenizerModel instance.
	 * @param {string[]} tokens The tokens to encode.
	 * @returns {string[]} The encoded tokens.
	 */
	_call(tokens: string[]) {
		tokens = this.encode(tokens);
		if (this.fuse_unk) {
			// Fuse unknown tokens
			tokens = fuse_unk(
				tokens,
				this.tokens_to_ids,
				this.unk_token_id as number,
			);
		}

		return tokens;
	}

	/**
	 * Encodes a list of tokens into a list of token IDs.
	 * @param {string[]} tokens The tokens to encode.
	 * @returns {string[]} The encoded tokens.
	 * @throws Will throw an error if not implemented in a subclass.
	 */
	encode(_tokens: string[]): string[] {
		throw Error('encode should be implemented in subclass.');
	}

	/**
	 * Converts a list of tokens into a list of token IDs.
	 * @param {string[]} tokens The tokens to convert.
	 * @returns {number[]} The converted token IDs.
	 */
	convert_tokens_to_ids(tokens: string[]) {
		return tokens.map((t) => this.tokens_to_ids.get(t) ?? this.unk_token_id);
	}

	/**
	 * Converts a list of token IDs into a list of tokens.
	 * @param {number[]|bigint[]} ids The token IDs to convert.
	 * @returns {string[]} The converted tokens.
	 */
	convert_ids_to_tokens(ids: number[]) {
		return ids.map((i) => this.vocab[i] ?? this.unk_token);
	}
}

/**
 * BPE class for encoding text into Byte-Pair-Encoding (BPE) tokens.
 * @extends TokenizerModel
 */
class BPE extends TokenizerModel {
	merges: [string, string][];
	bpe_ranks: Map<string, number>;
	continuing_subword_suffix: string | null;
	byte_fallback: boolean;
	ignore_merges: boolean;
	max_length_to_cache: number;
	cache_capacity: number;
	cache: LRUCache;
	text_encoder?: TextEncoder;
	/**
	 * Create a BPE instance.
	 * @param {Object} config The configuration object for BPE.
	 * @param {Object} config.vocab A mapping of tokens to ids.
	 * @param {string[]|[string, string][]} config.merges An array of BPE merges as strings.
	 * @param {string} config.unk_token The unknown token used for out of vocabulary words.
	 * @param {string} config.end_of_word_suffix The suffix to place at the end of each word.
	 * @param {string} [config.continuing_subword_suffix] The suffix to insert between words.
	 * @param {boolean} [config.byte_fallback=false] Whether to use spm byte-fallback trick (defaults to False)
	 * @param {boolean} [config.ignore_merges=false] Whether or not to match tokens with the vocab before using merges.
	 */
	constructor(config: any) {
		super(config);

		/** @type {Map<string, number>} */
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		this.tokens_to_ids = objectToMap(config.vocab);

		this.unk_token_id = this.tokens_to_ids.get(config.unk_token);
		this.unk_token = config.unk_token;

		this.vocab = new Array(this.tokens_to_ids.size);
		for (const [key, value] of this.tokens_to_ids) {
			this.vocab[value] = key;
		}

		// Tokenizers >= 0.20.0 serializes BPE merges as a [string, string][] instead of a string[],
		// which resolves the ambiguity for merges containing spaces.
		const use_new_merge_format = Array.isArray(config.merges[0]);

		/** @type {[string, string][]} */
		this.merges = use_new_merge_format
			? /** @type {[string, string][]} */ config.merges
			: config /** @type {string[]} */.merges
					.map((x: string) => /** @type {[string, string]} */ x.split(' ', 2));
		this.bpe_ranks = new Map(this.merges.map((x, i) => [JSON.stringify(x), i]));

		this.end_of_word_suffix = config.end_of_word_suffix;

		// NOTE: `continuing_subword_suffix` is custom (to support `BlenderbotSmallTokenizer`)
		this.continuing_subword_suffix = config.continuing_subword_suffix ?? null;

		this.byte_fallback = this.config.byte_fallback ?? false;

		if (this.byte_fallback) {
			this.text_encoder = new TextEncoder();
		}

		this.ignore_merges = this.config.ignore_merges ?? false;

		/**
		 * The maximum length we should cache in a model.
		 * Strings that are too long have minimal chances to cache hit anyway
		 */
		this.max_length_to_cache = 256;

		/**
		 * The default capacity for a `BPE`'s internal cache.
		 */
		this.cache_capacity = 10000;
		this.cache = new LRUCache(this.cache_capacity);
	}

	/**
	 * Clears the cache.
	 */
	clear_cache() {
		this.cache.clear();
	}

	/**
	 * Apply Byte-Pair-Encoding (BPE) to a given token. Efficient heap-based priority
	 * queue implementation adapted from https://github.com/belladoreai/llama-tokenizer-js.
	 * @param {string} token The token to encode.
	 * @returns {string[]} The BPE encoded tokens.
	 */
	bpe(token: string) {
		if (token.length === 0) {
			return [];
		}

		const cached = this.cache.get(token);
		if (cached !== undefined) {
			return cached;
		}

		const word = Array.from(token);
		if (this.end_of_word_suffix) {
			word[word.length - 1] += this.end_of_word_suffix;
		}

		let result = [];
		if (word.length > 1) {
			// Create a priority queue to store the nodes that will be merged.
			// The comparator function compares the scores of the nodes.
			const queue = new PriorityQueue((a, b) => a.score < b.score);

			// Construct a doubly-linked list of nodes that will be inserted into the priority queue,
			// starting with the individual characters. We also populate each node with a positional
			// bias to break ties in the priority queue.
			let startingNode: BPENode = {
				token: word[0],
				bias: 0,
				prev: null,
				next: null,
			};

			let previousNode = startingNode;
			for (let i = 1; i < word.length; ++i) {
				const currentNode = {
					bias: i / word.length, // Add fractional component to break ties
					token: word[i],
					prev: previousNode,
					next: null,
				};
				previousNode.next = currentNode;
				this._add_node(queue, previousNode);
				previousNode = currentNode;
			}

			while (!queue.isEmpty()) {
				// Get the next node with the highest priority
				const node = queue.pop();

				// Check that this merge is still possible
				if (node.deleted || !node.next || node.next.deleted) continue;

				// Here, we mark the current node (left side of the merge) and the next node (right side of the merge) as deleted.
				// This is because they will both be replaced by a new node representing the merge result.
				node.deleted = true;
				node.next.deleted = true;

				// Next, we fix the node that comes before the current node (i.e., left side of the merge).
				if (node.prev) {
					// Make a shallow copy of the previous node
					const newPreviousNode = {...node.prev};

					// Mark the old previous node as deleted. This avoids erroneous merges later,
					// because there may still be references to this node in the priority queue.
					node.prev.deleted = true;
					node.prev = newPreviousNode;

					// Update the reference of the previous node, by pointing its previous node to this new previous node.
					if (newPreviousNode.prev) {
						newPreviousNode.prev.next = newPreviousNode;
					} else {
						// If the previous of the previous node does not exist, it means that
						// `newPreviousNode` must be the new `startingNode`.
						startingNode = newPreviousNode;
					}
				}

				// Create a new node which represents the result of the merge.
				const merged = {
					token: node.token + node.next.token,
					bias: node.bias,
					prev: node.prev,
					next: node.next.next,
				};

				// We now consider where we can add the new merged node to the priority queue:
				// 1. prev <-> merged
				if (merged.prev) {
					merged.prev.next = merged;
					this._add_node(queue, merged.prev);
				} else {
					// If `merged.prev` does not exist, then `merged` must be the new `startingNode`.
					startingNode = merged;
				}

				// 2. merged <-> next
				if (merged.next) {
					merged.next.prev = merged;
					this._add_node(queue, merged);
				}
			}

			// Traverse the linked list, starting from the `startingNode`, and collect the tokens.
			for (
				let currentNode: BPENode | null = startingNode;
				currentNode !== null;
				currentNode = currentNode.next
			) {
				result.push(currentNode.token);
			}
		} else {
			result = word;
		}

		// Possibly append suffix
		if (this.continuing_subword_suffix) {
			// Do not append suffix to the last token
			for (let i = 0; i < result.length - 1; ++i) {
				result[i] += this.continuing_subword_suffix;
			}
		}

		if (token.length < this.max_length_to_cache) {
			// Save the result to the cache
			this.cache.put(token, result);
		}

		return result;
	}

	/**
	 * Helper function to add a node to the priority queue.
	 * @param {PriorityQueue} queue
	 * @param {BPENode} node
	 * @private
	 */
	_add_node(queue: PriorityQueue, node: BPENode) {
		// `score` is a measure of the merge priority: lower means higher priority
		// We use the BPE rank as a measure of priority (i.e., the local of the merge in the merges list)
		// We also add a fractional component to the score to break ties (with the earlier character having higher priority)
		const rank = this.bpe_ranks.get(
			JSON.stringify([node.token, node.next!.token]),
		);
		if (rank !== undefined) {
			node.score = rank + node.bias;
			queue.push(node);
		}
	}

	/**
	 * Encodes the input sequence of tokens using the BPE algorithm and returns the resulting subword tokens.
	 * @param {string[]} tokens The input sequence of tokens to encode.
	 * @returns {string[]} The resulting subword tokens after applying the BPE algorithm to the input sequence of tokens.
	 */
	encode(tokens: string[]) {
		const outputTokens = [];

		for (const token of tokens) {
			if (this.ignore_merges && this.tokens_to_ids.has(token)) {
				outputTokens.push(token);
				continue;
			}

			const bpe_token_list = this.bpe(token);

			for (const t of bpe_token_list) {
				if (this.tokens_to_ids.has(t)) {
					outputTokens.push(t);
				} else if (this.byte_fallback) {
					const byteTokens = Array.from(this.text_encoder!.encode(t)).map(
						(x) => `<0x${x.toString(16).toUpperCase().padStart(2, '0')}>`,
					);
					if (byteTokens.every((x) => this.tokens_to_ids.has(x))) {
						// Ensure the byte tokens are actually in the vocabulary, otherwise
						// we fall back to the unknown token. For more information, see
						// https://github.com/huggingface/transformers/issues/28096.
						outputTokens.push(...byteTokens);
					} else {
						outputTokens.push(this.unk_token);
					}
				} else {
					outputTokens.push(this.unk_token);
				}
			}
		}

		return outputTokens;
	}
}

function objectToMap(obj: Record<string, number>) {
	return new Map(Object.entries(obj));
}
