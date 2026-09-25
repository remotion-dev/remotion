import {type LogLevel} from 'remotion';
import type {MediaCache} from '../caches';
import {combineAudioDataAndClosePrevious} from '../convert-audiodata/combine-audiodata';
import {
	convertAudioDataToS16,
	fixFloatingPoint,
	resamplePcmS16AudioData,
	type PcmS16AudioData,
	type UnresampledPcmS16AudioData,
} from '../convert-audiodata/convert-audiodata';
import {getTimeInSeconds} from '../get-time-in-seconds';
import {
	isNetworkError,
	isUnsupportedConfigurationError,
} from '../is-type-of-error';
import type {MediaRequestInit} from '../request-init';

type ExtractAudioReturnType = Awaited<ReturnType<typeof extractAudioInternal>>;

type ExtractAudioParams = {
	sampleRate: number;
	src: string;
	timeInSeconds: number;
	durationInSeconds: number;
	logLevel: LogLevel;
	loop: boolean;
	playbackRate: number;
	audioStreamIndex: number | null;
	trimBefore: number | undefined;
	trimAfter: number | undefined;
	fps: number;
	maxCacheSize: number;
	credentials: RequestCredentials | undefined;
	requestInit?: MediaRequestInit;
	mediaCache: MediaCache;
};

const extractAudioInternal = async ({
	sampleRate,
	src,
	timeInSeconds: unloopedTimeInSeconds,
	durationInSeconds: durationNotYetApplyingPlaybackRate,
	logLevel,
	loop,
	playbackRate,
	audioStreamIndex,
	trimBefore,
	trimAfter,
	fps,
	maxCacheSize,
	credentials,
	requestInit,
	mediaCache,
}: ExtractAudioParams): Promise<
	| {
			data: PcmS16AudioData | null;
			durationInSeconds: number | null;
	  }
	| 'cannot-decode'
	| 'unknown-container-format'
	| 'network-error'
> => {
	const {getAudio, actualMatroskaTimestamps, isMatroska, getDuration} =
		await mediaCache.sinkManager.getSink(
			src,
			logLevel,
			credentials,
			requestInit,
		);

	let mediaDurationInSeconds: number | null = null;
	if (loop) {
		mediaDurationInSeconds = await getDuration();
	}

	const audio = await getAudio(audioStreamIndex);

	if (audio === 'network-error') {
		return 'network-error';
	}

	if (audio === 'no-audio-track') {
		return {data: null, durationInSeconds: null};
	}

	if (audio === 'cannot-decode-audio') {
		return 'cannot-decode';
	}

	if (audio === 'unknown-container-format') {
		return 'unknown-container-format';
	}

	const timeInSeconds = getTimeInSeconds({
		loop,
		mediaDurationInSeconds,
		unloopedTimeInSeconds,
		src,
		trimAfter,
		playbackRate,
		trimBefore,
		fps,
		ifNoMediaDuration: 'fail',
	});
	if (timeInSeconds === null) {
		return {data: null, durationInSeconds: mediaDurationInSeconds};
	}

	try {
		const durationInSeconds = durationNotYetApplyingPlaybackRate * playbackRate;
		const loopStartInSeconds = (trimBefore ?? 0) / fps;
		const loopEndInSeconds =
			trimAfter === undefined
				? (mediaDurationInSeconds ?? Infinity)
				: trimAfter / fps;
		if (loop && loopEndInSeconds <= loopStartInSeconds) {
			throw new Error(
				`Cannot loop audio over an empty range (${loopStartInSeconds} to ${loopEndInSeconds})`,
			);
		}

		const audioDataArray: UnresampledPcmS16AudioData[] = [];
		let remainingDurationInSeconds = durationInSeconds;
		let segmentStartInSeconds = timeInSeconds;
		let pendingSilenceInSeconds = 0;
		const appendSilence = (
			silenceDurationInSeconds: number,
			numberOfChannels: number,
			sourceSampleRate: number,
		) => {
			const silenceFrames = Math.ceil(
				fixFloatingPoint(silenceDurationInSeconds * sourceSampleRate),
			);
			if (silenceFrames > 0) {
				audioDataArray.push({
					data: new Int16Array(silenceFrames * numberOfChannels),
					numberOfChannels,
					numberOfFrames: silenceFrames,
					sampleRate: sourceSampleRate,
					timestamp: timeInSeconds * 1_000_000,
					durationInMicroSeconds:
						(silenceFrames / sourceSampleRate) * 1_000_000,
				});
			}
		};

		while (remainingDurationInSeconds > 0.0000000001) {
			const segmentDurationInSeconds = loop
				? Math.min(
						remainingDurationInSeconds,
						loopEndInSeconds - segmentStartInSeconds,
					)
				: remainingDurationInSeconds;
			if (segmentDurationInSeconds <= 0) {
				segmentStartInSeconds = loopStartInSeconds;
				continue;
			}

			const sampleIterator = await mediaCache.audioManager.getIterator({
				src,
				timeInSeconds: segmentStartInSeconds,
				audioSampleSink: audio.sampleSink,
				isMatroska,
				actualMatroskaTimestamps,
				logLevel,
				maxCacheSize,
			});
			const samples = await sampleIterator.getSamples(
				segmentStartInSeconds,
				segmentDurationInSeconds,
			);
			mediaCache.audioManager.logOpenFrames();

			const segmentAudioData: UnresampledPcmS16AudioData[] = [];
			for (let i = 0; i < samples.length; i++) {
				const sample = samples[i];
				const segmentEndInSeconds =
					segmentStartInSeconds + segmentDurationInSeconds;

				// Less than 1 sample would be included - we did not need it after all!
				if (
					Math.abs(sample.timestamp - segmentEndInSeconds) * sample.sampleRate <
					1
				) {
					continue;
				}

				// Less than 1 sample would be included - we did not need it after all!
				if (sample.timestamp + sample.duration <= segmentStartInSeconds) {
					continue;
				}

				const isFirstSample = i === 0;
				const isLastSample = i === samples.length - 1;

				const audioDataRaw = sample.toAudioData();

				// amount of samples to shave from start and end
				let trimStartInSeconds = 0;
				let trimEndInSeconds = 0;
				let leadingSilence: UnresampledPcmS16AudioData | null = null;

				if (isFirstSample) {
					trimStartInSeconds = fixFloatingPoint(
						segmentStartInSeconds - sample.timestamp,
					);

					if (trimStartInSeconds < 0) {
						const silenceFrames = Math.ceil(
							fixFloatingPoint(-trimStartInSeconds * audioDataRaw.sampleRate),
						);
						leadingSilence = {
							data: new Int16Array(
								silenceFrames * audioDataRaw.numberOfChannels,
							),
							numberOfChannels: audioDataRaw.numberOfChannels,
							numberOfFrames: silenceFrames,
							sampleRate: audioDataRaw.sampleRate,
							timestamp: segmentStartInSeconds * 1_000_000,
							durationInMicroSeconds:
								(silenceFrames / audioDataRaw.sampleRate) * 1_000_000,
						};
						trimStartInSeconds = 0;
					}
				}

				if (isLastSample) {
					trimEndInSeconds =
						// clamp to 0 in case the audio ends early
						Math.max(
							0,
							sample.timestamp + sample.duration - segmentEndInSeconds,
						);
				}

				const audioData = convertAudioDataToS16({
					audioData: audioDataRaw,
					trimStartInSeconds,
					trimEndInSeconds,
					audioDataTimestamp: sample.timestamp,
					isLast: isLastSample,
				});
				audioDataRaw.close();

				if (audioData.numberOfFrames === 0) {
					continue;
				}

				if (leadingSilence) {
					segmentAudioData.push(leadingSilence);
				}

				segmentAudioData.push(audioData);
			}

			if (segmentAudioData.length > 0) {
				const {numberOfChannels, sampleRate: sourceSampleRate} =
					segmentAudioData[0];
				// Preserve silence at the end of a loop pass before appending audio
				// from the next pass.
				appendSilence(
					pendingSilenceInSeconds,
					numberOfChannels,
					sourceSampleRate,
				);

				audioDataArray.push(...segmentAudioData);
				const segmentFrames = segmentAudioData.reduce(
					(sum, data) => sum + data.numberOfFrames,
					0,
				);
				pendingSilenceInSeconds = Math.max(
					0,
					segmentDurationInSeconds - segmentFrames / sourceSampleRate,
				);
			} else {
				pendingSilenceInSeconds += segmentDurationInSeconds;
			}

			remainingDurationInSeconds -= segmentDurationInSeconds;
			segmentStartInSeconds = loopStartInSeconds;
		}

		if (audioDataArray.length === 0) {
			return {data: null, durationInSeconds: mediaDurationInSeconds};
		}

		if (loop && pendingSilenceInSeconds > 0) {
			const {numberOfChannels, sampleRate: sourceSampleRate} =
				audioDataArray[0];
			appendSilence(
				pendingSilenceInSeconds,
				numberOfChannels,
				sourceSampleRate,
			);
		}

		const combined = combineAudioDataAndClosePrevious(audioDataArray);
		const resampled = resamplePcmS16AudioData({
			targetSampleRate: sampleRate,
			audioData: combined,
			playbackRate,
			isLast: true,
		});

		return {data: resampled, durationInSeconds: mediaDurationInSeconds};
	} catch (err) {
		const error = err as Error;
		if (isNetworkError(error)) {
			return 'network-error';
		}

		if (isUnsupportedConfigurationError(error)) {
			return 'cannot-decode';
		}

		throw err;
	}
};

export const extractAudio = (
	params: ExtractAudioParams,
): Promise<ExtractAudioReturnType> => {
	return params.mediaCache.queueAudioExtraction(() =>
		extractAudioInternal(params),
	);
};
