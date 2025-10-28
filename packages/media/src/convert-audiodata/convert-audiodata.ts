import {
	resampleAudioData,
	TARGET_NUMBER_OF_CHANNELS,
	TARGET_SAMPLE_RATE,
} from './resample-audiodata';

export type ConvertAudioDataOptions = {
	audioData: AudioData;
	trimStartInSeconds: number;
	trimEndInSeconds: number;
	playbackRate: number;
	audioDataTimestamp: number;
};

const FORMAT: AudioSampleFormat = 's16';

export type PcmS16AudioData = {
	data: Int16Array;
	numberOfFrames: number;
	timestamp: number;
};

const fixFloatingPoint = (value: number) => {
	if (value % 1 < 0.0000001) {
		return Math.floor(value);
	}

	if (value % 1 > 0.9999999) {
		return Math.ceil(value);
	}

	return value;
};

const ceilButNotIfFloatingPointIssue = (value: number) => {
	const fixed = fixFloatingPoint(value);
	return Math.ceil(fixed);
};

export const convertAudioData = ({
	audioData,
	trimStartInSeconds,
	trimEndInSeconds,
	playbackRate,
	audioDataTimestamp,
}: ConvertAudioDataOptions): PcmS16AudioData => {
	const {
		numberOfChannels: srcNumberOfChannels,
		sampleRate: currentSampleRate,
		numberOfFrames,
	} = audioData;
	const ratio = currentSampleRate / TARGET_SAMPLE_RATE;

	// Always rounding down start timestamps and rounding up end durations
	// to ensure there are no gaps when the samples don't align
	// In @remotion/renderer inline audio mixing, we also round down the sample start
	// timestamp and round up the end timestamp
	// This might lead to overlapping, hopefully aligning perfectly!
	// Test case: https://github.com/remotion-dev/remotion/issues/5758

	const frameOffset = Math.floor(
		fixFloatingPoint(trimStartInSeconds * audioData.sampleRate),
	);
	const unroundedFrameCount =
		numberOfFrames -
		(trimEndInSeconds + trimStartInSeconds) * audioData.sampleRate;

	const frameCount = ceilButNotIfFloatingPointIssue(unroundedFrameCount);
	const newNumberOfFrames = ceilButNotIfFloatingPointIssue(
		unroundedFrameCount / ratio / playbackRate,
	);

	if (newNumberOfFrames === 0) {
		throw new Error(
			'Cannot resample - the given sample rate would result in less than 1 sample',
		);
	}

	const srcChannels = new Int16Array(srcNumberOfChannels * frameCount);

	audioData.copyTo(srcChannels, {
		planeIndex: 0,
		format: FORMAT,
		frameOffset,
		frameCount,
	});

	const data = new Int16Array(newNumberOfFrames * TARGET_NUMBER_OF_CHANNELS);
	const chunkSize = frameCount / newNumberOfFrames;

	if (
		newNumberOfFrames === frameCount &&
		TARGET_NUMBER_OF_CHANNELS === srcNumberOfChannels &&
		playbackRate === 1
	) {
		const timestampOffsetMicroseconds2 =
			(frameOffset / audioData.sampleRate) * 1_000_000;
		return {
			data: srcChannels,
			numberOfFrames: newNumberOfFrames,
			timestamp:
				audioDataTimestamp * 1_000_000 +
				fixFloatingPoint(timestampOffsetMicroseconds2),
		};
	}

	resampleAudioData({
		srcNumberOfChannels,
		sourceChannels: srcChannels,
		destination: data,
		targetFrames: newNumberOfFrames,
		chunkSize,
	});

	const timestampOffsetMicroseconds =
		(frameOffset / audioData.sampleRate) * 1_000_000;
	const calculatedTimestamp = fixFloatingPoint(
		audioDataTimestamp * 1_000_000 + timestampOffsetMicroseconds,
	);

	const newAudioData: PcmS16AudioData = {
		data,
		numberOfFrames: newNumberOfFrames,
		timestamp: calculatedTimestamp,
	};

	return newAudioData;
};
