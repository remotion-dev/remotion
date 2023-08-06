import {expect, test} from 'vitest';
import {getSilentParts} from '../get-silent-parts';
import {exampleVideos} from './example-videos';

test('Should be able to get the silences from a video', async () => {
	const expected = await getSilentParts({
		src: exampleVideos.webcam,
		logLevel: 'info',
	});
	expect(expected.length).toEqual(1);
	expect(expected[0].start).toBe(0);
	expect(expected[0].end).toBe(1.0149);
});

test('Sensitive settings', async () => {
	const expected = await getSilentParts({
		src: exampleVideos.webcam,
		noiseThresholdInDecibel: 0,
		minDuration: 0.1,
		logLevel: 'info',
	});
	expect(expected.length).toEqual(1);
	expect(expected[0].start).toBe(0);
	expect(expected[0].end).toBe(2.789);
});

test('Long duration', async () => {
	const expected = await getSilentParts({
		src: exampleVideos.webcam,
		minDuration: 10,
	});
	expect(expected.length).toEqual(0);
});

test('Not a video', async () => {
	const expected = await getSilentParts({
		src: exampleVideos.notavideo,
		minDuration: 10,
	});
	expect(expected.length).toEqual(0);
});
