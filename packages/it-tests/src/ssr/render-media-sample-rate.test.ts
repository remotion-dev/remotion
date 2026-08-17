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
	requireSameOnset,
}: {
	reference: Int16Array;
	candidate: Int16Array;
	requireSameOnset: boolean;
}) => {
	expect(candidate.length).toBe(reference.length);
	const referenceOnset = reference.findIndex((sample) => sample !== 0);
	const candidateOnset = candidate.findIndex((sample) => sample !== 0);
	if (requireSameOnset) {
		expect(candidateOnset).toBe(referenceOnset);
	}

	let signalPower = 0;
	let errorPower = 0;
	let maximumError = 0;
	const comparisonStart = requireSameOnset
		? referenceOnset
		: Math.max(referenceOnset, candidateOnset);
	for (let index = comparisonStart; index < reference.length; index++) {
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
		const source = readFileSync(
			path.join(__dirname, '..', '..', '..', 'remotion-media', 'ding.wav'),
		);
		const inputProps = {
			implementation: 'media',
			src: `data:audio/wav;base64,${source.toString('base64')}`,
			variant: 'reproduction',
		};

		try {
			const renderWav = async (
				name: string,
				props: Record<string, unknown>,
				concurrency: number,
			) => {
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
					concurrency,
					logLevel: 'error',
				});

				return readPcmWav(outputLocation);
			};
			const reference = await renderWav(
				'html5-reference.wav',
				{...inputProps, implementation: 'html5'},
				1,
			);
			const candidateConcurrencyOne = await renderWav(
				'media-concurrency-1.wav',
				inputProps,
				1,
			);
			const candidateConcurrencyFive = await renderWav(
				'media-concurrency-5.wav',
				inputProps,
				5,
			);

			expect(reference.sampleRate).toBe(48000);
			expect(candidateConcurrencyOne.sampleRate).toBe(48000);
			expect(reference.channels).toBe(2);
			expect(candidateConcurrencyOne.channels).toBe(2);
			expect(candidateConcurrencyFive.samples).toEqual(
				candidateConcurrencyOne.samples,
			);
			const comparison = comparePcm({
				reference: reference.samples,
				candidate: candidateConcurrencyOne.samples,
				requireSameOnset: true,
			});
			expect(comparison.signalToNoiseRatio).toBeGreaterThan(30);
			expect(comparison.maximumError).toBeLessThanOrEqual(600);

			const untrimmedReference = await renderWav(
				'untrimmed-html5.wav',
				{...inputProps, implementation: 'html5', variant: 'untrimmed'},
				1,
			);
			const untrimmedCandidate = await renderWav(
				'untrimmed-media.wav',
				{...inputProps, variant: 'untrimmed'},
				1,
			);
			const untrimmedComparison = comparePcm({
				reference: untrimmedReference.samples,
				candidate: untrimmedCandidate.samples,
				requireSameOnset: false,
			});
			expect(untrimmedComparison.signalToNoiseRatio).toBeGreaterThan(30);
			expect(untrimmedComparison.maximumError).toBeLessThanOrEqual(600);

			const playbackRate = await renderWav(
				'playback-rate-media.wav',
				{...inputProps, variant: 'playback-rate'},
				1,
			);
			expect(playbackRate.sampleRate).toBe(48000);
			expect(playbackRate.samples.length).toBeGreaterThan(0);
			expect(playbackRate.samples.length).toBeLessThan(
				candidateConcurrencyOne.samples.length,
			);

			const fractionalFpsComposition = await selectComposition({
				id: 'audio-issue-10468-fractional-fps',
				serveUrl: exampleBuild,
				inputProps,
			});
			const fractionalFpsPath = path.join(tmpDir, 'fractional-fps-media.wav');
			await renderMedia({
				outputLocation: fractionalFpsPath,
				codec: 'wav',
				serveUrl: exampleBuild,
				composition: fractionalFpsComposition,
				inputProps,
				frameRange: [81, 119],
				sampleRate: 48000,
				concurrency: 1,
				logLevel: 'error',
			});
			const fractionalFps = readPcmWav(fractionalFpsPath);
			const expectedFractionalFpsFrames =
				Math.floor((119 / 29.97) * 48000) - Math.floor((81 / 29.97) * 48000);
			expect(fractionalFps.sampleRate).toBe(48000);
			expect(fractionalFps.samples.length / 2).toBe(
				expectedFractionalFpsFrames,
			);
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
