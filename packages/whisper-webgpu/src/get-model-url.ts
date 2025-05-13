import type {WhisperWebGpuModel} from './constants';

export const getModelUrl = (model: WhisperWebGpuModel) => {
	return `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${model}.bin`;
};

export const sizes = {
	tiny: 74_000_000,
	base: 244_000_000,
	small: 769_000_000,
	medium: 1550_000_000,
	large: 3050_000_000,
};
