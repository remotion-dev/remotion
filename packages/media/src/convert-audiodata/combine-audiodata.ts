import {fixFloatingPoint, type PcmS16AudioData} from './convert-audiodata';
import {TARGET_NUMBER_OF_CHANNELS} from './resample-audiodata';

export const combineAudioDataAndClosePrevious = (
	audioDataArray: PcmS16AudioData[],
): PcmS16AudioData => {
	let numberOfFrames = 0;
	let durationInMicroSeconds = 0;
	const {timestamp} = audioDataArray[0];

	for (const audioData of audioDataArray) {
		numberOfFrames += audioData.numberOfFrames;
		durationInMicroSeconds += audioData.durationInMicroSeconds;
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
		timestamp: fixFloatingPoint(timestamp),
		durationInMicroSeconds: fixFloatingPoint(durationInMicroSeconds),
	};
};
