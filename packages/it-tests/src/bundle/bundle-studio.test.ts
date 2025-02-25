import {RenderInternals, openBrowser} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {existsSync} from 'fs';
import path from 'path';

test('Bundle studio', async () => {
	const browser = openBrowser('chrome');

	const tab = await (
		await browser
	).newPage({
		context: () => null,
		logLevel: 'info',
		indent: false,
		pageIndex: 0,
		onBrowserLog: null,
	});
	const folder = path.join(process.cwd(), '..', 'example', 'build');
	const indexHtmlExists = existsSync(path.join(folder, 'index.html'));
	if (!indexHtmlExists) {
		throw new Error('index.html does not exist in the build folder');
	}

	const {port, close} = await RenderInternals.serveStatic(
		path.join(process.cwd(), '..', 'example', 'build'),
		{
			port: null,
			offthreadVideoThreads: 1,
			downloadMap: RenderInternals.makeDownloadMap(),
			indent: false,
			logLevel: 'info',
			offthreadVideoCacheSizeInBytes: null,
			remotionRoot: path.join(process.cwd(), '..', 'example'),
			binariesDirectory: null,
			forceIPv4: false,
		},
	);
	await tab.goto({
		url: `http://localhost:${port}`,
		timeout: 10000,
		options: {},
	});
	await new Promise((resolve) => {
		setTimeout(() => {
			resolve(null);
		}, 3000);
	});
	const result = await tab.evaluateHandle(() => {
		return document.querySelectorAll('.css-reset').length;
	});
	expect(result.toString()).toBeGreaterThan(1);

	await (await browser).close({silent: false});
	await close();
});
