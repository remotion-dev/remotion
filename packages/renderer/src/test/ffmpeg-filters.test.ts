import {AssetAudioDetails, MediaAsset} from '../assets/types';
import {calculateFfmpegFilters} from '../calculate-ffmpeg-filters';

const src =
	'/var/folders/hl/p8pg9kw15dbg3l7dbpn0scc80000gn/T/react-motion-graphicsh871Pk/1fe4a495500e1658167982183be07231.mp4';

const asset: MediaAsset = {
	type: 'video',
	src:
		'/var/folders/hl/p8pg9kw15dbg3l7dbpn0scc80000gn/T/react-motion-graphicsh871Pk/1fe4a495500e1658167982183be07231.mp4',
	duration: 20,
	startInVideo: 0,
	trimLeft: 0,
	volume: 1,
	id: '1',
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
		})[0].filter
	).toBe('[1:a]atrim=0.000:0.667,adelay=0,volume=1[a1]');
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
		})[0].filter
	).toBe('[1:a]atrim=0.333:1.000,adelay=0,volume=1[a1]');
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
		})[0].filter
	).toBe('[1:a]atrim=0.333:1.000,adelay=2667,volume=1[a1]');
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
		})[0].filter
	).toBe('[1:a]atrim=0.333:1.000,adelay=2667|2667|2667,volume=1[a1]');
});
