import {bundle} from '@remotion/bundler';
import {
	getCompositions,
	ImageFormat,
	RenderInternals,
	renderStill,
} from '@remotion/renderer';
import {cleanDownloadMap} from '@remotion/renderer/dist/assets/download-map';
import {existsSync, unlinkSync} from 'fs';
import {tmpdir} from 'os';
import path from 'path';
import {TCompMetadata} from 'remotion';
import {expect, test} from 'vitest';
import {webpackOverride} from '../webpack-override';

test(
	'Can render a still png using Node.JS APIs',
	async () => {
		const bundled = await bundle({
			entryPoint: path.join(process.cwd(), 'src/index.ts'),
			webpackOverride,
		});

		const compositions = await getCompositions(bundled);

		const composition = compositions.find(
			(c) => c.id === 'react-svg'
		) as TCompMetadata;

		const folder = path.join(tmpdir(), 'remotion-test', 'render-still');
		const testOut = path.join(folder, 'still.png');

		const downloadMap = RenderInternals.makeDownloadMap();
		const {port, close} = await RenderInternals.serveStatic(bundled, {
			onDownload: () => undefined,
			port: null,
			onError: (err) => {
				throw err;
			},
			ffmpegExecutable: null,
			ffprobeExecutable: null,
			downloadMap,
			remotionRoot: process.cwd(),
		});

		const serveUrl = `http://localhost:${port}`;
		const fileOSRoot = path.parse(__dirname).root;

		await expect(() =>
			renderStill({
				composition,
				output: testOut,
				serveUrl,
				frame: 500,
			})
		).rejects.toThrow(
			/Cannot use frame 500: Duration of composition is 300, therefore the highest frame that can be rendered is 299/
		);

		await expect(() =>
			renderStill({
				composition,
				output: process.platform === 'win32' ? fileOSRoot : '/var',
				serveUrl,
			})
		).rejects.toThrow(/already exists, but is not a file/);

		await expect(() =>
			renderStill({
				composition,
				output: 'src/index.ts',
				serveUrl,
				overwrite: false,
			})
		).rejects.toThrow(
			/Cannot render still - "overwrite" option was set to false, but the output/
		);

		await renderStill({
			composition,
			output: testOut,
			serveUrl,
			frame: 100,
		});

		expect(existsSync(testOut)).toBe(true);
		unlinkSync(testOut);
		RenderInternals.deleteDirectory(bundled);
		RenderInternals.deleteDirectory(folder);
		cleanDownloadMap(downloadMap);

		await close();
	},
	{
		retry: 3,
		timeout: 90000,
	}
);

// TODO REMOVE - Just for testing
test(
	'Can render a still pdf using Node.JS APIs',
	async () => {
		const imageFormat: ImageFormat = 'pdf';
		const bundled = await bundle({
			entryPoint: path.join(process.cwd(), 'src/index.ts'),
			webpackOverride,
		});
		const folder = path.join(tmpdir(), 'remotion-test', 'render-still');

		const compositions = await getCompositions(bundled);

		const downloadMap = RenderInternals.makeDownloadMap();
		const {port, close} = await RenderInternals.serveStatic(bundled, {
			onDownload: () => undefined,
			port: null,
			onError: (err) => {
				throw err;
			},
			ffmpegExecutable: null,
			ffprobeExecutable: null,
			downloadMap,
			remotionRoot: process.cwd(),
		});

		const serveUrl = `http://localhost:${port}`;

		const toRenderCompositions: [string, number][] = [
			['tiles', 15],
			['mdx-test', 0],
			['three-basic', 15],
			['halloween-pumpkin', 45],
			['rect-test', 20],
		];

		for (const toRenderComposition of toRenderCompositions) {
			const composition = compositions.find(
				(c) => c.id === toRenderComposition[0]
			) as TCompMetadata;

			const testOut = path.join(
				folder,
				`${toRenderComposition[0]}-${toRenderComposition[1]}.${imageFormat}`
			);

			await renderStill({
				composition,
				output: testOut,
				serveUrl,
				frame: toRenderComposition[1],
				imageFormat,
			});

			expect(existsSync(testOut)).toBe(true);
			// TODO unlinkSync(testOut);
		}

		RenderInternals.deleteDirectory(bundled);
		// TODO RenderInternals.deleteDirectory(folder);
		cleanDownloadMap(downloadMap);

		await close();
	},
	{
		retry: 3,
		timeout: 90000,
	}
);
