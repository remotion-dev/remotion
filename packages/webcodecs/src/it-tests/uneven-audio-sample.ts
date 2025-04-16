import {resampleAudioData} from '../resample-audiodata';
import {assertJson, audioDataToSerializable} from './assertions';

const audioData = new AudioData({
	data: new Int32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
	format: 's32',
	numberOfChannels: 1,
	numberOfFrames: 10,
	sampleRate: 6000,
	timestamp: 0,
});

assertJson(
	audioDataToSerializable(resampleAudioData({audioData, newSampleRate: 4000})),
	{
		data: [[1, 2, 4, 6, 7, 9]],
		format: 's32',
		numberOfChannels: 1,
		numberOfFrames: 6,
		sampleRate: 4000,
		timestamp: 0,
	},
);
