import {expect, test} from 'bun:test';
import {getDimensions} from '../get-dimensions';
import {getDuration} from '../get-duration';
import {parseVideo} from '../parse-video';
import {exampleVideos} from './example-videos';

test('Should get duration of video', async () => {
	const parsed = await parseVideo(exampleVideos.framer24fps, 128 * 1024);

	expect(getDuration(parsed)).toBe(4.167);
	expect(getDimensions(parsed)).toEqual([1080, 1080]);
});

test('Should get duration of HEVC video', async () => {
	const parsed = await parseVideo(exampleVideos.iphonehevc, Infinity);

	expect(getDuration(parsed)).toBe(3.4);
	expect(getDimensions(parsed)).toEqual([1920, 1080]);
});

test('Should get duration of AV1 video', async () => {
	const parsed = await parseVideo(exampleVideos.av1, Infinity);
	// TODO: AV1 duration is not yet supported
	expect(parsed).toEqual([
		{
			type: 'main-segment',
			child: {
				type: 'seek-head-segment',
				children: [
					{
						type: 'seek-segment',
						seekId: '0x1549a966',
						child: {type: 'seek-position-segment', seekPosition: 161},
					},
					{
						type: 'seek-segment',
						seekId: '0x1654ae6b',
						child: {type: 'seek-position-segment', seekPosition: 214},
					},
					{
						type: 'seek-segment',
						seekId: '0x1254c367',
						child: {type: 'seek-position-segment', seekPosition: 322},
					},
					{
						type: 'seek-segment',
						seekId: '0x1c53bb6b',
						child: {type: 'seek-position-segment', seekPosition: 347329},
					},
				],
			},
		},
	]);
});
