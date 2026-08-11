import {convertAudioData} from '../convert-audiodata';
import {assertJson, audioDataToSerializable} from './assertions';

const audioData = new AudioData({
	data: new Int32Array([1, 2, 3]),
	format: 's32',
	numberOfChannels: 1,
	numberOfFrames: 3,
	sampleRate: 22050,
	timestamp: 0,
});

assertJson(
	audioDataToSerializable(convertAudioData({audioData, newSampleRate: 44100})),
	{
		data: [[1, 1, 2, 2, 3, 3]],
		format: 's32',
		numberOfChannels: 1,
		numberOfFrames: 6,
		sampleRate: 44100,
		timestamp: 0,
	},
);
