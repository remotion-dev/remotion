import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {NoReactInternals, type InlineAudioAsset} from 'remotion/no-react';
import {makeInlineAudioMixing} from '../assets/inline-audio-mixing';

test('inline audio frames use non-overlapping sample ranges', () => {
	const dir = mkdtempSync(path.join(os.tmpdir(), 'inline-audio-mixing-'));
	const sampleRate = 48000;
	const fps = 29.97;
	const firstFrame = 1;
	const totalNumberOfFrames = 3;
	const mixing = makeInlineAudioMixing(dir, sampleRate);

	try {
		for (const frame of [2, 1, 3]) {
			const start = NoReactInternals.getAudioSamplePosition({
				frame,
				fps,
				sampleRate,
			});
			const end = NoReactInternals.getAudioSamplePosition({
				frame: frame + 1,
				fps,
				sampleRate,
			});
			const audio = new Int16Array((end - start) * 2);
			audio.fill(frame);
			const asset: InlineAudioAsset = {
				type: 'inline-audio',
				id: 'audio',
				audio,
				frame,
				timestamp: 0,
				duration: 0,
				toneFrequency: 1,
			};

			mixing.addAsset({
				asset,
				fps,
				totalNumberOfFrames,
				firstFrame,
				trimLeftOffset: 0,
				trimRightOffset: 0,
			});
		}

		const file = readFileSync(mixing.getListOfAssets()[0]);
		const pcm = new Int16Array(
			file.buffer.slice(
				file.byteOffset + 44,
				file.byteOffset + file.byteLength,
			),
		);
		const firstSample = NoReactInternals.getAudioSamplePosition({
			frame: firstFrame,
			fps,
			sampleRate,
		});
		const lastSample = NoReactInternals.getAudioSamplePosition({
			frame: firstFrame + totalNumberOfFrames,
			fps,
			sampleRate,
		});
		expect(pcm.length).toBe((lastSample - firstSample) * 2);

		const expected = new Int16Array(pcm.length);
		for (
			let frame = firstFrame;
			frame < firstFrame + totalNumberOfFrames;
			frame++
		) {
			const start = NoReactInternals.getAudioSamplePosition({
				frame,
				fps,
				sampleRate,
			});
			const end = NoReactInternals.getAudioSamplePosition({
				frame: frame + 1,
				fps,
				sampleRate,
			});
			expected.fill(frame, (start - firstSample) * 2, (end - firstSample) * 2);
		}

		expect(pcm).toEqual(expected);
	} finally {
		mixing.cleanup();
		rmSync(dir, {recursive: true, force: true});
	}
});
