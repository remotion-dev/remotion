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
import {calculateEndTime, getTimeInSeconds} from '../get-time-in-seconds';
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
		const audioDataArray: UnresampledPcmS16AudioData[] = [];
		const loopStartInSeconds = (trimBefore ?? 0) / fps;
		const loopEndInSeconds = loop
			? calculateEndTime({
					mediaDurationInSeconds,
					ifNoMediaDuration: 'fail',
					src,
					trimAfter,
					trimBefore,
					fps,
				})
			: Infinity;
		let remainingDuration = durationNotYetApplyingPlaybackRate * playbackRate;
		let segmentTimeInSeconds = timeInSeconds;

		// A rendered frame can cross a trimmed loop boundary, or even several
		// complete loops. Join the source slices before resampling the output frame.
		while (remainingDuration > 0) {
			const durationInSeconds = Math.min(
				remainingDuration,
				loopEndInSeconds - segmentTimeInSeconds,
			);
			if (durationInSeconds <= 0) {
				break;
			}

			const sampleIterator = await mediaCache.audioManager.getIterator({
				src,
				timeInSeconds: segmentTimeInSeconds,
				audioSampleSink: audio.sampleSink,
				isMatroska,
				actualMatroskaTimestamps,
				logLevel,
				maxCacheSize,
			});

			const samples = await sampleIterator.getSamples(
				segmentTimeInSeconds,
				durationInSeconds,
			);

			mediaCache.audioManager.logOpenFrames();
			let segmentAudioFrames = 0;

			for (let i = 0; i < samples.length; i++) {
				const sample = samples[i];

				// Less than 1 sample would be included - we did not need it after all!
				if (
					Math.abs(
						sample.timestamp - (segmentTimeInSeconds + durationInSeconds),
					) *
						sample.sampleRate <
					1
				) {
					continue;
				}

				// Less than 1 sample would be included - we did not need it after all!
				if (sample.timestamp + sample.duration <= segmentTimeInSeconds) {
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
						segmentTimeInSeconds - sample.timestamp,
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
							timestamp: segmentTimeInSeconds * 1_000_000,
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
							sample.timestamp +
								sample.duration -
								(segmentTimeInSeconds + durationInSeconds),
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
					audioDataArray.push(leadingSilence);
					segmentAudioFrames += leadingSilence.numberOfFrames;
				}

				audioDataArray.push(audioData);
				segmentAudioFrames += audioData.numberOfFrames;
			}

			// A container can outlast its audio track. Preserve that silent tail
			// before appending the next loop, so the following audio stays in sync.
			const missingFrames =
				Math.ceil(fixFloatingPoint(durationInSeconds * audio.sampleRate)) -
				segmentAudioFrames;
			if (loop && missingFrames > 0) {
				audioDataArray.push({
					data: new Int16Array(missingFrames * audio.numberOfChannels),
					numberOfChannels: audio.numberOfChannels,
					numberOfFrames: missingFrames,
					sampleRate: audio.sampleRate,
					timestamp:
						(segmentTimeInSeconds + segmentAudioFrames / audio.sampleRate) *
						1_000_000,
					durationInMicroSeconds:
						(missingFrames / audio.sampleRate) * 1_000_000,
				});
			}

			remainingDuration -= durationInSeconds;
			segmentTimeInSeconds = loopStartInSeconds;
		}

		if (audioDataArray.length === 0) {
			return {data: null, durationInSeconds: mediaDurationInSeconds};
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
