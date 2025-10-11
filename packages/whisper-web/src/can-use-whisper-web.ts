import type {WhisperWebModel} from './constants';
import {SIZES} from './constants';

export enum WhisperWebUnsupportedReason {
	WindowUndefined = 'window-undefined',
	IndexedDbUnavailable = 'indexed-db-unavailable',
	NavigatorStorageUnavailable = 'navigator-storage-unavailable',
	StorageEstimationApiUnavailable = 'storage-estimation-api-unavailable',
	QuotaUndefined = 'quota-undefined',
	UsageUndefined = 'usage-undefined',
	NotEnoughSpace = 'not-enough-space',
	ErrorEstimatingStorage = 'error-estimating-storage',
	NotCrossOriginIsolated = 'not-cross-origin-isolated',
}

export interface CanUseWhisperWebResult {
	supported: boolean;
	reason?: WhisperWebUnsupportedReason;
	detailedReason?: string;
}

export const canUseWhisperWeb = async (
	model: WhisperWebModel,
): Promise<CanUseWhisperWebResult> => {
	if (typeof window === 'undefined') {
		return {
			supported: false,
			reason: WhisperWebUnsupportedReason.WindowUndefined,
			detailedReason:
				'`window` is not defined. This module can only be used in a browser environment.',
		};
	}

	if (!window.crossOriginIsolated) {
		return {
			supported: false,
			reason: WhisperWebUnsupportedReason.NotCrossOriginIsolated,
			detailedReason:
				'The document is not cross-origin isolated (window.crossOriginIsolated = false). This prevents the usage of SharedArrayBuffer, which is required by `@remotion/whisper-web`. Make sure the document is served with the HTTP header `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`: https://remotion.dev/docs/miscellaneous/cross-origin-isolation',
		};
	}

	if (!window.indexedDB) {
		return {
			supported: false,
			reason: WhisperWebUnsupportedReason.IndexedDbUnavailable,
			detailedReason: 'IndexedDB is not available in this environment.',
		};
	}

	if (!navigator?.storage || !navigator?.storage.estimate) {
		return {
			supported: false,
			reason: WhisperWebUnsupportedReason.NavigatorStorageUnavailable,
			detailedReason:
				'`navigator.storage.estimate()` API is not available in this environment.',
		};
	}

	try {
		const estimate = await navigator.storage.estimate();

		if (estimate.quota === undefined) {
			return {
				supported: false,
				reason: WhisperWebUnsupportedReason.QuotaUndefined,
				detailedReason:
					'navigator.storage.estimate() API returned undefined quota.',
			};
		}

		if (estimate.usage === undefined) {
			return {
				supported: false,
				reason: WhisperWebUnsupportedReason.UsageUndefined,
				detailedReason:
					'navigator.storage.estimate() API returned undefined usage.',
			};
		}

		const remaining = estimate.quota - estimate.usage;
		const modelSize = SIZES[model];

		if (remaining < modelSize) {
			return {
				supported: false,
				reason: WhisperWebUnsupportedReason.NotEnoughSpace,
				detailedReason: `Not enough space to download the model. Required: ${modelSize} bytes, Available: ${remaining} bytes.`,
			};
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return {
			supported: false,
			reason: WhisperWebUnsupportedReason.ErrorEstimatingStorage,
			detailedReason: `Error estimating storage: ${errorMessage}`,
		};
	}

	return {
		supported: true,
	};
};
