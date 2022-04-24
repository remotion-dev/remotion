import {calculateAssetPositions} from '../assets/calculate-asset-positions';

// Previously <v2.5.1 this would error out due to two assets having the exact same
test('Conflicting IDs should be handled', () => {
	expect(
		calculateAssetPositions([
			[
				{
					frame: 0,
					id: 'notunique',
					mediaFrame: 0,
					playbackRate: 1,
					src: 'audio.mp3',
					type: 'audio',
					volume: 0.5,
				},
				{
					frame: 0,
					id: 'notunique',
					mediaFrame: 0,
					playbackRate: 1,
					src: 'audio.mp3',
					type: 'audio',
					volume: 0.5,
				},
			],
			[
				{
					frame: 1,
					id: 'notunique',
					mediaFrame: 0,
					playbackRate: 1,
					src: 'audio.mp3',
					type: 'audio',
					volume: 0.5,
				},
				{
					frame: 1,
					id: 'notunique',
					mediaFrame: 0,
					playbackRate: 1,
					src: 'audio.mp3',
					type: 'audio',
					volume: 0.5,
				},
				{
					frame: 1,
					id: 'another',
					mediaFrame: 0,
					playbackRate: 1,
					src: 'audio.mp3',
					type: 'audio',
					volume: 0.5,
				},
			],
			[
				{
					frame: 2,
					id: 'another',
					mediaFrame: 0,
					playbackRate: 1,
					src: 'audio.mp3',
					type: 'audio',
					volume: 0.5,
				},
			],
		]).length
	).toBe(4);
});
