import React, {useContext, useLayoutEffect, useMemo, useRef} from 'react';
import {
	cancelRender,
	continueRender,
	delayRender,
	Internals,
	useCurrentFrame,
} from 'remotion';
import {extractFrameViaBroadcastChannel} from './extract-frame-via-broadcast-channel';
import type {NewVideoProps} from './props';

const {
	useUnsafeVideoConfig,
	useFrameForVolumeProp,
	useTimelinePosition,
	RenderAssetManager,
	evaluateVolume,
} = Internals;

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
	const absoluteFrame = useTimelinePosition();
	const videoConfig = useUnsafeVideoConfig();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const {registerRenderAsset, unregisterRenderAsset} =
		useContext(RenderAssetManager);
	const frame = useCurrentFrame();
	const volumePropsFrame = useFrameForVolumeProp(
		loopVolumeCurveBehavior ?? 'repeat',
	);

	const id = useMemo(() => `${Math.random()}`, []);

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	if (!src) {
		throw new TypeError('No `src` was passed to <NewVideo>.');
	}

	const volume = evaluateVolume({
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
		})
			.then(({frame: imageBitmap, audio}) => {
				if (!imageBitmap) {
					cancelRender(new Error('No video frame found'));
				}

				onVideoFrame?.(imageBitmap);
				canvasRef.current?.getContext('2d')?.drawImage(imageBitmap, 0, 0);
				imageBitmap.close();

				if (audio) {
					const data = new Int16Array(
						audio.numberOfFrames * audio.numberOfChannels,
					);
					audio.clone().copyTo(data, {
						planeIndex: 0,
					});

					registerRenderAsset({
						type: 'inline-audio',
						id,
						audio: Array.from(data),
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
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
		fps,
		frame,
		logLevel,
		onVideoFrame,
		playbackRate,
		shouldRenderAudio,
		src,
		absoluteFrame,
		registerRenderAsset,
		unregisterRenderAsset,
		id,
	]);

	return (
		<canvas
			ref={canvasRef}
			width={videoConfig.width}
			height={videoConfig.height}
		/>
	);
};
