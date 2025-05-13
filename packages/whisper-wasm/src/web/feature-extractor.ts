import {Callable} from './callable';

/**
 * Base class for feature extractors.
 */
export class FeatureExtractor extends Callable {
	/**
	 * Constructs a new FeatureExtractor instance.
	 *
	 * @param {Object} config The configuration for the feature extractor.
	 */
	config: any;
	constructor(config: any) {
		super();
		this.config = config;
	}

	/**
	 * Instantiate one of the feature extractor classes of the library from a pretrained model.
	 *
	 * The feature extractor class to instantiate is selected based on the `feature_extractor_type` property of
	 * the config object (either passed as an argument or loaded from `pretrained_model_name_or_path` if possible)
	 *
	 * @param {string} pretrained_model_name_or_path The name or path of the pretrained model. Can be either:
	 * - A string, the *model id* of a pretrained feature_extractor hosted inside a model repo on huggingface.co.
	 *   Valid model ids can be located at the root-level, like `bert-base-uncased`, or namespaced under a
	 *   user or organization name, like `dbmdz/bert-base-german-cased`.
	 * - A path to a *directory* containing feature_extractor files, e.g., `./my_model_directory/`.
	 * @param {import('../utils/hub.js').PretrainedOptions} options Additional options for loading the feature_extractor.
	 *
	 * @returns {Promise<FeatureExtractor>} A new instance of the Feature Extractor class.
	 */
	static async from_pretrained() {
		throw new Error('Not implemented');
	}
}
