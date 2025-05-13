import type {WhisperWebGpuModel} from './constants';
import {SIZES} from './constants';

export enum WhisperWebGpuUnsupportedReason {
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

export interface CanUseWhisperWebGpuResult {
	supported: boolean;
	reason?: WhisperWebGpuUnsupportedReason;
	detailedReason?: string;
}

export const canUseWhisperWebGpu = async (
	model: WhisperWebGpuModel,
): Promise<CanUseWhisperWebGpuResult> => {
	if (typeof window === 'undefined') {
		return {
			supported: false,
			reason: WhisperWebGpuUnsupportedReason.WindowUndefined,
			detailedReason:
				'`window` is not defined. This module can only be used in a browser environment.',
		};
	}

	if (!window.crossOriginIsolated) {
		return {
			supported: false,
			reason: WhisperWebGpuUnsupportedReason.NotCrossOriginIsolated,
			detailedReason:
				'The document is not cross-origin isolated (window.crossOriginIsolated = false). This prevents the usage of SharedArrayBuffer, which is required by `@remotion/whisper-webgpu`. Make sure the document is served with the HTTP header `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`: https://developer.mozilla.org/en-US/docs/Web/API/Window/crossOriginIsolated',
		};
	}

	if (!window.indexedDB) {
		return {
			supported: false,
			reason: WhisperWebGpuUnsupportedReason.IndexedDbUnavailable,
			detailedReason: 'IndexedDB is not available in this environment.',
		};
	}

	if (!navigator?.storage || !navigator?.storage.estimate) {
		return {
			supported: false,
			reason: WhisperWebGpuUnsupportedReason.NavigatorStorageUnavailable,
			detailedReason:
				'`navigator.storage.estimate()` API is not available in this environment.',
		};
	}

	try {
		const estimate = await navigator.storage.estimate();

		if (estimate.quota === undefined) {
			return {
				supported: false,
				reason: WhisperWebGpuUnsupportedReason.QuotaUndefined,
				detailedReason:
					'navigator.storage.estimate() API returned undefined quota.',
			};
		}

		if (estimate.usage === undefined) {
			return {
				supported: false,
				reason: WhisperWebGpuUnsupportedReason.UsageUndefined,
				detailedReason:
					'navigator.storage.estimate() API returned undefined usage.',
			};
		}

		const remaining = estimate.quota - estimate.usage;
		const modelSize = SIZES[model];

		if (remaining < modelSize) {
			return {
				supported: false,
				reason: WhisperWebGpuUnsupportedReason.NotEnoughSpace,
				detailedReason: `Not enough space to download the model. Required: ${modelSize} bytes, Available: ${remaining} bytes.`,
			};
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return {
			supported: false,
			reason: WhisperWebGpuUnsupportedReason.ErrorEstimatingStorage,
			detailedReason: `Error estimating storage: ${errorMessage}`,
		};
	}

	return {
		supported: true,
	};
};
