import type {FeatureExtractor} from '@huggingface/transformers';
import {Processor} from './processor';

export class WhisperProcessor extends Processor {
	extractor: FeatureExtractor;

	constructor(feature_extractor: FeatureExtractor) {
		super(feature_extractor);
		this.extractor = feature_extractor;
	}

	async _call(audio: Float32Array | Float64Array) {
		return await this.extractor!(audio);
	}
}
