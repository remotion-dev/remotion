import {whisperProcessorConfig} from './whisper-config';
import {WhisperFeatureExtractor} from './whisper-feature-extractor';
import {WhisperProcessor} from './whisper-processor';

export class AutoProcessor {
	static async from_pretrained() {
		// Instantiate processor and feature extractor
		const feature_extractor = new WhisperFeatureExtractor(
			whisperProcessorConfig,
		);
		return new WhisperProcessor(feature_extractor);
	}
}
