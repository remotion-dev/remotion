import React, {
	forwardRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react';
import {getAbsoluteSrc} from '../absolute-src';
import {
	useFrameForVolumeProp,
	useMediaStartsAt,
} from '../audio/use-audio-frame';
import {CompositionManager} from '../CompositionManager';
import {continueRender, delayRender} from '../delay-render';
import {isApproximatelyTheSame} from '../is-approximately-the-same';
import {random} from '../random';
import {SequenceContext} from '../Sequence';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-current-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {evaluateVolume} from '../volume-prop';
import {warnAboutNonSeekableMedia} from '../warn-about-non-seekable-media';
import {getMediaTime} from './get-current-time';
import type {RemotionVideoProps} from './props';

const VideoForRenderingForwardFunction: React.ForwardRefRenderFunction<
	HTMLVideoElement,
	RemotionVideoProps
> = ({onError, volume: volumeProp, playbackRate, ...props}, ref) => {
	const absoluteFrame = useAbsoluteCurrentFrame();

	const frame = useCurrentFrame();
	const volumePropsFrame = useFrameForVolumeProp();
	const videoConfig = useUnsafeVideoConfig();
	const videoRef = useRef<HTMLVideoElement>(null);
	const sequenceContext = useContext(SequenceContext);
	const mediaStartsAt = useMediaStartsAt();

	const {registerAsset, unregisterAsset} = useContext(CompositionManager);

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() =>
			`video-${random(props.src ?? '')}-${sequenceContext?.cumulatedFrom}-${
				sequenceContext?.relativeFrom
			}-${sequenceContext?.durationInFrames}-muted:${props.muted}`,
		[
			props.src,
			props.muted,
			sequenceContext?.cumulatedFrom,
			sequenceContext?.relativeFrom,
			sequenceContext?.durationInFrames,
		]
	);

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	const volume = evaluateVolume({
		volume: volumeProp,
		frame: volumePropsFrame,
		mediaVolume: 1,
	});

	useEffect(() => {
		if (!props.src) {
			throw new Error('No src passed');
		}

		if (props.muted) {
			return;
		}

		if (!window.remotion_audioEnabled) {
			return;
		}

		registerAsset({
			type: 'video',
			src: getAbsoluteSrc(props.src),
			id,
			frame: absoluteFrame,
			volume,
			mediaFrame: frame,
			playbackRate: playbackRate ?? 1,
		});

		return () => unregisterAsset(id);
	}, [
		props.muted,
		props.src,
		registerAsset,
		id,
		unregisterAsset,
		volume,
		frame,
		absoluteFrame,
		playbackRate,
	]);

	useImperativeHandle(ref, () => {
		return videoRef.current as HTMLVideoElement;
	});

	useEffect(() => {
		if (!window.remotion_videoEnabled) {
			return;
		}

		const {current} = videoRef;
		if (!current) {
			return;
		}

		const currentTime = (() => {
			return getMediaTime({
				fps: videoConfig.fps,
				frame,
				src: props.src as string,
				playbackRate: playbackRate || 1,
				startFrom: -mediaStartsAt,
				mediaType: 'video',
			});
		})();
		const handle = delayRender(`Rendering <Video /> with src="${props.src}"`);
		if (process.env.NODE_ENV === 'test') {
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

		current.currentTime = currentTime;

		const seekedHandler = () => {
			warnAboutNonSeekableMedia(current, 'exception');

			if (window.navigator.platform.startsWith('Mac')) {
				// Improve me: This is ensures frame perfectness but slows down render.
				// Please see this issue for context: https://github.com/remotion-dev/remotion/issues/200

				// Only affects macOS since it uses VideoToolbox decoding.
				setTimeout(() => {
					continueRender(handle);
				}, 100);
			} else {
				continueRender(handle);
			}
		};

		current.addEventListener('seeked', seekedHandler, {once: true});

		const endedHandler = () => {
			continueRender(handle);
		};

		current.addEventListener('ended', endedHandler, {once: true});

		const errorHandler = () => {
			if (current?.error) {
				console.error('Error occurred in video', current?.error);
				throw new Error(
					`The browser threw an error while playing the video: Code ${current.error.code} - ${current?.error?.message}. See https://remotion.dev/docs/media-playback-error for help`
				);
			} else {
				throw new Error('The browser threw an error');
			}
		};

		current.addEventListener('error', errorHandler, {once: true});

		// If video skips to another frame or unmounts, we clear the created handle
		return () => {
			current.removeEventListener('ended', endedHandler);
			current.removeEventListener('error', errorHandler);
			current.removeEventListener('seeked', seekedHandler);
			continueRender(handle);
		};
	}, [
		volumePropsFrame,
		props.src,
		playbackRate,
		videoConfig.fps,
		frame,
		mediaStartsAt,
	]);

	return <video ref={videoRef} {...props} onError={onError} />;
};

export const VideoForRendering = forwardRef(VideoForRenderingForwardFunction);
