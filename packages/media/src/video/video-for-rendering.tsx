import React, {
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	cancelRender,
	Internals,
	useCurrentFrame,
	useDelayRender,
	useRemotionEnvironment,
	useVideoConfig,
} from 'remotion';
import {extractFrameViaBroadcastChannel} from '../video-extraction/extract-frame-via-broadcast-channel';
import type {VideoProps} from './props';

export const VideoForRendering: React.FC<VideoProps> = ({
	volume: volumeProp,
	src,
	muted,
	delayRenderRetries,
	delayRenderTimeoutInMilliseconds,
	// call when a frame of the video, i.e. frame drawn on canvas
	onVideoFrame,
	logLevel = window.remotion_logLevel,
	loop,
	style,
	playbackRate,
	className,
}) => {
	const absoluteFrame = Internals.useTimelinePosition();
	const {fps} = useVideoConfig();

	const actualFps = playbackRate ? fps / playbackRate : fps;

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const {registerRenderAsset, unregisterRenderAsset} = useContext(
		Internals.RenderAssetManager,
	);
	const frame = useCurrentFrame();
	const volumePropsFrame = Internals.useFrameForVolumeProp('repeat');
	const environment = useRemotionEnvironment();

	const [id] = useState(() => `${Math.random()}`.replace('0.', ''));

	if (!src) {
		throw new TypeError('No `src` was passed to <Video>.');
	}

	const volume = Internals.evaluateVolume({
		volume: volumeProp,
		frame: volumePropsFrame,
		mediaVolume: 1,
	});

	Internals.warnAboutTooHighVolume(volume);

	const shouldRenderAudio = useMemo(() => {
		if (!window.remotion_audioEnabled) {
			return false;
		}

		if (muted) {
			return false;
		}

		if (volume <= 0) {
			return false;
		}

		return true;
	}, [muted, volume]);

	const {delayRender, continueRender} = useDelayRender();

	useLayoutEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		const timestamp = frame / actualFps;
		const durationInSeconds = 1 / actualFps;

		const newHandle = delayRender(`Extracting frame number ${frame}`, {
			retries: delayRenderRetries ?? undefined,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
		});

		extractFrameViaBroadcastChannel({
			src,
			timeInSeconds: timestamp,
			durationInSeconds,
			logLevel: logLevel ?? 'info',
			includeAudio: shouldRenderAudio,
			includeVideo: window.remotion_videoEnabled,
			isClientSideRendering: environment.isClientSideRendering,
			volume,
			loop: loop ?? false,
		})
			.then(({frame: imageBitmap, audio}) => {
				if (imageBitmap) {
					onVideoFrame?.(imageBitmap);
					const context = canvasRef.current?.getContext('2d');
					if (!context) {
						return;
					}

					context.canvas.width =
						imageBitmap instanceof ImageBitmap
							? imageBitmap.width
							: imageBitmap.displayWidth;
					context.canvas.height =
						imageBitmap instanceof ImageBitmap
							? imageBitmap.height
							: imageBitmap.displayHeight;
					context.canvas.style.aspectRatio = `${context.canvas.width} / ${context.canvas.height}`;
					context.drawImage(imageBitmap, 0, 0);

					imageBitmap.close();
				} else if (window.remotion_videoEnabled) {
					cancelRender(new Error('No video frame found'));
				}

				if (audio) {
					registerRenderAsset({
						type: 'inline-audio',
						id,
						audio: Array.from(audio.data),
						sampleRate: audio.sampleRate,
						numberOfChannels: audio.numberOfChannels,
						frame: absoluteFrame,
						timestamp: audio.timestamp,
						duration: (audio.numberOfFrames / audio.sampleRate) * 1_000_000,
					});
				}

				continueRender(newHandle);
			})
			.catch((error) => {
				cancelRender(error);
			});

		return () => {
			continueRender(newHandle);
			unregisterRenderAsset(id);
		};
	}, [
		absoluteFrame,
		continueRender,
		delayRender,
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
		environment.isClientSideRendering,
		actualFps,
		frame,
		id,
		logLevel,
		onVideoFrame,
		registerRenderAsset,
		shouldRenderAudio,
		src,
		unregisterRenderAsset,
		volume,
		loop,
	]);

	const classNameValue = useMemo(() => {
		return [Internals.OBJECTFIT_CONTAIN_CLASS_NAME, className]
			.filter(Internals.truthy)
			.join(' ');
	}, [className]);

	return <canvas ref={canvasRef} style={style} className={classNameValue} />;
};
