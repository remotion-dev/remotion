import {expect, test} from 'bun:test';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {openBrowser, renderMedia, selectComposition} from '@remotion/renderer';

const exampleBuild = path.join(__dirname, '..', '..', '..', 'example', 'build');

test('A tab closing during a render should leave a passed-in browser running', async () => {
	const puppeteerInstance = await openBrowser('chrome');
	const outputDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'remotion-'),
	);

	try {
		const composition = await selectComposition({
			id: 'react-svg',
			serveUrl: exampleBuild,
			puppeteerInstance,
			inputProps: {},
		});

		let tabClosed = false;

		await renderMedia({
			codec: 'h264',
			composition,
			concurrency: 2,
			frameRange: [0, 59],
			outputLocation: path.join(outputDir, 'out.mp4'),
			puppeteerInstance,
			serveUrl: exampleBuild,
			onProgress: async ({renderedFrames}) => {
				if (renderedFrames < 10 || tabClosed) {
					return;
				}

				tabClosed = true;
				const pages = await puppeteerInstance.pages();
				await pages.find((p) => p.url().startsWith('http'))?.close();
			},
		});

		expect(tabClosed).toBe(true);
		expect(puppeteerInstance.isConnected()).toBe(true);

		// The caller can keep using the browser it owns.
		const again = await selectComposition({
			id: 'react-svg',
			serveUrl: exampleBuild,
			puppeteerInstance,
			inputProps: {},
		});
		expect(again.id).toBe('react-svg');
	} finally {
		await puppeteerInstance.close({silent: true});
		await fs.promises.rm(outputDir, {recursive: true, force: true});
	}
}, 60000);
