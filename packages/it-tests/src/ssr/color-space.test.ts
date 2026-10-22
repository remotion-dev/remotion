import {expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
	RenderInternals,
	openBrowser,
	renderMedia,
	selectComposition,
} from '@remotion/renderer';

const exampleBuild = path.join(__dirname, '..', '..', '..', 'example', 'build');

test('renders JPEG and PNG frames as BT.709 signals with complete metadata', async () => {
	const testRoot = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'remotion-bt709-test-'),
	);
	let browser: Awaited<ReturnType<typeof openBrowser>> | null = null;

	try {
		browser = await openBrowser('chrome');
		const composition = await selectComposition({
			id: 'green',
			serveUrl: exampleBuild,
			inputProps: {},
			puppeteerInstance: browser,
		});
		for (const imageFormat of ['jpeg', 'png'] as const) {
			const output = path.join(testRoot, `${imageFormat}.mp4`);
			const rawOutput = path.join(testRoot, `${imageFormat}.avi`);
			await renderMedia({
				codec: 'h264',
				colorSpace: 'bt709',
				composition,
				imageFormat,
				logLevel: 'error',
				outputLocation: output,
				puppeteerInstance: browser,
				serveUrl: exampleBuild,
			});

			const probe = await RenderInternals.callFf({
				bin: 'ffprobe',
				args: [
					'-v',
					'error',
					'-select_streams',
					'v:0',
					'-show_entries',
					'stream=pix_fmt,color_range,color_space,color_transfer,color_primaries',
					'-of',
					'json',
					output,
				],
				indent: false,
				logLevel: 'error',
				binariesDirectory: null,
				cancelSignal: undefined,
			});
			expect(JSON.parse(probe.stdout).streams).toEqual([
				{
					color_primaries: 'bt709',
					color_range: 'tv',
					color_space: 'bt709',
					color_transfer: 'bt709',
					pix_fmt: 'yuv420p',
				},
			]);

			await RenderInternals.callFf({
				bin: 'ffmpeg',
				args: [
					'-i',
					output,
					'-frames:v',
					'1',
					'-vf',
					'scale=1:1',
					'-c:v',
					'rawvideo',
					'-pix_fmt',
					'yuv444p',
					'-y',
					rawOutput,
				],
				indent: false,
				logLevel: 'error',
				binariesDirectory: null,
				cancelSignal: undefined,
			});
			const rawProbe = await RenderInternals.callFf({
				bin: 'ffprobe',
				args: [
					'-v',
					'error',
					'-show_packets',
					'-show_data',
					'-of',
					'json',
					rawOutput,
				],
				indent: false,
				logLevel: 'error',
				binariesDirectory: null,
				cancelSignal: undefined,
			});
			const rawData = JSON.parse(rawProbe.stdout) as {
				packets: [{data: string}];
			};
			const yuv = rawData.packets[0].data.match(
				/00000000: ([0-9a-f]{2})([0-9a-f]{2}) ([0-9a-f]{2})/,
			);
			expect(yuv).not.toBeNull();
			const [y, u, v] = yuv
				? yuv.slice(1).map((value) => Number.parseInt(value, 16))
				: [];
			expect(y).toBeWithin(92, 99);
			expect(u).toBeWithin(82, 89);
			expect(v).toBeWithin(74, 81);
		}
	} finally {
		if (browser) {
			await browser.close({silent: false});
		}

		await fs.promises.rm(testRoot, {recursive: true});
	}
});
