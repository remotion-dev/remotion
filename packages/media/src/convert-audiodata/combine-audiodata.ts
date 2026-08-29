import {
	fixFloatingPoint,
	type UnresampledPcmS16AudioData,
} from './convert-audiodata';

export const combineAudioDataAndClosePrevious = (
	audioDataArray: UnresampledPcmS16AudioData[],
): UnresampledPcmS16AudioData => {
	let numberOfFrames = 0;
	let durationInMicroSeconds = 0;
	const {numberOfChannels, sampleRate, timestamp} = audioDataArray[0];

	for (const audioData of audioDataArray) {
		if (
			audioData.numberOfChannels !== numberOfChannels ||
			audioData.sampleRate !== sampleRate
		) {
			throw new Error('Cannot combine audio data with different formats');
		}

		numberOfFrames += audioData.numberOfFrames;
		durationInMicroSeconds += audioData.durationInMicroSeconds;
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
		timestamp: fixFloatingPoint(timestamp),
		durationInMicroSeconds: fixFloatingPoint(durationInMicroSeconds),
	};
};
