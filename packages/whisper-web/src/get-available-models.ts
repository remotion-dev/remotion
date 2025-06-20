import {MODELS, SIZES, type WhisperWebModel} from './constants';

export type AvailableModel = {
	name: WhisperWebModel;
	downloadSize: number;
};

/**
 * Returns an array of all available Whisper models with their download sizes.
 * @returns An array of objects containing model name and download size in bytes
 */
export const getAvailableModels = (): AvailableModel[] => {
	return MODELS.map((model) => ({
		name: model,
		downloadSize: SIZES[model],
	}));
};
