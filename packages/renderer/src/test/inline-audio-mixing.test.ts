import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, statSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {InlineAudioAsset} from 'remotion/no-react';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';
import {makeInlineAudioMixing} from '../assets/inline-audio-mixing';
import {mergeInlineAudioTracks} from '../merge-inline-audio-tracks';

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
	startInVideo: number | undefined;
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
		expect(track.startInSeconds).toBe(10);
		expect(track.durationInSeconds).toBeCloseTo(2 / FPS, 8);
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
			asset: makeAsset({id: 'unknown', frame: 3, startInVideo: undefined}),
			fps: FPS,
			totalNumberOfFrames: 4,
			firstFrame: 0,
			trimLeftOffset: 0,
			trimRightOffset: 0,
		});
		await finish(mixing);

		const [track] = mixing.getListOfAssets();
		expect(track.startInSeconds).toBe(0);
		expect(track.durationInSeconds).toBeCloseTo(4 / FPS, 8);
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
			expect(merged?.startInSeconds).toBe(startFrames[0] / FPS);
			expect(merged?.durationInSeconds).toBeCloseTo(
				(startFrames.at(-1)! - startFrames[0] + 1) / FPS,
				8,
			);
			expect(statSync(merged!.outName).size).toBeLessThan(4_000_000);
		} finally {
			cleanDownloadMap(downloadMap);
		}
	},
	{timeout: 120_000},
);
