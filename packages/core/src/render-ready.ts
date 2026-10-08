import type {DelayRenderScope} from './delay-render.js';

export const RENDER_READY_EVENT = 'remotion-render-ready';

const listeners = new WeakMap<DelayRenderScope, Set<() => void>>();

export const subscribeToRenderReady = (
	scope: DelayRenderScope,
	listener: () => void,
) => {
	let scopedListeners = listeners.get(scope);
	if (!scopedListeners) {
		scopedListeners = new Set();
		listeners.set(scope, scopedListeners);
	}

	scopedListeners.add(listener);
	return () => {
		scopedListeners.delete(listener);
	};
};

export const notifyRenderReady = (scope: DelayRenderScope) => {
	listeners.get(scope)?.forEach((listener) => listener());
	if (typeof window !== 'undefined' && scope === window) {
		window.dispatchEvent(new Event(RENDER_READY_EVENT));
	}
};
