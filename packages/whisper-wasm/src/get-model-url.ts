import type {WhisperModel} from './constants';

export const getModelUrl = (model: WhisperModel) => {
	return `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${model}.bin`;
};
