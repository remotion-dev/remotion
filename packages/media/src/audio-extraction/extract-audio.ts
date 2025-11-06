import {type LogLevel} from 'remotion';
import {audioManager} from '../caches';
import {combineAudioDataAndClosePrevious} from '../convert-audiodata/combine-audiodata';
import {
	convertAudioData,
	fixFloatingPoint,
	type PcmS16AudioData,
} from '../convert-audiodata/convert-audiodata';
import {
	TARGET_NUMBER_OF_CHANNELS,
	TARGET_SAMPLE_RATE,
} from '../convert-audiodata/resample-audiodata';
import {getSink} from '../get-sink';
import {getTimeInSeconds} from '../get-time-in-seconds';

type ExtractAudioReturnType = Awaited<ReturnType<typeof extractAudioInternal>>;

type ExtractAudioParams = {
	src: string;
	timeInSeconds: number;
	durationInSeconds: number;
	logLevel: LogLevel;
	loop: boolean;
	playbackRate: number;
	audioStreamIndex: number;
	trimBefore: number | undefined;
	trimAfter: number | undefined;
	fps: number;
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
}: ExtractAudioParams): Promise<
	| {
			data: PcmS16AudioData | null;
			durationInSeconds: number | null;
	  }
	| 'cannot-decode'
	| 'unknown-container-format'
> => {
	const {getAudio, actualMatroskaTimestamps, isMatroska, getDuration} =
		await getSink(src, logLevel);

	let mediaDurationInSeconds: number | null = null;
	if (loop) {
		mediaDurationInSeconds = await getDuration();
	}

	const audio = await getAudio(audioStreamIndex);

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

	const sampleIterator = await audioManager.getIterator({
		src,
		timeInSeconds,
		audioSampleSink: audio.sampleSink,
		isMatroska,
		actualMatroskaTimestamps,
		logLevel,
	});

	const durationInSeconds = durationNotYetApplyingPlaybackRate * playbackRate;

	const samples = await sampleIterator.getSamples(
		timeInSeconds,
		durationInSeconds,
	);

	audioManager.logOpenFrames();

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

		// amount of samples to shave from start and end
		let trimStartInSeconds = 0;
		let trimEndInSeconds = 0;
		let leadingSilence: PcmS16AudioData | null = null;

		if (isFirstSample) {
			trimStartInSeconds = timeInSeconds - sample.timestamp;
			if (trimStartInSeconds < 0) {
				const padSeconds = -trimStartInSeconds;
				const silenceFrames = Math.ceil(
					fixFloatingPoint(padSeconds * TARGET_SAMPLE_RATE),
				);

				if (silenceFrames > 0) {
					leadingSilence = {
						data: new Int16Array(silenceFrames * TARGET_NUMBER_OF_CHANNELS),
						numberOfFrames: silenceFrames,
						timestamp: Math.round(timeInSeconds * 1_000_000),
						durationInMicroSeconds: Math.round(
							(silenceFrames / TARGET_SAMPLE_RATE) * 1_000_000,
						),
					};
				}

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
};

let queue = Promise.resolve<ExtractAudioReturnType | undefined>(undefined);

export const extractAudio = (
	params: ExtractAudioParams,
): Promise<ExtractAudioReturnType> => {
	queue = queue.then(() => extractAudioInternal(params));

	return queue as Promise<ExtractAudioReturnType>;
};
