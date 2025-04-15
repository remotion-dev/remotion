import {resampleAudioData} from '../resample-audiodata';
import {assertJson, audioDataToSerializable} from './assertions';

const audioData = new AudioData({
	data: new Float32Array([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]),
	format: 'f32',
	numberOfChannels: 2,
	numberOfFrames: 6,
	sampleRate: 44100,
	timestamp: 0,
});

assertJson(
	audioDataToSerializable(resampleAudioData({audioData, newSampleRate: 22050})),
	{
		data: [[1.5, 1.5, 3.5, 3.5, 5.5, 5.5]],
		format: 'f32',
		numberOfChannels: 2,
		numberOfFrames: 3,
		sampleRate: 22050,
		timestamp: 0,
	},
);
