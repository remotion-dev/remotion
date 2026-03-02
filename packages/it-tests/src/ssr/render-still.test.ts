import {beforeAll, expect, test} from 'bun:test';
import {existsSync} from 'fs';
import os from 'os';
import path from 'path';
import {
	ensureBrowser,
	getCompositions,
	openBrowser,
	renderStill,
} from '@remotion/renderer';

const exampleBuild = path.join(__dirname, '..', '..', '..', 'example', 'build');

beforeAll(async () => {
	await ensureBrowser();
});

test('Render video with browser instance open', async () => {
	const puppeteerInstance = await openBrowser('chrome');
	const compositions = await getCompositions(exampleBuild, {
		puppeteerInstance,
		inputProps: {},
	});

	const reactSvg = compositions.find((c) => c.id === 'react-svg');

	if (!reactSvg) {
		throw new Error('not found');
	}

	const tmpDir = os.tmpdir();

	const outPath = path.join(tmpDir, 'out.mp4');

	const {buffer} = await renderStill({
		output: outPath,
		serveUrl: exampleBuild,
		composition: reactSvg,
		puppeteerInstance,
	});
	expect(buffer).toBe(null);
	await puppeteerInstance.close({silent: false});
});

test('Render still with browser instance not open and legacy webpack config', async () => {
	const compositions = await getCompositions(exampleBuild);

	const reactSvg = compositions.find((c) => c.id === 'react-svg');

	if (!reactSvg) {
		throw new Error('not found');
	}

	const tmpDir = os.tmpdir();

	const outPath = path.join(tmpDir, 'subdir', 'out.jpg');

	await renderStill({
		output: outPath,
		serveUrl: exampleBuild,
		composition: reactSvg,
	});
	expect(existsSync(outPath)).toBe(true);
});
