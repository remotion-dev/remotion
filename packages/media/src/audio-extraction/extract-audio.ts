import {type LogLevel} from 'remotion';
import {audioManager} from '../caches';
import {combineAudioDataAndClosePrevious} from '../convert-audiodata/combine-audiodata';
import type {PcmS16AudioData} from '../convert-audiodata/convert-audiodata';
import {convertAudioData} from '../convert-audiodata/convert-audiodata';
import {
	TARGET_NUMBER_OF_CHANNELS,
	TARGET_SAMPLE_RATE,
} from '../convert-audiodata/resample-audiodata';
import {sinkPromises} from '../video-extraction/extract-frame';
import {getSinks} from '../video-extraction/get-frames-since-keyframe';

export const extractAudio = async ({
	src,
	timeInSeconds: unloopedTimeInSeconds,
	durationInSeconds,
	volume,
	logLevel,
	loop,
}: {
	src: string;
	timeInSeconds: number;
	durationInSeconds: number;
	volume: number;
	logLevel: LogLevel;
	loop: boolean;
}): Promise<PcmS16AudioData | null> => {
	if (!sinkPromises[src]) {
		sinkPromises[src] = getSinks(src);
	}

	const {audio, actualMatroskaTimestamps, isMatroska, getDuration} =
		await sinkPromises[src];

	if (audio === null) {
		return null;
	}

	const timeInSeconds = loop
		? unloopedTimeInSeconds % (await getDuration())
		: unloopedTimeInSeconds;

	const sampleIterator = await audioManager.getIterator({
		src,
		timeInSeconds,
		audioSampleSink: audio.sampleSink,
		isMatroska,
		actualMatroskaTimestamps,
		logLevel,
	});

	const samples = await sampleIterator.getSamples(
		timeInSeconds,
		durationInSeconds,
	);

	audioManager.logOpenFrames(logLevel);

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

		// TODO: Apply playback rate
		// TODO: Apply tone frequency

		if (isFirstSample) {
			trimStartInSeconds = timeInSeconds - sample.timestamp;
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
			newSampleRate: TARGET_SAMPLE_RATE,
			trimStartInSeconds,
			trimEndInSeconds,
			targetNumberOfChannels: TARGET_NUMBER_OF_CHANNELS,
			volume,
		});
		audioDataRaw.close();

		if (audioData.numberOfFrames === 0) {
			continue;
		}

		audioDataArray.push(audioData);
	}

	if (audioDataArray.length === 0) {
		return null;
	}

	const combined = combineAudioDataAndClosePrevious(audioDataArray);

	return combined;
};
