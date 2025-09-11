import type {PcmS16AudioData} from './convert-audiodata';

export const combineAudioDataAndClosePrevious = (
	audioDataArray: PcmS16AudioData[],
): PcmS16AudioData => {
	let numberOfFrames = 0;
	let numberOfChannels: number | null = null;
	let sampleRate: number | null = null;
	const {timestamp} = audioDataArray[0];

	for (const audioData of audioDataArray) {
		numberOfFrames += audioData.numberOfFrames;

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

	if (!numberOfChannels) {
		throw new Error('Number of channels is not set');
	}

	if (!sampleRate) {
		throw new Error('Sample rate is not set');
	}

	const arr = new Int16Array(numberOfFrames * numberOfChannels);

	let offset = 0;
	for (const audioData of audioDataArray) {
		arr.set(audioData.data, offset);
		offset += audioData.data.length;
	}

	return {
		data: arr,
		numberOfChannels,
		numberOfFrames,
		sampleRate,
		timestamp,
	};
};
