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
import {useMaxMediaCacheSize} from '../caches';
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
	logLevel: overriddenLogLevel,
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
	onError,
}) => {
	const defaultLogLevel = Internals.useLogLevel();
	const logLevel = overriddenLogLevel ?? defaultLogLevel;
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
			`media-audio-${random(
				src,
			)}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.relativeFrom}-${sequenceContext?.durationInFrames}`,
		[
			src,
			sequenceContext?.cumulatedFrom,
			sequenceContext?.relativeFrom,
			sequenceContext?.durationInFrames,
		],
	);

	const maxCacheSize = useMaxMediaCacheSize(logLevel);

	const audioEnabled = Internals.useAudioEnabled();

	useLayoutEffect(() => {
		const timestamp = frame / fps;
		const durationInSeconds = 1 / fps;

		const shouldRenderAudio = (() => {
			if (!audioEnabled) {
				return false;
			}

			if (muted) {
				return false;
			}

			return true;
		})();

		if (!shouldRenderAudio) {
			return;
		}

		if (replaceWithHtml5Audio) {
			return;
		}

		const newHandle = delayRender(`Extracting audio for frame ${frame}`, {
			retries: delayRenderRetries ?? undefined,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
		});

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
			maxCacheSize,
		})
			.then((result) => {
				const handleError = (
					error: Error,
					clientSideError: Error,
					fallbackMessage: string,
				) => {
					if (environment.isClientSideRendering) {
						cancelRender(clientSideError);
						return;
					}

					if (onError) {
						const action = onError({error});
						if (action === 'fail') {
							cancelRender(error);
							return;
						}

						// action === 'fallback'
						Internals.Log.warn(
							{logLevel, tag: '@remotion/media'},
							fallbackMessage,
						);
						setReplaceWithHtml5Audio(true);
						return;
					}

					if (disallowFallbackToHtml5Audio) {
						cancelRender(error);
						return;
					}

					Internals.Log.warn(
						{logLevel, tag: '@remotion/media'},
						fallbackMessage,
					);
					setReplaceWithHtml5Audio(true);
				};

				if (result.type === 'unknown-container-format') {
					handleError(
						new Error(`Unknown container format ${src}.`),
						new Error(
							`Cannot render audio "${src}": Unknown container format. See supported formats: https://www.remotion.dev/docs/mediabunny/formats`,
						),
						`Unknown container format for ${src} (Supported formats: https://www.remotion.dev/docs/mediabunny/formats), falling back to <Html5Audio>`,
					);
					return;
				}

				if (result.type === 'cannot-decode') {
					handleError(
						new Error(`Cannot decode ${src}.`),
						new Error(
							`Cannot render audio "${src}": The audio could not be decoded by the browser.`,
						),
						`Cannot decode ${src}, falling back to <Html5Audio>`,
					);
					return;
				}

				if (result.type === 'cannot-decode-alpha') {
					throw new Error(
						`Cannot decode alpha component for ${src}, and 'disallowFallbackToHtml5Audio' was set. But this should never happen, since you used the <Audio> tag. Please report this as a bug.`,
					);
				}

				if (result.type === 'network-error') {
					handleError(
						new Error(`Network error fetching ${src}.`),
						new Error(
							`Cannot render audio "${src}": Network error while fetching the audio (possibly CORS).`,
						),
						`Network error fetching ${src}, falling back to <Html5Audio>`,
					);
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
						audio: environment.isClientSideRendering
							? audio.data
							: Array.from(audio.data),
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
		maxCacheSize,
		audioEnabled,
		onError,
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
