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

	useEffect(() => {
		return () => {
			if (chainStateRef.current) {
				cleanupEffectChainState(chainStateRef.current);
			}
		};
	}, []);

	return useMemo(
		() => ({
			get: (width, height) => {
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
