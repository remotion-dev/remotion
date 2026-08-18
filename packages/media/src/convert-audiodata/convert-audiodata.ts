import {
	resampleAudioData,
	TARGET_NUMBER_OF_CHANNELS,
	getTargetSampleRate,
} from './resample-audiodata';

export type ConvertAudioDataOptions = {
	audioData: AudioData;
	trimStartInSeconds: number;
	trimEndInSeconds: number;
	playbackRate: number;
	audioDataTimestamp: number;
	isLast: boolean;
};

const FORMAT: AudioSampleFormat = 's16';

export type PcmS16AudioData = {
	data: Int16Array;
	numberOfFrames: number;
	timestamp: number;
	durationInMicroSeconds: number;
};

export type UnresampledPcmS16AudioData = PcmS16AudioData & {
	numberOfChannels: number;
	sampleRate: number;
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

export const convertAudioDataToS16 = ({
	audioData,
	trimStartInSeconds,
	trimEndInSeconds,
	audioDataTimestamp,
	isLast,
}: Omit<
	ConvertAudioDataOptions,
	'playbackRate'
>): UnresampledPcmS16AudioData => {
	const {
		numberOfChannels: srcNumberOfChannels,
		sampleRate: currentSampleRate,
		numberOfFrames,
	} = audioData;

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

	const srcChannels = new Int16Array(srcNumberOfChannels * frameCount);

	// https://github.com/remotion-dev/remotion/issues/6493
	const isF32 = audioData.format === 'f32' || audioData.format === 'f32-planar';

	if (isF32) {
		// Firefox decodes as f32 — normalize to f32-planar first so the
		// final s16 conversion always starts from the same representation.
		const bytesPerPlane = frameCount * 4;
		const f32Buffer = new ArrayBuffer(srcNumberOfChannels * bytesPerPlane);
		for (let ch = 0; ch < srcNumberOfChannels; ch++) {
			audioData.copyTo(
				new Float32Array(f32Buffer, ch * bytesPerPlane, frameCount),
				{planeIndex: ch, frameOffset, frameCount, format: 'f32-planar'},
			);
		}

		const f32AudioData = new AudioData({
			format: 'f32-planar',
			sampleRate: currentSampleRate,
			numberOfFrames: frameCount,
			numberOfChannels: srcNumberOfChannels,
			timestamp: audioData.timestamp,
			data: f32Buffer,
		});

		f32AudioData.copyTo(srcChannels, {
			planeIndex: 0,
			format: FORMAT,
			frameOffset: 0,
			frameCount,
		});
		f32AudioData.close();
	} else {
		// Chrome decodes as s16-planar — copy directly to interleaved s16.
		audioData.copyTo(srcChannels, {
			planeIndex: 0,
			format: FORMAT,
			frameOffset,
			frameCount,
		});
	}

	const timestampOffsetMicroseconds =
		(frameOffset / audioData.sampleRate) * 1_000_000;

	return {
		data: srcChannels,
		numberOfChannels: srcNumberOfChannels,
		numberOfFrames: frameCount,
		sampleRate: currentSampleRate,
		timestamp:
			audioDataTimestamp * 1_000_000 +
			fixFloatingPoint(timestampOffsetMicroseconds),
		durationInMicroSeconds: fixFloatingPoint(
			(frameCount / currentSampleRate) * 1_000_000,
		),
	};
};

export const resamplePcmS16AudioData = ({
	audioData,
	playbackRate,
	isLast,
}: {
	audioData: UnresampledPcmS16AudioData;
	playbackRate: number;
	isLast: boolean;
}): PcmS16AudioData => {
	const ratio = audioData.sampleRate / getTargetSampleRate();
	const newNumberOfFrames = isLast
		? ceilButNotIfFloatingPointIssue(
				audioData.numberOfFrames / ratio / playbackRate,
			)
		: Math.round(audioData.numberOfFrames / ratio / playbackRate);

	if (newNumberOfFrames === 0) {
		throw new Error(
			'Cannot resample - the given sample rate would result in less than 1 sample',
		);
	}

	if (
		newNumberOfFrames === audioData.numberOfFrames &&
		TARGET_NUMBER_OF_CHANNELS === audioData.numberOfChannels &&
		playbackRate === 1
	) {
		return {
			data: audioData.data,
			numberOfFrames: newNumberOfFrames,
			timestamp: audioData.timestamp,
			durationInMicroSeconds: fixFloatingPoint(
				(newNumberOfFrames / getTargetSampleRate()) * 1_000_000,
			),
		};
	}

	const data = new Int16Array(newNumberOfFrames * TARGET_NUMBER_OF_CHANNELS);
	const chunkSize = audioData.numberOfFrames / newNumberOfFrames;

	resampleAudioData({
		srcNumberOfChannels: audioData.numberOfChannels,
		sourceChannels: audioData.data,
		destination: data,
		targetFrames: newNumberOfFrames,
		chunkSize,
	});

	const newAudioData: PcmS16AudioData = {
		data,
		numberOfFrames: newNumberOfFrames,
		timestamp: audioData.timestamp,
		durationInMicroSeconds: fixFloatingPoint(
			(newNumberOfFrames / getTargetSampleRate()) * 1_000_000,
		),
	};

	return newAudioData;
};

export const convertAudioData = (
	options: ConvertAudioDataOptions,
): PcmS16AudioData => {
	const audioData = convertAudioDataToS16(options);

	return resamplePcmS16AudioData({
		audioData,
		playbackRate: options.playbackRate,
		isLast: options.isLast,
	});
};
