import {readFileSync} from 'fs';
import {createServer} from 'http';
import path from 'path';
import {expect, test} from '@playwright/test';
import {BundlerInternals} from '@remotion/bundler';
import {exampleDir} from './constants.mts';

// Playwright's open-source Chromium build omits the proprietary AAC decoder.
// Chrome exercises the same Chromium WebCodecs path with AAC enabled.
test.use({channel: 'chrome'});

test.describe('transcription media resampling', () => {
	test('decodes authenticated AAC media into mono 16kHz Float32 PCM', async ({
		page,
	}) => {
		const resamplerPath = path.resolve(
			exampleDir,
			'..',
			'studio',
			'src',
			'components',
			'Transcription',
			'resample-media-to-16-khz.ts',
		);
		const result = await BundlerInternals.esbuild.build({
			bundle: true,
			entryPoints: [resamplerPath],
			format: 'iife',
			globalName: 'RemotionTranscriptionResamplingTest',
			platform: 'browser',
			write: false,
		});
		const browserBundle = result.outputFiles[0]?.text;
		if (!browserBundle) {
			throw new Error('Did not generate the browser resampling bundle.');
		}

		const media = readFileSync(
			path.join(exampleDir, 'public', 'demo_smpte_h264_aac.mp4'),
		);
		const server = createServer((request, response) => {
			if (request.url === '/') {
				response.setHeader('Content-Type', 'text/html');
				response.end('<!doctype html><title>Resampling test</title>');
				return;
			}

			if (request.url !== '/fixture.mp4') {
				response.statusCode = 404;
				response.end();
				return;
			}
			if (request.headers['x-remotion-test'] !== 'transcription') {
				response.statusCode = 401;
				response.end();
				return;
			}

			const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
			const start = range ? Number(range[1]) : 0;
			const requestedEnd = range?.[2] ? Number(range[2]) : media.length - 1;
			const end = Math.min(requestedEnd, media.length - 1);
			response.statusCode = range ? 206 : 200;
			response.setHeader('Accept-Ranges', 'bytes');
			response.setHeader('Content-Type', 'video/mp4');
			response.setHeader('Content-Length', end - start + 1);
			if (range) {
				response.setHeader(
					'Content-Range',
					`bytes ${start}-${end}/${media.length}`,
				);
			}

			response.end(
				request.method === 'HEAD' ? undefined : media.subarray(start, end + 1),
			);
		});
		await new Promise<void>((resolve) =>
			server.listen(0, '127.0.0.1', resolve),
		);

		try {
			const address = server.address();
			if (address === null || typeof address === 'string') {
				throw new Error('Could not determine the media server port.');
			}

			await page.goto(`http://127.0.0.1:${address.port}`);
			await page.addScriptTag({content: browserBundle});
			const waveform = await page.evaluate(async () => {
				const progress: number[] = [];
				const bundle = window as typeof window & {
					RemotionTranscriptionResamplingTest: {
						resampleMediaTo16Khz: (options: {
							src: string;
							audioStreamIndex: number | null;
							requestInit: Omit<RequestInit, 'signal'> | null;
							onProgress: (value: number) => void;
						}) => Promise<Float32Array>;
					};
				};
				const pcm =
					await bundle.RemotionTranscriptionResamplingTest.resampleMediaTo16Khz(
						{
							src: '/fixture.mp4',
							audioStreamIndex: null,
							requestInit: {
								headers: {'x-remotion-test': 'transcription'},
							},
							onProgress: (value) => progress.push(value),
						},
					);

				let peak = 0;
				for (const sample of pcm) {
					peak = Math.max(peak, Math.abs(sample));
				}

				return {
					isFloat32Array: pcm instanceof Float32Array,
					length: pcm.length,
					peak,
					progress,
				};
			});

			expect(waveform.isFloat32Array).toBe(true);
			// The fixture is 10 seconds long. Around 160,000 samples proves that the
			// stereo 48kHz AAC track was converted to mono PCM at 16kHz.
			expect(waveform.length).toBeGreaterThan(159_000);
			expect(waveform.length).toBeLessThan(161_000);
			expect(waveform.peak).toBeGreaterThan(0);
			expect(waveform.progress[0]).toBe(0);
			expect(waveform.progress.at(-1)).toBe(1);
		} finally {
			await new Promise<void>((resolve, reject) => {
				server.close((error) => (error ? reject(error) : resolve()));
			});
		}
	});
});
