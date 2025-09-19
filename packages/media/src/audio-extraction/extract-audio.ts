import type {AudioSample} from 'mediabunny';
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
	timeInSeconds,
	durationInSeconds,
	volume,
}: {
	src: string;
	timeInSeconds: number;
	durationInSeconds: number;
	volume: number;
}): Promise<PcmS16AudioData | null> => {
	console.time('extractAudio');
	if (!sinkPromises[src]) {
		sinkPromises[src] = getSinks(src);
	}

	const {audio, actualMatroskaTimestamps, isMatroska} = await sinkPromises[src];

	if (audio === null) {
		console.timeEnd('extractAudio');

		return null;
	}

	// https://discord.com/channels/@me/1409810025844838481/1415028953093111870
	// Audio frames might have dependencies on previous and next frames so we need to decode a bit more
	// and then discard it.
	// The worst case seems to be FLAC files with a 65'535 sample window, which would be 1486.0ms at 44.1Khz.
	// So let's set a threshold of 1.5 seconds.

	const extraThreshold = 1.5;

	// Matroska timestamps are not accurate unless we start from the beginning
	// So for matroska, we need to decode all samples :(

	// https://github.com/Vanilagy/mediabunny/issues/105
	const sampleIterator = audio.sampleSink.samples(
		isMatroska ? 0 : Math.max(0, timeInSeconds - extraThreshold),
		timeInSeconds + durationInSeconds,
	);
	const samples: AudioSample[] = [];

	for await (const sample of sampleIterator) {
		const realTimestamp = actualMatroskaTimestamps.getRealTimestamp(
			sample.timestamp,
		);

		if (realTimestamp !== null && realTimestamp !== sample.timestamp) {
			sample.setTimestamp(realTimestamp);
		}

		actualMatroskaTimestamps.observeTimestamp(sample.timestamp);
		actualMatroskaTimestamps.observeTimestamp(
			sample.timestamp + sample.duration,
		);
		if (sample.timestamp + sample.duration - 0.0000000001 <= timeInSeconds) {
			continue;
		}

		if (sample.timestamp >= timeInSeconds + durationInSeconds - 0.0000000001) {
			continue;
		}

		samples.push(sample);
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
			sample.close();
			continue;
		}

		// Less than 1 sample would be included - we did not need it after all!
		if (sample.timestamp + sample.duration <= timeInSeconds) {
			sample.close();
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
			sample.close();

			continue;
		}

		audioDataArray.push(audioData);

		sample.close();
	}

	if (audioDataArray.length === 0) {
		console.timeEnd('extractAudio');

		return null;
	}

	const combined = combineAudioDataAndClosePrevious(audioDataArray);

	console.timeEnd('extractAudio');

	return combined;
};
