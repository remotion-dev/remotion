import type {WhisperModel} from './constants';
import {MODELS, SIZES} from './constants';

export interface CanDownloadModelResult {
	canDownload: boolean;
	reason?: string;
}

export const canDownloadModel = async (
	model: WhisperModel,
): Promise<CanDownloadModelResult> => {
	if (typeof window === 'undefined' || !window.navigator?.storage?.estimate) {
		return {
			canDownload: false,
			reason: 'Storage estimation API is not available in this environment.',
		};
	}

	if (!model || !MODELS.includes(model)) {
		return {
			canDownload: false,
			reason: `Invalid model name. Supported models: ${MODELS.join(', ')}.`,
		};
	}

	try {
		const estimate = await navigator.storage.estimate();

		if (estimate.quota === undefined) {
			return {
				canDownload: false,
				reason: 'navigator.storage.estimate() API returned undefined quota.',
			};
		}

		if (estimate.usage === undefined) {
			return {
				canDownload: false,
				reason: 'navigator.storage.estimate() API returned undefined usage.',
			};
		}

		const remaining = estimate.quota - estimate.usage;
		const modelSize = SIZES[model];

		if (remaining < modelSize) {
			return {
				canDownload: false,
				reason: `Not enough space to download the model. Required: ${modelSize} bytes, Available: ${remaining} bytes.`,
			};
		}

		return {canDownload: true};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return {
			canDownload: false,
			reason: `Error estimating storage: ${errorMessage}`,
		};
	}
};
