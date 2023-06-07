import {bundle} from '@remotion/bundler';
import {
	getCompositions,
	RenderInternals,
	renderStill,
	StillImageFormat,
} from '@remotion/renderer';
import {existsSync, unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {AnyCompMetadata} from 'remotion';
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
		) as AnyCompMetadata;

		const folder = path.join(tmpdir(), 'remotion-test', 'render-still');
		const testOut = path.join(folder, 'still.png');

		const server = await RenderInternals.makeOrReuseServer(
			undefined,
			{
				webpackConfigOrServeUrl: bundled,
				port: null,
				remotionRoot: process.cwd(),
				concurrency: RenderInternals.getActualConcurrency(null),
				verbose: false,
				indent: false,
			},
			{
				onDownload: () => undefined,
				onError: (err) => {
					throw err;
				},
			}
		);

		const serveUrl = `http://localhost:${server.server.offthreadPort}`;
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

		await server.cleanupServer(true);
	},
	{
		retry: 3,
		timeout: 90000,
	}
);

test(
	'Can render a still pdf using Node.JS APIs',
	async () => {
		const imageFormat: StillImageFormat = 'pdf';
		const bundled = await bundle({
			entryPoint: path.join(process.cwd(), 'src/index.ts'),
			webpackOverride,
		});
		const folder = path.join(tmpdir(), 'remotion-test', 'render-still');

		const compositions = await getCompositions(bundled);

		const server = await RenderInternals.makeOrReuseServer(
			undefined,
			{
				webpackConfigOrServeUrl: bundled,
				port: null,
				remotionRoot: process.cwd(),
				concurrency: RenderInternals.getActualConcurrency(null),
				verbose: false,
				indent: false,
			},
			{
				onDownload: () => undefined,
				onError: (err) => {
					throw err;
				},
			}
		);

		const serveUrl = `http://localhost:${server.server.offthreadPort}`;

		const toRenderCompositions: [string, number][] = [
			['tiles', 15],
			['mdx-test', 0],
			['halloween-pumpkin', 45],
			['rect-test', 20],
		];

		for (const toRenderComposition of toRenderCompositions) {
			const composition = compositions.find(
				(c) => c.id === toRenderComposition[0]
			) as AnyCompMetadata;

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
			unlinkSync(testOut);
		}

		RenderInternals.deleteDirectory(bundled);
		RenderInternals.deleteDirectory(folder);

		await server.cleanupServer(true);
	},
	{
		retry: 3,
		timeout: 90000,
	}
);
