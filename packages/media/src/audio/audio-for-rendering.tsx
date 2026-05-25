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
import type {PcmS16AudioData} from '../convert-audiodata/convert-audiodata';
import {getTargetSampleRate} from '../convert-audiodata/resample-audiodata';
import {frameForVolumeProp} from '../looped-frame';
import {callOnErrorAndResolve} from '../on-error';
import {extractFrameViaBroadcastChannel} from '../video-extraction/extract-frame-via-broadcast-channel';
import type {AudioProps} from './props';

const NUMBER_OF_CHANNELS = 2;

const isAlmostZero = (value: number) => {
	return Math.abs(value) < 0.0000001;
};

const roundSamples = (seconds: number) => {
	return Math.round(seconds * getTargetSampleRate());
};

const padAudioToFullFrame = ({
	audio,
	fps,
	padStartInSeconds,
	padEndInSeconds,
}: {
	audio: PcmS16AudioData;
	fps: number;
	padStartInSeconds: number;
	padEndInSeconds: number;
}): PcmS16AudioData => {
	if (isAlmostZero(padStartInSeconds) && isAlmostZero(padEndInSeconds)) {
		return audio;
	}

	const expectedFrames = Math.round(getTargetSampleRate() / fps);
	const target = new Int16Array(expectedFrames * NUMBER_OF_CHANNELS);
	const offset = Math.min(
		Math.max(0, roundSamples(padStartInSeconds)),
		expectedFrames,
	);
	const requestedEndPadding = Math.max(0, roundSamples(padEndInSeconds));
	const maxFramesToCopy = Math.max(
		0,
		expectedFrames - offset - requestedEndPadding,
	);
	const framesToCopy = Math.min(audio.numberOfFrames, maxFramesToCopy);

	target.set(
		audio.data.subarray(0, framesToCopy * NUMBER_OF_CHANNELS),
		offset * NUMBER_OF_CHANNELS,
	);

	return {
		data: target,
		numberOfFrames: expectedFrames,
		timestamp: audio.timestamp - padStartInSeconds * 1_000_000,
		durationInMicroSeconds:
			(expectedFrames / getTargetSampleRate()) * 1_000_000,
	};
};

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
	credentials,
	requestInit,
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
	const [initialRequestInit] = useState(requestInit);

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

		const sequenceStartFrame =
			(sequenceContext?.cumulatedFrom ?? 0) +
			(sequenceContext?.relativeFrom ?? 0);
		const sequenceEndFrame =
			sequenceStartFrame + (sequenceContext?.durationInFrames ?? Infinity);
		const extractAndRegister = async ({
			sourceStartFrame,
			durationInFrames,
			frameToRegister,
			padStartInSeconds,
			padEndInSeconds,
			volumeFrame,
		}: {
			sourceStartFrame: number;
			durationInFrames: number;
			frameToRegister: number;
			padStartInSeconds: number;
			padEndInSeconds: number;
			volumeFrame: number;
		}) => {
			if (
				durationInFrames <= 0 ||
				(durationInFrames / fps) * getTargetSampleRate() < 1
			) {
				return;
			}

			const result = await extractFrameViaBroadcastChannel({
				src,
				timeInSeconds: sourceStartFrame / fps,
				durationInSeconds: durationInFrames / fps,
				playbackRate: playbackRate ?? 1,
				logLevel,
				includeAudio: shouldRenderAudio,
				includeVideo: false,
				isClientSideRendering: environment.isClientSideRendering,
				loop: loop ?? false,
				audioStreamIndex: audioStreamIndex ?? null,
				trimAfter,
				trimBefore,
				fps,
				maxCacheSize,
				credentials,
				requestInit: initialRequestInit,
			});

			const handleError = (
				error: Error,
				clientSideError: Error,
				fallbackMessage: string,
			) => {
				const [action, errorToUse] = callOnErrorAndResolve({
					onError,
					error,
					disallowFallback: disallowFallbackToHtml5Audio ?? false,
					isClientSideRendering: environment.isClientSideRendering,
					clientSideError,
				});
				if (action === 'fail') {
					cancelRender(errorToUse);
				}

				Internals.Log.warn({logLevel, tag: '@remotion/media'}, fallbackMessage);

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

			if (audio) {
				const volumePropsFrame = frameForVolumeProp({
					behavior: loopVolumeCurveBehavior ?? 'repeat',
					loop: loop ?? false,
					assetDurationInSeconds: assetDurationInSeconds ?? 0,
					fps,
					frame: volumeFrame,
					startsAt,
				});
				const volume = Internals.evaluateVolume({
					volume: volumeProp,
					frame: volumePropsFrame,
					mediaVolume: 1,
				});

				Internals.warnAboutTooHighVolume(volume);

				if (volume > 0) {
					const paddedAudio = padAudioToFullFrame({
						audio,
						fps,
						padStartInSeconds,
						padEndInSeconds,
					});
					applyVolume(paddedAudio.data, volume);
					registerRenderAsset({
						type: 'inline-audio',
						id,
						audio: environment.isClientSideRendering
							? paddedAudio.data
							: Array.from(paddedAudio.data),
						frame: frameToRegister,
						timestamp: paddedAudio.timestamp,
						duration:
							(paddedAudio.numberOfFrames / getTargetSampleRate()) * 1_000_000,
						toneFrequency: toneFrequency ?? 1,
					});
				}
			}
		};

		const frameStart = absoluteFrame;
		const frameEnd = absoluteFrame + 1;
		const audibleStart = Math.max(frameStart, sequenceStartFrame);
		const audibleEnd = Math.min(frameEnd, sequenceEndFrame);
		const extractionTasks: Promise<void>[] = [];

		if (audibleEnd > audibleStart) {
			extractionTasks.push(
				extractAndRegister({
					sourceStartFrame: audibleStart - sequenceStartFrame,
					durationInFrames: audibleEnd - audibleStart,
					frameToRegister: absoluteFrame,
					padStartInSeconds: (audibleStart - frameStart) / fps,
					padEndInSeconds: (frameEnd - audibleEnd) / fps,
					volumeFrame: audibleStart - sequenceStartFrame,
				}),
			);
		}

		const startsInPreviousFrame =
			sequenceStartFrame % 1 !== 0 &&
			absoluteFrame === Math.ceil(sequenceStartFrame);
		if (startsInPreviousFrame) {
			const previousFrameStart = absoluteFrame - 1;
			const previousFrameEnd = absoluteFrame;
			const previousAudibleStart = Math.max(
				previousFrameStart,
				sequenceStartFrame,
			);
			const previousAudibleEnd = Math.min(previousFrameEnd, sequenceEndFrame);
			if (previousAudibleEnd > previousAudibleStart) {
				extractionTasks.push(
					extractAndRegister({
						sourceStartFrame: previousAudibleStart - sequenceStartFrame,
						durationInFrames: previousAudibleEnd - previousAudibleStart,
						frameToRegister: previousFrameStart,
						padStartInSeconds:
							(previousAudibleStart - previousFrameStart) / fps,
						padEndInSeconds: (previousFrameEnd - previousAudibleEnd) / fps,
						volumeFrame: previousAudibleStart - sequenceStartFrame,
					}),
				);
			}
		}

		Promise.all(extractionTasks)
			.then(() => {
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
		credentials,
		initialRequestInit,
		sequenceContext?.cumulatedFrom,
		sequenceContext?.relativeFrom,
		sequenceContext?.durationInFrames,
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
				preservePitch={fallbackHtml5AudioProps?.preservePitch ?? true}
				name={name}
				showInTimeline={showInTimeline}
			/>
		);
	}

	return null;
};
