import {type LogLevel} from 'remotion';
import type {MediaCache} from '../caches';
import {
	copyAudioDataToInterleavedS16,
	fixFloatingPoint,
	type PcmS16AudioData,
} from '../convert-audiodata/convert-audiodata';
import {
	getTargetSampleRate,
	resampleAudioData,
	TARGET_NUMBER_OF_CHANNELS,
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
		const targetSampleRate = getTargetSampleRate();
		const targetFrames = Math.ceil(
			fixFloatingPoint(durationNotYetApplyingPlaybackRate * targetSampleRate),
		);
		const firstSourceTime = timeInSeconds;
		const lastSourceTime =
			timeInSeconds + ((targetFrames - 1) / targetSampleRate) * playbackRate;
		const sourcePadding = Math.max(
			0.001,
			(Math.abs(playbackRate) * 2) / targetSampleRate,
		);
		const requestedStart = Math.max(0, firstSourceTime - sourcePadding);
		const requestedEnd = lastSourceTime + sourcePadding;
		const sampleIterator = await mediaCache.audioManager.getIterator({
			src,
			timeInSeconds: requestedStart,
			audioSampleSink: audio.sampleSink,
			isMatroska,
			actualMatroskaTimestamps,
			logLevel,
			maxCacheSize,
		});
		const samples = await sampleIterator.getSamples(
			requestedStart,
			requestedEnd - requestedStart,
		);

		mediaCache.audioManager.logOpenFrames();

		if (samples.length === 0) {
			return {data: null, durationInSeconds: mediaDurationInSeconds};
		}

		const sourceBufferStartTime = samples[0].timestamp;
		const decoded = samples.map((sample) => {
			const audioData = sample.toAudioData();
			try {
				return {
					data: copyAudioDataToInterleavedS16({
						audioData,
						frameOffset: 0,
						frameCount: audioData.numberOfFrames,
					}),
					frameOffset: Math.round(
						fixFloatingPoint(
							(sample.timestamp - sourceBufferStartTime) * audioData.sampleRate,
						),
					),
					numberOfChannels: audioData.numberOfChannels,
					numberOfFrames: audioData.numberOfFrames,
					sampleRate: audioData.sampleRate,
				};
			} finally {
				audioData.close();
			}
		});

		const sourceSampleRate = decoded[0].sampleRate;
		const sourceNumberOfChannels = decoded[0].numberOfChannels;
		const sourceFrames = Math.max(
			...decoded.map((chunk) => chunk.frameOffset + chunk.numberOfFrames),
		);
		const source = new Int16Array(sourceFrames * sourceNumberOfChannels);
		for (const chunk of decoded) {
			if (
				chunk.sampleRate !== sourceSampleRate ||
				chunk.numberOfChannels !== sourceNumberOfChannels
			) {
				throw new Error(`Audio format changed while decoding ${src}`);
			}

			source.set(chunk.data, chunk.frameOffset * sourceNumberOfChannels);
		}

		const destination = new Int16Array(
			targetFrames * TARGET_NUMBER_OF_CHANNELS,
		);
		resampleAudioData({
			srcNumberOfChannels: sourceNumberOfChannels,
			sourceChannels: source,
			destination,
			targetFrames,
			sourceStart: (firstSourceTime - sourceBufferStartTime) * sourceSampleRate,
			chunkSize: (sourceSampleRate * playbackRate) / targetSampleRate,
		});

		return {
			data: {
				data: destination,
				numberOfFrames: targetFrames,
				timestamp: fixFloatingPoint(timeInSeconds * 1_000_000),
				durationInMicroSeconds: fixFloatingPoint(
					(targetFrames / targetSampleRate) * 1_000_000,
				),
			},
			durationInSeconds: mediaDurationInSeconds,
		};
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
