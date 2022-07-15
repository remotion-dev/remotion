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
	).toBe(
		'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0.000000:6.666667[a0]'
	);
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
	).toBe(
		'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0.000000:0.666667,apad=pad_len=128000[a0]'
	);
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
	).toBe(
		'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0.333333:1.000000,apad=pad_len=128000[a0]'
	);
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
	).toBe(
		'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0.333333:1.000000,apad=pad_len=128000[a0]'
	);
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
	).toBe(
		'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0.333333:1.000000,adelay=2667|2667[a0]'
	);
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
	).toBe(
		'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0.333333:1.000000,adelay=2667|2667|2667|2667[a0]'
	);
});
