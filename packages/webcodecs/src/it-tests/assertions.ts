import {getDataTypeForAudioFormat} from '../audio-data/data-types';

export const assertIs = (value: unknown, expected: unknown) => {
	if (value !== expected) {
		throw new Error(`Expected ${expected}, got ${value}`);
	}
};

export const assertJson = (value: unknown, expected: unknown) => {
	if (JSON.stringify(value) !== JSON.stringify(expected)) {
		throw new Error(
			`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(value)}`,
		);
	}
};

export const audioDataToSerializable = (audioData: AudioData) => {
	if (!audioData.format) {
		throw new Error('AudioData format is not set');
	}

	const isPlanar = audioData.format.includes('planar');
	const planes = isPlanar ? audioData.numberOfChannels : 1;
	const DataType = getDataTypeForAudioFormat(audioData.format);

	const planesArray = new Array(planes)
		.fill(true)
		.map(
			() =>
				new DataType(
					audioData.numberOfFrames *
						(isPlanar ? 1 : audioData.numberOfChannels),
				),
		);

	for (let i = 0; i < planes; i++) {
		audioData.clone().copyTo(planesArray[i], {
			planeIndex: i,
		});
	}

	return {
		data: planesArray.map((plane) => Array.from(plane)),
		format: audioData.format,
		numberOfChannels: audioData.numberOfChannels,
		numberOfFrames: audioData.numberOfFrames,
		sampleRate: audioData.sampleRate,
		timestamp: audioData.timestamp,
	};
};
