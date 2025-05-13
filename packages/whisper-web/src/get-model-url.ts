import type {WhisperWebModel} from './constants';

export const getModelUrl = (model: WhisperWebModel) => {
	return `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${model}.bin`;
};

export const sizes = {
	tiny: 74_000_000,
	base: 244_000_000,
	small: 769_000_000,
	medium: 1550_000_000,
	large: 3050_000_000,
};
