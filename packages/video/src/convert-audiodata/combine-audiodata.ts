import {getDataTypeForAudioFormat} from './data-types';
import {isPlanarFormat} from './is-planar-format';

export const combineAudioDataAndClosePrevious = (
	audioDataArray: AudioData[],
) => {
	let numberOfFrames = 0;
	let format: AudioSampleFormat | null = null;
	let numberOfChannels: number | null = null;
	let sampleRate: number | null = null;
	const {timestamp} = audioDataArray[0];

	for (const audioData of audioDataArray) {
		numberOfFrames += audioData.numberOfFrames;
		if (!format) {
			format = audioData.format;
		} else if (format !== audioData.format) {
			throw new Error('Formats do not match');
		}

		if (!numberOfChannels) {
			numberOfChannels = audioData.numberOfChannels;
		} else if (numberOfChannels !== audioData.numberOfChannels) {
			throw new Error('Number of channels do not match');
		}

		if (!sampleRate) {
			sampleRate = audioData.sampleRate;
		} else if (sampleRate !== audioData.sampleRate) {
			throw new Error('Sample rates do not match');
		}
	}

	if (!format) {
		throw new Error('Format is not set');
	}

	if (!numberOfChannels) {
		throw new Error('Number of channels is not set');
	}

	if (!sampleRate) {
		throw new Error('Sample rate is not set');
	}

	const DataType = getDataTypeForAudioFormat(format);
	const isPlanar = isPlanarFormat(format);
	if (isPlanar) {
		throw new Error(
			'Planar formats are not supported for combining audio dats',
		);
	}

	const channel = new DataType(numberOfFrames * numberOfChannels);

	let framesWritten = 0;

	for (
		let audioDataIndex = 0;
		audioDataIndex < audioDataArray.length;
		audioDataIndex++
	) {
		const audioData = audioDataArray[audioDataIndex];

		const intermediateChannel = new DataType(
			audioData.numberOfFrames * numberOfChannels,
		);
		audioData.copyTo(intermediateChannel, {
			planeIndex: 0,
		});
		channel.set(intermediateChannel, framesWritten);
		console.log(
			'wrote',
			intermediateChannel.byteLength,
			'bytes to channel at offset',
			framesWritten,
			audioData.format,
			DataType,
			audioData.allocationSize({planeIndex: 0}),
		);

		framesWritten += audioData.numberOfFrames * numberOfChannels;
		audioData.close();
	}

	const newAudioData = new AudioData({
		numberOfFrames,
		sampleRate,
		timestamp,
		data: channel,
		format,
		numberOfChannels,
	});

	return newAudioData;
};
