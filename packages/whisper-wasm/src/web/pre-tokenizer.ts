import {Callable} from './callable';

/**
 * A callable class representing a pre-tokenizer used in tokenization. Subclasses
 * should implement the `pre_tokenize_text` method to define the specific pre-tokenization logic.
 * @extends Callable
 */
export class PreTokenizer extends Callable {
	/**
	 * Method that should be implemented by subclasses to define the specific pre-tokenization logic.
	 *
	 * @abstract
	 * @param {string} text The text to pre-tokenize.
	 * @param {Object} [options] Additional options for the pre-tokenization logic.
	 * @returns {string[]} The pre-tokenized text.
	 * @throws {Error} If the method is not implemented in the subclass.
	 */
	pre_tokenize_text(_text: string, _options: any): string[] {
		throw Error('pre_tokenize_text should be implemented in subclass.');
	}

	/**
	 * Tokenizes the given text into pre-tokens.
	 * @param {string|string[]} text The text or array of texts to pre-tokenize.
	 * @param {Object} [options] Additional options for the pre-tokenization logic.
	 * @returns {string[]} An array of pre-tokens.
	 */
	pre_tokenize(text: string | string[], options: any) {
		return (
			Array.isArray(text)
				? text.map((x) => this.pre_tokenize_text(x, options))
				: this.pre_tokenize_text(text, options)
		).flat();
	}

	/**
	 * Alias for {@link PreTokenizer#pre_tokenize}.
	 * @param {string|string[]} text The text or array of texts to pre-tokenize.
	 * @param {Object} [options] Additional options for the pre-tokenization logic.
	 * @returns {string[]} An array of pre-tokens.
	 */
	_call(text: string | string[], options: any) {
		return this.pre_tokenize(text, options);
	}
}
