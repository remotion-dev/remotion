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
import type {IsExact} from '../audio/props.js';
import {SharedAudioContext} from '../audio/shared-audio-tags.js';
import {makeSharedElementSourceNode} from '../audio/shared-element-source-node.js';
import {useFrameForVolumeProp} from '../audio/use-audio-frame.js';
import {getCrossOriginValue} from '../get-cross-origin-value.js';
import {useLogLevel, useMountTime} from '../log-level-context.js';
import {playbackLogging} from '../playback-logging.js';
import {usePreload} from '../prefetch.js';
import {useVolume} from '../use-amplification.js';
import {useMediaInTimeline} from '../use-media-in-timeline.js';
import {useMediaPlayback} from '../use-media-playback.js';
import {useMediaTag} from '../use-media-tag.js';
import {useVideoConfig} from '../use-video-config.js';
import {VERSION} from '../version.js';
import {
	useMediaMutedState,
	useMediaVolumeState,
} from '../volume-position-state.js';
import {evaluateVolume} from '../volume-prop.js';
import {warnAboutTooHighVolume} from '../volume-safeguard.js';
import {useEmitVideoFrame} from './emit-video-frame.js';
import type {NativeVideoProps, OnVideoFrame, RemotionVideoProps} from './props';
import {isIosSafari, useAppendVideoFragment} from './video-fragment.js';

type VideoForPreviewProps = RemotionVideoProps & {
	readonly onlyWarnForMediaSeekingError: boolean;
	readonly onDuration: (src: string, durationInSeconds: number) => void;
	readonly pauseWhenBuffering: boolean;
	readonly _remotionInternalNativeLoopPassed: boolean;
	readonly _remotionInternalStack: string | null;
	readonly showInTimeline: boolean;
	readonly onVideoFrame: null | OnVideoFrame;
	readonly crossOrigin?: '' | 'anonymous' | 'use-credentials';
};

type Expected = Omit<
	NativeVideoProps,
	'crossOrigin' | 'src' | 'name' | 'muted' | 'style'
>;

const VideoForDevelopmentRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLVideoElement,
	VideoForPreviewProps
> = (props, ref) => {
	const context = useContext(SharedAudioContext);
	if (!context) {
		throw new Error('SharedAudioContext not found');
	}

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const sharedSource = useMemo(() => {
		if (!context.audioContext) {
			return null;
		}

		return makeSharedElementSourceNode({
			audioContext: context.audioContext,
			ref: videoRef,
		});
	}, [context.audioContext]);

	const {
		volume,
		muted,
		playbackRate,
		onlyWarnForMediaSeekingError,
		src,
		onDuration,
		// @ts-expect-error
		acceptableTimeShift,
		acceptableTimeShiftInSeconds,
		toneFrequency,
		name,
		_remotionInternalNativeLoopPassed,
		_remotionInternalStack,
		style,
		pauseWhenBuffering,
		showInTimeline,
		loopVolumeCurveBehavior,
		onError,
		onAutoPlayError,
		onVideoFrame,
		crossOrigin,
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
		allowAmplificationDuringRender,
		useWebAudioApi,
		audioStreamIndex,
		...nativeProps
	} = props;

	const _propsValid: IsExact<typeof nativeProps, Expected> = true;

	if (!_propsValid) {
		throw new Error('typecheck error');
	}

	const volumePropFrame = useFrameForVolumeProp(
		loopVolumeCurveBehavior ?? 'repeat',
	);
	const {fps, durationInFrames} = useVideoConfig();
	const parentSequence = useContext(SequenceContext);
	const {hidden} = useContext(SequenceVisibilityToggleContext);
	const logLevel = useLogLevel();
	const mountTime = useMountTime();

	const [timelineId] = useState(() => String(Math.random()));
	const isSequenceHidden = hidden[timelineId] ?? false;

	if (typeof acceptableTimeShift !== 'undefined') {
		throw new Error(
			'acceptableTimeShift has been removed. Use acceptableTimeShiftInSeconds instead.',
		);
	}

	const [mediaVolume] = useMediaVolumeState();
	const [mediaMuted] = useMediaMutedState();

	const userPreferredVolume = evaluateVolume({
		frame: volumePropFrame,
		volume,
		mediaVolume,
	});

	warnAboutTooHighVolume(userPreferredVolume);

	useMediaInTimeline({
		volume,
		mediaVolume,
		mediaType: 'video',
		src,
		playbackRate: props.playbackRate ?? 1,
		displayName: name ?? null,
		id: timelineId,
		stack: _remotionInternalStack,
		showInTimeline,
		premountDisplay: null,
		postmountDisplay: null,
	});

	useMediaTag({
		mediaRef: videoRef,
		id: timelineId,
		mediaType: 'video',
		onAutoPlayError: onAutoPlayError ?? null,
		isPremounting: Boolean(parentSequence?.premounting),
		isPostmounting: Boolean(parentSequence?.postmounting),
	});

	// putting playback before useVolume
	// because volume looks at playbackrate
	useMediaPlayback({
		mediaRef: videoRef,
		src,
		mediaType: 'video',
		playbackRate: props.playbackRate ?? 1,
		onlyWarnForMediaSeekingError,
		acceptableTimeshift: acceptableTimeShiftInSeconds ?? null,
		isPremounting: Boolean(parentSequence?.premounting),
		isPostmounting: Boolean(parentSequence?.postmounting),
		pauseWhenBuffering,
		onAutoPlayError: onAutoPlayError ?? null,
	});

	useVolume({
		logLevel,
		mediaRef: videoRef,
		volume: userPreferredVolume,
		source: sharedSource,
		shouldUseWebAudioApi: useWebAudioApi ?? false,
	});

	const actualFrom = parentSequence ? parentSequence.relativeFrom : 0;
	const duration = parentSequence
		? Math.min(parentSequence.durationInFrames, durationInFrames)
		: durationInFrames;

	const preloadedSrc = usePreload(src as string);

	const actualSrc = useAppendVideoFragment({
		actualSrc: preloadedSrc,
		actualFrom,
		duration,
		fps,
	});

	useImperativeHandle(ref, () => {
		return videoRef.current as HTMLVideoElement;
	}, []);

	useState(() =>
		playbackLogging({
			logLevel,
			message: `Mounting video with source = ${actualSrc}, v=${VERSION}, user agent=${
				typeof navigator === 'undefined' ? 'server' : navigator.userAgent
			}`,
			tag: 'video',
			mountTime,
		}),
	);

	useEffect(() => {
		const {current} = videoRef;
		if (!current) {
			return;
		}

		const errorHandler = () => {
			if (current.error) {
				// eslint-disable-next-line no-console
				console.error('Error occurred in video', current?.error);

				// If user is handling the error, we don't cause an unhandled exception
				if (onError) {
					const err = new Error(
						`Code ${current.error.code}: ${current.error.message}`,
					);
					onError(err);
					return;
				}

				throw new Error(
					`The browser threw an error while playing the video ${src}: Code ${current.error.code} - ${current?.error?.message}. See https://remotion.dev/docs/media-playback-error for help. Pass an onError() prop to handle the error.`,
				);
			} else {
				// If user is handling the error, we don't cause an unhandled exception
				if (onError) {
					const err = new Error(
						`The browser threw an error while playing the video ${src}`,
					);
					onError(err);
					return;
				}

				throw new Error('The browser threw an error while playing the video');
			}
		};

		current.addEventListener('error', errorHandler, {once: true});
		return () => {
			current.removeEventListener('error', errorHandler);
		};
	}, [onError, src]);

	const currentOnDurationCallback =
		useRef<VideoForPreviewProps['onDuration']>(onDuration);
	currentOnDurationCallback.current = onDuration;

	useEmitVideoFrame({ref: videoRef, onVideoFrame});

	useEffect(() => {
		const {current} = videoRef;
		if (!current) {
			return;
		}

		if (current.duration) {
			currentOnDurationCallback.current?.(src as string, current.duration);
			return;
		}

		const onLoadedMetadata = () => {
			currentOnDurationCallback.current?.(src as string, current.duration);
		};

		current.addEventListener('loadedmetadata', onLoadedMetadata);
		return () => {
			current.removeEventListener('loadedmetadata', onLoadedMetadata);
		};
	}, [src]);

	useEffect(() => {
		const {current} = videoRef;

		if (!current) {
			return;
		}

		// Without this, on iOS Safari, the video cannot be seeked.
		// if a seek is triggered before `loadedmetadata` is fired,
		// the video will not seek, even if `loadedmetadata` is fired afterwards.

		// Also, this needs to happen in a useEffect, because otherwise
		// the SSR props will be applied.

		if (isIosSafari()) {
			current.preload = 'metadata';
		} else {
			current.preload = 'auto';
		}
	}, []);

	const actualStyle: React.CSSProperties = useMemo(() => {
		return {
			...style,
			opacity: isSequenceHidden ? 0 : (style?.opacity ?? 1),
		};
	}, [isSequenceHidden, style]);

	const crossOriginValue = getCrossOriginValue({
		crossOrigin,
		requestsVideoFrame: Boolean(onVideoFrame),
	});

	return (
		<video
			ref={videoRef}
			muted={
				muted || mediaMuted || isSequenceHidden || userPreferredVolume <= 0
			}
			playsInline
			src={actualSrc}
			loop={_remotionInternalNativeLoopPassed}
			style={actualStyle}
			disableRemotePlayback
			crossOrigin={crossOriginValue}
			{...nativeProps}
		/>
	);
};

export const VideoForPreview = forwardRef(
	VideoForDevelopmentRefForwardingFunction,
);
