import {useContext, useMemo} from 'react';
import type React from 'react';
import {PremountContext} from './PremountContext.js';
import {useCurrentFrame} from './use-current-frame.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {useVideoConfig} from './use-video-config.js';
import {ENABLE_V5_BREAKING_CHANGES} from './v5-flag.js';

export const usePremounting = ({
	from,
	durationInFrames,
	premountFor,
	postmountFor,
	style,
	styleWhilePremounted,
	styleWhilePostmounted,
	hideWhilePremounted,
}: {
	readonly from: number;
	readonly durationInFrames: number;
	readonly premountFor: number | null;
	readonly postmountFor: number | null;
	readonly style: React.CSSProperties | null;
	readonly styleWhilePremounted: React.CSSProperties | null;
	readonly styleWhilePostmounted: React.CSSProperties | null;
	readonly hideWhilePremounted: 'opacity' | 'display-none';
}) => {
	const parentPremountContext = useContext(PremountContext);
	const frame =
		useCurrentFrame() - parentPremountContext.premountFramesRemaining;
	const environment = useRemotionEnvironment();
	const {fps} = useVideoConfig();
	const effectivePremountFor = ENABLE_V5_BREAKING_CHANGES
		? (premountFor ?? fps)
		: (premountFor ?? 0);
	const effectivePostmountFor = postmountFor ?? 0;
	const endThreshold = Math.ceil(from + durationInFrames - 1);
	const premountingActive =
		!environment.isRendering &&
		frame < from &&
		frame >= from - effectivePremountFor;
	const postmountingActive =
		!environment.isRendering &&
		frame > endThreshold &&
		frame <= endThreshold + effectivePostmountFor;
	const isPremountingOrPostmounting = premountingActive || postmountingActive;
	const freezeFrame = premountingActive
		? from
		: postmountingActive
			? from + durationInFrames - 1
			: 0;

	const premountingStyle = useMemo((): React.CSSProperties | null => {
		if (!isPremountingOrPostmounting) {
			return style;
		}

		return {
			...style,
			...(hideWhilePremounted === 'opacity' ? {opacity: 0} : {display: 'none'}),
			pointerEvents: 'none',
			...(premountingActive ? styleWhilePremounted : {}),
			...(postmountingActive ? styleWhilePostmounted : {}),
		};
	}, [
		isPremountingOrPostmounting,
		hideWhilePremounted,
		postmountingActive,
		premountingActive,
		style,
		styleWhilePostmounted,
		styleWhilePremounted,
	]);

	return {
		effectivePremountFor,
		effectivePostmountFor,
		premountingActive,
		postmountingActive,
		isPremountingOrPostmounting,
		freezeFrame,
		premountingStyle,
	};
};
