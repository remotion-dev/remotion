import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('mp3 vbr fast path', async () => {
	const {durationInSeconds, internalStats} = await parseMedia({
		src: exampleVideos.mp3vbr,
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
		fields: {
			durationInSeconds: true,
			internalStats: true,
		},
	});

	expect(internalStats).toEqual({finalCursorOffset: 332, skippedBytes: 20064});
	expect(durationInSeconds).toBe(5.04);
});

test('mp3 vbr slow path', async () => {
	const {slowDurationInSeconds, internalStats} = await parseMedia({
		src: exampleVideos.mp3vbr,
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
		fields: {
			internalStats: true,
			slowDurationInSeconds: true,
			slowKeyframes: true,
		},
	});

	expect(internalStats).toEqual({finalCursorOffset: 20396, skippedBytes: 0});
	expect(slowDurationInSeconds).toBe(5.04);
});
