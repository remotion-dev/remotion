import {pick} from './whisper-generation-config';

/**
 *
 * @param {PretrainedConfig} config
 * @returns {Object} The normalized configuration.
 */
export function getNormalizedConfig(config: any) {
	const mapping: Record<string, string> = {};

	const init_normalized_config = {};
	switch (config.model_type) {
		case 'whisper':
			mapping.num_decoder_layers = 'decoder_layers';
			mapping.num_decoder_heads = 'decoder_attention_heads';
			mapping.decoder_hidden_size = 'd_model';
			mapping.num_encoder_layers = 'encoder_layers';
			mapping.num_encoder_heads = 'encoder_attention_heads';
			mapping.encoder_hidden_size = 'd_model';
			break;
		default:
			throw new Error(`Unsupported model type: ${config.model_type}`);
	}

	// NOTE: If `num_attention_heads` is not set, it is assumed to be equal to `num_heads`
	const normalized_config = {
		...init_normalized_config,
		...pick(config, ['model_type', 'multi_query', 'is_encoder_decoder']),
	};
	for (const key in mapping) {
		normalized_config[key] = config[mapping[key]];
	}

	return normalized_config;
}
