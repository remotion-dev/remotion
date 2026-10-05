import {expect, test} from 'bun:test';
import type {TRenderAsset} from 'remotion';
import type {AudioOrVideoAsset} from 'remotion/no-react';
import {calculateAssetPositions} from '../assets/calculate-asset-positions';
import {uncompressMediaAsset} from '../assets/types';
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
				toneFrequency: 1,
				audioStartFrame: 0,
				audioStreamIndex: 0,
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
				toneFrequency: 1,
				audioStartFrame: 0,
				audioStreamIndex: 0,
			},
		],
	].flat(1);

	const onlyAudioAndVideo = onlyAudioAndVideoAssets(uncompressed);
	const firstAssetBySrc = new Map<string, AudioOrVideoAsset>();

	const compressedAssets = onlyAudioAndVideo.map((asset) => {
		const compressed = compressAsset(firstAssetBySrc, asset);
		if (!firstAssetBySrc.has(compressed.src)) {
			firstAssetBySrc.set(compressed.src, compressed);
		}

		return compressed;
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
			toneFrequency: 1,
			audioStartFrame: 0,
			audioStreamIndex: 0,
		},
	]);
});

test('Should uncompress correctly when multiple assets share the same id and frame', () => {
	const longSrc = String('x').repeat(1000);

	const assets: AudioOrVideoAsset[] = [
		{
			frame: 187,
			id: 'offthreadvideo-0.123',
			src: longSrc,
			mediaFrame: 0,
			playbackRate: 1,
			type: 'video' as const,
			volume: 1,
			toneFrequency: 1,
			audioStartFrame: 0,
			audioStreamIndex: 0,
		},
		{
			frame: 187,
			id: 'offthreadvideo-0.123',
			src: longSrc,
			mediaFrame: 1,
			playbackRate: 1,
			type: 'video' as const,
			volume: 1,
			toneFrequency: 1,
			audioStartFrame: 0,
			audioStreamIndex: 0,
		},
		{
			frame: 187,
			id: 'offthreadvideo-0.123',
			src: longSrc,
			mediaFrame: 2,
			playbackRate: 1,
			type: 'video' as const,
			volume: 1,
			toneFrequency: 1,
			audioStartFrame: 0,
			audioStreamIndex: 0,
		},
	];

	const firstAssetBySrc = new Map<string, AudioOrVideoAsset>();
	const compressed = assets.map((asset) => {
		const compressedAsset = compressAsset(firstAssetBySrc, asset);
		if (!firstAssetBySrc.has(compressedAsset.src)) {
			firstAssetBySrc.set(compressedAsset.src, compressedAsset);
		}

		return compressedAsset;
	});

	expect(compressed[0].src).toBe(longSrc);
	expect(compressed[1].src).toBe('same-as-offthreadvideo-0.123-187');
	expect(compressed[2].src).toBe('same-as-offthreadvideo-0.123-187');

	const uncompressed1 = uncompressMediaAsset(compressed, compressed[1]);
	expect(uncompressed1.src).toBe(longSrc);

	const uncompressed2 = uncompressMediaAsset(compressed, compressed[2]);
	expect(uncompressed2.src).toBe(longSrc);
});
