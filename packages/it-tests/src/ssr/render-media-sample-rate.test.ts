import {expect, test} from 'bun:test';
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	statSync,
} from 'node:fs';
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

const STRESS_FPS = 30;
const STRESS_SAMPLE_RATE = 48_000;
const STRESS_DURATION_IN_FRAMES = 620;
const STRESS_CLIP_COUNT = 423;
const STRESS_SOURCE_AMPLITUDE = 8000;
const STRESS_INTERMITTENT_START = 28;
const stressIntermittentRanges = [
	{from: 0, durationInFrames: 37},
	{from: 52, durationInFrames: 39},
	{from: 143, durationInFrames: 37},
	{from: 260, durationInFrames: 70},
	{from: 411, durationInFrames: 89},
];

let nextStressClipStart = 20;
const stressClips = new Array(STRESS_CLIP_COUNT).fill(null).map((_, index) => {
	if (index % 17 === 0) {
		nextStressClipStart += 4;
	} else if (index % 7 === 0) {
		nextStressClipStart++;
	}

	const middleFrom = (index * 7) % 8;
	const innerFrom = (index * 11) % 9;
	const clip = {
		outerFrom: nextStressClipStart - middleFrom - innerFrom,
		middleFrom,
		innerFrom,
		durationInFrames: 1,
	};
	nextStressClipStart++;
	return clip;
});

const stressClipStarts = new Set(
	stressClips.map((clip) => clip.outerFrom + clip.middleFrom + clip.innerFrom),
);

const makeConstantPcmWavDataUrl = () => {
	const channels = 2;
	const sourceDurationInFrames = 30;
	const samplesPerChannel =
		(STRESS_SAMPLE_RATE / STRESS_FPS) * sourceDurationInFrames;
	const dataSize = samplesPerChannel * channels * 2;
	const wav = Buffer.alloc(44 + dataSize);
	wav.write('RIFF', 0);
	wav.writeUInt32LE(36 + dataSize, 4);
	wav.write('WAVE', 8);
	wav.write('fmt ', 12);
	wav.writeUInt32LE(16, 16);
	wav.writeUInt16LE(1, 20);
	wav.writeUInt16LE(channels, 22);
	wav.writeUInt32LE(STRESS_SAMPLE_RATE, 24);
	wav.writeUInt32LE(STRESS_SAMPLE_RATE * channels * 2, 28);
	wav.writeUInt16LE(channels * 2, 32);
	wav.writeUInt16LE(16, 34);
	wav.write('data', 36);
	wav.writeUInt32LE(dataSize, 40);
	for (let offset = 44; offset < wav.length; offset += 2) {
		wav.writeInt16LE(STRESS_SOURCE_AMPLITUDE, offset);
	}

	return `data:audio/wav;base64,${wav.toString('base64')}`;
};

const inlineAudioStressInputProps = {
	src: makeConstantPcmWavDataUrl(),
	clips: stressClips,
	intermittentOuterFrom: 11,
	intermittentInnerFrom: 17,
	intermittentDurationInFrames: 560,
	intermittentRanges: stressIntermittentRanges,
};

const getInlineAudioTempSize = (
	directory: string,
	insideInlineAudioDirectory: boolean,
): number => {
	if (!existsSync(directory)) {
		return 0;
	}

	try {
		return readdirSync(directory, {withFileTypes: true}).reduce(
			(total, entry) => {
				const entryPath = path.join(directory, entry.name);
				if (entry.isFile()) {
					return insideInlineAudioDirectory
						? total + statSync(entryPath).size
						: total;
				}

				if (!entry.isDirectory()) {
					return total;
				}

				return (
					total +
					getInlineAudioTempSize(
						entryPath,
						insideInlineAudioDirectory ||
							entry.name === 'remotion-inline-audio-mixing',
					)
				);
			},
			0,
		);
	} catch {
		// The renderer can delete a temporary file between readdirSync() and
		// statSync() while the size monitor is running.
		return 0;
	}
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
	'@remotion/media keeps 423 nested and intermittently mounted audio clips sample-aligned',
	async () => {
		const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'inline-audio-stress-'));
		const previousTmpDir = process.env.TMPDIR;
		process.env.TMPDIR = tmpDir;
		let peakInlineAudioTempSize = 0;
		const tempSizeMonitor = setInterval(() => {
			peakInlineAudioTempSize = Math.max(
				peakInlineAudioTempSize,
				getInlineAudioTempSize(tmpDir, false),
			);
		}, 5);
		try {
			const outputLocation = path.join(tmpDir, 'stress.wav');
			const composition = await selectComposition({
				id: 'inline-audio-stress',
				serveUrl: exampleBuild,
				inputProps: inlineAudioStressInputProps,
			});
			await renderMedia({
				outputLocation,
				codec: 'wav',
				serveUrl: exampleBuild,
				composition,
				inputProps: inlineAudioStressInputProps,
				sampleRate: STRESS_SAMPLE_RATE,
				concurrency: 4,
				logLevel: 'error',
			});

			const rendered = readPcmWav(outputLocation);
			expect(rendered.sampleRate).toBe(STRESS_SAMPLE_RATE);
			expect(rendered.channels).toBe(2);
			const samplesPerFrame = STRESS_SAMPLE_RATE / STRESS_FPS;
			const expectedSampleCount =
				STRESS_DURATION_IN_FRAMES * samplesPerFrame * rendered.channels;
			expect(rendered.samples.length).toBe(expectedSampleCount);

			const observedLevels = new Set<number>();
			let maximumMeanError = 0;
			for (let frame = 0; frame < STRESS_DURATION_IN_FRAMES; frame++) {
				const intermittentFrame = frame - STRESS_INTERMITTENT_START;
				const intermittentIsMounted = stressIntermittentRanges.some(
					(range) =>
						intermittentFrame >= range.from &&
						intermittentFrame < range.from + range.durationInFrames,
				);
				const expectedAmplitude =
					(stressClipStarts.has(frame) ? 2000 : 0) +
					(intermittentIsMounted ? 1000 : 0);
				observedLevels.add(expectedAmplitude);

				// Ignore a few samples at frame boundaries so this assertion is about
				// timeline placement rather than decoder edge interpolation.
				const firstSample = (frame * samplesPerFrame + 64) * rendered.channels;
				const lastSample =
					((frame + 1) * samplesPerFrame - 64) * rendered.channels;
				let sum = 0;
				for (let sample = firstSample; sample < lastSample; sample++) {
					sum += Math.abs(rendered.samples[sample]);
				}

				const mean = sum / (lastSample - firstSample);
				maximumMeanError = Math.max(
					maximumMeanError,
					Math.abs(mean - expectedAmplitude),
				);
			}

			expect([...observedLevels].sort((a, b) => a - b)).toEqual([
				0, 1000, 2000, 3000,
			]);
			expect(maximumMeanError).toBeLessThanOrEqual(20);
			expect(peakInlineAudioTempSize).toBeGreaterThan(2_000_000);
			expect(peakInlineAudioTempSize).toBeLessThan(10_000_000);
		} finally {
			clearInterval(tempSizeMonitor);
			if (previousTmpDir === undefined) {
				delete process.env.TMPDIR;
			} else {
				process.env.TMPDIR = previousTmpDir;
			}

			rmSync(tmpDir, {recursive: true, force: true});
		}
	},
	{timeout: 300000},
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
