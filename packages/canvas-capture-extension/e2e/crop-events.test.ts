import {expect, test} from 'bun:test';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
type CaptureTestWindow = Window & {
	__remotionCanvasCapture: {
		handleRequest: (request: {
			type: string;
			command: string;
		}) => Promise<unknown>;
	};
};

test('resizing a crop preserves the page modal and normal page clicks still work', async () => {
	const browser = await chromium.launch({
		executablePath: process.env.CANVAS_CAPTURE_TEST_BROWSER,
		args: ['--enable-blink-features=CanvasDrawElement'],
	});
	try {
		const page = await browser.newPage({viewport: {width: 1000, height: 800}});
		await page.setContent(
			'<button>Page action</button><dialog>Page modal</dialog>',
		);
		// Only the browser-extension messaging boundary is stubbed. The production
		// bundle installs the actual controls, pointer capture and crop handlers.
		await page.evaluate(() => {
			Object.defineProperty(
				(window as unknown as {chrome: object}).chrome,
				'runtime',
				{
					value: {id: 'capture-test', onMessage: {addListener: () => {}}},
					configurable: true,
				},
			);
			// The page registers its document capture listeners before the extension.
			for (const type of ['pointerup', 'mouseup', 'click']) {
				document.addEventListener(
					type,
					() => document.querySelector('dialog')!.close(),
					true,
				);
			}

			document.querySelector('button')!.addEventListener('click', () => {
				document.querySelector('button')!.textContent = 'Page action clicked';
			});
		});
		await page.addScriptTag({
			content: await readFile(
				new URL('../dist/capture.js', import.meta.url),
				'utf8',
			),
		});
		await page.evaluate(async () => {
			await (
				window as unknown as CaptureTestWindow
			).__remotionCanvasCapture.handleRequest({
				type: 'remotion-canvas-capture-controller',
				command: 'select-area',
			});
		});
		await page.mouse.move(150, 150);
		await page.mouse.down();
		await page.mouse.move(500, 400);
		await page.mouse.up();
		await page.evaluate(() => document.querySelector('dialog')!.show());
		const crop = page.locator('[data-remotion-canvas-capture] .highlight');
		const before = await crop.boundingBox();
		expect(before).not.toBeNull();
		const handle = await page
			.locator('[data-remotion-canvas-capture] [data-handle="e"]')
			.boundingBox();
		expect(handle).not.toBeNull();
		await page.mouse.move(
			handle!.x + handle!.width / 2,
			handle!.y + handle!.height / 2,
		);
		await page.mouse.down();
		await page.mouse.move(
			handle!.x + handle!.width / 2 + 80,
			handle!.y + handle!.height / 2,
			{steps: 5},
		);
		await page.mouse.up();
		expect((await crop.boundingBox())!.width).toBeCloseTo(
			before!.width + 80,
			0,
		);
		expect(await page.getByText('Page modal').isVisible()).toBe(true);
		await page
			.getByRole('button', {name: 'Clear selection', exact: true})
			.click();
		await page.evaluate(async () => {
			await (
				window as unknown as CaptureTestWindow
			).__remotionCanvasCapture.handleRequest({
				type: 'remotion-canvas-capture-controller',
				command: 'toggle-controls',
			});
		});
		await page.getByRole('button', {name: 'Page action', exact: true}).click();
		expect(
			await page.getByRole('button', {name: 'Page action clicked'}).isVisible(),
		).toBe(true);
	} finally {
		await browser.close();
	}
}, 30_000);
