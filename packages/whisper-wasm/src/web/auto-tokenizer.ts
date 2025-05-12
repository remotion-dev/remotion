import {WhisperTokenizer} from '@huggingface/transformers';
import {tokenizerConfig} from './tokenizer-config';
import tokenizerJSON from './tokenizer.json';

export class AutoTokenizer {
	static async from_pretrained() {
		return new WhisperTokenizer(tokenizerJSON, tokenizerConfig);
	}
}
