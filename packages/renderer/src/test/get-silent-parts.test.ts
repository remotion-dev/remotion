import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import path from 'path';
import {getSilentParts} from '../get-silent-parts';

test('Should be able to get the silences from a video', async () => {
	const {silentParts, audibleParts} = await getSilentParts({
		src: exampleVideos.webcam,
		logLevel: 'info',
	});
	expect(silentParts.length).toEqual(1);
	expect(silentParts[0].startInSeconds).toBe(0);
	expect(silentParts[0].endInSeconds).toBe(1.014896);

	expect(audibleParts.length).toEqual(1);
	expect(audibleParts[0].startInSeconds).toEqual(1.014896);
	expect(audibleParts[0].endInSeconds).toEqual(2.789);
});

test('Sensitive settings', async () => {
	const {silentParts, audibleParts, durationInSeconds} = await getSilentParts({
		src: exampleVideos.webcam,
		noiseThresholdInDecibels: 0,
		minDurationInSeconds: 0.1,
		logLevel: 'info',
	});
	expect(silentParts.length).toEqual(1);
	expect(silentParts[0].startInSeconds).toBe(0);
	expect(silentParts[0].endInSeconds).toBe(2.789);
	expect(durationInSeconds).toBe(durationInSeconds);
	expect(audibleParts.length).toEqual(0);
});

test('Long duration', async () => {
	const {silentParts, audibleParts} = await getSilentParts({
		src: exampleVideos.webcam,
		minDurationInSeconds: 10,
	});
	expect(silentParts.length).toEqual(0);
	expect(audibleParts.length).toEqual(1);
	expect(audibleParts.length).toEqual(1);
	expect(audibleParts[0].startInSeconds).toEqual(0);
	expect(audibleParts[0].endInSeconds).toEqual(2.789);
});

test('Wrong file', async () => {
	try {
		await getSilentParts({
			src: exampleVideos.notavideo,
			minDurationInSeconds: 10,
		});
		throw new Error('Should not be able to get silent parts from a non-video');
	} catch (err) {
		expect((err as Error).message).toContain('Could not find audio stream');
		expect((err as Error).message).toContain(exampleVideos.notavideo);
	}
});

test('Inexistent file', async () => {
	try {
		await getSilentParts({
			src: exampleVideos.notafile,
			minDurationInSeconds: 10,
		});
		throw new Error('Should not be able to get silent parts from a non-video');
	} catch (err) {
		expect((err as Error).message).toContain('No such file or directory');
	}
});

test('folder', async () => {
	try {
		await getSilentParts({
			src: path.dirname(exampleVideos.notafile),
			minDurationInSeconds: 10,
		});
		throw new Error('Should not be able to get silent parts from a non-video');
	} catch (err) {
		if (process.platform === 'win32') {
			expect((err as Error).message).toContain('Permission denied');
		} else {
			expect((err as Error).message).toContain('Is a directory');
		}
	}
});
