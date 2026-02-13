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
	isLast: boolean;
};

export type PcmS16AudioData = {
	data: Int16Array;
	numberOfFrames: number;
	timestamp: number;
	durationInMicroSeconds: number;
};

export const fixFloatingPoint = (value: number) => {
	const decimal = Math.abs(value % 1);

	if (decimal < 0.0000001) {
		return value < 0 ? Math.ceil(value) : Math.floor(value);
	}

	if (decimal > 0.9999999) {
		return value < 0 ? Math.floor(value) : Math.ceil(value);
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
	isLast,
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
		numberOfFrames - trimEndInSeconds * audioData.sampleRate - frameOffset;

	const frameCount = isLast
		? ceilButNotIfFloatingPointIssue(unroundedFrameCount)
		: Math.round(unroundedFrameCount);

	const newNumberOfFrames = isLast
		? ceilButNotIfFloatingPointIssue(unroundedFrameCount / ratio / playbackRate)
		: Math.round(unroundedFrameCount / ratio / playbackRate);

	if (newNumberOfFrames === 0) {
		throw new Error(
			'Cannot resample - the given sample rate would result in less than 1 sample',
		);
	}

	// Always normalize through f32 to ensure consistent conversion across
	// browsers. Firefox decodes audio as f32 while Chrome decodes as s16-planar.
	// Relying on the browser's AudioData.copyTo() for the f32→s16 conversion
	// produces different results per browser. By always going through f32 and
	// converting to s16 ourselves, we guarantee identical output.
	const srcChannels = new Int16Array(srcNumberOfChannels * frameCount);
	const f32Temp = new Float32Array(frameCount);

	for (let ch = 0; ch < srcNumberOfChannels; ch++) {
		audioData.copyTo(f32Temp, {
			planeIndex: ch,
			frameOffset,
			frameCount,
			format: 'f32-planar',
		});
		for (let i = 0; i < frameCount; i++) {
			const clamped = Math.max(-1, Math.min(1, f32Temp[i]));
			srcChannels[i * srcNumberOfChannels + ch] = Math.max(
				-32768,
				Math.min(32767, Math.round(clamped * 32768)),
			);
		}
	}

	const data = new Int16Array(newNumberOfFrames * TARGET_NUMBER_OF_CHANNELS);
	const chunkSize = frameCount / newNumberOfFrames;

	const timestampOffsetMicroseconds =
		(frameOffset / audioData.sampleRate) * 1_000_000;

	if (
		newNumberOfFrames === frameCount &&
		TARGET_NUMBER_OF_CHANNELS === srcNumberOfChannels &&
		playbackRate === 1
	) {
		return {
			data: srcChannels,
			numberOfFrames: newNumberOfFrames,
			timestamp:
				audioDataTimestamp * 1_000_000 +
				fixFloatingPoint(timestampOffsetMicroseconds),
			durationInMicroSeconds: fixFloatingPoint(
				(newNumberOfFrames / TARGET_SAMPLE_RATE) * 1_000_000,
			),
		};
	}

	resampleAudioData({
		srcNumberOfChannels,
		sourceChannels: srcChannels,
		destination: data,
		targetFrames: newNumberOfFrames,
		chunkSize,
	});

	const newAudioData: PcmS16AudioData = {
		data,
		numberOfFrames: newNumberOfFrames,
		timestamp:
			audioDataTimestamp * 1_000_000 +
			fixFloatingPoint(timestampOffsetMicroseconds),
		durationInMicroSeconds: fixFloatingPoint(
			(newNumberOfFrames / TARGET_SAMPLE_RATE) * 1_000_000,
		),
	};

	return newAudioData;
};
