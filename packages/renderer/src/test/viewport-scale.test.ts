import {expect, test} from 'bun:test';
import {PNG} from 'pngjs';
import {openBrowser} from '../open-browser';
import {screenshotTask} from '../screenshot-task';

for (const forceDeviceScaleFactor of [undefined, 2]) {
	// Lambda's view-capture path requires Linux; headless macOS cannot capture it.
	test.skipIf(process.platform !== 'linux')(
		`Should preserve view capture density with browser scale ${forceDeviceScaleFactor ?? 'default'}`,
		async () => {
			const previous = process.env.DISABLE_FROM_SURFACE;
			const browser = await openBrowser('chrome', {
				logLevel: 'error',
				forceDeviceScaleFactor,
			});
			try {
				delete process.env.DISABLE_FROM_SURFACE;
				const page = await browser.newPage({
					context: () => null,
					logLevel: 'error',
					indent: false,
					pageIndex: 0,
					onBrowserLog: null,
					onLog: () => undefined,
				});
				const otherPage = await browser.newPage({
					context: () => null,
					logLevel: 'error',
					indent: false,
					pageIndex: 1,
					onBrowserLog: null,
					onLog: () => undefined,
				});
				await otherPage.setViewport({
					width: 64,
					height: 36,
					deviceScaleFactor: 1,
				});
				for (const [width, height, scale] of [
					[64, 36, 2],
					[64, 36, 0.5],
					[64, 36, 1],
					[64, 36, 1.5],
					...(forceDeviceScaleFactor === undefined
						? [
								[65, 37, 1.25],
								[65, 37, 1.5],
							]
						: []),
				]) {
					let reference: PNG | null = null;
					for (const fromSurface of [true, false]) {
						if (fromSurface) {
							delete process.env.DISABLE_FROM_SURFACE;
						} else {
							process.env.DISABLE_FROM_SURFACE = '1';
						}

						await page.setViewport({
							width,
							height,
							deviceScaleFactor: scale,
						});
						const context = await page.mainFrame().executionContext();
						const density = await context.evaluate<number>(
							(canvasWidth: number, canvasHeight: number) => {
								document.body.style.margin = '0';
								document.body.replaceChildren();
								const canvas = document.createElement('canvas');
								canvas.width = Math.round(
									canvasWidth * window.devicePixelRatio,
								);
								canvas.height = Math.round(
									canvasHeight * window.devicePixelRatio,
								);
								canvas.style.width = `${canvasWidth}px`;
								canvas.style.height = `${canvasHeight}px`;
								document.body.appendChild(canvas);
								const ctx = canvas.getContext('2d')!;
								for (let x = 0; x < canvas.width; x++) {
									ctx.fillStyle = x % 2 ? 'white' : 'black';
									ctx.fillRect(x, 0, 1, canvas.height / 2);
								}

								ctx.fillStyle = 'white';
								ctx.fillRect(
									0,
									canvas.height / 2,
									canvas.width,
									canvas.height / 2,
								);
								ctx.fillStyle = 'black';
								ctx.fillRect(
									10 * window.devicePixelRatio,
									canvas.height / 2,
									0.5 * window.devicePixelRatio,
									canvas.height / 2,
								);
								return window.devicePixelRatio;
							},
							width,
							height,
						);
						expect(
							await context.evaluate<number[]>(() => [
								window.innerWidth,
								window.innerHeight,
							]),
						).toEqual([width, height]);
						await context.evaluate(() => {
							return new Promise<void>((resolve) => {
								requestAnimationFrame(() =>
									requestAnimationFrame(() => resolve()),
								);
							});
						});
						const image = (await screenshotTask({
							page,
							format: 'png',
							width,
							height,
							scale,
							omitBackground: false,
							remotionSharedMemory: null,
						})) as Buffer;
						const decoded = PNG.sync.read(image);
						expect(density).toBe(scale);
						expect(decoded.width).toBe(Math.round(width * scale));
						expect(decoded.height).toBe(Math.round(height * scale));
						const otherContext = await otherPage.mainFrame().executionContext();
						expect(
							await otherContext.evaluate<number>(
								() => window.devicePixelRatio,
							),
						).toBe(1);
						if (fromSurface) {
							reference = decoded;
						} else {
							expect(decoded.data).toEqual(reference!.data);
						}

						if (scale === 2) {
							const {data: pixels} = decoded;
							for (let x = 0; x < 12; x++) {
								const offset = (10 * width * scale + x) * 4;
								const value = x % 2 ? 255 : 0;
								expect([...pixels.subarray(offset, offset + 4)]).toEqual([
									value,
									value,
									value,
									255,
								]);
							}

							for (const x of [19, 20, 21]) {
								const offset = (50 * width * scale + x) * 4;
								const value = x === 20 ? 0 : 255;
								expect([...pixels.subarray(offset, offset + 4)]).toEqual([
									value,
									value,
									value,
									255,
								]);
							}
						}
					}
				}
			} finally {
				if (previous === undefined) {
					delete process.env.DISABLE_FROM_SURFACE;
				} else {
					process.env.DISABLE_FROM_SURFACE = previous;
				}

				await browser.close({silent: true});
			}
		},
		90000,
	);
}
