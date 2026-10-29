import path from 'node:path';
import {openBrowser} from '@remotion/renderer';

const output = path.resolve(process.argv[2] ?? '/tmp/sdk-monaco-source.png');
const browser = await openBrowser('chrome');

try {
	const page = await browser.newPage({
		context: () => null,
		logLevel: 'error',
		indent: false,
		pageIndex: 0,
		onBrowserLog: null,
		onLog: () => {},
	});
	await page.setViewport({width: 1180, height: 1180, deviceScaleFactor: 3});
	await page.goto({url: 'http://127.0.0.1:3040/', timeout: 30000});
	await page.evaluate(async () => {
		const deadline = Date.now() + 30000;
		while (
			!(window as Window & {sdkEditorReady: boolean | null}).sdkEditorReady ||
			![...document.querySelectorAll('.view-lines span')].some(
				(span) => getComputedStyle(span).color === 'rgb(206, 145, 120)',
			)
		) {
			if (Date.now() > deadline) throw new Error('Monaco did not become ready');
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
	});
	const {value: shot} = await page
		._client()
		.send('Page.captureScreenshot', {format: 'png'});
	await Bun.write(output, Buffer.from(shot.data, 'base64'));
	// eslint-disable-next-line no-console
	console.log(`Saved ${output} (3540 × 3540)`);
} finally {
	await browser.close({silent: true});
}
