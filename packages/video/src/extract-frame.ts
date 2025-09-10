import type {AudioSample} from 'mediabunny';
import {combineAudioDataAndClosePrevious} from './convert-audiodata/combine-audiodata';
import {convertAudioData} from './convert-audiodata/convert-audiodata';
import {TARGET_NUMBER_OF_CHANNELS} from './convert-audiodata/resample-audiodata';
import {getSinks, type GetSink} from './get-frames-since-keyframe';
import {makeKeyframeManager} from './keyframe-manager';
import type {LogLevel} from './log';

const keyframeManager = makeKeyframeManager();
const sinkPromise: Record<string, Promise<GetSink>> = {};

export const extractFrame = async ({
	src,
	timeInSeconds,
	logLevel,
}: {
	src: string;
	timeInSeconds: number;
	logLevel: LogLevel;
}) => {
	if (!sinkPromise[src]) {
		sinkPromise[src] = getSinks(src);
	}

	const {video} = await sinkPromise[src];

	const keyframeBank = await keyframeManager.requestKeyframeBank({
		packetSink: video.packetSink,
		videoSampleSink: video.sampleSink,
		timestamp: timeInSeconds,
		src,
		logLevel,
	});

	const frame = await keyframeBank.getFrameFromTimestamp(timeInSeconds);

	return frame;
};

export const extractAudio = async ({
	src,
	timeInSeconds,
	durationInSeconds,
}: {
	src: string;
	timeInSeconds: number;
	logLevel: LogLevel;
	durationInSeconds: number;
}) => {
	if (!sinkPromise[src]) {
		sinkPromise[src] = getSinks(src);
	}

	const {audio, actualMatroskaTimestamps} = await sinkPromise[src];

	if (audio === null) {
		return null;
	}

	// TODO: Hardcodec
	const fps = 30;

	// https://discord.com/channels/@me/1409810025844838481/1415028953093111870
	// Audio frames might have dependencies on previous and next frames so we need to decode a bit more
	// and then discard it,
	const extraThreshold = 1 / fps;

	const sampleIterator = audio.sampleSink.samples(
		timeInSeconds - extraThreshold,
		timeInSeconds + durationInSeconds + extraThreshold,
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

	const audioDataArray: AudioData[] = [];
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

		// TODO: Apply volume
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
			newSampleRate: 48000,
			format: 's16',
			trimStartInSeconds,
			trimEndInSeconds,
			targetNumberOfChannels: TARGET_NUMBER_OF_CHANNELS,
		});

		if (audioData.numberOfFrames === 0) {
			audioData.close();
			sample.close();

			continue;
		}

		audioDataArray.push(audioData);

		sample.close();
	}

	if (audioDataArray.length === 0) {
		return null;
	}

	const combined = combineAudioDataAndClosePrevious(audioDataArray);

	return combined;
};

export const extractFrameAndAudio = async ({
	src,
	timeInSeconds,
	logLevel,
	durationInSeconds,
	shouldRenderAudio,
}: {
	src: string;
	timeInSeconds: number;
	logLevel: LogLevel;
	durationInSeconds: number;
	shouldRenderAudio: boolean;
}) => {
	const [frame, audio] = await Promise.all([
		extractFrame({
			src,
			timeInSeconds,
			logLevel,
		}),
		shouldRenderAudio
			? extractAudio({
					src,
					timeInSeconds,
					logLevel,
					durationInSeconds,
				})
			: null,
	]);

	return {
		frame,
		audio,
	};
};
