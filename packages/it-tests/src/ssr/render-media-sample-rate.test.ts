import {expect, test} from 'bun:test';
import os from 'os';
import path from 'path';
import {
	getCompositions,
	renderMedia,
	RenderInternals,
} from '@remotion/renderer';

const exampleBuild = path.join(__dirname, '..', '..', '..', 'example', 'build');

const getSampleRateFromFile = async (filePath: string): Promise<number> => {
	const result = await RenderInternals.callFf({
		bin: 'ffprobe',
		args: [
			'-v',
			'error',
			'-select_streams',
			'a:0',
			'-show_entries',
			'stream=sample_rate',
			'-of',
			'default=nw=1',
			filePath,
		],
		indent: false,
		logLevel: 'error',
		binariesDirectory: null,
		cancelSignal: undefined,
	});

	const match = result.stdout.match(/sample_rate=(\d+)/);
	if (!match) {
		throw new Error(
			`Could not determine sample rate from ffprobe output: ${result.stdout}`,
		);
	}

	return parseInt(match[1], 10);
};

test(
	'Render video with sampleRate 44100 should produce 44100 Hz audio',
	async () => {
		const compositions = await getCompositions(exampleBuild, {inputProps: {}});
		const comp = compositions.find((c) => c.id === 'audio-testing');

		if (!comp) {
			throw new Error('audio-testing composition not found');
		}

		const tmpDir = os.tmpdir();
		const outPath = path.join(tmpDir, 'sample-rate-44100.mp4');

		await renderMedia({
			outputLocation: outPath,
			codec: 'h264',
			licenseKey: null,
			serveUrl: exampleBuild,
			composition: comp,
			frameRange: [0, 2],
			sampleRate: 44100,
			logLevel: 'error',
		});

		const sampleRate = await getSampleRateFromFile(outPath);
		expect(sampleRate).toBe(44100);
	},
	{timeout: 30000},
);

test(
	'Render video with default sampleRate should produce 48000 Hz audio',
	async () => {
		const compositions = await getCompositions(exampleBuild, {inputProps: {}});
		const comp = compositions.find((c) => c.id === 'audio-testing');

		if (!comp) {
			throw new Error('audio-testing composition not found');
		}

		const tmpDir = os.tmpdir();
		const outPath = path.join(tmpDir, 'sample-rate-default.mp4');

		await renderMedia({
			outputLocation: outPath,
			codec: 'h264',
			licenseKey: null,
			serveUrl: exampleBuild,
			composition: comp,
			frameRange: [0, 2],
			logLevel: 'error',
		});

		const sampleRate = await getSampleRateFromFile(outPath);
		expect(sampleRate).toBe(48000);
	},
	{timeout: 30000},
);
