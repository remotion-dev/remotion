import {useEffect, useMemo, useRef} from 'react';
import type {EffectChainState} from './run-effect-chain.js';
import {
	cleanupEffectChainState,
	createEffectChainState,
} from './run-effect-chain.js';

export const useEffectChainState = (): {
	get: (width: number, height: number) => EffectChainState | null;
} => {
	const chainStateRef = useRef<EffectChainState | null>(null);
	const sizeRef = useRef<{width: number; height: number} | null>(null);
	const unmountedRef = useRef(false);

	useEffect(() => {
		// StrictMode and Fast Refresh run the cleanup below and then this effect
		// again, after which `get()` must hand out a fresh state.
		unmountedRef.current = false;

		return () => {
			unmountedRef.current = true;
			if (chainStateRef.current) {
				cleanupEffectChainState(chainStateRef.current);
				chainStateRef.current = null;
				sizeRef.current = null;
			}
		};
	}, []);

	return useMemo(
		() => ({
			get: (width, height) => {
				// Async work such as a late decoded video frame can still get here
				// after unmount. Nothing would release a pool created at this point.
				if (unmountedRef.current) {
					return null;
				}

				if (
					!sizeRef.current ||
					sizeRef.current.width !== width ||
					sizeRef.current.height !== height
				) {
					if (chainStateRef.current) {
						cleanupEffectChainState(chainStateRef.current);
					}

					chainStateRef.current = createEffectChainState(width, height);
					sizeRef.current = {width, height};
				}

				return chainStateRef.current;
			},
		}),
		[],
	);
};
