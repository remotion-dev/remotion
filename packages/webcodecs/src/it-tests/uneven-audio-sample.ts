import {convertAudioData} from '../convert-audiodata';
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
	audioDataToSerializable(convertAudioData({audioData, newSampleRate: 4000})),
	{
		data: [[1, 2, 4, 6, 7, 9]],
		format: 's32',
		numberOfChannels: 1,
		numberOfFrames: 6,
		sampleRate: 4000,
		timestamp: 0,
	},
);

const newAudioData = convertAudioData({
	audioData: new AudioData({
		data: new Int32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
		format: 's32',
		numberOfChannels: 1,
		numberOfFrames: 10,
		sampleRate: 44100,
		timestamp: 0,
	}),
	newSampleRate: 22050,
});

assertJson(audioDataToSerializable(newAudioData), {
	data: [[0, 2, 4, 6, 8]],
	format: 's32',
	numberOfChannels: 1,
	numberOfFrames: 5,
	sampleRate: 22050,
	timestamp: 0,
});
