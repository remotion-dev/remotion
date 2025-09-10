import {getDataTypeForAudioFormat} from './data-types';
import {isPlanarFormat} from './is-planar-format';
import {resampleAudioData} from './resample-audiodata';

export type ConvertAudioDataOptions = {
	audioData: AudioData;
	newSampleRate: number;
	format: AudioSampleFormat | null;
	trimStartInSeconds: number;
	trimEndInSeconds: number;
	targetNumberOfChannels: number;
};
/**
 * Converts an `AudioData` object to a new `AudioData` object with a different sample rate or format.
 * @see [Documentation](https://remotion.dev/docs/webcodecs/convert-audiodata)
 */
export const convertAudioData = ({
	audioData,
	newSampleRate,
	format,
	trimStartInSeconds,
	trimEndInSeconds,
	targetNumberOfChannels,
}: ConvertAudioDataOptions) => {
	const {
		numberOfChannels: srcNumberOfChannels,
		sampleRate: currentSampleRate,
		numberOfFrames,
	} = audioData;
	const ratio = currentSampleRate / newSampleRate;

	const frameOffset = Math.round(trimStartInSeconds * audioData.sampleRate);
	const frameCount =
		numberOfFrames -
		Math.round((trimEndInSeconds + trimStartInSeconds) * audioData.sampleRate);

	const newNumberOfFrames = Math.floor(frameCount / ratio);

	if (newNumberOfFrames === 0) {
		throw new Error(
			'Cannot resample - the given sample rate would result in less than 1 sample',
		);
	}

	if (newSampleRate < 3000 || newSampleRate > 768000) {
		throw new Error('newSampleRate must be between 3000 and 768000');
	}

	if (!format) {
		throw new Error('AudioData format is not set');
	}

	if (
		format === audioData.format &&
		newNumberOfFrames === numberOfFrames &&
		trimStartInSeconds === 0 &&
		trimEndInSeconds === 0
	) {
		return audioData.clone();
	}

	const DataType = getDataTypeForAudioFormat(format);

	const isPlanar = isPlanarFormat(format);
	const planes = isPlanar ? srcNumberOfChannels : 1;

	const srcChannels = new Array(planes)
		.fill(true)
		.map(() => new DataType((isPlanar ? 1 : srcNumberOfChannels) * frameCount));

	for (let i = 0; i < planes; i++) {
		audioData.copyTo(srcChannels[i], {
			planeIndex: i,
			format,
			frameOffset,
			frameCount,
		});
	}

	const data = new DataType(newNumberOfFrames * targetNumberOfChannels);
	const chunkSize = frameCount / newNumberOfFrames;

	const timestamp = Math.round(
		audioData.timestamp + trimStartInSeconds * 1_000_000,
	);

	if (
		newNumberOfFrames === frameCount &&
		targetNumberOfChannels === srcNumberOfChannels
	) {
		let offset = 0;
		for (let i = 0; i < planes; i++) {
			data.set(srcChannels[i], offset);
			offset += srcChannels[i].length;
		}

		return new AudioData({
			data,
			format,
			numberOfChannels: targetNumberOfChannels,
			numberOfFrames: newNumberOfFrames,
			sampleRate: newSampleRate,
			timestamp,
		});
	}

	resampleAudioData({
		srcNumberOfChannels,
		srcChannels,
		data,
		newNumberOfFrames,
		chunkSize,
		isPlanar,
	});

	const newAudioData = new AudioData({
		data,
		format,
		numberOfChannels: targetNumberOfChannels,
		numberOfFrames: newNumberOfFrames,
		sampleRate: newSampleRate,
		timestamp,
	});

	return newAudioData;
};
