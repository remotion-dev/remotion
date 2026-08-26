import type {ResolvedWhisperWebGpuBackend} from './backend';

export const WHISPER_WEBGPU_MODELS = [
	'tiny',
	'tiny.en',
	'base',
	'base.en',
	'small',
	'small.en',
	'medium',
	'medium.en',
	'large-v3-turbo',
] as const;

export type WhisperWebGpuModel = (typeof WHISPER_WEBGPU_MODELS)[number];

export type WhisperWebGpuModelInfo = {
	name: WhisperWebGpuModel;
	modelId: string;
	parameters: number;
	multilingual: boolean;
	webGpuDownloadSize: number;
	wasmDownloadSize: number;
};

const MODEL_INFO: Record<WhisperWebGpuModel, WhisperWebGpuModelInfo> = {
	tiny: {
		name: 'tiny',
		modelId: 'onnx-community/whisper-tiny_timestamped',
		parameters: 39_000_000,
		multilingual: true,
		webGpuDownloadSize: 119_699_015,
		wasmDownloadSize: 40_827_373,
	},
	'tiny.en': {
		name: 'tiny.en',
		modelId: 'onnx-community/whisper-tiny.en_timestamped',
		parameters: 39_000_000,
		multilingual: false,
		webGpuDownloadSize: 119_697_479,
		wasmDownloadSize: 40_826_993,
	},
	base: {
		name: 'base',
		modelId: 'onnx-community/whisper-base_timestamped',
		parameters: 74_000_000,
		multilingual: true,
		webGpuDownloadSize: 206_190_057,
		wasmDownloadSize: 76_871_875,
	},
	'base.en': {
		name: 'base.en',
		modelId: 'onnx-community/whisper-base.en_timestamped',
		parameters: 74_000_000,
		multilingual: false,
		webGpuDownloadSize: 206_188_009,
		wasmDownloadSize: 76_871_369,
	},
	small: {
		name: 'small',
		modelId: 'onnx-community/whisper-small_timestamped',
		parameters: 244_000_000,
		multilingual: true,
		webGpuDownloadSize: 586_213_010,
		wasmDownloadSize: 249_036_248,
	},
	'small.en': {
		name: 'small.en',
		modelId: 'onnx-community/whisper-small.en_timestamped',
		parameters: 244_000_000,
		multilingual: false,
		webGpuDownloadSize: 586_209_938,
		wasmDownloadSize: 249_035_489,
	},
	medium: {
		name: 'medium',
		modelId: 'onnx-community/whisper-medium_timestamped',
		parameters: 769_000_000,
		multilingual: true,
		webGpuDownloadSize: 1_698_508_143,
		wasmDownloadSize: 985_716_093,
	},
	'medium.en': {
		name: 'medium.en',
		modelId: 'onnx-community/whisper-medium.en_timestamped',
		parameters: 769_000_000,
		multilingual: false,
		webGpuDownloadSize: 1_698_504_047,
		wasmDownloadSize: 985_710_974,
	},
	'large-v3-turbo': {
		name: 'large-v3-turbo',
		modelId: 'onnx-community/whisper-large-v3-turbo_timestamped',
		parameters: 809_000_000,
		multilingual: true,
		webGpuDownloadSize: 2_882_584_170,
		wasmDownloadSize: 1_084_880_793,
	},
};

export const getAvailableModels = (): WhisperWebGpuModelInfo[] => {
	return WHISPER_WEBGPU_MODELS.map((model) => ({...MODEL_INFO[model]}));
};

export const getModelInfo = (
	model: WhisperWebGpuModel,
): WhisperWebGpuModelInfo => {
	return MODEL_INFO[model];
};

export const getWhisperModelDtype = (backend: ResolvedWhisperWebGpuBackend) => {
	return backend === 'webgpu'
		? ({encoder_model: 'fp32', decoder_model_merged: 'q4'} as const)
		: ('q8' as const);
};
