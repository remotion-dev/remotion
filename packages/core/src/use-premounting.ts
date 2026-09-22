import {useContext, useMemo} from 'react';
import type React from 'react';
import {getSequenceBoundaryTolerance} from './get-sequence-boundary-tolerance.js';
import {PremountContext} from './PremountContext.js';
import {SequenceContext} from './SequenceContext.js';
import {useTimelinePosition} from './timeline-position-state.js';
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
	const endExclusive = from + durationInFrames;
	const sequenceContext = useContext(SequenceContext);
	const boundaryTolerance = getSequenceBoundaryTolerance({
		absoluteFrame: useTimelinePosition(),
		cumulatedFrom: sequenceContext
			? sequenceContext.cumulatedFrom + sequenceContext.relativeFrom
			: 0,
		from,
		parentPlaybackRate: sequenceContext?.playbackRate ?? 1,
		durationInFrames,
	});
	const premountingActive =
		!environment.isRendering &&
		frame - from < -boundaryTolerance &&
		frame - (from - effectivePremountFor) >= -boundaryTolerance;
	const postmountingActive =
		!environment.isRendering &&
		frame - endExclusive >= -boundaryTolerance &&
		frame - (endExclusive + effectivePostmountFor) < -boundaryTolerance;
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
