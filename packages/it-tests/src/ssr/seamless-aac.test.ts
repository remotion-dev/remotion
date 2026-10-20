import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, selectComposition} from '@remotion/renderer';

test(
	'Seamless AAC alignment preserves the start of audio mounted mid-chunk (#12274)',
	async () => {
		const directory = mkdtempSync(path.join(tmpdir(), 'seamless-aac-'));
		const browser = await openBrowser('chrome');
		try {
			const sampleRate = 48000;
			const channels = 2;
			const sampleCount = sampleRate * 0.6;
			const source = Buffer.alloc(44 + sampleCount * channels * 2);
			source.write('RIFF', 0);
			source.writeUInt32LE(source.length - 8, 4);
			source.write('WAVEfmt ', 8);
			source.writeUInt32LE(16, 16);
			source.writeUInt16LE(1, 20);
			source.writeUInt16LE(channels, 22);
			source.writeUInt32LE(sampleRate, 24);
			source.writeUInt32LE(sampleRate * channels * 2, 28);
			source.writeUInt16LE(channels * 2, 32);
			source.writeUInt16LE(16, 34);
			source.write('data', 36);
			source.writeUInt32LE(sampleCount * channels * 2, 40);
			// Like the reported pop, all audible energy is in the first 32 ms.
			for (let sample = 0; sample < sampleRate * 0.032; sample++) {
				for (let channel = 0; channel < channels; channel++) {
					source.writeInt16LE(
						Math.round(
							Math.cos((sample * 2 * Math.PI * 1000) / sampleRate) * 16000,
						),
						44 + (sample * channels + channel) * 2,
					);
				}
			}

			const inputProps = {
				src: `data:audio/wav;base64,${source.toString('base64')}`,
			};
			const serveUrl = await bundle({
				entryPoint: path.join(__dirname, 'fixtures', 'seamless-aac.tsx'),
				outDir: path.join(directory, 'bundle'),
				enableCaching: false,
			});
			const composition = await selectComposition({
				serveUrl,
				id: 'seamless-aac',
				inputProps,
				puppeteerInstance: browser,
			});
			const outputLocation = path.join(directory, 'chunk.wav');
			await renderMedia({
				composition,
				serveUrl,
				inputProps,
				outputLocation,
				// Inspect lossless samples before AAC encoding, exercising the same
				// chunk alignment and audio mixing as the Lambda renderer.
				codec: 'wav',
				frameRange: [334, 360],
				compositionStart: 280,
				forSeamlessAacConcatenation: true,
				sampleRate,
				concurrency: 1,
				puppeteerInstance: browser,
				logLevel: 'error',
			});

			const rendered = readFileSync(outputLocation);
			let offset = 12;
			let pcm: Buffer | null = null;
			while (offset + 8 <= rendered.length) {
				const size = rendered.readUInt32LE(offset + 4);
				if (rendered.toString('ascii', offset, offset + 4) === 'data') {
					pcm = rendered.subarray(offset + 8, offset + 8 + size);
					break;
				}

				offset += 8 + size + (size % 2);
			}

			if (pcm === null) {
				throw new Error('Rendered WAV has no PCM samples');
			}

			// Capture begins at frame 332, then advances 32 ms to the AAC boundary.
			// The pop at frame 359 must therefore start at 1.048 s in this chunk.
			const onset = Math.round(1.048 * sampleRate);
			const samples = new Int16Array(
				pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + pcm.byteLength),
			);
			expect(samples.findIndex((sample) => sample !== 0)).toBe(
				onset * channels,
			);

			let maximumError = 0;
			for (let sample = 0; sample < sampleRate * 0.032; sample++) {
				const expected = Math.round(
					source.readInt16LE(44 + sample * channels * 2) * 0.2,
				);
				maximumError = Math.max(
					maximumError,
					Math.abs(samples[(onset + sample) * channels] - expected),
				);
			}

			expect(maximumError).toBeLessThanOrEqual(1);
		} finally {
			await browser.close({silent: true});
			rmSync(directory, {recursive: true, force: true});
		}
	},
	{timeout: 60000},
);
