import {beforeAll, expect, test} from 'bun:test';
import {execSync} from 'node:child_process';
import {existsSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	RenderInternals,
	openBrowser,
	renderMedia,
	renderStill,
	selectComposition,
	StillImageFormat,
} from '@remotion/renderer';
import {$} from 'bun';
import sharp from 'sharp';

if (process.platform === 'win32') {
	process.exit(0);
}

const exampleDir = path.join(__dirname, '..', '..');

beforeAll(async () => {
	await $`bunx remotion browser ensure`.cwd(exampleDir);
});

test(
	'Can render stills and colorspaces using Node.JS APIs',
	async () => {
		const browser = await openBrowser('chrome');

		try {
			const pngComposition = await selectComposition({
				serveUrl: path.join(exampleDir, 'build'),
				id: 'react-svg',
				inputProps: {},
				puppeteerInstance: browser,
			});

			const folder = path.join(tmpdir(), 'remotion-test', 'render-still');
			const pngOutput = path.join(folder, 'still.png');
			const fileOSRoot = path.parse(__dirname).root;

			await expect(
				renderStill({
					composition: pngComposition,
					output: pngOutput,
					serveUrl: path.join(exampleDir, 'build'),
					frame: 500,
					puppeteerInstance: browser,
				}),
			).rejects.toThrow(
				/Cannot use frame 500: Duration of composition is 300, therefore the highest frame that can be rendered is 299/,
			);

			await expect(
				renderStill({
					composition: pngComposition,
					output: process.platform === 'win32' ? fileOSRoot : '/var',
					serveUrl: path.join(exampleDir, 'build'),
					puppeteerInstance: browser,
				}),
			).rejects.toThrow(/already exists, but is not a file/);

			await expect(
				renderStill({
					composition: pngComposition,
					output: 'src/index.ts',
					serveUrl: path.join(exampleDir, 'build'),
					overwrite: false,
					puppeteerInstance: browser,
				}),
			).rejects.toThrow(
				/Cannot render still - "overwrite" option was set to false, but the output/,
			);

			await renderStill({
				composition: pngComposition,
				output: pngOutput,
				serveUrl: path.join(exampleDir, 'build'),
				frame: 100,
				puppeteerInstance: browser,
			});

			expect(existsSync(pngOutput)).toBe(true);
			unlinkSync(pngOutput);
			RenderInternals.deleteDirectory(folder);

			if (process.platform !== 'linux') {
				const imageFormat: StillImageFormat = 'pdf';
				const pdfComposition = await selectComposition({
					serveUrl: path.join(exampleDir, 'build'),
					id: 'tiles',
					inputProps: {},
					puppeteerInstance: browser,
				});
				const pdfOutput = path.join(folder, `edgecase.${imageFormat}`);

				await renderStill({
					composition: pdfComposition,
					output: pdfOutput,
					serveUrl: path.join(exampleDir, 'build'),
					frame: 15,
					imageFormat,
					puppeteerInstance: browser,
				});

				expect(existsSync(pdfOutput)).toBe(true);
				unlinkSync(pdfOutput);
				RenderInternals.deleteDirectory(folder);
			}

			const colorComposition = await selectComposition({
				serveUrl: path.join(exampleDir, 'build'),
				id: 'green',
				inputProps: {},
				puppeteerInstance: browser,
			});
			const still = await renderStill({
				composition: colorComposition,
				serveUrl: path.join(exampleDir, 'build'),
				puppeteerInstance: browser,
			});
			const img = await sharp(still.buffer as Buffer)
				.raw()
				.toBuffer();
			const actualColor = {
				red: img.readUInt8(0),
				green: img.readUInt8(1),
				blue: img.readUInt8(2),
			};

			expect(actualColor.blue).toBe(0);
			expect(actualColor.green).toBe(128);
			expect(actualColor.blue).toBe(0);

			const {buffer} = await renderMedia({
				codec: 'h264',
				composition: colorComposition,
				imageFormat: 'png',
				serveUrl: path.join(exampleDir, 'build'),
				muted: true,
				puppeteerInstance: browser,
			});

			writeFileSync('out.mp4', new Uint8Array(buffer as Buffer));
			execSync('bunx remotion ffmpeg -i - -frames:v 1 -c:v png out%02d.png', {
				input: new Uint8Array(buffer as Buffer),
				stdio: ['pipe', 'ignore', 'ignore'],
			});

			const pngBuffer = readFileSync('out01.png');
			const frameImg = await sharp(pngBuffer).raw().toBuffer();
			const actualColorFrame = {
				red: frameImg.readUInt8(0),
				green: frameImg.readUInt8(1),
				blue: frameImg.readUInt8(2),
			};
			expect(actualColorFrame.blue).toBe(0);
			expect(actualColorFrame.green).toBeGreaterThanOrEqual(126);
			expect(actualColorFrame.green).toBeLessThanOrEqual(128);
			expect(actualColorFrame.blue).toBe(0);

			unlinkSync('out01.png');
			unlinkSync('out.mp4');
		} finally {
			await browser.close({silent: false});
		}
	},
	{
		retry: 3,
		timeout: 90000,
	},
);
