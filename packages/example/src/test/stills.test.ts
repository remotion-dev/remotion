import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill} from '@remotion/renderer';
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

	const compositions = await getCompositions(bundled);

	const composition = compositions.find(
		(c) => c.id === 'react-svg'
	) as TCompMetadata;

	const testOut = path.join(tmpdir(), 'path/to/still.png');

	expect(() =>
		renderStill({
			composition,
			output: testOut,
			webpackBundle: bundled,
			frame: 500,
		})
	).rejects.toThrow(
		/Cannot use frame 500: Duration of composition is 300, therefore the highest frame that can be rendered is 299/
	);

	expect(() =>
		renderStill({
			composition,
			output: process.platform === 'win32' ? 'D:\\my\\path' : '/var',
			webpackBundle: bundled,
		})
	).rejects.toThrow(/already exists, but is not a file/);

	expect(() =>
		renderStill({
			composition,
			output: 'src/index.tsx',
			webpackBundle: bundled,
			overwrite: false,
		})
	).rejects.toThrow(
		/Cannot render still - "overwrite" option was set to false, but the output/
	);

	await renderStill({
		composition,
		output: testOut,
		webpackBundle: bundled,
		frame: 100,
	});

	expect(existsSync(testOut)).toBe(true);
	unlinkSync(testOut);
});
