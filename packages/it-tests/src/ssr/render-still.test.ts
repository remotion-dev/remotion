import {
	ensureBrowser,
	getCompositions,
	openBrowser,
	renderStill,
} from '@remotion/renderer';
import {beforeAll, expect, test} from 'bun:test';
import {existsSync} from 'fs';
import os from 'os';
import path from 'path';

beforeAll(async () => {
	await ensureBrowser();
});

test('Render video with browser instance open', async () => {
	const puppeteerInstance = await openBrowser('chrome');
	const compositions = await getCompositions(
		'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
		{
			puppeteerInstance,
			inputProps: {},
		},
	);

	const reactSvg = compositions.find((c) => c.id === 'react-svg');

	if (!reactSvg) {
		throw new Error('not found');
	}

	const tmpDir = os.tmpdir();

	const outPath = path.join(tmpDir, 'out.mp4');

	const {buffer} = await renderStill({
		output: outPath,
		serveUrl:
			'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
		composition: reactSvg,
		puppeteerInstance,
	});
	expect(buffer).toBe(null);
	await puppeteerInstance.close({silent: false});
});

test('Render still with browser instance not open and legacy webpack config', async () => {
	const compositions = await getCompositions(
		'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
	);

	const reactSvg = compositions.find((c) => c.id === 'react-svg');

	if (!reactSvg) {
		throw new Error('not found');
	}

	const tmpDir = os.tmpdir();

	const outPath = path.join(tmpDir, 'subdir', 'out.jpg');

	await renderStill({
		output: outPath,
		serveUrl:
			'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
		composition: reactSvg,
	});
	expect(existsSync(outPath)).toBe(true);
});
