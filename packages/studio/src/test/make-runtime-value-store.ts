import type {RuntimeValueStore} from 'remotion';

export const makeRuntimeValueStore = (
	snapshot: Readonly<Record<string, unknown>>,
): RuntimeValueStore => ({
	getSnapshot: () => snapshot,
	subscribe: () => () => undefined,
});
