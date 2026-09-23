import {expect, test} from 'bun:test';
import {spawnSync} from 'node:child_process';
import path from 'path';
import {exampleVideos} from '@remotion/example-videos';
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

test('WAV files without a channel mask', async () => {
	// Plain PCM WAVs have no channel mask, so FFmpeg reports an unknown
	// channel layout for them
	const stereo = await getSilentParts({src: exampleVideos.junk});
	expect(stereo.silentParts).toEqual([
		{startInSeconds: 1.736871, endInSeconds: 3.328277},
	]);
	expect(stereo.audibleParts).toEqual([
		{startInSeconds: 0, endInSeconds: 1.736871},
	]);

	const mono = await getSilentParts({src: exampleVideos.chirp});
	expect(mono.silentParts).toEqual([]);
	expect(mono.audibleParts).toEqual([{startInSeconds: 0, endInSeconds: 30}]);
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

test('Should not keep the process alive after rejecting', () => {
	const script = `
		import {getSilentParts} from ${JSON.stringify(path.join(__dirname, '..', 'get-silent-parts.ts'))};
		for (const options of [
			{src: ${JSON.stringify(exampleVideos.webcam)}, minDurationInSeconds: 0},
			{src: ${JSON.stringify(exampleVideos.notafile)}},
		]) {
			await getSilentParts(options).catch((err) => console.log(err.message));
		}
	`;
	const result = spawnSync(process.execPath, ['-e', script], {
		encoding: 'utf8',
		timeout: 10_000,
	});

	expect(result.stdout).toContain(
		'minDurationInSeconds must be greater than 0, but was 0',
	);
	expect(result.stdout).toContain('No such file or directory');
	expect(result.signal).toBe(null);
	expect(result.status).toBe(0);
}, 20_000);

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
