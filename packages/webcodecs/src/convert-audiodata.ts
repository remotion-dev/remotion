import {getDataTypeForAudioFormat} from './audio-data/data-types';
import {isPlanarFormat} from './audio-data/is-planar-format';

const validateRange = (format: AudioSampleFormat, value: number) => {
	if (format === 'f32' || format === 'f32-planar') {
		if (value < -1 || value > 1) {
			throw new Error('All values in a Float32 array must be between -1 and 1');
		}
	}
};

export type ConvertAudioDataOptions = {
	audioData: AudioData;
	newSampleRate?: number;
	format?: AudioSampleFormat | null;
};
/**
 * Converts an `AudioData` object to a new `AudioData` object with a different sample rate or format.
 * @see [Documentation](https://remotion.dev/docs/webcodecs/convert-audiodata)
 */
export const convertAudioData = ({
	audioData,
	newSampleRate = audioData.sampleRate,
	format = audioData.format,
}: ConvertAudioDataOptions) => {
	const {
		numberOfChannels,
		sampleRate: currentSampleRate,
		numberOfFrames: currentNumberOfFrames,
	} = audioData;
	const ratio = currentSampleRate / newSampleRate;
	const newNumberOfFrames = Math.floor(currentNumberOfFrames / ratio);

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
		newNumberOfFrames === currentNumberOfFrames
	) {
		return audioData.clone();
	}

	const DataType = getDataTypeForAudioFormat(format);

	const isPlanar = isPlanarFormat(format);
	const planes = isPlanar ? numberOfChannels : 1;
	const srcChannels = new Array(planes)
		.fill(true)
		.map(
			() =>
				new DataType((isPlanar ? 1 : numberOfChannels) * currentNumberOfFrames),
		);

	for (let i = 0; i < planes; i++) {
		audioData.clone().copyTo(srcChannels[i], {
			planeIndex: i,
			format,
		});
	}

	const data = new DataType(newNumberOfFrames * numberOfChannels);
	const chunkSize = currentNumberOfFrames / newNumberOfFrames;

	for (
		let newFrameIndex = 0;
		newFrameIndex < newNumberOfFrames;
		newFrameIndex++
	) {
		const start = Math.floor(newFrameIndex * chunkSize);
		const end = Math.max(Math.floor(start + chunkSize), start + 1);

		if (isPlanar) {
			for (
				let channelIndex = 0;
				channelIndex < numberOfChannels;
				channelIndex++
			) {
				const chunk = srcChannels[channelIndex].slice(start, end);

				const average =
					(chunk as Int32Array<ArrayBuffer>).reduce((a, b) => {
						return a + b;
					}, 0) / chunk.length;

				validateRange(format, average);

				data[newFrameIndex + channelIndex * newNumberOfFrames] = average;
			}
		} else {
			const sampleCountAvg = end - start;

			for (
				let channelIndex = 0;
				channelIndex < numberOfChannels;
				channelIndex++
			) {
				const items = [];
				for (let k = 0; k < sampleCountAvg; k++) {
					const num =
						srcChannels[0][(start + k) * numberOfChannels + channelIndex];
					items.push(num);
				}

				const average = items.reduce((a, b) => a + b, 0) / items.length;

				validateRange(format, average);

				data[newFrameIndex * numberOfChannels + channelIndex] = average;
			}
		}
	}

	const newAudioData = new AudioData({
		data,
		format,
		numberOfChannels,
		numberOfFrames: newNumberOfFrames,
		sampleRate: newSampleRate,
		timestamp: audioData.timestamp,
	});

	return newAudioData;
};
