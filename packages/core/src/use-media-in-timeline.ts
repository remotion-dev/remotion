import {useContext, useEffect, useMemo, useState} from 'react';
import {useMediaStartsAt} from './audio/use-audio-frame.js';
import type {LoopDisplay} from './CompositionManager.js';
import {getAssetDisplayName} from './get-asset-file-name.js';
import {getTimelineDuration} from './get-timeline-duration.js';
import {useNonce} from './nonce.js';
import {SequenceContext} from './SequenceContext.js';
import {SequenceManager} from './SequenceManager.js';
import {useTimelineContext} from './timeline-position-state.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
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
	loop,
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
	loop: boolean;
}) => {
	if (!src) {
		throw new Error('No src passed');
	}

	const parentSequence = useContext(SequenceContext);

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

		return new Array(Math.floor(Math.max(0, duration + mediaStartsAt)))
			.fill(true)
			.map((_, i) => {
				return evaluateVolume({
					frame: i + mediaStartsAt,
					volume,
					mediaVolume,
				});
			})
			.join(',');
	}, [duration, mediaStartsAt, volume, mediaVolume]);

	useEffect(() => {
		if (typeof volume === 'number' && volume !== initialVolume) {
			warnOnce(
				`Remotion: The ${mediaType} with src ${src} has changed it's volume. Prefer the callback syntax for setting volume to get better timeline display: https://www.remotion.dev/docs/audio/volume`,
			);
		}
	}, [initialVolume, mediaType, src, volume]);

	const doesVolumeChange = typeof volume === 'function';

	const nonce = useNonce();
	const {rootId} = useTimelineContext();

	const startMediaFrom = 0 - mediaStartsAt + (trimBefore ?? 0);

	const memoizedResult = useMemo(() => {
		return {
			volumes,
			duration,
			doesVolumeChange,
			nonce,
			rootId,
			finalDisplayName: displayName ?? getAssetDisplayName(src),
			startMediaFrom,
			src,
			playbackRate,
		};
	}, [
		volumes,
		duration,
		doesVolumeChange,
		nonce,
		rootId,
		displayName,
		src,
		startMediaFrom,
		playbackRate,
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
	documentationLink,
	refForOutline,
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
	documentationLink: string | null;
	refForOutline: React.RefObject<Element | null> | null;
}) => {
	const parentSequence = useContext(SequenceContext);
	const startsAt = useMediaStartsAt();
	const {registerSequence, unregisterSequence} = useContext(SequenceManager);
	const {durationInFrames} = useVideoConfig();
	const mediaStartsAt = useMediaStartsAt();

	const {volumes, duration, doesVolumeChange, nonce, rootId, finalDisplayName} =
		useBasicMediaInTimeline({
			volume,
			mediaVolume,
			mediaType,
			src,
			displayName,
			trimAfter: undefined,
			trimBefore: undefined,
			playbackRate,
			sequenceDurationInFrames: durationInFrames,
			mediaStartsAt,
			loop: false,
		});

	const {isStudio} = useRemotionEnvironment();

	useEffect(() => {
		if (!src) {
			throw new Error('No src passed');
		}

		if (!isStudio && window.process?.env?.NODE_ENV !== 'test') {
			return;
		}

		if (!showInTimeline) {
			return;
		}

		registerSequence({
			type: mediaType,
			src,
			id,
			duration,
			from: 0,
			trimBefore: null,
			parent: parentSequence?.id ?? null,
			displayName: finalDisplayName,
			documentationLink,
			rootId,
			volume: volumes,
			showInTimeline: true,
			nonce: nonce.get(),
			startMediaFrom: 0 - startsAt,
			doesVolumeChange,
			loopDisplay,
			playbackRate,
			getStack,
			premountDisplay,
			postmountDisplay,
			controls: null,
			effects: [],
			refForOutline,
			isInsideSeries: false,
			frozenFrame: null,
			frozenMediaFrame: null,
		});

		return () => {
			unregisterSequence(id);
		};
	}, [
		duration,
		id,
		parentSequence,
		src,
		registerSequence,
		unregisterSequence,
		volumes,
		doesVolumeChange,
		nonce,
		mediaType,
		startsAt,
		playbackRate,
		getStack,
		showInTimeline,
		premountDisplay,
		postmountDisplay,
		loopDisplay,
		documentationLink,
		rootId,
		finalDisplayName,
		isStudio,
		refForOutline,
	]);
};
