import {bundle} from '@remotion/bundler';
import {
	getCompositions,
	RenderInternals,
	renderMedia,
	renderStill,
	selectComposition,
	StillImageFormat,
} from '@remotion/renderer';
import {execSync} from 'node:child_process';
import {existsSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {VideoConfig} from 'remotion';
import sharp from 'sharp';
import {afterAll, beforeAll, expect, test} from 'vitest';
// @ts-expect-error it does work
import {webpackOverride} from '../webpack-override.mjs';

let bundled = 'none';

beforeAll(async () => {
	bundled = await bundle({
		entryPoint: path.join(process.cwd(), 'src/index.ts'),
		webpackOverride,
	});
});

afterAll(() => {
	RenderInternals.deleteDirectory(bundled);
});

test(
	'Can render a still png using Node.JS APIs',
	async () => {
		const compositions = await getCompositions(bundled);

		const composition = compositions.find(
			(c) => c.id === 'react-svg',
		) as VideoConfig;

		const folder = path.join(tmpdir(), 'remotion-test', 'render-still');
		const testOut = path.join(folder, 'still.png');

		const fileOSRoot = path.parse(__dirname).root;

		await expect(() =>
			renderStill({
				composition,
				output: testOut,
				serveUrl: bundled,
				frame: 500,
			}),
		).rejects.toThrow(
			/Cannot use frame 500: Duration of composition is 300, therefore the highest frame that can be rendered is 299/,
		);

		await expect(() =>
			renderStill({
				composition,
				output: process.platform === 'win32' ? fileOSRoot : '/var',
				serveUrl: bundled,
			}),
		).rejects.toThrow(/already exists, but is not a file/);

		await expect(() =>
			renderStill({
				composition,
				output: 'src/index.ts',
				serveUrl: bundled,
				overwrite: false,
			}),
		).rejects.toThrow(
			/Cannot render still - "overwrite" option was set to false, but the output/,
		);

		await renderStill({
			composition,
			output: testOut,
			serveUrl: bundled,
			frame: 100,
		});

		expect(existsSync(testOut)).toBe(true);
		unlinkSync(testOut);
		RenderInternals.deleteDirectory(folder);
	},
	{
		retry: 3,
		timeout: 90000,
	},
);

test(
	'Can render a still pdf using Node.JS APIs',
	async () => {
		const imageFormat: StillImageFormat = 'pdf';
		const folder = path.join(tmpdir(), 'remotion-test', 'render-still');

		const composition = await selectComposition({
			serveUrl: bundled,
			id: 'tiles',
		});

		const testOut = path.join(folder, `.${imageFormat}`);

		await renderStill({
			composition,
			output: testOut,
			serveUrl: bundled,
			frame: 15,
			imageFormat,
		});

		expect(existsSync(testOut)).toBe(true);
		unlinkSync(testOut);

		RenderInternals.deleteDirectory(folder);
	},
	{
		retry: 3,
		timeout: 90000,
	},
);

test('Bt709 encoding should work', async () => {
	const composition = await selectComposition({
		serveUrl: bundled,
		id: 'green',
	});

	const still = await renderStill({
		composition,
		serveUrl: bundled,
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
		composition,
		imageFormat: 'png',
		colorSpace: 'bt709',
		serveUrl: bundled,
		muted: true,
	});

	writeFileSync('out.mp4', buffer as Buffer);

	execSync('pnpm exec remotion ffmpeg -i - -frames:v 1 -c:v png out%02d.png', {
		input: buffer as Buffer,
	});

	const pngBuffer = readFileSync('out01.png');

	const frameImg = await sharp(pngBuffer).raw().toBuffer();
	const actualColorFrame = {
		red: frameImg.readUInt8(0),
		green: frameImg.readUInt8(1),
		blue: frameImg.readUInt8(2),
	};
	expect(actualColorFrame.blue).toBe(0);
	expect(actualColorFrame.green).toBe(126);
	expect(actualColorFrame.blue).toBe(0);

	unlinkSync('out01.png');
	unlinkSync('out.mp4');
});
