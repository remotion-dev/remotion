import {src} from './source';

// Registering the same module URL twice on one AudioContext rejects, so the
// registration promise is memoized per context (mirrors packages/gif's worker
// module loader).
const registered = new WeakMap<BaseAudioContext, Promise<void>>();

export const ensurePitchWorkletModule = (
	audioContext: BaseAudioContext,
): Promise<void> => {
	const existing = registered.get(audioContext);
	if (existing) {
		return existing;
	}

	const promise = (async () => {
		const blob = new Blob([src], {type: 'application/javascript'});
		const url = URL.createObjectURL(blob);
		try {
			await audioContext.audioWorklet.addModule(url);
		} finally {
			URL.revokeObjectURL(url);
		}
	})();

	registered.set(audioContext, promise);
	return promise;
};
