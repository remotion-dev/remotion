import {afterEach, expect, spyOn, test} from 'bun:test';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';
import * as callFfmpeg from '../call-ffmpeg';
import {mergeAudioTrack} from '../merge-audio-track';

const spies: {mockRestore: () => void}[] = [];

afterEach(() => {
	spies.splice(0).forEach((spy) => spy.mockRestore());
});

test('concurrent merges of 32 or more tracks do not deadlock', async () => {
	let running = 0;
	let maxRunning = 0;
	spies.push(
		spyOn(callFfmpeg, 'callFf').mockImplementation((() => {
			running++;
			maxRunning = Math.max(maxRunning, running);
			return Object.assign(
				new Promise<void>((resolve) => {
					setTimeout(() => {
						running--;
						resolve();
					}, 5);
				}),
				{stderr: null},
			);
		}) as never),
	);
	const downloadMap = makeDownloadMap(48000);

	try {
		// Like three renders in one process mixing audio at the same time. Each
		// one splits its 32 tracks into chunks and has to merge those first.
		const merges = Promise.all(
			[0, 1, 2].map((render) =>
				mergeAudioTrack({
					files: new Array(32).fill(true).map((_, track) => ({
						outName: `render-${render}-track-${track}.wav`,
						filter: {pad_start: null, pad_end: null},
					})),
					outName: `render-${render}-merged.wav`,
					downloadMap,
					remotionRoot: process.cwd(),
					indent: false,
					logLevel: 'error',
					binariesDirectory: null,
					cancelSignal: undefined,
					onProgress: () => undefined,
					fps: 30,
					chunkLengthInSeconds: 1,
					sampleRate: 48000,
				}),
			),
		);

		const result = await Promise.race([
			merges.then(() => 'done'),
			new Promise((resolve) => {
				setTimeout(() => resolve('stuck'), 2000);
			}),
		]);
		expect(result).toBe('done');
		expect(maxRunning).toBeLessThanOrEqual(3);
	} finally {
		cleanDownloadMap(downloadMap);
	}
});
