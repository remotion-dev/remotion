import type {PcmS16AudioData} from './convert-audiodata';
import {TARGET_NUMBER_OF_CHANNELS} from './resample-audiodata';

export const combineAudioDataAndClosePrevious = (
	audioDataArray: PcmS16AudioData[],
): PcmS16AudioData => {
	let numberOfFrames = 0;
	let sampleRate: number | null = null;
	const {timestamp} = audioDataArray[0];

	for (const audioData of audioDataArray) {
		numberOfFrames += audioData.numberOfFrames;

		if (!sampleRate) {
			sampleRate = audioData.sampleRate;
		} else if (sampleRate !== audioData.sampleRate) {
			throw new Error('Sample rates do not match');
		}
	}

	if (!sampleRate) {
		throw new Error('Sample rate is not set');
	}

	const arr = new Int16Array(numberOfFrames * TARGET_NUMBER_OF_CHANNELS);

	let offset = 0;
	for (const audioData of audioDataArray) {
		arr.set(audioData.data, offset);
		offset += audioData.data.length;
	}

	return {
		data: arr,
		numberOfFrames,
		sampleRate,
		timestamp,
	};
};
