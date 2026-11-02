import {expect, test} from 'bun:test';
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import type {AudioConcatenation} from '@remotion/renderer';
import {
	openBrowser,
	RenderInternals,
	renderMedia,
	selectComposition,
} from '@remotion/renderer';

const fps = 30;
const sampleRate = 48000;
const durationInFrames = 150;
// A click every 0.37 s, so that shifting a chunk by a frame or by an AAC packet moves a click.
const clickTimesInSeconds = new Array(13)
	.fill(true)
	.map((_, i) => 0.05 + i * 0.37);

const makeClicksWav = () => {
	const sampleCount = (durationInFrames / fps) * sampleRate;
	const wav = Buffer.alloc(44 + sampleCount * 2);
	wav.write('RIFF', 0);
	wav.writeUInt32LE(wav.length - 8, 4);
	wav.write('WAVEfmt ', 8);
	wav.writeUInt32LE(16, 16);
	wav.writeUInt16LE(1, 20);
	wav.writeUInt16LE(1, 22);
	wav.writeUInt32LE(sampleRate, 24);
	wav.writeUInt32LE(sampleRate * 2, 28);
	wav.writeUInt16LE(2, 32);
	wav.writeUInt16LE(16, 34);
	wav.write('data', 36);
	wav.writeUInt32LE(sampleCount * 2, 40);
	for (const time of clickTimesInSeconds) {
		const start = Math.round(time * sampleRate);
		// 2 ms of a full-scale 3 kHz tone
		for (let sample = 0; sample < sampleRate * 0.002; sample++) {
			wav.writeInt16LE(
				Math.round(
					0.9 * 32767 * Math.cos((2 * Math.PI * 3000 * sample) / sampleRate),
				),
				44 + (start + sample) * 2,
			);
		}
	}

	return wav;
};

const getClicks = async (file: string) => {
	const wavPath = `${file}.wav`;
	await RenderInternals.callFf({
		bin: 'ffmpeg',
		args: [
			'-y',
			'-i',
			file,
			'-vn',
			'-ac',
			'1',
			'-ar',
			String(sampleRate),
			'-c:a',
			'pcm_s16le',
			wavPath,
		],
		indent: false,
		logLevel: 'error',
		binariesDirectory: null,
		cancelSignal: undefined,
	});
	const wav = readFileSync(wavPath);
	const dataStart = wav.indexOf('data') + 8;
	const pcm = wav.subarray(
		dataStart,
		dataStart + wav.readUInt32LE(dataStart - 4),
	);
	const samples = new Int16Array(
		pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + pcm.byteLength),
	);
	const onsets: number[] = [];
	for (let i = 0; i < samples.length; i++) {
		if (
			Math.abs(samples[i]) > 16000 &&
			(onsets.length === 0 || i / sampleRate - onsets[onsets.length - 1] > 0.2)
		) {
			onsets.push(i / sampleRate);
		}
	}

	return {onsets, durationInSeconds: samples.length / sampleRate};
};

const countVideoFrames = async (file: string) => {
	const {stdout} = await RenderInternals.callFf({
		bin: 'ffprobe',
		args: [
			'-v',
			'error',
			'-count_frames',
			'-select_streams',
			'v:0',
			'-show_entries',
			'stream=nb_read_frames',
			'-of',
			'csv=p=0',
			file,
		],
		indent: false,
		logLevel: 'error',
		binariesDirectory: null,
		cancelSignal: undefined,
	});
	return Number(stdout.trim());
};

test(
	'Merging unequal chunks lines up their audio with a single-pass render, seamless or encoded at the merge',
	async () => {
		const directory = mkdtempSync(path.join(tmpdir(), 'seamless-aac-chunks-'));
		const browser = await openBrowser('chrome');
		try {
			const publicDir = path.join(directory, 'public');
			mkdirSync(publicDir);
			writeFileSync(
				path.join(publicDir, 'clicks.wav'),
				new Uint8Array(makeClicksWav()),
			);
			const serveUrl = await bundle({
				entryPoint: path.join(__dirname, 'fixtures', 'seamless-aac-chunks.tsx'),
				publicDir,
				outDir: path.join(directory, 'bundle'),
				enableCaching: false,
			});
			const composition = await selectComposition({
				serveUrl,
				id: 'seamless-aac-chunks',
				puppeteerInstance: browser,
			});

			const reference = path.join(directory, 'reference.mp4');
			await renderMedia({
				composition,
				serveUrl,
				codec: 'h264',
				outputLocation: reference,
				puppeteerInstance: browser,
				logLevel: 'error',
			});
			const referenceClicks = await getClicks(reference);
			expect(referenceClicks.onsets).toHaveLength(clickTimesInSeconds.length);

			// Renders each chunk and merges them the way Remotion Lambda does.
			const renderInChunks = async (
				name: string,
				chunks: [number, number][],
				chunkDurationsInFrames: number[] | null,
				audioConcatenation: AudioConcatenation,
			) => {
				const framesPerChunk = Math.min(
					...chunks.map(([start, end]) => end - start + 1),
				);
				const seamlessAudio = RenderInternals.canConcatAudioSeamlessly(
					'aac',
					framesPerChunk,
					audioConcatenation,
				);
				const chunkAudioCodec = seamlessAudio ? 'aac' : 'pcm-16';
				const files: string[] = [];
				for (const [index, frameRange] of chunks.entries()) {
					const base = path.join(directory, `${name}-${index}`);
					await renderMedia({
						composition,
						serveUrl,
						codec: 'h264-ts',
						audioCodec: chunkAudioCodec,
						frameRange,
						outputLocation: `${base}.video`,
						separateAudioTo: `${base}.${RenderInternals.getExtensionFromAudioCodec(chunkAudioCodec)}`,
						forSeamlessAacConcatenation: seamlessAudio,
						compositionStart: 0,
						enforceAudioTrack: true,
						puppeteerInstance: browser,
						logLevel: 'error',
					});
					files.push(base);
				}

				const audioExtension =
					RenderInternals.getExtensionFromAudioCodec(chunkAudioCodec);

				const outputLocation = path.join(directory, `${name}.mp4`);
				await RenderInternals.internalCombineChunks({
					outputLocation,
					onProgress: () => undefined,
					codec: 'h264',
					fps,
					numberOfGifLoops: null,
					audioBitrate: null,
					indent: false,
					logLevel: 'error',
					binariesDirectory: null,
					cancelSignal: undefined,
					metadata: null,
					audioFiles: files.map((file) => `${file}.${audioExtension}`),
					videoFiles: files.map((file) => `${file}.video`),
					framesPerChunk,
					audioCodec: null,
					preferLossless: false,
					everyNthFrame: 1,
					frameRange: null,
					compositionDurationInFrames: durationInFrames,
					sampleRate,
					separateAudioTo: null,
					chunkDurationsInFrames,
					audioConcatenation,
				});
				return outputLocation;
			};

			const unequalChunks: [number, number][] = [
				[0, 6],
				[7, 51],
				[52, 59],
				[60, 149],
			];
			const equalChunks: [number, number][] = [
				[0, 29],
				[30, 59],
				[60, 89],
				[90, 119],
				[120, 149],
			];

			for (const merged of [
				await renderInChunks(
					'unequal',
					unequalChunks,
					unequalChunks.map(([start, end]) => end - start + 1),
					'seamless-if-possible',
				),
				await renderInChunks(
					'equal',
					equalChunks,
					null,
					'seamless-if-possible',
				),
				await renderInChunks(
					'unequal-encode-at-merge',
					unequalChunks,
					unequalChunks.map(([start, end]) => end - start + 1),
					'encode-at-merge',
				),
			]) {
				const {onsets, durationInSeconds} = await getClicks(merged);
				// Every click starts on the same sample as in the single-pass render.
				expect(onsets).toEqual(referenceClicks.onsets);

				expect(
					Math.abs(durationInSeconds - referenceClicks.durationInSeconds),
				).toBeLessThan(0.03);
				expect(await countVideoFrames(merged)).toBe(durationInFrames);
			}
		} finally {
			await browser.close({silent: true});
			rmSync(directory, {recursive: true, force: true});
		}
	},
	{timeout: 180000},
);
