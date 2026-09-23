import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {
	Html5MediaTrimContext,
	useMediaStartsAt,
	type LoopVolumeCurveBehavior,
} from './audio/use-audio-frame.js';
import type {LoopDisplay, TSequence} from './CompositionManager.js';
import {getAssetDisplayName} from './get-asset-file-name.js';
import {getTimelineDuration} from './get-timeline-duration.js';
import {Loop, LoopTimelineContext} from './loop/index.js';
import {SequenceContext} from './SequenceContext.js';
import {SequenceRegistrationContext} from './SequenceManager.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {useSequenceRegistration} from './use-sequence-registration.js';
import {useVideoConfig} from './use-video-config.js';
import type {VolumeProp} from './volume-prop.js';
import {evaluateVolume} from './volume-prop.js';

const didWarn: {[key: string]: boolean} = {};
const warnOnce = (message: string) => {
	if (didWarn[message]) {
		return;
	}

	// eslint-disable-next-line no-console
	console.warn(message);
	didWarn[message] = true;
};

export const useBasicMediaInTimeline = ({
	volume,
	mediaVolume,
	mediaType,
	src,
	displayName,
	trimBefore,
	trimAfter,
	playbackRate,
	sequenceDurationInFrames,
	mediaStartsAt,
	mediaFrom,
	loop,
	muted,
}: {
	volume: VolumeProp | undefined;
	mediaVolume: number;
	mediaType: 'audio' | 'video' | 'image';
	src: string | undefined;
	displayName: string | null;
	trimBefore: number | undefined;
	trimAfter: number | undefined;
	playbackRate: number;
	sequenceDurationInFrames: number;
	mediaStartsAt: number;
	mediaFrom: number;
	loop: boolean;
	muted: boolean;
}) => {
	if (!src) {
		throw new Error('No src passed');
	}

	const parentSequence = useContext(SequenceContext);
	const sequencePlaybackRate = parentSequence?.playbackRate ?? 1;

	const [initialVolume] = useState<VolumeProp | undefined>(() => volume);

	const duration = getTimelineDuration({
		compositionDurationInFrames: sequenceDurationInFrames,
		playbackRate,
		trimBefore,
		trimAfter,
		parentSequenceDurationInFrames: parentSequence?.durationInFrames ?? null,
		loop,
	});

	const volumes: string | number = useMemo(() => {
		if (typeof volume === 'number') {
			return volume;
		}

		if (typeof volume !== 'function') {
			return evaluateVolume({
				frame: 0,
				volume,
				mediaVolume,
			});
		}

		// Curves start at the first visible frame, just like the live volume callback.
		// Sampling composition frames also preserves fractional local frames at slow rates.
		return new Array(
			Math.ceil(
				Math.max(0, duration + Math.min(0, mediaStartsAt + mediaFrom)) /
					sequencePlaybackRate,
			),
		)
			.fill(true)
			.map((_, i) => {
				return evaluateVolume({
					frame: i * sequencePlaybackRate,
					volume,
					mediaVolume,
				});
			})
			.join(',');
	}, [
		duration,
		mediaStartsAt,
		mediaFrom,
		volume,
		mediaVolume,
		sequencePlaybackRate,
	]);

	useEffect(() => {
		if (typeof volume === 'number' && volume !== initialVolume) {
			warnOnce(
				`Remotion: The ${mediaType} with src ${src} has changed it's volume. Prefer the callback syntax for setting volume to get better timeline display: https://www.remotion.dev/docs/audio/volume`,
			);
		}
	}, [initialVolume, mediaType, src, volume]);

	const doesVolumeChange = typeof volume === 'function';

	const startMediaFrom = 0 - mediaStartsAt + (trimBefore ?? 0);

	const memoizedResult = useMemo(() => {
		return {
			volumes,
			duration,
			doesVolumeChange,
			finalDisplayName: displayName ?? getAssetDisplayName(src),
			startMediaFrom,
			src,
			playbackRate,
			muted,
		};
	}, [
		volumes,
		duration,
		doesVolumeChange,
		displayName,
		src,
		startMediaFrom,
		playbackRate,
		muted,
	]);

	return memoizedResult;
};

export type BasicMediaInTimelineReturnType = ReturnType<
	typeof useBasicMediaInTimeline
>;

export const useMediaInTimeline = ({
	volume,
	mediaVolume,
	src,
	mediaType,
	playbackRate,
	displayName,
	id,
	getStack,
	showInTimeline,
	premountDisplay,
	postmountDisplay,
	loopDisplay,
	loopVolumeCurveBehavior,
	documentationLink,
	refForOutline,
	muted,
}: {
	volume: VolumeProp | undefined;
	mediaVolume: number;
	src: string | undefined;
	mediaType: 'audio' | 'video';
	playbackRate: number;
	displayName: string | null;
	id: string;
	getStack: () => string | null;
	showInTimeline: boolean;
	premountDisplay: number | null;
	postmountDisplay: number | null;
	loopDisplay: LoopDisplay | undefined;
	loopVolumeCurveBehavior: LoopVolumeCurveBehavior;
	documentationLink: string | null;
	refForOutline: React.RefObject<Element | null> | null;
	muted: boolean;
}) => {
	const parentSequence = useContext(SequenceContext);
	const mediaTrimBefore = useContext(Html5MediaTrimContext);
	const sequenceRegistrationEnabled = useContext(SequenceRegistrationContext);
	const {durationInFrames} = useVideoConfig();
	const mediaStartsAt = useMediaStartsAt();
	const loopContext = Loop.useLoop();
	const loopTimeline = useContext(LoopTimelineContext);

	const {
		volumes: basicVolumes,
		duration,
		finalDisplayName,
	} = useBasicMediaInTimeline({
		volume: loopContext && typeof volume === 'function' ? undefined : volume,
		mediaVolume,
		mediaType,
		src,
		displayName,
		trimAfter: undefined,
		trimBefore: undefined,
		playbackRate,
		sequenceDurationInFrames: durationInFrames,
		mediaStartsAt,
		mediaFrom: 0,
		loop: false,
		muted,
	});
	const doesVolumeChange = typeof volume === 'function';
	const volumes = useMemo(() => {
		if (!loopContext || !loopTimeline || typeof volume !== 'function') {
			return basicVolumes;
		}

		const timeline = loopTimeline;
		const loopDuration = loopContext.durationInFrames;
		const sequenceRate = parentSequence?.playbackRate ?? 1;
		const mediaOrigin = parentSequence
			? parentSequence.cumulatedFrom + parentSequence.relativeFrom
			: 0;
		const mediaOffset =
			mediaOrigin +
			mediaTrimBefore / sequenceRate -
			(timeline.startFrame +
				(loopContext.iteration * loopDuration) / timeline.playbackRate);
		const firstVisible = Math.max(0, timeline.firstVisibleFrame);
		const firstCompositionFrame = Math.ceil(firstVisible);
		return Array.from(
			{
				length: Math.max(
					0,
					Math.ceil(timeline.endFrame) - firstCompositionFrame,
				),
			},
			(_, index) => {
				const compositionFrame = firstCompositionFrame + index;
				const loopsElapsed =
					((compositionFrame - timeline.startFrame) * timeline.playbackRate) /
					loopDuration;
				const nearestIteration = Math.round(loopsElapsed);
				const iteration =
					Math.abs(loopsElapsed - nearestIteration) <=
					Number.EPSILON * Math.max(1, Math.abs(loopsElapsed)) * 4
						? nearestIteration
						: Math.floor(loopsElapsed);
				const iterationStart =
					timeline.startFrame +
					(iteration * loopDuration) / timeline.playbackRate +
					mediaOffset;
				const frame =
					Math.max(
						0,
						compositionFrame - Math.max(firstVisible, iterationStart),
					) *
						sequenceRate +
					(loopVolumeCurveBehavior === 'extend'
						? (iteration * loopDuration * sequenceRate) / timeline.playbackRate
						: 0);
				return evaluateVolume({frame, volume, mediaVolume});
			},
		).join(',');
	}, [
		basicVolumes,
		loopContext,
		loopTimeline,
		mediaTrimBefore,
		mediaVolume,
		parentSequence,
		volume,
		loopVolumeCurveBehavior,
	]);

	const {isStudio} = useRemotionEnvironment();

	const getSequenceForRegistration = useCallback((): TSequence => {
		if (!src) {
			throw new Error('No src passed');
		}

		return {
			effectRuntimeValues: null,
			type: mediaType,
			src,
			id,
			duration,
			from: 0,
			trimBefore: null,
			parent: parentSequence?.id ?? null,
			displayName: finalDisplayName,
			documentationLink,
			volume: volumes,
			muted,
			showInTimeline: true,
			timelineOrder: null,
			startMediaFrom: mediaTrimBefore,
			mediaFrameAtSequenceZero: mediaTrimBefore * (1 - playbackRate),
			doesVolumeChange,
			loopDisplay,
			playbackRate,
			sequencePlaybackRate: 1,
			getStack,
			premountDisplay,
			postmountDisplay,
			controls: null,
			effects: [],
			refForOutline,
			isInsideSeries: false,
			frozenFrame: null,
			frozenMediaFrame: null,
		};
	}, [
		duration,
		id,
		parentSequence,
		src,
		volumes,
		doesVolumeChange,
		mediaType,
		mediaTrimBefore,
		playbackRate,
		getStack,
		premountDisplay,
		postmountDisplay,
		loopDisplay,
		documentationLink,
		finalDisplayName,
		refForOutline,
		muted,
	]);
	const registrationEnabled =
		isStudio ||
		sequenceRegistrationEnabled ||
		(typeof window !== 'undefined' && window.process?.env?.NODE_ENV === 'test');
	useSequenceRegistration({
		getSequence:
			registrationEnabled && showInTimeline ? getSequenceForRegistration : null,
		id,
	});
};
