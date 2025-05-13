/**
 *
 * @param {PretrainedConfig} config
 * @returns {Record<string, number[]>}
 */
export function getKeyValueShapes(
	config: any,
	{prefix = 'past_key_values', batch_size = 1} = {},
) {
	/** @type {Record<string, number[]>} */
	const decoderFeeds: Record<string, number[]> = {};
	const {normalized_config} = config;

	if (
		normalized_config.is_encoder_decoder &&
		'num_encoder_heads' in normalized_config &&
		'num_decoder_heads' in normalized_config
	) {
		const encoder_dim_kv =
			normalized_config.encoder_dim_kv ??
			normalized_config.encoder_hidden_size /
				normalized_config.num_encoder_heads;
		const decoder_dim_kv =
			normalized_config.decoder_dim_kv ??
			normalized_config.decoder_hidden_size /
				normalized_config.num_decoder_heads;

		const encoder_dims = [
			batch_size,
			normalized_config.num_encoder_heads,
			0,
			encoder_dim_kv,
		];
		const decoder_dims = [
			batch_size,
			normalized_config.num_decoder_heads,
			0,
			decoder_dim_kv,
		];
		for (let i = 0; i < normalized_config.num_decoder_layers; ++i) {
			decoderFeeds[`${prefix}.${i}.encoder.key`] = encoder_dims;
			decoderFeeds[`${prefix}.${i}.encoder.value`] = encoder_dims;
			decoderFeeds[`${prefix}.${i}.decoder.key`] = decoder_dims;
			decoderFeeds[`${prefix}.${i}.decoder.value`] = decoder_dims;
		}
	} else {
		// Decoders
		const {num_heads} = normalized_config;
		const {num_layers} = normalized_config;
		const dim_kv =
			normalized_config.dim_kv ??
			normalized_config.hidden_size /
				(normalized_config.num_attention_heads ?? num_heads);

		if (normalized_config.model_type === 'falcon') {
			// NOTE: Custom implementation for Falcon
			const dims = [batch_size * num_heads, 0, dim_kv];
			for (let i = 0; i < num_layers; ++i) {
				decoderFeeds[`${prefix}.${i}.key`] = dims;
				decoderFeeds[`${prefix}.${i}.value`] = dims;
			}
		} else if (normalized_config.multi_query) {
			// e.g., for `gpt_bigcode`
			const dims = [batch_size * num_heads, 0, 2 * dim_kv];

			for (let i = 0; i < num_layers; ++i) {
				decoderFeeds[`${prefix}.${i}.key_value`] = dims;
			}
		} else if (normalized_config.model_type === 'bloom') {
			// NOTE: Custom implementation for Bloom

			const keyDims = [batch_size * num_heads, dim_kv, 0]; // [batch_size x num_heads,64,past_sequence_length]
			const valueDims = [batch_size * num_heads, 0, dim_kv]; // [batch_size x num_heads,past_sequence_length,64]
			for (let i = 0; i < num_layers; ++i) {
				decoderFeeds[`${prefix}.${i}.key`] = keyDims;
				decoderFeeds[`${prefix}.${i}.value`] = valueDims;
			}
		} else if (normalized_config.model_type === 'openelm') {
			for (let i = 0; i < num_layers; ++i) {
				const dims = [batch_size, num_heads[i], 0, dim_kv];

				decoderFeeds[`${prefix}.${i}.key`] = dims;
				decoderFeeds[`${prefix}.${i}.value`] = dims;
			}
		} else {
			// Decoder-only
			const dims = [batch_size, num_heads, 0, dim_kv];
			for (let i = 0; i < num_layers; ++i) {
				decoderFeeds[`${prefix}.${i}.key`] = dims;
				decoderFeeds[`${prefix}.${i}.value`] = dims;
			}
		}
	}

	return decoderFeeds;
}
