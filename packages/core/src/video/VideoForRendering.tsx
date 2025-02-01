import type {ForwardRefExoticComponent, RefAttributes} from 'react';
import React, {
	forwardRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
} from 'react';
import {RenderAssetManager} from '../RenderAssetManager.js';
import {SequenceContext} from '../SequenceContext.js';
import {getAbsoluteSrc} from '../absolute-src.js';
import {
	useFrameForVolumeProp,
	useMediaStartsAt,
} from '../audio/use-audio-frame.js';
import {continueRender, delayRender} from '../delay-render.js';
import {getRemotionEnvironment} from '../get-remotion-environment.js';
import {isApproximatelyTheSame} from '../is-approximately-the-same.js';
import {useLogLevel, useMountTime} from '../log-level-context.js';
import {random} from '../random.js';
import {useTimelinePosition} from '../timeline-position-state.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config.js';
import {evaluateVolume} from '../volume-prop.js';
import {getMediaTime} from './get-current-time.js';
import type {OnVideoFrame, RemotionVideoProps} from './props';
import {seekToTimeMultipleUntilRight} from './seek-until-right.js';

type VideoForRenderingProps = RemotionVideoProps & {
	readonly onDuration: (src: string, durationInSeconds: number) => void;
	readonly onVideoFrame: null | OnVideoFrame;
};

const VideoForRenderingForwardFunction: React.ForwardRefRenderFunction<
	HTMLVideoElement,
	VideoForRenderingProps
> = (
	{
		onError,
		volume: volumeProp,
		allowAmplificationDuringRender,
		playbackRate,
		onDuration,
		toneFrequency,
		name,
		acceptableTimeShiftInSeconds,
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
		loopVolumeCurveBehavior,
		...props
	},
	ref,
) => {
	const absoluteFrame = useTimelinePosition();

	const frame = useCurrentFrame();
	const volumePropsFrame = useFrameForVolumeProp(
		loopVolumeCurveBehavior ?? 'repeat',
	);
	const videoConfig = useUnsafeVideoConfig();
	const videoRef = useRef<HTMLVideoElement>(null);
	const sequenceContext = useContext(SequenceContext);
	const mediaStartsAt = useMediaStartsAt();
	const environment = getRemotionEnvironment();
	const logLevel = useLogLevel();
	const mountTime = useMountTime();

	const {registerRenderAsset, unregisterRenderAsset} =
		useContext(RenderAssetManager);

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() =>
			`video-${random(
				props.src ?? '',
			)}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.relativeFrom}-${sequenceContext?.durationInFrames}`,
		[
			props.src,
			sequenceContext?.cumulatedFrom,
			sequenceContext?.relativeFrom,
			sequenceContext?.durationInFrames,
		],
	);

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	const volume = evaluateVolume({
		volume: volumeProp,
		frame: volumePropsFrame,
		mediaVolume: 1,
		allowAmplificationDuringRender: allowAmplificationDuringRender ?? false,
	});

	useEffect(() => {
		if (!props.src) {
			throw new Error('No src passed');
		}

		if (props.muted) {
			return;
		}

		if (volume <= 0) {
			return;
		}

		if (!window.remotion_audioEnabled) {
			return;
		}

		registerRenderAsset({
			type: 'video',
			src: getAbsoluteSrc(props.src),
			id,
			frame: absoluteFrame,
			volume,
			mediaFrame: frame,
			playbackRate: playbackRate ?? 1,
			allowAmplificationDuringRender: allowAmplificationDuringRender ?? false,
			toneFrequency: toneFrequency ?? null,
			audioStartFrame: Math.max(0, -(sequenceContext?.relativeFrom ?? 0)),
		});

		return () => unregisterRenderAsset(id);
	}, [
		props.muted,
		props.src,
		registerRenderAsset,
		id,
		unregisterRenderAsset,
		volume,
		frame,
		absoluteFrame,
		playbackRate,
		allowAmplificationDuringRender,
		toneFrequency,
		sequenceContext?.relativeFrom,
	]);

	useImperativeHandle(ref, () => {
		return videoRef.current as HTMLVideoElement;
	}, []);

	useEffect(() => {
		if (!window.remotion_videoEnabled) {
			return;
		}

		const {current} = videoRef;
		if (!current) {
			return;
		}

		const currentTime = getMediaTime({
			frame,
			playbackRate: playbackRate || 1,
			startFrom: -mediaStartsAt,
			fps: videoConfig.fps,
		});
		const handle = delayRender(
			`Rendering <Video /> with src="${props.src}" at time ${currentTime}`,
			{
				retries: delayRenderRetries ?? undefined,
				timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
			},
		);
		if (window.process?.env?.NODE_ENV === 'test') {
			continueRender(handle);
			return;
		}

		if (isApproximatelyTheSame(current.currentTime, currentTime)) {
			if (current.readyState >= 2) {
				continueRender(handle);
				return;
			}

			const loadedDataHandler = () => {
				continueRender(handle);
			};

			current.addEventListener('loadeddata', loadedDataHandler, {once: true});
			return () => {
				current.removeEventListener('loadeddata', loadedDataHandler);
			};
		}

		const endedHandler = () => {
			continueRender(handle);
		};

		const seek = seekToTimeMultipleUntilRight({
			element: current,
			desiredTime: currentTime,
			fps: videoConfig.fps,
			logLevel,
			mountTime,
		});

		seek.prom.then(() => {
			continueRender(handle);
		});

		current.addEventListener('ended', endedHandler, {once: true});

		const errorHandler = () => {
			if (current?.error) {
				// eslint-disable-next-line no-console
				console.error('Error occurred in video', current?.error);

				// If user is handling the error, we don't cause an unhandled exception
				if (onError) {
					return;
				}

				throw new Error(
					`The browser threw an error while playing the video ${props.src}: Code ${current.error.code} - ${current?.error?.message}. See https://remotion.dev/docs/media-playback-error for help. Pass an onError() prop to handle the error.`,
				);
			} else {
				throw new Error('The browser threw an error');
			}
		};

		current.addEventListener('error', errorHandler, {once: true});

		// If video skips to another frame or unmounts, we clear the created handle
		return () => {
			seek.cancel();
			current.removeEventListener('ended', endedHandler);
			current.removeEventListener('error', errorHandler);
			continueRender(handle);
		};
	}, [
		volumePropsFrame,
		props.src,
		playbackRate,
		videoConfig.fps,
		frame,
		mediaStartsAt,
		onError,
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
		logLevel,
		mountTime,
	]);

	const {src} = props;

	// If video source switches, make new handle
	if (environment.isRendering) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			if (window.process?.env?.NODE_ENV === 'test') {
				return;
			}

			const newHandle = delayRender(
				'Loading <Video> duration with src=' + src,
				{
					retries: delayRenderRetries ?? undefined,
					timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
				},
			);
			const {current} = videoRef;

			const didLoad = () => {
				if (current?.duration) {
					onDuration(src as string, current.duration);
				}

				continueRender(newHandle);
			};

			if (current?.duration) {
				onDuration(src as string, current.duration);
				continueRender(newHandle);
			} else {
				current?.addEventListener('loadedmetadata', didLoad, {once: true});
			}

			// If tag gets unmounted, clear pending handles because video metadata is not going to load
			return () => {
				current?.removeEventListener('loadedmetadata', didLoad);
				continueRender(newHandle);
			};
		}, [src, onDuration, delayRenderRetries, delayRenderTimeoutInMilliseconds]);
	}

	return <video ref={videoRef} disableRemotePlayback {...props} />;
};

export const VideoForRendering = forwardRef(
	VideoForRenderingForwardFunction,
) as ForwardRefExoticComponent<
	VideoForRenderingProps & RefAttributes<HTMLVideoElement>
>;
