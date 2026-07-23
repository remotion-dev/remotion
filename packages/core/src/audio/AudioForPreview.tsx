import {useCallback} from 'react';
import type {AudioHTMLAttributes} from 'react';
import React, {
	forwardRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {getCrossOriginValue} from '../get-cross-origin-value.js';
import {useLogLevel} from '../log-level-context.js';
import {usePreload} from '../prefetch.js';
import {random} from '../random.js';
import {SequenceContext} from '../SequenceContext.js';
import {useVolume} from '../use-amplification.js';
import {useMediaInTimeline} from '../use-media-in-timeline.js';
import {useMediaPlayback} from '../use-media-playback.js';
import {useMediaTag} from '../use-media-tag.js';
import {
	usePlayerMutedState,
	useMediaVolumeState,
} from '../volume-position-state.js';
import {evaluateVolume} from '../volume-prop.js';
import {warnAboutTooHighVolume} from '../volume-safeguard.js';
import type {IsExact, NativeAudioProps, RemotionAudioProps} from './props.js';
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
	readonly onNativeError: React.ReactEventHandler<HTMLAudioElement>;
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

	const logLevel = useLogLevel();

	const {
		volume,
		muted,
		playbackRate,
		preservePitch,
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
		crossOrigin,
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
		toneFrequency,
		useWebAudioApi,
		onError,
		onNativeError,
		audioStreamIndex,
		...nativeProps
	} = props;

	// Typecheck that we are not accidentially passing unrecognized props
	// to the DOM
	const _propsValid: IsExact<
		typeof nativeProps,
		Omit<NativeAudioProps, 'crossOrigin' | 'src' | 'name' | 'muted'>
	> = true;
	if (!_propsValid) {
		throw new Error('typecheck error');
	}

	const [mediaVolume] = useMediaVolumeState();
	const [playerMuted] = usePlayerMutedState();

	const volumePropFrame = useFrameForVolumeProp(
		loopVolumeCurveBehavior ?? 'repeat',
	);

	if (!src) {
		throw new TypeError("No 'src' was passed to <Html5Audio>.");
	}

	const preloadedSrc = usePreload(src);

	const sequenceContext = useContext(SequenceContext);

	const [timelineId] = useState(() => String(Math.random()));

	const userPreferredVolume = evaluateVolume({
		frame: volumePropFrame,
		volume,
		mediaVolume,
	});

	warnAboutTooHighVolume(userPreferredVolume);

	const crossOriginValue = getCrossOriginValue({
		crossOrigin,
		requestsVideoFrame: false,
		isClientSideRendering: false,
	});

	const propsToPass = useMemo((): AudioHTMLAttributes<HTMLAudioElement> => {
		return {
			muted: muted || playerMuted || userPreferredVolume <= 0,
			src: preloadedSrc,
			loop: _remotionInternalNativeLoopPassed,
			crossOrigin: crossOriginValue,
			...nativeProps,
		};
	}, [
		_remotionInternalNativeLoopPassed,
		playerMuted,
		muted,
		nativeProps,
		preloadedSrc,
		userPreferredVolume,
		crossOriginValue,
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

	const {
		el: audioRef,
		mediaElementSourceNode,
		cleanupOnMediaTagUnmount,
	} = useSharedAudio({
		aud: propsToPass,
		audioId: id,
		premounting: Boolean(sequenceContext?.premounting),
		postmounting: Boolean(sequenceContext?.postmounting),
	});

	const getStack = useCallback(() => {
		return _remotionInternalStack ?? null;
	}, [_remotionInternalStack]);

	useMediaInTimeline({
		volume,
		mediaVolume,
		src,
		mediaType: 'audio',
		playbackRate: playbackRate ?? 1,
		displayName: name ?? null,
		id: timelineId,
		getStack,
		showInTimeline,
		premountDisplay: sequenceContext?.premountDisplay ?? null,
		postmountDisplay: sequenceContext?.postmountDisplay ?? null,
		loopDisplay: undefined,
		documentationLink: 'https://www.remotion.dev/docs/html5-audio',
		refForOutline: null,
	});

	// putting playback before useVolume
	// because volume looks at playbackrate
	useMediaPlayback({
		mediaRef: audioRef,
		src,
		mediaType: 'audio',
		playbackRate: playbackRate ?? 1,
		preservePitch,
		onlyWarnForMediaSeekingError: false,
		acceptableTimeshift: acceptableTimeShiftInSeconds ?? null,
		isPremounting: Boolean(sequenceContext?.premounting),
		isPostmounting: Boolean(sequenceContext?.postmounting),
		pauseWhenBuffering,
		onAutoPlayError: null,
	});

	useMediaTag({
		id: timelineId,
		isPostmounting: Boolean(sequenceContext?.postmounting),
		isPremounting: Boolean(sequenceContext?.premounting),
		mediaRef: audioRef,
		mediaType: 'audio',
		onAutoPlayError: null,
	});

	useVolume({
		logLevel,
		mediaRef: audioRef,
		source: mediaElementSourceNode,
		volume: userPreferredVolume,
		shouldUseWebAudioApi: useWebAudioApi ?? false,
	});

	/**
	 * Effects in React 18 fire twice, and we are looking for a way to only fire it once.
	 * - useInsertionEffect only fires once. If it's available we are in React 18.
	 * - useLayoutEffect only fires once in React 17.
	 *
	 * Need to import it from React to fix React 17 ESM support.
	 */
	const effectToUse = React.useInsertionEffect ?? React.useLayoutEffect;

	// Disconnecting the SharedElementSourceNodes if the Audio tag unmounts to prevent leak.
	// https://github.com/remotion-dev/remotion/issues/6285
	// But useInsertionEffect will fire before other effects, meaning the
	// nodes might still be used. Using rAF to ensure it's after other effects.
	effectToUse(() => {
		return () => {
			requestAnimationFrame(() => {
				cleanupOnMediaTagUnmount();
			});
		};
	}, [cleanupOnMediaTagUnmount]);

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

	return (
		<audio
			ref={audioRef}
			preload="metadata"
			crossOrigin={crossOriginValue}
			{...propsToPass}
		/>
	);
};

export const AudioForPreview = forwardRef(
	AudioForDevelopmentForwardRefFunction,
);
