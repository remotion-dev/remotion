import {createContext} from 'react';
import type {SequenceNodePath} from '../SequenceManager.js';

/**
 * Provides the resolved `nodePath` of the JSX element whose
 * `_experimentalEffects` prop is being rendered. Used by
 * `useMemoizedEffects` to look up live drag overrides and
 * code values for individual effects when rendering inside
 * the Studio.
 */
export type EffectOverridesContextValue = {
	nodePath: SequenceNodePath | null;
};

export const EffectOverridesContext =
	createContext<EffectOverridesContextValue>({
		nodePath: null,
	});
