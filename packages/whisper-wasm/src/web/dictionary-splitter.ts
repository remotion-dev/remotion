/**
 * A data structure which uses a trie to split a string into tokens based on a dictionary.
 * It can also use a regular expression to preprocess the input text before splitting.
 *
 * NOTE: To ensure multi-byte characters are handled correctly, we operate at byte-level instead of character-level.
 */
export class DictionarySplitter {
	/**
	 * @param {string[]} dictionary The dictionary of words to use for splitting.
	 */
	trie: Record<string, any>;
	constructor(dictionary: string[]) {
		this.trie = this._buildTrie(dictionary);
	}

	/**
	 * Builds a trie from the given dictionary.
	 * @param {string[]} dictionary The dictionary of words to build the trie from.
	 * @returns {Object} The root node of the trie.
	 * @private
	 */
	_buildTrie(dictionary: string[]) {
		const trie = Object.create(null);
		for (const word of dictionary) {
			let node = trie;
			for (let i = 0; i < word.length; ++i) {
				// eslint-disable-next-line no-multi-assign
				node = node[word[i]] ??= Object.create(null);
			}

			node.end = word;
		}

		return trie;
	}

	/**
	 * Splits the input text into tokens based on the dictionary.
	 * @param {string} text The input text to split.
	 * @returns {string[]} An array of tokens.
	 */
	split(text: string) {
		const result = [];
		const n = text.length;
		let start = 0;
		let i = 0;

		while (i < n) {
			let node = this.trie;
			let match = null;
			let j = i;

			while (j < n && (node = node[text[j]])) {
				if (node.end) {
					// Always keep the last (i.e., longest) match.
					match = node.end;
				}

				++j;
			}

			if (match) {
				if (i > start) {
					result.push(text.slice(start, i));
				}

				result.push(match);
				i += match.length;
				start = i;
			} else {
				++i;
			}
		}

		if (start < n) {
			result.push(text.slice(start));
		}

		return result;
	}
}
