import {writeFile} from 'node:fs/promises';
import {openBrowser} from '@remotion/renderer';

export const captureCode = async (
	shots: {url: string; output: string; width: number; height: number}[],
) => {
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
		for (const shot of shots) {
			await page.setViewport({
				width: shot.width,
				height: shot.height,
				deviceScaleFactor: 3,
			});
			await page.goto({url: shot.url, timeout: 30000});
			await page.evaluate(async () => {
				const deadline = Date.now() + 30000;
				while (document.body.dataset.captureReady !== 'true') {
					if (Date.now() > deadline)
						throw new Error('Monaco did not become ready');
					await new Promise((resolve) => setTimeout(resolve, 50));
				}
			});
			const {value: image} = await page
				._client()
				.send('Page.captureScreenshot', {format: 'png'});
			await writeFile(
				shot.output,
				new Uint8Array(Buffer.from(image.data, 'base64')),
			);
			// eslint-disable-next-line no-console
			console.log(
				`Saved ${shot.output} (${shot.width * 3} × ${shot.height * 3})`,
			);
		}
	} finally {
		await browser.close({silent: true});
	}
};
