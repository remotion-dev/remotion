// For tiny
// https://huggingface.co/Xenova/whisper-tiny.en/blob/main/preprocessor_config.json

export const whisperProcessorConfig = {
	chunk_length: 30,
	feature_extractor_type: 'WhisperFeatureExtractor',
	feature_size: 80,
	hop_length: 160,
	n_fft: 400,
	n_samples: 480000,
	nb_max_frames: 3000,
	padding_side: 'right',
	padding_value: 0.0,
	processor_class: 'WhisperProcessor',
	return_attention_mask: false,
	sampling_rate: 16000,
} as const;

export type WhisperProcessorConfig = typeof whisperProcessorConfig;
