import {expect, test} from 'bun:test';
import React from 'react';
import {
	Html5Audio,
	Html5Video,
	interpolate,
	Sequence,
	useCurrentFrame,
} from 'remotion';
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

test('Should calculate asset positions for a complete media workflow', async () => {
	const sources = {
		basicVideo: 'https://remotion.media/video.mp4?basic-video',
		basicAudio: 'https://remotion.media/video.mp4?basic-audio',
		jump: 'https://remotion.media/video.mp4?jump',
		sequence: 'https://remotion.media/video.mp4?sequence',
		volume: 'https://remotion.media/video.mp4?volume',
		trimmedAudio: 'https://remotion.media/video.mp4?trimmed-audio',
		negativeOffset: 'https://remotion.media/video.mp4?negative-offset',
		nestedNegativeOffset:
			'https://remotion.media/video.mp4?nested-negative-offset',
		cancelledNegativeOffset:
			'https://remotion.media/video.mp4?cancelled-negative-offset',
	} as const;

	const assetPositions = await getPositions(() => {
		const frame = useCurrentFrame();

		return (
			<div>
				<Html5Video src={sources.basicVideo} />
				<Html5Audio src={sources.basicAudio} />
				{frame === 20 ? null : <Html5Video src={sources.jump} />}
				<Sequence durationInFrames={30} from={-20}>
					<Html5Video src={sources.sequence} />
				</Sequence>
				<Html5Video
					volume={(f) =>
						interpolate(f, [0, 4], [0, 1], {
							extrapolateRight: 'clamp',
						})
					}
					src={sources.volume}
				/>
				<Sequence from={1}>
					<Html5Audio
						trimBefore={100}
						trimAfter={200}
						src={sources.trimmedAudio}
						volume={(f) =>
							interpolate(f, [0, 50, 100], [0, 1, 0], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							})
						}
					/>
				</Sequence>
				<Sequence from={-10} durationInFrames={40}>
					<Html5Audio
						src={sources.negativeOffset}
						volume={(f) =>
							interpolate(f, [0, 50, 100], [0, 1, 0], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							})
						}
					/>
				</Sequence>
				<Sequence from={-10} durationInFrames={40}>
					<Sequence from={0} layout="none">
						<Html5Audio
							src={sources.nestedNegativeOffset}
							volume={(f) =>
								interpolate(f, [0, 50, 100], [0, 1, 0], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								})
							}
						/>
					</Sequence>
				</Sequence>
				<Sequence from={-20} durationInFrames={40}>
					<Sequence from={10} layout="none">
						<Html5Audio
							src={sources.cancelledNegativeOffset}
							volume={(f) =>
								interpolate(f, [0, 50, 100], [0, 1, 0], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								})
							}
						/>
					</Sequence>
				</Sequence>
			</div>
		);
	});

	const getBySrc = (src: string) => {
		return assetPositions.filter((asset) => asset.src === src).map(withoutId);
	};

	expect(getBySrc(sources.basicVideo)).toEqual([
		{
			type: 'video',
			src: sources.basicVideo,
			duration: 60,
			startInVideo: 0,
			trimLeft: 0,
			volume: 1,
			playbackRate: 1,
			toneFrequency: 1,
			audioStartFrame: 0,
			audioStreamIndex: 0,
		},
	]);
	expect(getBySrc(sources.basicAudio)).toEqual([
		{
			type: 'audio',
			src: sources.basicAudio,
			duration: 60,
			startInVideo: 0,
			trimLeft: 0,
			volume: 1,
			playbackRate: 1,
			toneFrequency: 1,
			audioStartFrame: 0,
			audioStreamIndex: 0,
		},
	]);
	expect(getBySrc(sources.jump)).toEqual([
		{
			type: 'video',
			src: sources.jump,
			duration: 20,
			startInVideo: 0,
			trimLeft: 0,
			volume: 1,
			playbackRate: 1,
			toneFrequency: 1,
			audioStartFrame: 0,
			audioStreamIndex: 0,
		},
		{
			type: 'video',
			src: sources.jump,
			duration: 39,
			startInVideo: 21,
			trimLeft: 21,
			volume: 1,
			playbackRate: 1,
			toneFrequency: 1,
			audioStartFrame: 0,
			audioStreamIndex: 0,
		},
	]);
	expect(getBySrc(sources.sequence)).toEqual([
		{
			type: 'video',
			src: sources.sequence,
			duration: 10,
			startInVideo: 0,
			trimLeft: 20,
			volume: 1,
			playbackRate: 1,
			toneFrequency: 1,
			audioStartFrame: 20,
			audioStreamIndex: 0,
		},
	]);
	expect(getBySrc(sources.volume)).toEqual([
		{
			type: 'video',
			src: sources.volume,
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
			toneFrequency: 1,
			audioStartFrame: 0,
			audioStreamIndex: 0,
		},
	]);
	expect(getBySrc(sources.trimmedAudio)).toEqual([
		{
			type: 'audio',
			src: sources.trimmedAudio,
			duration: 58,
			startInVideo: 2,
			trimLeft: 101,
			playbackRate: 1,
			volume: new Array(58).fill(true).map((_, i) =>
				interpolate(i + 1, [0, 50, 100], [0, 1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			),
			toneFrequency: 1,
			audioStartFrame: 100,
			audioStreamIndex: 0,
		},
	]);

	const expectedNegativeOffset = {
		type: 'audio',
		duration: 29,
		startInVideo: 1,
		trimLeft: 11,
		playbackRate: 1,
		volume: new Array(29).fill(true).map((_, i) =>
			interpolate(i + 1, [0, 50, 100], [0, 1, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}),
		),
		toneFrequency: 1,
		audioStartFrame: 10,
		audioStreamIndex: 0,
	} as const;

	expect(getBySrc(sources.negativeOffset)).toEqual([
		{...expectedNegativeOffset, src: sources.negativeOffset},
	]);
	expect(getBySrc(sources.nestedNegativeOffset)).toEqual([
		{...expectedNegativeOffset, src: sources.nestedNegativeOffset},
	]);
	expect(getBySrc(sources.cancelledNegativeOffset)).toEqual([
		{
			type: 'audio',
			src: sources.cancelledNegativeOffset,
			duration: 19,
			startInVideo: 1,
			trimLeft: 11,
			playbackRate: 1,
			volume: new Array(19).fill(true).map((_, i) =>
				interpolate(i + 1, [0, 50, 100], [0, 1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			),
			toneFrequency: 1,
			audioStartFrame: 10,
			audioStreamIndex: 0,
		},
	]);
});
