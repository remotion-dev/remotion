import {tokenizerConfig} from './tokenizer-config';
import tokenizerJSON from './tokenizer.json';
import {WhisperTokenizer} from './whisper-tokenizer';

export class AutoTokenizer {
	static async from_pretrained() {
		return new WhisperTokenizer(tokenizerJSON, tokenizerConfig);
	}
}
