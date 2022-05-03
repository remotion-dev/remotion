import {AssetAudioDetails, MediaAsset} from '../assets/types';
import {calculateFfmpegFilters} from '../calculate-ffmpeg-filters';

const src =
	'/var/folders/hl/p8pg9kw15dbg3l7dbpn0scc80000gn/T/react-motion-graphicsh871Pk/1fe4a495500e1658167982183be07231.mp4';

const asset: MediaAsset = {
	type: 'video',
	src: '/var/folders/hl/p8pg9kw15dbg3l7dbpn0scc80000gn/T/react-motion-graphicsh871Pk/1fe4a495500e1658167982183be07231.mp4',
	duration: 20,
	startInVideo: 0,
	trimLeft: 0,
	volume: 1,
	id: '1',
	playbackRate: 1,
};

test('Should create a basic filter correctly', () => {
	const assetAudioDetails = new Map<string, AssetAudioDetails>();
	assetAudioDetails.set(src, {
		channels: 1,
	});
	expect(
		calculateFfmpegFilters({
			fps: 30,
			assetPositions: [asset],
			assetAudioDetails,
		})[0]
	).toBe(
		'[0:a]apad,atrim=0.000:0.667,adelay=0|0,atempo=1.00000,volume=1:eval=once[a0]'
	);
});

test('Should handle trim correctly', () => {
	const assetAudioDetails = new Map<string, AssetAudioDetails>();
	assetAudioDetails.set(src, {
		channels: 1,
	});
	expect(
		calculateFfmpegFilters({
			fps: 30,
			assetPositions: [
				{
					...asset,
					trimLeft: 10,
				},
			],
			assetAudioDetails,
		})[0]
	).toBe(
		'[0:a]apad,atrim=0.333:1.000,adelay=0|0,atempo=1.00000,volume=1:eval=once[a0]'
	);
});

test('Should handle delay correctly', () => {
	const assetAudioDetails = new Map<string, AssetAudioDetails>();
	assetAudioDetails.set(src, {
		channels: 1,
	});
	expect(
		calculateFfmpegFilters({
			fps: 30,
			assetPositions: [
				{
					...asset,
					trimLeft: 10,
					startInVideo: 80,
				},
			],
			assetAudioDetails,
		})[0]
	).toBe(
		'[0:a]apad,atrim=0.333:1.000,adelay=2667|2667,atempo=1.00000,volume=1:eval=once[a0]'
	);
});

test('Should offset multiple channels', () => {
	const assetAudioDetails = new Map<string, AssetAudioDetails>();
	assetAudioDetails.set(src, {
		channels: 3,
	});
	expect(
		calculateFfmpegFilters({
			fps: 30,
			assetPositions: [
				{
					...asset,
					trimLeft: 10,
					startInVideo: 80,
				},
			],
			assetAudioDetails,
		})[0]
	).toBe(
		'[0:a]apad,atrim=0.333:1.000,adelay=2667|2667|2667|2667,atempo=1.00000,volume=1:eval=once[a0]'
	);
});

test('Should calculate correct indices even if some muted channels are removed before', () => {
	const assetAudioDetails = new Map<string, AssetAudioDetails>();
	const mutedSrc = 'music.mp3';
	assetAudioDetails.set(mutedSrc, {
		channels: 0,
	});
	assetAudioDetails.set(src, {
		channels: 3,
	});
	const makeFilters = () =>
		calculateFfmpegFilters({
			fps: 30,
			assetPositions: [
				{
					trimLeft: 10,
					startInVideo: 80,
					duration: 100,
					id: 'any',
					src: mutedSrc,
					type: 'video',
					volume: 1,
					playbackRate: 1,
				},
				{
					...asset,
					trimLeft: 10,
					startInVideo: 80,
				},
			],
			assetAudioDetails,
		});
	expect(makeFilters()[0]).toBe(
		// Should be index 2 - make sure that index 1 is not current, because it is muted
		'[0:a]apad,atrim=0.333:1.000,adelay=2667|2667|2667|2667,atempo=1.00000,volume=1:eval=once[a0]'
	);

	// Also test basic case: if first one is unmuted, both channels are there again
	assetAudioDetails.set(mutedSrc, {
		channels: 1,
	});
	expect(makeFilters()[0]).toBe(
		'[0:a]apad,atrim=0.333:3.667,adelay=2667|2667,atempo=1.00000,volume=1:eval=once[a0]'
	);
	expect(makeFilters()[1]).toBe(
		'[0:a]apad,atrim=0.333:1.000,adelay=2667|2667|2667|2667,atempo=1.00000,volume=1:eval=once[a0]'
	);
});
