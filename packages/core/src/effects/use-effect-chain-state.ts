import {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {validateDimension} from '../validation/validate-dimensions.js';
import type {EffectCanvasGeometry} from './effect-canvas-geometries.js';
import type {EffectsOutputSize} from './effect-types.js';
import {
	PreferredEffectBackendContext,
	validatePreferredEffectBackend,
} from './preferred-effect-backend.js';
import type {EffectChainState} from './run-effect-chain.js';
import {
	cleanupEffectChainState,
	createEffectChainState,
} from './run-effect-chain.js';

export const useEffectChainState = (
	effectsOutputSize: EffectsOutputSize | null = null,
	geometry: EffectCanvasGeometry | null = null,
): {
	recoveryRevision: number;
	get: (width: number, height: number) => EffectChainState | null;
} => {
	const preferredEffectBackend = validatePreferredEffectBackend(
		useContext(PreferredEffectBackendContext) ??
			(typeof window === 'undefined'
				? 'auto'
				: (window.remotion_preferredEffectBackend ?? 'auto')),
	);
	const effectWidth = effectsOutputSize?.width;
	const effectHeight = effectsOutputSize?.height;
	if (effectsOutputSize) {
		validateDimension(
			effectWidth,
			'effectsOutputSize.width',
			'on an effect-capable component',
		);
		validateDimension(
			effectHeight,
			'effectsOutputSize.height',
			'on an effect-capable component',
		);
	}

	const chainStateRef = useRef<EffectChainState | null>(null);
	const unmountedRef = useRef(false);
	const [recoveryRevision, setRecoveryRevision] = useState(0);

	useEffect(() => {
		// StrictMode and Fast Refresh run the cleanup below and then this effect
		// again, after which `get()` must hand out a fresh state.
		unmountedRef.current = false;

		return () => {
			unmountedRef.current = true;
			if (chainStateRef.current) {
				cleanupEffectChainState(chainStateRef.current);
				chainStateRef.current = null;
			}
		};
	}, []);

	return useMemo(
		() => ({
			recoveryRevision,
			get: (width, height) => {
				width = geometry?.width ?? effectWidth ?? width;
				height = geometry?.height ?? effectHeight ?? height;
				// Async work such as a late decoded video frame can still get here
				// after unmount. Nothing would release a pool created at this point.
				if (unmountedRef.current) {
					return null;
				}

				const state = chainStateRef.current;
				const rect = geometry?.contentRect ?? null;
				if (
					!state ||
					state.width !== width ||
					state.height !== height ||
					state.contentRect.x !== (rect?.x ?? 0) ||
					state.contentRect.y !== (rect?.y ?? 0) ||
					state.contentRect.width !== (rect?.width ?? width) ||
					state.contentRect.height !== (rect?.height ?? height) ||
					state.preferredEffectBackend !== preferredEffectBackend
				) {
					if (state) {
						cleanupEffectChainState(state);
					}

					chainStateRef.current = createEffectChainState(width, height, rect);
					chainStateRef.current.requestRedraw = () => {
						if (!unmountedRef.current)
							setRecoveryRevision((revision) => revision + 1);
					};

					chainStateRef.current.preferredEffectBackend = preferredEffectBackend;
				}

				return chainStateRef.current;
			},
		}),
		[
			effectWidth,
			effectHeight,
			preferredEffectBackend,
			recoveryRevision,
			geometry,
		],
	);
};
