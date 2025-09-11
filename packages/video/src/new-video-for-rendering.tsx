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
} from 'remotion';
import {extractFrameViaBroadcastChannel} from './extract-frame-via-broadcast-channel';
import type {NewVideoProps} from './props';

export const NewVideoForRendering: React.FC<NewVideoProps> = ({
	volume: volumeProp,
	playbackRate,
	src,
	muted,
	loopVolumeCurveBehavior,
	delayRenderRetries,
	delayRenderTimeoutInMilliseconds,
	// call when a frame of the video, i.e. frame drawn on canvas
	onVideoFrame,
	logLevel,
}) => {
	const absoluteFrame = Internals.useTimelinePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const {registerRenderAsset, unregisterRenderAsset} = useContext(
		Internals.RenderAssetManager,
	);
	const frame = useCurrentFrame();
	const volumePropsFrame = Internals.useFrameForVolumeProp(
		loopVolumeCurveBehavior ?? 'repeat',
	);
	const environment = useRemotionEnvironment();

	const [id] = useState(() => `${Math.random()}`.replace('0.', ''));

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	if (!src) {
		throw new TypeError('No `src` was passed to <NewVideo>.');
	}

	const volume = Internals.evaluateVolume({
		volume: volumeProp,
		frame: volumePropsFrame,
		mediaVolume: 1,
	});

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

	const {fps} = videoConfig;

	const {delayRender, continueRender} = useDelayRender();

	useLayoutEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		const actualFps = playbackRate ? fps / playbackRate : fps;
		const timestamp = frame / actualFps;
		const durationInSeconds = 1 / actualFps;

		const newHandle = delayRender(`extracting frame number ${frame}`, {
			retries: delayRenderRetries ?? undefined,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
		});

		extractFrameViaBroadcastChannel({
			src,
			timeInSeconds: timestamp,
			durationInSeconds,
			logLevel: logLevel ?? 'info',
			shouldRenderAudio,
			isClientSideRendering: environment.isClientSideRendering,
		})
			.then(({frame: imageBitmap, audio}) => {
				if (!imageBitmap) {
					cancelRender(new Error('No video frame found'));
				}

				onVideoFrame?.(imageBitmap);
				canvasRef.current?.getContext('2d')?.drawImage(imageBitmap, 0, 0);
				imageBitmap.close();

				if (audio) {
					registerRenderAsset({
						type: 'inline-audio',
						id,
						audio: Array.from(audio.data),
						sampleRate: audio.sampleRate,
						numberOfChannels: audio.numberOfChannels,
						frame: absoluteFrame,
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
		fps,
		frame,
		id,
		logLevel,
		onVideoFrame,
		playbackRate,
		registerRenderAsset,
		shouldRenderAudio,
		src,
		unregisterRenderAsset,
	]);

	return (
		<canvas
			ref={canvasRef}
			width={videoConfig.width}
			height={videoConfig.height}
		/>
	);
};
