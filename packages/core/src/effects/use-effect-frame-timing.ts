import {useMemo} from 'react';
import {useCurrentFrameWithOptionalSubscription} from '../use-current-frame.js';
import {useVideoConfig} from '../use-video-config.js';
import type {
	EffectDefinitionAndStack,
	EffectFrameTiming,
} from './effect-types.js';

export const useEffectFrameTiming = (
	effects: EffectDefinitionAndStack<unknown>[],
): EffectFrameTiming => {
	const temporal = effects.some(
		(effect) =>
			!(effect.params as {disabled?: boolean}).disabled &&
			effect.definition.frameDependent?.(effect.params),
	);
	const frame = useCurrentFrameWithOptionalSubscription(temporal);
	const {fps} = useVideoConfig();
	return useMemo(
		() => Object.freeze({timestampInSeconds: frame / fps, fps}),
		[frame, fps],
	);
};
