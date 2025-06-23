import {convertAudioData} from '../convert-audiodata';
import {assertJson, audioDataToSerializable} from './assertions';

// s32 to f32
assertJson(
	audioDataToSerializable(
		convertAudioData({
			audioData: new AudioData({
				data: new Int32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
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
			[
				4.656612873077393e-10, 9.313225746154785e-10, 1.862645149230957e-9,
				2.7939677238464355e-9, 3.259629011154175e-9, 4.190951585769653e-9,
			],
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
		convertAudioData({
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
