import {expect, test} from 'bun:test';
import {existsSync, readFileSync} from 'fs';
import path from 'path';
import {openBrowser} from '@remotion/renderer';
import {
	getRemotionVersionFromIndexHtml,
	VERSION,
} from '@remotion/serverless-client';

test(
	'Bundle studio',
	async () => {
		const browser = openBrowser('chrome');

		const tab = await (
			await browser
		).newPage({
			context: () => null,
			logLevel: 'info',
			indent: false,
			pageIndex: 0,
			onBrowserLog: null,
			onLog: console.log,
		});
		const folder = path.join(process.cwd(), '..', 'example', 'build');
		const indexHtmlExists = existsSync(path.join(folder, 'index.html'));
		if (!indexHtmlExists) {
			throw new Error('index.html does not exist in the build folder');
		}

		const bundleJs = existsSync(path.join(folder, 'bundle.js'));
		if (!bundleJs) {
			throw new Error('bundle.js does not exist in the build folder');
		}
		const contents = readFileSync(path.join(folder, 'bundle.js'), 'utf-8');
		if (contents.includes('PreviewToolbar') || contents.includes('TopPanel')) {
			throw new Error('Studio was bundled');
		}
		// remotion/no-react must not pull in another stateful delay-render module.
		expect(
			contents.match(/window\.remotion_delayRenderHandles = \[\]/g),
		).toHaveLength(1);

		const indexHtmlContent = readFileSync(
			path.join(folder, 'index.html'),
			'utf-8',
		);
		const version = getRemotionVersionFromIndexHtml(indexHtmlContent);
		expect(version).toBe(VERSION);

		const server = Bun.serve({
			port: 0,
			fetch: async (request) => {
				const url = new URL(request.url);
				const requestedPath =
					url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
				const filePath = path.resolve(folder, requestedPath);
				if (!filePath.startsWith(`${folder}${path.sep}`)) {
					return new Response('Forbidden', {status: 403});
				}

				const file = Bun.file(filePath);
				if (!(await file.exists())) {
					return new Response('Not found', {status: 404});
				}

				return new Response(file);
			},
		});
		await tab.goto({
			url: `http://localhost:${server.port}/?/WidthHeight`,
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

		const sourceLocation = await tab.evaluateHandle(async () => {
			let openedInspector = false;
			for (let attempt = 0; attempt < 100; attempt++) {
				const inspectorSourceLocation = document.querySelector(
					'[aria-label="Inspector source location"]',
				);
				if (inspectorSourceLocation?.textContent?.includes('Root.tsx:')) {
					return inspectorSourceLocation.textContent;
				}
				if (inspectorSourceLocation) {
					openedInspector = true;
				}

				if (!openedInspector) {
					const inspectorToggle = document.querySelector<HTMLElement>(
						'[data-sidebar-toggle="right"]',
					);
					if (inspectorToggle) {
						openedInspector = true;
						inspectorToggle.click();
					}
				}

				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			return null;
		});
		expect(sourceLocation.toString()).toMatch(/Root\.tsx:\d+/);
		expect(sourceLocation.toString()).toMatch(/WidthHeightSequences\.tsx:\d+/);
		const sequenceSourceLocation = await tab.evaluateHandle(async () => {
			const label = document.querySelector<HTMLElement>('[title="<Sequence>"]');
			label?.parentElement?.parentElement?.dispatchEvent(
				new PointerEvent('pointerdown', {bubbles: true, button: 0}),
			);

			for (let attempt = 0; attempt < 100; attempt++) {
				const inspectorSourceLocation = document.querySelector(
					'[aria-label="Inspector source location"]',
				);
				if (
					inspectorSourceLocation?.textContent?.startsWith('<Sequence>') &&
					inspectorSourceLocation.textContent.includes(
						'WidthHeightSequences.tsx:',
					)
				) {
					return inspectorSourceLocation.textContent;
				}

				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			return null;
		});
		expect(sequenceSourceLocation.toString()).toMatch(
			/<Sequence>WidthHeightSequences\.tsx:\d+/,
		);

		const fontLoaded = await tab.evaluateHandle(() => {
			let loaded = false;
			document.fonts.forEach((font) => {
				if (font.family === 'Bangers' && font.status === 'loaded') {
					loaded = true;
				}
			});
			return loaded;
		});
		expect(String(fontLoaded.toString())).toBe('true');

		const orphanedFontTimeouts = await tab.evaluateHandle(() => {
			return Object.values(window.remotion_delayRenderTimeouts).filter(
				(timeout) => timeout.label?.startsWith('Loading font Bangers'),
			).length;
		});
		expect(Number(orphanedFontTimeouts.toString())).toBe(0);

		await Promise.all([
			result.dispose(),
			sourceLocation.dispose(),
			sequenceSourceLocation.dispose(),
			fontLoaded.dispose(),
			orphanedFontTimeouts.dispose(),
		]);
		await tab.close();
		await (await browser).close({silent: false});
		await server.stop(true);
	},
	{timeout: 20_000},
);
