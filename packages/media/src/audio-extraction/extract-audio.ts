import {AudioSample} from 'mediabunny';
import {type LogLevel} from 'remotion';
import type {MediaCache} from '../caches';
import {combineAudioDataAndClosePrevious} from '../convert-audiodata/combine-audiodata';
import type {PcmS16AudioData} from '../convert-audiodata/convert-audiodata';
import {
	convertAudioData,
	fixFloatingPoint,
} from '../convert-audiodata/convert-audiodata';
import {
	TARGET_NUMBER_OF_CHANNELS,
	getTargetSampleRate,
} from '../convert-audiodata/resample-audiodata';
import {getTimeInSeconds} from '../get-time-in-seconds';
import {
	isNetworkError,
	isUnsupportedConfigurationError,
} from '../is-type-of-error';
import type {MediaRequestInit} from '../request-init';

type ExtractAudioReturnType = Awaited<ReturnType<typeof extractAudioInternal>>;

type ExtractAudioParams = {
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
		const sampleIterator = await mediaCache.audioManager.getIterator({
			src,
			timeInSeconds,
			audioSampleSink: audio.sampleSink,
			isMatroska,
			actualMatroskaTimestamps,
			logLevel,
			maxCacheSize,
		});

		const durationInSeconds = durationNotYetApplyingPlaybackRate * playbackRate;

		let samples = await sampleIterator.getSamples(
			timeInSeconds,
			durationInSeconds,
		);

		mediaCache.audioManager.logOpenFrames();

		let combinedSample: AudioSample | null = null;
		// Resample continuous PCM once instead of resetting at AudioSample boundaries.
		if (
			samples.length > 1 &&
			(samples[0].sampleRate !== getTargetSampleRate() || playbackRate !== 1)
		) {
			const first = samples[0];
			const numberOfFrames = samples.reduce(
				(sum, sample) => sum + sample.numberOfFrames,
				0,
			);
			const data = new Float32Array(numberOfFrames * first.numberOfChannels);
			let offset = 0;
			for (const sample of samples) {
				sample.copyTo(data.subarray(offset), {format: 'f32', planeIndex: 0});
				offset += sample.numberOfFrames * sample.numberOfChannels;
			}

			combinedSample = new AudioSample({
				data,
				format: 'f32',
				numberOfChannels: first.numberOfChannels,
				sampleRate: first.sampleRate,
				timestamp: first.timestamp,
			});
			samples = [combinedSample];
		}

		const audioDataArray: PcmS16AudioData[] = [];
		for (let i = 0; i < samples.length; i++) {
			const sample = samples[i];

			// Less than 1 sample would be included - we did not need it after all!
			if (
				Math.abs(sample.timestamp - (timeInSeconds + durationInSeconds)) *
					sample.sampleRate <
				1
			) {
				continue;
			}

			// Less than 1 sample would be included - we did not need it after all!
			if (sample.timestamp + sample.duration <= timeInSeconds) {
				continue;
			}

			const isFirstSample = i === 0;
			const isLastSample = i === samples.length - 1;

			const audioDataRaw = sample.toAudioData();
			if (sample === combinedSample) {
				combinedSample.close();
			}

			// amount of samples to shave from start and end
			let trimStartInSeconds = 0;
			let trimEndInSeconds = 0;
			let leadingSilence: PcmS16AudioData | null = null;

			if (isFirstSample) {
				trimStartInSeconds = fixFloatingPoint(timeInSeconds - sample.timestamp);

				if (trimStartInSeconds < 0) {
					const silenceFrames = Math.ceil(
						fixFloatingPoint(-trimStartInSeconds * getTargetSampleRate()),
					);
					leadingSilence = {
						data: new Int16Array(silenceFrames * TARGET_NUMBER_OF_CHANNELS),
						numberOfFrames: silenceFrames,
						timestamp: timeInSeconds * 1_000_000,
						durationInMicroSeconds:
							(silenceFrames / getTargetSampleRate()) * 1_000_000,
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
							(timeInSeconds + durationInSeconds),
					);
			}

			const audioData = convertAudioData({
				audioData: audioDataRaw,
				trimStartInSeconds,
				trimEndInSeconds,
				playbackRate,
				audioDataTimestamp: sample.timestamp,
				isLast: isLastSample,
			});
			audioDataRaw.close();

			if (audioData.numberOfFrames === 0) {
				continue;
			}

			if (leadingSilence) {
				audioDataArray.push(leadingSilence);
			}

			audioDataArray.push(audioData);
		}

		if (audioDataArray.length === 0) {
			return {data: null, durationInSeconds: mediaDurationInSeconds};
		}

		const combined = combineAudioDataAndClosePrevious(audioDataArray);

		return {data: combined, durationInSeconds: mediaDurationInSeconds};
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
