import type {TAsset} from 'remotion';
import {expect, test} from 'vitest';
import {calculateAssetPositions} from '../assets/calculate-asset-positions';

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T; // from lodash

function truthy<T>(value: T): value is Truthy<T> {
	return Boolean(value);
}

test('Dont skip assets', () => {
	const assetPositions = calculateAssetPositions(mock);
	expect(assetPositions).toEqual([
		{
			src: 'http://localhost:3000/4793bac32f610ffba8197b8a3422456f.mp3',
			type: 'audio',
			duration: 2934,
			id: 'audio-0.24816237785853446-undefined-undefined-undefined-muted:undefined',
			startInVideo: 0,
			trimLeft: 0,
			volume: 1,
			playbackRate: 1,
		},
		{
			src: 'http://localhost:3000/e15ac5e3d531199ebb1828ca6a99100d.webm',
			type: 'video',
			duration: 40,
			id: 'audio-0.6976876351982355-0-180-40-muted:undefined',
			startInVideo: 180,
			trimLeft: 0,
			volume: 1,
			playbackRate: 1,
		},
	]);
});

const mock: TAsset[][] = new Array(2934)
	.fill(true)
	.map((_, i) => i)
	.map((k) => {
		return [
			k >= 180 && k < 220
				? {
						type: 'video' as const,
						src: 'http://localhost:3000/e15ac5e3d531199ebb1828ca6a99100d.webm',
						id: 'audio-0.6976876351982355-0-180-40-muted:undefined',
						frame: 180,
						volume: 1,
						playbackRate: 1,
						mediaFrame: 0,
				  }
				: null,
			{
				type: 'audio' as const,
				src: 'http://localhost:3000/4793bac32f610ffba8197b8a3422456f.mp3',
				id: 'audio-0.24816237785853446-undefined-undefined-undefined-muted:undefined',
				frame: k,
				volume: 1,
				playbackRate: 1,
				mediaFrame: k,
			},
		].filter(truthy);
	});
