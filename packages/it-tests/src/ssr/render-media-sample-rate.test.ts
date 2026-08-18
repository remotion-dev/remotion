import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import os from 'os';
import path from 'path';
import {
	renderMedia,
	RenderInternals,
	selectComposition,
} from '@remotion/renderer';

const exampleBuild = path.join(__dirname, '..', '..', '..', 'example', 'build');

const readPcmWav = (filePath: string) => {
	const file = readFileSync(filePath);
	let offset = 12;
	let channels: number | null = null;
	let sampleRate: number | null = null;
	let samples: Int16Array | null = null;

	while (offset + 8 <= file.length) {
		const chunk = file.toString('ascii', offset, offset + 4);
		const size = file.readUInt32LE(offset + 4);
		const dataStart = offset + 8;
		if (chunk === 'fmt ') {
			channels = file.readUInt16LE(dataStart + 2);
			sampleRate = file.readUInt32LE(dataStart + 4);
			expect(file.readUInt16LE(dataStart + 14)).toBe(16);
		}

		if (chunk === 'data') {
			const pcm = file.subarray(dataStart, dataStart + size);
			samples = new Int16Array(
				pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + pcm.byteLength),
			);
			break;
		}

		offset = dataStart + size + (size % 2);
	}

	if (channels === null || sampleRate === null || samples === null) {
		throw new Error(`Could not read PCM WAV file ${filePath}`);
	}

	return {channels, sampleRate, samples};
};

const comparePcm = ({
	reference,
	candidate,
}: {
	reference: Int16Array;
	candidate: Int16Array;
}) => {
	const referenceOnset = reference.findIndex((sample) => sample !== 0);
	const candidateOnset = candidate.findIndex((sample) => sample !== 0);
	expect(candidateOnset).toBe(referenceOnset);

	let signalPower = 0;
	let errorPower = 0;
	let maximumError = 0;
	for (
		let index = referenceOnset;
		index < Math.min(reference.length, candidate.length);
		index++
	) {
		const expected = reference[index];
		const actual = candidate[index];
		const error = expected - actual;
		signalPower += expected * expected;
		errorPower += error * error;
		maximumError = Math.max(maximumError, Math.abs(error));
	}

	return {
		maximumError,
		signalToNoiseRatio: 10 * Math.log10(signalPower / errorPower),
	};
};

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

const issue10468Source = readFileSync(
	path.join(__dirname, '..', '..', '..', 'remotion-media', 'ding.wav'),
);
const issue10468InputProps = {
	implementation: 'media',
	src: `data:audio/wav;base64,${issue10468Source.toString('base64')}`,
};

const issue5758Source = readFileSync(
	path.join(
		__dirname,
		'..',
		'..',
		'..',
		'example',
		'public',
		'audio-48000hz.wav',
	),
);
const issue5758InputProps = {
	src: `data:audio/wav;base64,${issue5758Source.toString('base64')}`,
};

const renderIssue10468Wav = async ({
	tmpDir,
	name,
	props,
}: {
	tmpDir: string;
	name: string;
	props: Record<string, unknown>;
}) => {
	const outputLocation = path.join(tmpDir, name);
	const composition = await selectComposition({
		id: 'audio-issue-10468',
		serveUrl: exampleBuild,
		inputProps: props,
	});
	await renderMedia({
		outputLocation,
		codec: 'wav',
		serveUrl: exampleBuild,
		composition,
		inputProps: props,
		sampleRate: 48000,
		concurrency: 1,
		logLevel: 'error',
	});

	return readPcmWav(outputLocation);
};

test(
	'Render video with sampleRate 44100 should produce 44100 Hz audio',
	async () => {
		const comp = await selectComposition({
			id: 'audio-testing',
			serveUrl: exampleBuild,
			inputProps: {},
		});

		const tmpDir = os.tmpdir();
		const outPath = path.join(tmpDir, 'sample-rate-44100.mp4');

		await renderMedia({
			outputLocation: outPath,
			codec: 'h264',
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
	'@remotion/media sample-rate conversion should match Html5Audio',
	async () => {
		const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'issue-10468-'));
		try {
			const reference = await renderIssue10468Wav({
				tmpDir,
				name: 'html5-reference.wav',
				props: {...issue10468InputProps, implementation: 'html5'},
			});
			const candidate = await renderIssue10468Wav({
				tmpDir,
				name: 'media.wav',
				props: issue10468InputProps,
			});

			expect(reference.sampleRate).toBe(48000);
			expect(candidate.sampleRate).toBe(48000);
			expect(reference.channels).toBe(2);
			expect(candidate.channels).toBe(2);
			const comparison = comparePcm({
				reference: reference.samples,
				candidate: candidate.samples,
			});
			expect(comparison.signalToNoiseRatio).toBeGreaterThan(30);
			expect(comparison.maximumError).toBeLessThanOrEqual(600);
		} finally {
			rmSync(tmpDir, {recursive: true, force: true});
		}
	},
	{timeout: 180000},
);

test(
	'@remotion/media should not leave audio gaps at 24.87 FPS (#5758)',
	async () => {
		const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'issue-5758-'));
		try {
			const outputLocation = path.join(tmpDir, 'media.wav');
			const composition = await selectComposition({
				id: 'audio-issue-5758',
				serveUrl: exampleBuild,
				inputProps: issue5758InputProps,
			});
			await renderMedia({
				outputLocation,
				codec: 'wav',
				serveUrl: exampleBuild,
				composition,
				inputProps: issue5758InputProps,
				sampleRate: 48000,
				concurrency: 1,
				logLevel: 'error',
			});

			const rendered = readPcmWav(outputLocation);
			const onset = rendered.samples.findIndex((sample) => sample !== 0);
			expect(rendered.sampleRate).toBe(48000);
			expect(rendered.channels).toBe(2);
			expect(onset).toBeGreaterThan(-1);
			expect(
				rendered.samples.subarray(onset).findIndex((sample) => sample === 0),
			).toBe(-1);
		} finally {
			rmSync(tmpDir, {recursive: true, force: true});
		}
	},
	{timeout: 180000},
);

test(
	'Render video with default sampleRate should produce 48000 Hz audio',
	async () => {
		const comp = await selectComposition({
			id: 'audio-testing',
			serveUrl: exampleBuild,
			inputProps: {},
		});

		const tmpDir = os.tmpdir();
		const outPath = path.join(tmpDir, 'sample-rate-default.mp4');

		await renderMedia({
			outputLocation: outPath,
			codec: 'h264',
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
