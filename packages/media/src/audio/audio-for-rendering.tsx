import type React from 'react';
import {useContext, useLayoutEffect, useMemo, useState} from 'react';
import {
	cancelRender,
	Html5Audio,
	Internals,
	random,
	useCurrentFrame,
	useDelayRender,
	useRemotionEnvironment,
} from 'remotion';
import {applyVolume} from '../convert-audiodata/apply-volume';
import {TARGET_SAMPLE_RATE} from '../convert-audiodata/resample-audiodata';
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
	audioStreamIndex,
	showInTimeline,
	style,
	name,
	disallowFallbackToHtml5Audio,
	toneFrequency,
	trimAfter,
	trimBefore,
}) => {
	const frame = useCurrentFrame();
	const absoluteFrame = Internals.useTimelinePosition();

	const videoConfig = Internals.useUnsafeVideoConfig();
	const {registerRenderAsset, unregisterRenderAsset} = useContext(
		Internals.RenderAssetManager,
	);
	const startsAt = Internals.useMediaStartsAt();

	const environment = useRemotionEnvironment();

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	if (!src) {
		throw new TypeError('No `src` was passed to <Audio>.');
	}

	const {fps} = videoConfig;

	const {delayRender, continueRender} = useDelayRender();
	const [replaceWithHtml5Audio, setReplaceWithHtml5Audio] = useState(false);

	const sequenceContext = useContext(Internals.SequenceContext);

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() =>
			`media-video-${random(
				src,
			)}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.relativeFrom}-${sequenceContext?.durationInFrames}`,
		[
			src,
			sequenceContext?.cumulatedFrom,
			sequenceContext?.relativeFrom,
			sequenceContext?.durationInFrames,
		],
	);

	useLayoutEffect(() => {
		const timestamp = frame / fps;
		const durationInSeconds = 1 / fps;

		if (replaceWithHtml5Audio) {
			return;
		}

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
			logLevel,
			includeAudio: shouldRenderAudio,
			includeVideo: false,
			isClientSideRendering: environment.isClientSideRendering,
			loop: loop ?? false,
			audioStreamIndex: audioStreamIndex ?? 0,
			trimAfter,
			trimBefore,
			fps,
		})
			.then((result) => {
				if (result.type === 'unknown-container-format') {
					if (disallowFallbackToHtml5Audio) {
						cancelRender(
							new Error(
								`Unknown container format ${src}, and 'disallowFallbackToHtml5Audio' was set. Failing the render.`,
							),
						);
					}

					Internals.Log.warn(
						{logLevel, tag: '@remotion/media'},
						`Unknown container format for ${src} (Supported formats: https://www.remotion.dev/docs/mediabunny/formats), falling back to <Html5Audio>`,
					);
					setReplaceWithHtml5Audio(true);
					return;
				}

				if (result.type === 'cannot-decode') {
					if (disallowFallbackToHtml5Audio) {
						cancelRender(
							new Error(
								`Cannot decode ${src}, and 'disallowFallbackToHtml5Audio' was set. Failing the render.`,
							),
						);
					}

					Internals.Log.warn(
						{logLevel, tag: '@remotion/media'},
						`Cannot decode ${src}, falling back to <Html5Audio>`,
					);
					setReplaceWithHtml5Audio(true);
					return;
				}

				if (result.type === 'network-error') {
					if (disallowFallbackToHtml5Audio) {
						cancelRender(
							new Error(
								`Cannot decode ${src}, and 'disallowFallbackToHtml5Audio' was set. Failing the render.`,
							),
						);
					}

					Internals.Log.warn(
						{logLevel, tag: '@remotion/media'},
						`Network error fetching ${src}, falling back to <Html5Audio>`,
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
						frame: absoluteFrame,
						timestamp: audio.timestamp,
						duration: (audio.numberOfFrames / TARGET_SAMPLE_RATE) * 1_000_000,
						toneFrequency: toneFrequency ?? 1,
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
		disallowFallbackToHtml5Audio,
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
		audioStreamIndex,
		toneFrequency,
		trimAfter,
		trimBefore,
		replaceWithHtml5Audio,
	]);

	if (replaceWithHtml5Audio) {
		return (
			<Html5Audio
				src={src}
				playbackRate={playbackRate}
				muted={muted}
				loop={loop}
				volume={volumeProp}
				delayRenderRetries={delayRenderRetries}
				delayRenderTimeoutInMilliseconds={delayRenderTimeoutInMilliseconds}
				style={style}
				loopVolumeCurveBehavior={loopVolumeCurveBehavior}
				audioStreamIndex={audioStreamIndex}
				useWebAudioApi={fallbackHtml5AudioProps?.useWebAudioApi}
				onError={fallbackHtml5AudioProps?.onError}
				toneFrequency={toneFrequency}
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
