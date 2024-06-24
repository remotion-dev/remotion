import {expect, test} from 'bun:test';
import React from 'react';
import {Audio, Sequence, Video, interpolate, useCurrentFrame} from 'remotion';
import {calculateAssetPositions} from '../assets/calculate-asset-positions';
import type {MediaAsset} from '../assets/types';
import {onlyAudioAndVideoAssets} from '../filter-asset-types';
import {getAssetsForMarkup} from './get-assets-for-markup';

const basicConfig = {
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 60,
	id: 'hithere',
};

const getPositions = async (Markup: React.FC) => {
	const assets = await getAssetsForMarkup(Markup, basicConfig);
	const onlyAudioAndVideo = assets.map((ass) => {
		return onlyAudioAndVideoAssets(ass);
	});

	return calculateAssetPositions(onlyAudioAndVideo);
};

const withoutId = (asset: MediaAsset) => {
	const {id, ...others} = asset;
	return others;
};

test('Should be able to collect assets', async () => {
	const assetPositions = await getPositions(() => (
		<Video src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4" />
	));
	expect(assetPositions.length).toBe(1);
	expect(withoutId(assetPositions[0])).toEqual({
		type: 'video',
		src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
		duration: 60,
		startInVideo: 0,
		trimLeft: 0,
		volume: 1,
		playbackRate: 1,
		allowAmplificationDuringRender: false,
		toneFrequency: null,
		audioStartFrame: 0,
	});
});

test('Should get multiple assets', async () => {
	const assetPositions = await getPositions(() => (
		<div>
			<Video src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4" />
			<Audio src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp3" />
		</div>
	));
	expect(assetPositions.length).toBe(2);
	expect(withoutId(assetPositions[0])).toEqual({
		type: 'video',
		src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
		duration: 60,
		startInVideo: 0,
		trimLeft: 0,
		volume: 1,
		playbackRate: 1,
		allowAmplificationDuringRender: false,
		toneFrequency: null,
		audioStartFrame: 0,
	});
	expect(withoutId(assetPositions[1])).toEqual({
		type: 'audio',
		src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp3',
		duration: 60,
		startInVideo: 0,
		trimLeft: 0,
		volume: 1,
		playbackRate: 1,
		allowAmplificationDuringRender: false,
		toneFrequency: null,
		audioStartFrame: 0,
	});
});

test('Should handle jumps inbetween', async () => {
	const assetPositions = await getPositions(() => {
		const frame = useCurrentFrame();
		return (
			<div>
				{frame === 20 ? null : (
					<Video src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4" />
				)}
			</div>
		);
	});
	expect(assetPositions.length).toBe(2);
	expect(withoutId(assetPositions[0])).toEqual({
		type: 'video',
		src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
		duration: 20,
		startInVideo: 0,
		trimLeft: 0,
		volume: 1,
		playbackRate: 1,
		allowAmplificationDuringRender: false,
		toneFrequency: null,
		audioStartFrame: 0,
	});
	expect(withoutId(assetPositions[1])).toEqual({
		type: 'video',
		src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
		duration: 39,
		startInVideo: 21,
		trimLeft: 21,
		volume: 1,
		playbackRate: 1,
		allowAmplificationDuringRender: false,
		toneFrequency: null,
		audioStartFrame: 0,
	});
});

test('Should support sequencing', async () => {
	const assetPositions = await getPositions(() => {
		return (
			<Sequence durationInFrames={30} from={-20}>
				<Video src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4" />
			</Sequence>
		);
	});
	expect(assetPositions.length).toBe(1);
	expect(withoutId(assetPositions[0])).toEqual({
		type: 'video',
		src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
		duration: 10,
		startInVideo: 0,
		trimLeft: 20,
		volume: 1,
		playbackRate: 1,
		allowAmplificationDuringRender: false,
		toneFrequency: null,
		audioStartFrame: 20,
	});
});

test('Should calculate volumes correctly', async () => {
	const assetPositions = await getPositions(() => {
		return (
			<Video
				volume={(f) =>
					interpolate(f, [0, 4], [0, 1], {
						extrapolateRight: 'clamp',
					})
				}
				src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4"
			/>
		);
	});
	expect(assetPositions.length).toBe(1);
	expect(withoutId(assetPositions[0])).toEqual({
		type: 'video',
		src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
		duration: 59,
		startInVideo: 1,
		trimLeft: 1,
		playbackRate: 1,
		volume: new Array(60)
			.fill(true)
			.map((_, i) =>
				interpolate(i, [0, 4], [0, 1], {extrapolateRight: 'clamp'}),
			)
			.filter((f) => f > 0),
		allowAmplificationDuringRender: false,
		toneFrequency: null,
		audioStartFrame: 0,
	});
});

test('Should calculate startFrom correctly', async () => {
	const assetPositions = await getPositions(() => {
		return (
			<Sequence from={1}>
				<Audio
					startFrom={100}
					endAt={200}
					src={
						'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4'
					}
					volume={(f) =>
						interpolate(f, [0, 50, 100], [0, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})
					}
				/>
			</Sequence>
		);
	});
	expect(assetPositions.length).toBe(1);
	expect(withoutId(assetPositions[0])).toEqual({
		type: 'audio',
		src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
		duration: 58,
		startInVideo: 2,
		trimLeft: 101,
		playbackRate: 1,
		volume: new Array(59)
			.fill(true)
			.map((_, i) =>
				interpolate(i, [0, 50, 100], [0, 1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			)
			.filter((i) => i > 0),
		allowAmplificationDuringRender: false,
		toneFrequency: null,
		audioStartFrame: 100,
	});
});
