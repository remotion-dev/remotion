import {convertAudioData} from '../convert-audiodata';
import {assertJson, audioDataToSerializable} from './assertions';

const audioData = new AudioData({
	data: new Float32Array([
		1 / 16,
		2 / 16,
		3 / 16,
		4 / 16,
		5 / 16,
		6 / 16,
		7 / 16,
		8 / 16,
		9 / 16,
		10 / 16,
		11 / 16,
		12 / 16,
	]),
	format: 'f32-planar',
	numberOfChannels: 2,
	numberOfFrames: 6,
	sampleRate: 44100,
	timestamp: 0,
});

assertJson(
	audioDataToSerializable(convertAudioData({audioData, newSampleRate: 22050})),
	{
		data: [
			[1.5 / 16, 3.5 / 16, 5.5 / 16],
			[7.5 / 16, 9.5 / 16, 11.5 / 16],
		],
		format: 'f32-planar',
		numberOfChannels: 2,
		numberOfFrames: 3,
		sampleRate: 22050,
		timestamp: 0,
	},
);
