export interface CanUseWhisperWasmResult {
	supported: boolean;
	reasons: string[];
}

export const canUseWhisperWasm = (): CanUseWhisperWasmResult => {
	const reasons: string[] = [];

	if (typeof window === 'undefined') {
		reasons.push(
			'`window` is not defined. This module can only be used in a browser environment.',
		);
	}

	if (!window?.indexedDB) {
		reasons.push('IndexedDB is not available in this environment.');
	}

	if (!navigator?.storage || !navigator?.storage.estimate) {
		reasons.push(
			'`navigator.storage.estimate()` API is not available in this environment.',
		);
	}

	return {
		supported: reasons.length === 0,
		reasons,
	};
};
