import {Callable} from './callable';
import type {FeatureExtractor} from './feature-extractor';

export class Processor extends Callable {
	feature_extractor: FeatureExtractor;

	/**
	 * Creates a new Processor with the given feature extractor.
	 * @param {FeatureExtractor} feature_extractor The function used to extract features from the input.
	 */
	constructor(feature_extractor: FeatureExtractor) {
		super();
		this.feature_extractor = feature_extractor;
		// TODO use tokenizer here?
	}

	/**
	 * Calls the feature_extractor function with the given input.
	 * @param {any} input The input to extract features from.
	 * @param {...any} args Additional arguments.
	 * @returns {Promise<any>} A Promise that resolves with the extracted features.
	 */
	async _call(input: any, ...args: any[]): Promise<any> {
		return await this.feature_extractor._call(input, ...args);
	}
}
