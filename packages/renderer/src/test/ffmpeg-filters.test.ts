import {expect, test} from 'vitest';
import type {MediaAsset} from '../assets/types';
import {calculateFfmpegFilter} from '../calculate-ffmpeg-filters';

const src =
	'/var/folders/hl/p8pg9kw15dbg3l7dbpn0scc80000gn/T/react-motion-graphicsh871Pk/1fe4a495500e1658167982183be07231.mp4';

const asset: MediaAsset = {
	type: 'video',
	src,
	duration: 20,
	startInVideo: 0,
	trimLeft: 0,
	volume: 1,
	id: '1',
	playbackRate: 1,
	allowAmplificationDuringRender: false,
};

test('Should create a basic filter correctly', () => {
	expect(
		calculateFfmpegFilter({
			fps: 30,
			asset: {
				...asset,
				duration: 200,
			},
			durationInFrames: 100,
			channels: 1,
			assetDuration: 10,
		})
	).toEqual({
		filter:
			'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0.000000:6.666667[a0]',
		pad_end: null,
		pad_start: null,
	});
});
test('Trim the end', () => {
	expect(
		calculateFfmpegFilter({
			fps: 30,
			asset,
			durationInFrames: 100,
			channels: 1,
			assetDuration: 10,
		})
	).toEqual({
		filter:
			'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0.000000:0.666667[a0]',
		pad_end: 'apad=pad_len=128000',
		pad_start: null,
	});
});

test('Should handle trim correctly', () => {
	expect(
		calculateFfmpegFilter({
			fps: 30,
			asset: {
				...asset,
				trimLeft: 10,
			},
			durationInFrames: 100,
			channels: 1,
			assetDuration: 10,
		})
	).toEqual({
		filter:
			'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0.333333:1.000000[a0]',
		pad_end: 'apad=pad_len=128000',
		pad_start: null,
	});
});

test('Should add padding if audio is too short', () => {
	expect(
		calculateFfmpegFilter({
			fps: 30,
			asset: {
				...asset,
				trimLeft: 10,
			},
			durationInFrames: 100,
			channels: 1,
			assetDuration: 1,
		})
	).toEqual({
		filter:
			'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0.333333:1.000000[a0]',
		pad_end: 'apad=pad_len=128000',
		pad_start: null,
	});
});

test('Should handle delay correctly', () => {
	expect(
		calculateFfmpegFilter({
			fps: 30,
			asset: {
				...asset,
				trimLeft: 10,
				startInVideo: 80,
			},

			durationInFrames: 100,
			channels: 1,
			assetDuration: 1,
		})
	).toEqual({
		filter:
			'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0.333333:1.000000[a0]',
		pad_end: null,
		pad_start: 'adelay=2667|2667',
	});
});

test('Should offset multiple channels', () => {
	expect(
		calculateFfmpegFilter({
			fps: 30,
			asset: {
				...asset,
				trimLeft: 10,
				startInVideo: 80,
			},
			durationInFrames: 100,
			channels: 3,
			assetDuration: 1,
		})
	).toEqual({
		filter:
			'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0.333333:1.000000[a0]',
		pad_end: null,
		pad_start: 'adelay=2667|2667|2667|2667',
	});
});

test('Should calculate pad correctly with a lot of playbackRate', () => {
	const naturalDurationInSeconds = 1000 / 30 / 16;
	const expectedPadLength =
		(2000 / 30) * 48000 - naturalDurationInSeconds * 48000;
	expect(
		calculateFfmpegFilter({
			fps: 30,
			asset: {
				type: 'video',
				src,
				duration: 1000,
				volume: 1,
				id: '1',
				trimLeft: 0,
				startInVideo: 0,
				playbackRate: 16,
				allowAmplificationDuringRender: false,
			},
			durationInFrames: 2000,
			channels: 1,
			assetDuration: 33.333333,
		})
	).toEqual({
		filter:
			'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0.000000:33.333333,atempo=2.00000,atempo=2.00000,atempo=2.00000,atempo=2.00000[a0]',
		pad_end: `apad=pad_len=${expectedPadLength}`,
		pad_start: null,
	});
});
