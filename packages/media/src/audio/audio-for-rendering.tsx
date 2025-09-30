import type React from 'react';
import {useContext, useLayoutEffect, useState} from 'react';
import {
	Audio,
	cancelRender,
	Internals,
	useCurrentFrame,
	useDelayRender,
	useRemotionEnvironment,
} from 'remotion';
import {applyVolume} from '../convert-audiodata/apply-volume';
import {frameForVolumeProp} from '../looped-frame';
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
	loop,
	fallbackHtml5AudioProps,
	showInTimeline,
	style,
	name,
}) => {
	const frame = useCurrentFrame();
	const absoluteFrame = Internals.useTimelinePosition();

	const videoConfig = Internals.useUnsafeVideoConfig();
	const {registerRenderAsset, unregisterRenderAsset} = useContext(
		Internals.RenderAssetManager,
	);
	const startsAt = Internals.useMediaStartsAt();

	const environment = useRemotionEnvironment();

	const [id] = useState(() => `${Math.random()}`.replace('0.', ''));

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	if (!src) {
		throw new TypeError('No `src` was passed to <Audio>.');
	}

	const {fps} = videoConfig;

	const {delayRender, continueRender} = useDelayRender();
	const [replaceWithHtml5Audio, setReplaceWithHtml5Audio] = useState(false);

	useLayoutEffect(() => {
		const actualFps = playbackRate ? fps / playbackRate : fps;
		const timestamp = frame / actualFps;
		const durationInSeconds = 1 / actualFps;

		const newHandle = delayRender(`Extracting audio for frame ${frame}`, {
			retries: delayRenderRetries ?? undefined,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
		});

		const shouldRenderAudio = (() => {
			if (!window.remotion_audioEnabled) {
				return false;
			}

			if (muted) {
				return false;
			}

			return true;
		})();

		extractFrameViaBroadcastChannel({
			src,
			timeInSeconds: timestamp,
			durationInSeconds,
			playbackRate: playbackRate ?? 1,
			logLevel: logLevel ?? 'info',
			includeAudio: shouldRenderAudio,
			includeVideo: false,
			isClientSideRendering: environment.isClientSideRendering,
			loop: loop ?? false,
		})
			.then((result) => {
				if (result === 'cannot-decode') {
					Internals.Log.info(
						{logLevel, tag: '@remotion/media'},
						`Cannot decode ${src}, falling back to <Audio>`,
					);
					setReplaceWithHtml5Audio(true);
					return;
				}

				if (result === 'network-error') {
					Internals.Log.info(
						{logLevel, tag: '@remotion/media'},
						`Network error fetching ${src}, falling back to <Audio>`,
					);
					setReplaceWithHtml5Audio(true);
					return;
				}

				const {audio, durationInSeconds: assetDurationInSeconds} = result;

				const volumePropsFrame = frameForVolumeProp({
					behavior: loopVolumeCurveBehavior ?? 'repeat',
					loop: loop ?? false,
					assetDurationInSeconds: assetDurationInSeconds ?? 0,
					fps,
					frame,
					startsAt,
				});
				const volume = Internals.evaluateVolume({
					volume: volumeProp,
					frame: volumePropsFrame,
					mediaVolume: 1,
				});

				Internals.warnAboutTooHighVolume(volume);

				if (audio && volume > 0) {
					applyVolume(audio.data, volume);
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
		loop,
		loopVolumeCurveBehavior,
		muted,
		playbackRate,
		registerRenderAsset,
		src,
		startsAt,
		unregisterRenderAsset,
		volumeProp,
	]);

	if (replaceWithHtml5Audio) {
		// TODO: Loop and other props
		return (
			<Audio
				src={src}
				playbackRate={playbackRate}
				muted={muted}
				loop={loop}
				volume={volumeProp}
				delayRenderRetries={delayRenderRetries}
				delayRenderTimeoutInMilliseconds={delayRenderTimeoutInMilliseconds}
				style={style}
				loopVolumeCurveBehavior={loopVolumeCurveBehavior}
				audioStreamIndex={fallbackHtml5AudioProps?.audioStreamIndex}
				useWebAudioApi={fallbackHtml5AudioProps?.useWebAudioApi}
				onError={fallbackHtml5AudioProps?.onError}
				toneFrequency={fallbackHtml5AudioProps?.toneFrequency}
				acceptableTimeShiftInSeconds={
					fallbackHtml5AudioProps?.acceptableTimeShiftInSeconds
				}
				name={name}
				showInTimeline={showInTimeline}
			/>
		);
	}

	return null;
};
