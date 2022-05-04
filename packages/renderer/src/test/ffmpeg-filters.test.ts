import {MediaAsset} from '../assets/types';
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
			asset,
			durationInFrames: 100,
			channels: 1,
		})
	).toBe(
		'[0:a]apad,atrim=0.000:0.667,adelay=0|0,atempo=1.00000,volume=1:eval=once[a0]'
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
		})
	).toBe(
		'[0:a]apad,atrim=0.333:1.000,adelay=0|0,atempo=1.00000,volume=1:eval=once[a0]'
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
		})
	).toBe(
		'[0:a]apad,atrim=0.333:1.000,adelay=2667|2667,atempo=1.00000,volume=1:eval=once[a0]'
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
		})
	).toBe(
		'[0:a]apad,atrim=0.333:1.000,adelay=2667|2667|2667|2667,atempo=1.00000,volume=1:eval=once[a0]'
	);
});
