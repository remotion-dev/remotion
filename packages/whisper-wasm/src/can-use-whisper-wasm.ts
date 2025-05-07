import type {WhisperWasmModel} from './constants';
import {MODELS, SIZES} from './constants';

export enum WhisperWasmUnsupportedReason {
	WindowUndefined = 'window-undefined',
	IndexedDbUnavailable = 'indexed-db-unavailable',
	NavigatorStorageUnavailable = 'navigator-storage-unavailable',
	StorageEstimationApiUnavailable = 'storage-estimation-api-unavailable',
	InvalidModelName = 'invalid-model-name',
	QuotaUndefined = 'quota-undefined',
	UsageUndefined = 'usage-undefined',
	NotEnoughSpace = 'not-enough-space',
	ErrorEstimatingStorage = 'error-estimating-storage',
}

export interface CanUseWhisperWasmResult {
	supported: boolean;
	reason?: WhisperWasmUnsupportedReason;
	detailedReason?: string;
}

export const canUseWhisperWasm = async (
	model: WhisperWasmModel,
): Promise<CanUseWhisperWasmResult> => {
	if (typeof window === 'undefined') {
		return {
			supported: false,
			reason: WhisperWasmUnsupportedReason.WindowUndefined,
			detailedReason:
				'`window` is not defined. This module can only be used in a browser environment.',
		};
	}

	if (!window.indexedDB) {
		return {
			supported: false,
			reason: WhisperWasmUnsupportedReason.IndexedDbUnavailable,
			detailedReason: 'IndexedDB is not available in this environment.',
		};
	}

	if (!navigator?.storage || !navigator?.storage.estimate) {
		return {
			supported: false,
			reason: WhisperWasmUnsupportedReason.NavigatorStorageUnavailable,
			detailedReason:
				'`navigator.storage.estimate()` API is not available in this environment.',
		};
	}

	if (!model || !MODELS.includes(model)) {
		return {
			supported: false,
			reason: WhisperWasmUnsupportedReason.InvalidModelName,
			detailedReason: `Invalid model name. Supported models: ${MODELS.join(
				', ',
			)}.`,
		};
	}

	try {
		const estimate = await navigator.storage.estimate();

		if (estimate.quota === undefined) {
			return {
				supported: false,
				reason: WhisperWasmUnsupportedReason.QuotaUndefined,
				detailedReason:
					'navigator.storage.estimate() API returned undefined quota.',
			};
		}

		if (estimate.usage === undefined) {
			return {
				supported: false,
				reason: WhisperWasmUnsupportedReason.UsageUndefined,
				detailedReason:
					'navigator.storage.estimate() API returned undefined usage.',
			};
		}

		const remaining = estimate.quota - estimate.usage;
		const modelSize = SIZES[model];

		if (remaining < modelSize) {
			return {
				supported: false,
				reason: WhisperWasmUnsupportedReason.NotEnoughSpace,
				detailedReason: `Not enough space to download the model. Required: ${modelSize} bytes, Available: ${remaining} bytes.`,
			};
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return {
			supported: false,
			reason: WhisperWasmUnsupportedReason.ErrorEstimatingStorage,
			detailedReason: `Error estimating storage: ${errorMessage}`,
		};
	}

	return {
		supported: true,
	};
};
