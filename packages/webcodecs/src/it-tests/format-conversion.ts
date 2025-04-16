import {resampleAudioData} from '../resample-audiodata';
import {assertJson, audioDataToSerializable} from './assertions';

// s32 to f32
assertJson(
	audioDataToSerializable(
		resampleAudioData({
			audioData: new AudioData({
				data: new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
				format: 's32',
				numberOfChannels: 1,
				numberOfFrames: 10,
				sampleRate: 6000,
				timestamp: 0,
			}),
			newSampleRate: 4000,
			format: 'f32',
		}),
	),
	{
		data: [
			[0.49609375, 0.5, 0.50390625, 0.505859375, 0.5068359375, 0.50830078125],
		],
		format: 'f32',
		numberOfChannels: 1,
		numberOfFrames: 6,
		sampleRate: 4000,
		timestamp: 0,
	},
);

assertJson(
	audioDataToSerializable(
		resampleAudioData({
			audioData: new AudioData({
				data: new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
				format: 'f32',
				numberOfChannels: 1,
				numberOfFrames: 10,
				sampleRate: 6000,
				timestamp: 0,
			}),
			newSampleRate: 4000,
			format: 's32',
		}),
	),
	{
		data: [
			[2147483647, 2147483647, 2147483647, 2147483647, 2147483647, 2147483647],
		],
		format: 's32',
		numberOfChannels: 1,
		numberOfFrames: 6,
		sampleRate: 4000,
		timestamp: 0,
	},
);
