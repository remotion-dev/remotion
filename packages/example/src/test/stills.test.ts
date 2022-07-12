import {bundle} from '@remotion/bundler';
import {
	getCompositions,
	RenderInternals,
	renderStill,
} from '@remotion/renderer';
import {existsSync, unlinkSync} from 'fs';
import {tmpdir} from 'os';
import path from 'path';
import {TCompMetadata} from 'remotion';
import {webpackOverride} from '../webpack-override';

test('Can render a still using Node.JS APIs', async () => {
	const bundled = await bundle(
		path.join(process.cwd(), 'src/index.tsx'),
		() => undefined,
		{webpackOverride}
	);

	console.log('DID BUNDLE');

	const compositions = await getCompositions(bundled);
	console.log('DID GETCOMPOSITIONS');

	const composition = compositions.find(
		(c) => c.id === 'react-svg'
	) as TCompMetadata;

	const testOut = path.join(tmpdir(), 'path/to/still.png');

	const downloadDir = RenderInternals.tmpDir('remotion-assets-dir');

	const {port, close} = await RenderInternals.serveStatic(bundled, {
		downloadDir,
		onDownload: () => undefined,
		port: null,
		onError: (err) => {
			throw err;
		},
		ffmpegExecutable: null,
		ffprobeExecutable: null,
	});

	console.log('DID SERVE');

	const serveUrl = `http://localhost:${port}`;

	expect(() =>
		renderStill({
			composition,
			output: testOut,
			serveUrl,
			frame: 500,
		})
	).rejects.toThrow(
		/Cannot use frame 500: Duration of composition is 300, therefore the highest frame that can be rendered is 299/
	);

	expect(() =>
		renderStill({
			composition,
			output: process.platform === 'win32' ? 'D:\\' : '/var',
			serveUrl,
		})
	).rejects.toThrow(/already exists, but is not a file/);

	expect(() =>
		renderStill({
			composition,
			output: 'src/index.tsx',
			serveUrl,
			overwrite: false,
		})
	).rejects.toThrow(
		/Cannot render still - "overwrite" option was set to false, but the output/
	);

	console.log('DID PASS UNHAPPY PATHS');

	await renderStill({
		composition,
		output: testOut,
		serveUrl,
		frame: 100,
	});
	console.log('DID RENDERSTILL');

	expect(existsSync(testOut)).toBe(true);
	unlinkSync(testOut);

	await close();
	console.log('DID CLOSE');
}, 90000);
