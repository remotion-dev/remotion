import type React from 'react';
import {useContext, useLayoutEffect, useMemo, useState} from 'react';
import {
	cancelRender,
	Internals,
	useCurrentFrame,
	useDelayRender,
	useRemotionEnvironment,
} from 'remotion';
import {extractFrameViaBroadcastChannel} from '../video-extraction/extract-frame-via-broadcast-channel';
import type {AudioProps} from './props';

export const AudioForRendering: React.FC<AudioProps> = ({
	volume: volumeProp,
	playbackRate,
	src,
	muted,
	loopVolumeCurveBehavior,
	delayRenderRetries,
	delayRenderTimeoutInMilliseconds,
	logLevel = window.remotion_logLevel,
}) => {
	const absoluteFrame = Internals.useTimelinePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();
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
		throw new TypeError('No `src` was passed to <Audio>.');
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

	const {fps} = videoConfig;

	const {delayRender, continueRender} = useDelayRender();

	useLayoutEffect(() => {
		const actualFps = playbackRate ? fps / playbackRate : fps;
		const timestamp = frame / actualFps;
		const durationInSeconds = 1 / actualFps;

		const newHandle = delayRender(`Extracting audio for frame ${frame}`, {
			retries: delayRenderRetries ?? undefined,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
		});

		extractFrameViaBroadcastChannel({
			src,
			timeInSeconds: timestamp,
			durationInSeconds,
			logLevel: logLevel ?? 'info',
			includeAudio: shouldRenderAudio,
			includeVideo: false,
			isClientSideRendering: environment.isClientSideRendering,
			volume,
		})
			.then(({audio}) => {
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
		fps,
		frame,
		id,
		logLevel,
		playbackRate,
		registerRenderAsset,
		shouldRenderAudio,
		src,
		unregisterRenderAsset,
		volume,
	]);

	return null;
};
