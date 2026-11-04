import React, {useLayoutEffect, useMemo, useState} from 'react';
import type {EffectDefinitionAndStack} from './effect-types.js';
import type {EffectChainState} from './run-effect-chain.js';

type SourceListener = (source: CanvasImageSource | null) => void;
type EffectSourceIdentity = {sequenceKey: string; effectIndex: number};

const observers = new Map<string, Map<number, Set<SourceListener>>>();
const redrawListeners = new Map<string, Set<() => void>>();
const identities = new WeakMap<
	EffectDefinitionAndStack<unknown>,
	EffectSourceIdentity
>();
const inspectedChains = new WeakMap<
	EffectChainState,
	Map<string, EffectSourceIdentity>
>();
const sourceChainOwners = new Map<string, EffectChainState>();
const useIdentityCommitEffect = React.useInsertionEffect ?? useLayoutEffect;

/** Studio-only inspection. The source is borrowed and must be consumed synchronously. */
export const subscribeToEffectSource = ({
	sequenceKey,
	effectIndex,
	onSource,
}: {
	readonly sequenceKey: string;
	readonly effectIndex: number;
	readonly onSource: SourceListener;
}): (() => void) => {
	let sequence = observers.get(sequenceKey);
	if (!sequence) {
		sequence = new Map();
		observers.set(sequenceKey, sequence);
	}

	let listeners = sequence.get(effectIndex);
	if (!listeners) {
		listeners = new Set();
		sequence.set(effectIndex, listeners);
	}

	listeners.add(onSource);
	// Repaint once when the inspector opens, including while playback is paused.
	redrawListeners.get(sequenceKey)?.forEach((redraw) => redraw());
	return () => {
		listeners.delete(onSource);
		if (listeners.size === 0) {
			sequence.delete(effectIndex);
		}

		if (sequence.size === 0) {
			observers.delete(sequenceKey);
		}
	};
};

export const publishEffectSource = (
	effect: EffectDefinitionAndStack<unknown>,
	source: CanvasImageSource,
	chain: EffectChainState,
): void => {
	if (observers.size === 0) {
		return;
	}

	const identity = identities.get(effect);
	if (!identity) {
		return;
	}

	const listeners = observers
		.get(identity.sequenceKey)
		?.get(identity.effectIndex);
	if (!listeners || listeners.size === 0) {
		return;
	}

	let inspected = inspectedChains.get(chain);
	if (!inspected) {
		inspected = new Map();
		inspectedChains.set(chain, inspected);
	}

	const key = `${identity.sequenceKey}\0${identity.effectIndex}`;
	inspected.set(key, identity);
	sourceChainOwners.set(key, chain);
	listeners.forEach((listener) => {
		try {
			listener(source);
		} catch {
			// Optional inspector readback must never interrupt rendering.
		}
	});
};

export const invalidateEffectChainSources = (chain: EffectChainState): void => {
	const inspected = inspectedChains.get(chain);
	inspectedChains.delete(chain);
	inspected?.forEach((identity, key) => {
		// A replacement canvas may already have painted before the old canvas's
		// passive cleanup. Only the current owner can invalidate its histogram.
		if (sourceChainOwners.get(key) !== chain) {
			return;
		}

		sourceChainOwners.delete(key);
		observers
			.get(identity.sequenceKey)
			?.get(identity.effectIndex)
			?.forEach((listener) => {
				try {
					listener(null);
				} catch {
					// Optional inspection must not interfere with canvas cleanup.
				}
			});
	});
};

export const useEffectSourceInspection = (
	effects: EffectDefinitionAndStack<unknown>[],
	sequenceKey: string | null,
): EffectDefinitionAndStack<unknown>[] => {
	const [revision, setRevision] = useState(0);
	useLayoutEffect(() => {
		if (sequenceKey === null) {
			return;
		}

		let listeners = redrawListeners.get(sequenceKey);
		if (!listeners) {
			listeners = new Set();
			redrawListeners.set(sequenceKey, listeners);
		}

		const redraw = () => setRevision((previous) => previous + 1);
		listeners.add(redraw);
		if (observers.has(sequenceKey)) {
			redraw();
		}

		return () => {
			listeners.delete(redraw);
			if (listeners.size === 0) {
				redrawListeners.delete(sequenceKey);
				observers.get(sequenceKey)?.forEach((sourceListeners) => {
					sourceListeners.forEach((listener) => {
						try {
							listener(null);
						} catch {
							// An inspector must not interfere with source cleanup.
						}
					});
				});
			}
		};
	}, [sequenceKey]);
	useIdentityCommitEffect(() => {
		if (sequenceKey === null) {
			return;
		}

		effects.forEach((effect, effectIndex) => {
			identities.set(effect, {sequenceKey, effectIndex});
		});
		return () => {
			effects.forEach((effect) => identities.delete(effect));
		};
	}, [effects, sequenceKey]);

	// Source components already repaint when their effect array changes.
	return useMemo(() => {
		return sequenceKey === null || revision === 0 ? effects : effects.slice();
	}, [effects, revision, sequenceKey]);
};
