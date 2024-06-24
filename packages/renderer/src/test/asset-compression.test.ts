import {expect, test} from 'bun:test';
import type {TRenderAsset} from 'remotion';
import {calculateAssetPositions} from '../assets/calculate-asset-positions';
import {compressAsset} from '../compress-assets';
import {onlyAudioAndVideoAssets} from '../filter-asset-types';

test('Should compress and uncompress assets', () => {
	const uncompressed: TRenderAsset[] = [
		[
			{
				frame: 0,
				id: 'my-id',
				src: String('x').repeat(1000),
				mediaFrame: 0,
				playbackRate: 1,
				type: 'video' as const,
				volume: 1,
				allowAmplificationDuringRender: false,
				toneFrequency: null,
				audioStartFrame: 0,
			},
		],
		[
			{
				frame: 1,
				id: 'my-id',
				src: String('x').repeat(1000),
				mediaFrame: 0,
				playbackRate: 1,
				type: 'video' as const,
				volume: 1,
				allowAmplificationDuringRender: false,
				toneFrequency: null,
				audioStartFrame: 0,
			},
		],
	].flat(1);

	const onlyAudioAndVideo = onlyAudioAndVideoAssets(uncompressed);

	const compressedAssets = onlyAudioAndVideo.map((asset, i) => {
		return compressAsset(onlyAudioAndVideo.slice(0, i), asset);
	});

	expect(compressedAssets[0].src).toBe(String('x').repeat(1000));
	expect(compressedAssets[1].src).toBe('same-as-my-id-0');

	const assPos = calculateAssetPositions([compressedAssets]);
	expect(assPos).toEqual([
		{
			duration: 1,
			id: 'my-id',
			playbackRate: 1,
			src: String('x').repeat(1000),
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			allowAmplificationDuringRender: false,
			toneFrequency: null,
			audioStartFrame: 0,
		},
	]);
});
