import {useCallback, useContext, useMemo} from 'react';
import {
	Html5MediaTrimContext,
	useMediaStartsAt,
} from './audio/use-audio-frame.js';
import type {LoopDisplay, TSequence} from './CompositionManager.js';
import {getAssetDisplayName} from './get-asset-file-name.js';
import {getTimelineDuration} from './get-timeline-duration.js';
import {
	SequenceOutlineContext,
	SequenceOutlineInternals,
} from './sequence-outline.js';
import {SequenceContext} from './SequenceContext.js';
import {SequenceRegistrationContext} from './SequenceManager.js';
import {TimelineTrackContext} from './timeline-track-context.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {useSequenceRegistration} from './use-sequence-registration.js';
import {useVideoConfig} from './use-video-config.js';

const EMPTY_EFFECTS = [] as const;

export const useBasicMediaInTimeline = ({
	src,
	displayName,
	trimBefore,
	trimAfter,
	playbackRate,
	sequenceDurationInFrames,
	mediaStartsAt,
	loop,
	muted,
}: {
	src: string | undefined;
	displayName: string | null;
	trimBefore: number | undefined;
	trimAfter: number | undefined;
	playbackRate: number;
	sequenceDurationInFrames: number;
	mediaStartsAt: number;
	loop: boolean;
	muted: boolean;
}) => {
	if (!src) {
		throw new Error('No src passed');
	}

	const parentSequence = useContext(SequenceContext);

	const duration = getTimelineDuration({
		compositionDurationInFrames: sequenceDurationInFrames,
		playbackRate,
		trimBefore,
		trimAfter,
		parentSequenceDurationInFrames: parentSequence?.durationInFrames ?? null,
		loop,
	});

	const startMediaFrom = 0 - mediaStartsAt + (trimBefore ?? 0);

	const memoizedResult = useMemo(() => {
		return {
			duration,
			finalDisplayName: displayName ?? getAssetDisplayName(src),
			startMediaFrom,
			src,
			playbackRate,
			muted,
		};
	}, [duration, displayName, src, startMediaFrom, playbackRate, muted]);

	return memoizedResult;
};

export type BasicMediaInTimelineReturnType = ReturnType<
	typeof useBasicMediaInTimeline
>;

export const useMediaInTimelineRegistration = ({
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
	documentationLink,
	muted,
}: {
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
	documentationLink: string | null;
	muted: boolean;
}) => {
	const parentSequence = useContext(SequenceContext);
	const timelineTrack = useContext(TimelineTrackContext);
	const mediaTrimBefore = useContext(Html5MediaTrimContext);
	const sequenceRegistrationEnabled = useContext(SequenceRegistrationContext);
	const {durationInFrames} = useVideoConfig();
	const mediaStartsAt = useMediaStartsAt();
	const canvasOutlinesEnabled = useContext(SequenceOutlineContext);
	const {isStudio} = useRemotionEnvironment();
	const stack = getStack();
	const getStackForRegistration = useCallback(() => stack, [stack]);
	const automaticOutlineRef = useMemo(
		() =>
			mediaType === 'video' && (isStudio || canvasOutlinesEnabled)
				? SequenceOutlineInternals.createRef()
				: null,
		[canvasOutlinesEnabled, isStudio, mediaType],
	);

	const {duration, finalDisplayName} = useBasicMediaInTimeline({
		src,
		displayName,
		trimAfter: undefined,
		trimBefore: undefined,
		playbackRate,
		sequenceDurationInFrames: durationInFrames,
		mediaStartsAt,
		loop: false,
		muted,
	});
	const getSequenceForRegistration = useCallback((): TSequence => {
		if (!src) {
			throw new Error('No src passed');
		}

		return {
			effectRuntimeValues: null,
			...(timelineTrack
				? {
						timelineTrack: {
							...timelineTrack,
							role: 'clip' as const,
							seriesOffset: null,
						},
					}
				: {}),
			type: mediaType,
			src,
			id,
			duration,
			from: 0,
			trimBefore: null,
			parent: parentSequence?.id ?? null,
			displayName: finalDisplayName,
			documentationLink,
			muted,
			showInTimeline: true,
			timelineOrder: null,
			startMediaFrom: mediaTrimBefore,
			mediaFrameAtSequenceZero: mediaTrimBefore * (1 - playbackRate),
			loopDisplay,
			playbackRate,
			sequencePlaybackRate: 1,
			getStack: getStackForRegistration,
			premountDisplay,
			postmountDisplay,
			controls: null,
			effects: EMPTY_EFFECTS,
			refForOutline: automaticOutlineRef,
			isInsideSeries: false,
			frozenFrame: null,
			frozenMediaFrame: null,
		};
	}, [
		duration,
		id,
		timelineTrack,
		parentSequence?.id,
		src,
		mediaType,
		mediaTrimBefore,
		playbackRate,
		getStackForRegistration,
		premountDisplay,
		postmountDisplay,
		loopDisplay,
		documentationLink,
		finalDisplayName,
		automaticOutlineRef,
		muted,
	]);
	const registrationEnabled =
		isStudio ||
		sequenceRegistrationEnabled ||
		(typeof window !== 'undefined' && window.process?.env?.NODE_ENV === 'test');
	const registration = useSequenceRegistration({
		getSequence:
			registrationEnabled && showInTimeline ? getSequenceForRegistration : null,
		id,
	});
	return {automaticOutlineRef, registration};
};
