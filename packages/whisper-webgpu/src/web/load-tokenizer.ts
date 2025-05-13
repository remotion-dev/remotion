import {tokenizerConfig} from './tokenizer-config';
import tokenizer from './tokenizer.json';

/**
 * Loads a tokenizer from the specified path.
 * @param {string} pretrained_model_name_or_path The path to the tokenizer directory.
 * @param {PretrainedTokenizerOptions} options Additional options for loading the tokenizer.
 * @returns {Promise<any[]>} A promise that resolves with information about the loaded tokenizer.
 */
export async function loadTokenizer() {
	const info = await Promise.all([tokenizer, tokenizerConfig]);

	return info;
}
