import React, {
	forwardRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {SequenceContext} from '../SequenceContext.js';
import {SequenceVisibilityToggleContext} from '../SequenceManager.js';
import {usePreload} from '../prefetch.js';
import {random} from '../random.js';
import {useMediaInTimeline} from '../use-media-in-timeline.js';
import {
	DEFAULT_ACCEPTABLE_TIMESHIFT,
	useMediaPlayback,
} from '../use-media-playback.js';
import {useSyncVolumeWithMediaTag} from '../use-sync-volume-with-media-tag.js';
import {
	useMediaMutedState,
	useMediaVolumeState,
} from '../volume-position-state.js';
import {evaluateVolume} from '../volume-prop.js';
import type {RemotionAudioProps} from './props.js';
import {useSharedAudio} from './shared-audio-tags.js';
import {useFrameForVolumeProp} from './use-audio-frame.js';

type AudioForPreviewProps = RemotionAudioProps & {
	readonly shouldPreMountAudioTags: boolean;
	readonly onDuration: (src: string, durationInSeconds: number) => void;
	readonly pauseWhenBuffering: boolean;
	readonly _remotionInternalNativeLoopPassed: boolean;
	readonly _remotionInternalStack: string | null;
	readonly showInTimeline: boolean;
	readonly stack?: string | undefined;
};

const AudioForDevelopmentForwardRefFunction: React.ForwardRefRenderFunction<
	HTMLAudioElement,
	AudioForPreviewProps
> = (props, ref) => {
	const [initialShouldPreMountAudioElements] = useState(
		props.shouldPreMountAudioTags,
	);
	if (props.shouldPreMountAudioTags !== initialShouldPreMountAudioElements) {
		throw new Error(
			'Cannot change the behavior for pre-mounting audio tags dynamically.',
		);
	}

	const {
		volume,
		muted,
		playbackRate,
		shouldPreMountAudioTags,
		src,
		onDuration,
		acceptableTimeShiftInSeconds,
		_remotionInternalNeedsDurationCalculation,
		_remotionInternalNativeLoopPassed,
		_remotionInternalStack,
		allowAmplificationDuringRender,
		name,
		pauseWhenBuffering,
		showInTimeline,
		loopVolumeCurveBehavior,
		stack,
		...nativeProps
	} = props;

	const [mediaVolume] = useMediaVolumeState();
	const [mediaMuted] = useMediaMutedState();

	const volumePropFrame = useFrameForVolumeProp(
		loopVolumeCurveBehavior ?? 'repeat',
	);

	const {hidden} = useContext(SequenceVisibilityToggleContext);

	if (!src) {
		throw new TypeError("No 'src' was passed to <Audio>.");
	}

	const preloadedSrc = usePreload(src);

	const sequenceContext = useContext(SequenceContext);

	const [timelineId] = useState(() => String(Math.random()));

	const isSequenceHidden = hidden[timelineId] ?? false;

	const userPreferredVolume = evaluateVolume({
		frame: volumePropFrame,
		volume,
		mediaVolume,
		allowAmplificationDuringRender: false,
	});

	const propsToPass = useMemo((): RemotionAudioProps => {
		return {
			muted:
				muted || mediaMuted || isSequenceHidden || userPreferredVolume <= 0,
			src: preloadedSrc,
			loop: _remotionInternalNativeLoopPassed,
			...nativeProps,
		};
	}, [
		_remotionInternalNativeLoopPassed,
		isSequenceHidden,
		mediaMuted,
		muted,
		nativeProps,
		preloadedSrc,
		userPreferredVolume,
	]);
	// Generate a string that's as unique as possible for this asset
	// but at the same time deterministic. We use it to combat strict mode issues.
	const id = useMemo(
		() =>
			`audio-${random(
				src ?? '',
			)}-${sequenceContext?.relativeFrom}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.durationInFrames}-muted:${
				props.muted
			}-loop:${props.loop}`,
		[
			src,
			sequenceContext?.relativeFrom,
			sequenceContext?.cumulatedFrom,
			sequenceContext?.durationInFrames,
			props.muted,
			props.loop,
		],
	);

	const audioRef = useSharedAudio(propsToPass, id).el;

	useSyncVolumeWithMediaTag({
		volumePropFrame,
		volume,
		mediaVolume,
		mediaRef: audioRef,
	});

	useMediaInTimeline({
		volume,
		mediaVolume,
		mediaRef: audioRef,
		src,
		mediaType: 'audio',
		playbackRate: playbackRate ?? 1,
		displayName: name ?? null,
		id: timelineId,
		stack: _remotionInternalStack,
		showInTimeline,
		premountDisplay: null,
		onAutoPlayError: null,
		isPremounting: Boolean(sequenceContext?.premounting),
	});

	useMediaPlayback({
		mediaRef: audioRef,
		src,
		mediaType: 'audio',
		playbackRate: playbackRate ?? 1,
		onlyWarnForMediaSeekingError: false,
		acceptableTimeshift:
			acceptableTimeShiftInSeconds ?? DEFAULT_ACCEPTABLE_TIMESHIFT,
		isPremounting: Boolean(sequenceContext?.premounting),
		pauseWhenBuffering,
		onAutoPlayError: null,
	});

	useImperativeHandle(ref, () => {
		return audioRef.current as HTMLAudioElement;
	}, [audioRef]);

	const currentOnDurationCallback =
		useRef<AudioForPreviewProps['onDuration']>(onDuration);
	currentOnDurationCallback.current = onDuration;

	useEffect(() => {
		const {current} = audioRef;
		if (!current) {
			return;
		}

		if (current.duration) {
			currentOnDurationCallback.current?.(current.src, current.duration);
			return;
		}

		const onLoadedMetadata = () => {
			currentOnDurationCallback.current?.(current.src, current.duration);
		};

		current.addEventListener('loadedmetadata', onLoadedMetadata);
		return () => {
			current.removeEventListener('loadedmetadata', onLoadedMetadata);
		};
	}, [audioRef, src]);

	if (initialShouldPreMountAudioElements) {
		return null;
	}

	return <audio ref={audioRef} preload="metadata" {...propsToPass} />;
};

export const AudioForPreview = forwardRef(
	AudioForDevelopmentForwardRefFunction,
);
