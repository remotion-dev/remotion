import {expect, test} from 'bun:test';
import {fileURLToPath} from 'node:url';
import {ALL_FORMATS, BufferSource, Input} from 'mediabunny';
import {chromium, type Browser} from 'playwright';
import type * as BuiltRenderer from './fixtures/built-renderer';

// https://github.com/remotion-dev/remotion/issues/12568
test('the built package renders a video without native disposal symbols', async () => {
	// Resolve the public package export to dist/esm, not the source modules
	// transformed by Vite in the visual tests.
	const bundle = await Bun.build({
		entrypoints: [
			fileURLToPath(new URL('./fixtures/built-renderer.ts', import.meta.url)),
		],
		target: 'browser',
		format: 'esm',
		define: {'process.env.NODE_ENV': JSON.stringify('production')},
	});
	expect(bundle.success).toBe(true);
	const server = Bun.serve({
		hostname: '127.0.0.1',
		port: 0,
		fetch(request) {
			if (new URL(request.url).pathname === '/renderer.js') {
				return new Response(bundle.outputs[0], {
					headers: {'Content-Type': 'text/javascript'},
				});
			}

			return new Response('<!doctype html><html><body></body></html>', {
				headers: {'Content-Type': 'text/html'},
			});
		},
	});
	let browser: Browser | null = null;
	try {
		browser = await chromium.launch({channel: 'chrome'});
		const page = await browser.newPage();
		await page.addInitScript(() => {
			// Native well-known symbols cannot be deleted. Keep the Symbol API,
			// but omit disposal symbols before loading any application code.
			const descriptors: Record<string, PropertyDescriptor> =
				Object.getOwnPropertyDescriptors(Symbol);
			delete descriptors.dispose;
			delete descriptors.asyncDispose;
			globalThis.Symbol = Object.defineProperties(
				Symbol.bind(null),
				descriptors,
			);
		});
		await page.goto(server.url.href);
		expect(
			await page.evaluate(() => [
				typeof Symbol.dispose,
				typeof Symbol.asyncDispose,
			]),
		).toEqual(['undefined', 'undefined']);

		const bytes = await page.evaluate(async (url) => {
			const {renderMediaOnWeb, createElement} = (await import(
				url
			)) as typeof BuiltRenderer;
			const result = await renderMediaOnWeb({
				composition: {
					component: () =>
						createElement('div', {
							style: {width: 64, height: 64, backgroundColor: 'red'},
						}),
					id: 'disposal-symbols',
					width: 64,
					height: 64,
					fps: 30,
					durationInFrames: 3,
				},
				inputProps: {},
				container: 'webm',
				videoCodec: 'vp8',
				muted: true,
				licenseKey: 'free-license',
			});
			const blob = await result.getBlob();
			return Array.from(new Uint8Array(await blob.arrayBuffer()));
		}, new URL('/renderer.js', server.url).href);

		using input = new Input({
			formats: ALL_FORMATS,
			source: new BufferSource(new Uint8Array(bytes)),
		});
		const video = await input.getPrimaryVideoTrack();
		expect(video).not.toBeNull();
		expect(video?.displayWidth).toBe(64);
		expect(video?.displayHeight).toBe(64);
		expect(await input.computeDuration()).toBeCloseTo(0.1);
		expect((await video?.computePacketStats())?.packetCount).toBe(3);
	} finally {
		await browser?.close();
		server.stop(true);
	}
}, 30_000);
