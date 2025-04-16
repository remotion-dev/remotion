import {convertAudioData} from '../convert-audiodata';
import {assertJson, audioDataToSerializable} from './assertions';

const audioData = new AudioData({
	data: new Int32Array([1, 1, 3, 3, 5, 5, 7, 7, 9, 9, 11, 11]),
	format: 's32',
	numberOfChannels: 2,
	numberOfFrames: 6,
	sampleRate: 44100,
	timestamp: 0,
});

assertJson(
	audioDataToSerializable(convertAudioData({audioData, newSampleRate: 22050})),
	{
		data: [[2, 2, 6, 6, 10, 10]],
		format: 's32',
		numberOfChannels: 2,
		numberOfFrames: 3,
		sampleRate: 22050,
		timestamp: 0,
	},
);
