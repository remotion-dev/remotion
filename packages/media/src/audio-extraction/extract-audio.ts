import {type LogLevel} from 'remotion';
import {audioManager} from '../caches';
import {combineAudioDataAndClosePrevious} from '../convert-audiodata/combine-audiodata';
import type {PcmS16AudioData} from '../convert-audiodata/convert-audiodata';
import {convertAudioData} from '../convert-audiodata/convert-audiodata';
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

		if (isFirstSample) {
			trimStartInSeconds = timeInSeconds - sample.timestamp;
			if (trimStartInSeconds < 0 && trimStartInSeconds > -1e-10) {
				trimStartInSeconds = 0;
			}

			if (trimStartInSeconds < 0) {
				throw new Error(
					`trimStartInSeconds is negative: ${trimStartInSeconds}. ${JSON.stringify({timeInSeconds, ts: sample.timestamp, d: sample.duration, isFirstSample, isLastSample, durationInSeconds, i, st: samples.map((s) => s.timestamp)})}`,
				);
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
		});
		audioDataRaw.close();

		if (audioData.numberOfFrames === 0) {
			continue;
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
