import {getNormalizedConfig} from './get-normalized-config';
import {whisperModelConfig} from './model-config';

/**
 * Base class for all configuration classes. For more information, see the corresponding
 * [Python documentation](https://huggingface.co/docs/transformers/main/en/main_classes/configuration#transformers.PretrainedConfig).
 */
export class PretrainedConfig {
	// NOTE: Typo in original

	/** @type {Record<string, unknown>} */
	normalized_config: Record<string, unknown> = {};

	/** @type {string|null} */
	model_type = null;

	/** @type {boolean} */
	is_encoder_decoder = false;

	/** @type {number} */
	max_position_embeddings: number | null = null;

	/** @type {TransformersJSConfig} */
	'transformers.js_config': Record<string, unknown> | null = null;

	/**
	 * Create a new PreTrainedTokenizer instance.
	 * @param {Object} configJSON The JSON of the config.
	 */
	constructor(configJSON: Record<string, unknown>) {
		Object.assign(this, configJSON);
		this.normalized_config = getNormalizedConfig(this);
	}

	/**
	 * Loads a pre-trained config from the given `pretrained_model_name_or_path`.
	 *
	 * @param {string} pretrained_model_name_or_path The path to the pre-trained config.
	 * @param {PretrainedOptions} options Additional options for loading the config.
	 * @throws {Error} Throws an error if the config.json is not found in the `pretrained_model_name_or_path`.
	 *
	 * @returns {Promise<PretrainedConfig>} A new instance of the `PretrainedConfig` class.
	 */
	static async from_pretrained(
		_pretrained_model_name_or_path: string,
		{}: {} = {},
	) {
		const data = whisperModelConfig;
		return new this(data);
	}
}

/**
 * Helper class which is used to instantiate pretrained configs with the `from_pretrained` function.
 *
 * @example
 * const config = await AutoConfig.from_pretrained('Xenova/bert-base-uncased');
 */
export class AutoConfig {
	/** @type {typeof PretrainedConfig.from_pretrained} */
	static async from_pretrained(...args: any[]) {
		// @ts-expect-error
		return PretrainedConfig.from_pretrained(...args);
	}
}
