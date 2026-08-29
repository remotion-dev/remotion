import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, statSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {InlineAudioAsset} from 'remotion/no-react';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';
import {makeInlineAudioMixing} from '../assets/inline-audio-mixing';
import {
	inlineAudioTrackToPreprocessedAudioTrack,
	mergeInlineAudioTracks,
} from '../merge-inline-audio-tracks';

const SAMPLE_RATE = 48_000;
const FPS = 30;
const SAMPLES_PER_FRAME = SAMPLE_RATE / FPS;

const makeAsset = ({
	id,
	frame,
	startInVideo,
}: {
	id: string;
	frame: number;
	startInVideo: number | null;
}): InlineAudioAsset => ({
	type: 'inline-audio',
	id,
	audio: new Int16Array(SAMPLES_PER_FRAME * 2).fill(1000),
	frame,
	startInVideo,
	timestamp: 0,
	duration: 1_000_000 / FPS,
	toneFrequency: 1,
});

const finish = (mixing: ReturnType<typeof makeInlineAudioMixing>) => {
	return mixing.finish({
		indent: false,
		logLevel: 'error',
		binariesDirectory: null,
		cancelSignal: undefined,
		sampleRate: SAMPLE_RATE,
	});
};

test('writes late inline audio relative to its clip origin', async () => {
	const dir = mkdtempSync(path.join(os.tmpdir(), 'inline-audio-relative-'));
	const mixing = makeInlineAudioMixing(dir, SAMPLE_RATE);

	try {
		// Deliberately write the second frame first to ensure the origin does not
		// depend on renderer concurrency or completion order.
		mixing.addAsset({
			asset: makeAsset({id: 'late', frame: 301, startInVideo: 300}),
			fps: FPS,
			totalNumberOfFrames: 330,
			firstFrame: 0,
			trimLeftOffset: 0,
			trimRightOffset: 0,
		});
		mixing.addAsset({
			asset: makeAsset({id: 'late', frame: 300, startInVideo: 300}),
			fps: FPS,
			totalNumberOfFrames: 330,
			firstFrame: 0,
			trimLeftOffset: 0,
			trimRightOffset: 0,
		});
		await finish(mixing);

		const [track] = mixing.getListOfAssets();
		const wav = readFileSync(track.outName);
		expect(track.startInSamples).toBe(10 * SAMPLE_RATE);
		expect(track.durationInSamples).toBe(2 * SAMPLES_PER_FRAME);
		expect(wav.length).toBe(44 + SAMPLES_PER_FRAME * 2 * 2 * 2);
		expect(wav.readUInt32LE(4)).toBe(wav.length - 8);
		expect(wav.readUInt32LE(40)).toBe(wav.length - 44);
	} finally {
		mixing.cleanup();
		rmSync(dir, {recursive: true, force: true});
	}
});

test('keeps a composition-relative fallback for an unknown clip origin', async () => {
	const dir = mkdtempSync(path.join(os.tmpdir(), 'inline-audio-fallback-'));
	const mixing = makeInlineAudioMixing(dir, SAMPLE_RATE);

	try {
		mixing.addAsset({
			asset: makeAsset({id: 'unknown', frame: 3, startInVideo: null}),
			fps: FPS,
			totalNumberOfFrames: 4,
			firstFrame: 0,
			trimLeftOffset: 0,
			trimRightOffset: 0,
		});
		await finish(mixing);

		const [track] = mixing.getListOfAssets();
		expect(track.startInSamples).toBe(0);
		expect(track.durationInSamples).toBe(4 * SAMPLES_PER_FRAME);
	} finally {
		mixing.cleanup();
		rmSync(dir, {recursive: true, force: true});
	}
});

test('preserves legacy sample placement at fractional frame rates', async () => {
	const dir = mkdtempSync(path.join(os.tmpdir(), 'inline-audio-fractional-'));
	const mixing = makeInlineAudioMixing(dir, SAMPLE_RATE);

	try {
		// Write out of order to also exercise sparse compact-file placement.
		mixing.addAsset({
			asset: makeAsset({id: 'fractional', frame: 83, startInVideo: 81}),
			fps: 24.87,
			totalNumberOfFrames: 41,
			firstFrame: 79,
			trimLeftOffset: 0.0021487736228385534,
			trimRightOffset: 0,
		});
		mixing.addAsset({
			asset: makeAsset({id: 'fractional', frame: 81, startInVideo: 81}),
			fps: 24.87,
			totalNumberOfFrames: 41,
			firstFrame: 79,
			trimLeftOffset: 0.0021487736228385534,
			trimRightOffset: 0,
		});
		await finish(mixing);

		const [track] = mixing.getListOfAssets();
		const wav = readFileSync(track.outName);
		const preprocessed = inlineAudioTrackToPreprocessedAudioTrack({
			track,
			relativeToInSamples: 0,
			padToDurationInSamples: null,
		});
		expect(preprocessed.filter.pad_start).toBe('adelay=3756S|3756S|3756S');
		// Legacy absolute placement for frame 83 is sample 7617. Relative to the
		// compact track's sample 3756 origin, its first sample must be at 3861.
		expect(wav.readInt16LE(44 + 3860 * 2 * 2)).toBe(0);
		expect(wav.readInt16LE(44 + 3861 * 2 * 2)).toBe(1000);
	} finally {
		mixing.cleanup();
		rmSync(dir, {recursive: true, force: true});
	}
});

test(
	'pre-merges 423 offset clips without materializing their timeline offsets',
	async () => {
		const downloadMap = makeDownloadMap(SAMPLE_RATE);

		try {
			let nextFrame = 300;
			const startFrames: number[] = [];
			for (let index = 0; index < 423; index++) {
				if (index % 17 === 0) {
					nextFrame += 4;
				} else if (index % 7 === 0) {
					nextFrame++;
				}

				startFrames.push(nextFrame);
				downloadMap.inlineAudioMixing.addAsset({
					asset: makeAsset({
						id: `clip-${index}`,
						frame: nextFrame,
						startInVideo: nextFrame,
					}),
					fps: FPS,
					totalNumberOfFrames: 1000,
					firstFrame: 0,
					trimLeftOffset: 0,
					trimRightOffset: 0,
				});
				nextFrame++;
			}

			await finish(downloadMap.inlineAudioMixing);
			const merged = await mergeInlineAudioTracks({
				tracks: downloadMap.inlineAudioMixing.getListOfAssets(),
				downloadMap,
				remotionRoot: process.cwd(),
				indent: false,
				logLevel: 'error',
				binariesDirectory: null,
				cancelSignal: undefined,
				fps: FPS,
				chunkLengthInSeconds: 12,
				sampleRate: SAMPLE_RATE,
			});

			expect(merged).not.toBeNull();
			expect(merged?.startInSamples).toBe((startFrames[0] * SAMPLE_RATE) / FPS);
			expect(merged?.durationInSamples).toBe(
				((startFrames.at(-1)! - startFrames[0] + 1) * SAMPLE_RATE) / FPS,
			);
			expect(statSync(merged!.outName).size).toBeLessThan(4_000_000);
		} finally {
			cleanDownloadMap(downloadMap);
		}
	},
	{timeout: 120_000},
);
