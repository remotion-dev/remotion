import {createElement} from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {NoReactInternals} from 'remotion/no-react';
import {expect, test, vi} from 'vitest';
import {page} from 'vitest/browser';
import '../symbol-dispose';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import {svgExternalFontReady} from './fixtures/svg-external-font-selection';
import {svgFontMediaCache} from './fixtures/svg-font-media-cache';
import {captureNativeReference, countNativePixels} from './native-reference';

test.for(['empty', 'empty-tspan', 'nested-system'])(
	'does not fetch unused CSS URL font for $0',
	async (mode) => {
		const url = new URL(
			'../../../example/public/bangers.woff2',
			import.meta.url,
		).href;
		const stylesheet = document.createElement('style');
		stylesheet.textContent = `@font-face{font-family:"SVG unused URL ${mode}";src:url("${url}") format("woff2")}`;
		document.head.appendChild(stylesheet);
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '100');
		svg.setAttribute('height', '60');
		svg.innerHTML = `<text style='font-family:"SVG unused URL ${mode}";font-size:0'>${mode === 'empty' ? '' : mode === 'empty-tspan' ? '<tspan/>' : '<tspan style="font-family:serif">Other family</tspan>'}</text><rect x="10" y="10" width="70" height="40" fill="blue"/>`;
		document.body.appendChild(svg);
		const fetchFont = vi
			.spyOn(NoReactInternals, 'fetchFontData')
			.mockRejectedValue(new Error('Unused font fetch must not run'));
		try {
			const [face] = await document.fonts.load(`16px "SVG unused URL ${mode}"`);
			expect(face?.status).toBe('loaded');
			const drawable = await turnSvgIntoDrawable(svg);
			expect(drawable.naturalWidth).toBe(100);
			expect(fetchFont).not.toHaveBeenCalled();
		} finally {
			fetchFont.mockRestore();
			svg.remove();
			stylesheet.remove();
		}
	},
);

test('invalidates SVG font carrier cache when viewport media changes', async () => {
	await svgExternalFontReady;
	const viewport = {width: innerWidth, height: innerHeight};
	const host = document.createElement('div');
	Object.assign(host.style, {position: 'fixed', left: '-1000px', top: '0px'});
	document.body.appendChild(host);
	const root = createRoot(host);
	const composition = svgFontMediaCache({active: null});
	flushSync(() => root.render(createElement(composition.component)));
	const svg = host.querySelector('svg')!;
	const source = new XMLSerializer().serializeToString(svg);
	const draw = async (element: SVGSVGElement) => {
		const canvas = new OffscreenCanvas(100, 60);
		try {
			canvas
				.getContext('2d')!
				.drawImage(await turnSvgIntoDrawable(element), 0, 0);
			return await canvas.convertToBlob({type: 'image/png'});
		} finally {
			canvas.width = 0;
			canvas.height = 0;
		}
	};

	try {
		for (const width of [800, 400, 800]) {
			await page.viewport(width, 720);
			const active = matchMedia('(min-width: 500px)').matches;
			expect(active).toBe(width >= 500);
			expect(new XMLSerializer().serializeToString(svg)).toBe(source);
			const actual = await draw(svg);
			const fresh = svg.cloneNode(true) as SVGSVGElement;
			host.appendChild(fresh);
			let expected: Blob;
			try {
				expected = await draw(fresh);
			} finally {
				fresh.remove();
			}

			const native = await captureNativeReference(composition, 0, {
				omitBackground: false,
			});
			const literal = await captureNativeReference(
				svgFontMediaCache({active}),
				0,
				{omitBackground: false},
			);
			expect((await countNativePixels(native, literal)).mismatchedPixels).toBe(
				0,
			);
			expect((await countNativePixels(expected, actual)).mismatchedPixels).toBe(
				0,
			);
			expect((await countNativePixels(native, actual)).mismatchedPixels).toBe(
				0,
			);
		}
	} finally {
		root.unmount();
		host.remove();
		await page.viewport(viewport.width, viewport.height);
	}
});

test('snapshots carrier media before an asynchronous URL font fetch', async () => {
	await svgExternalFontReady;
	const viewport = {width: innerWidth, height: innerHeight};
	const url = new URL('../../../example/public/bangers.woff2', import.meta.url)
		.href;
	const fontData = await (await fetch(url)).arrayBuffer();
	const stylesheet = document.createElement('style');
	stylesheet.textContent = `@font-face{font-family:"SVG pending media URL";src:url("${url}") format("woff2")}`;
	document.head.appendChild(stylesheet);
	const host = document.createElement('div');
	Object.assign(host.style, {position: 'fixed', left: '-1000px', top: '0px'});
	document.body.appendChild(host);
	const root = createRoot(host);
	const composition = svgFontMediaCache({active: null});
	flushSync(() => root.render(createElement(composition.component)));
	const svg = host.querySelector('svg')!;
	svg.querySelector('text')!.style.fontFamily = '"SVG pending media URL"';
	let resolveFont!: (data: ArrayBuffer) => void;
	const deferred = new Promise<ArrayBuffer>((resolve) => {
		resolveFont = resolve;
	});
	let fetchFont: ReturnType<typeof vi.spyOn> | null = null;
	const canvas = new OffscreenCanvas(100, 60);
	const encode = (image: HTMLImageElement) => {
		const context = canvas.getContext('2d')!;
		context.clearRect(0, 0, 100, 60);
		context.drawImage(image, 0, 0);
		return canvas.convertToBlob({type: 'image/png'});
	};

	try {
		await document.fonts.load('16px "SVG pending media URL"');
		await page.viewport(800, 720);
		expect(matchMedia('(min-width: 500px)').matches).toBe(true);
		const before = await captureNativeReference(composition, 0, {
			omitBackground: false,
		});
		fetchFont = vi
			.spyOn(NoReactInternals, 'fetchFontData')
			.mockReturnValueOnce(deferred)
			.mockResolvedValue(fontData);
		const pending = turnSvgIntoDrawable(svg);
		expect(fetchFont).toHaveBeenCalledTimes(1);
		await page.viewport(400, 720);
		expect(matchMedia('(min-width: 500px)').matches).toBe(false);
		resolveFont(fontData);
		const first = await encode(await pending);
		expect((await countNativePixels(before, first)).mismatchedPixels).toBe(0);
		const next = turnSvgIntoDrawable(svg);
		expect(next).not.toBe(pending);
		const actual = await encode(await next);
		const native = await captureNativeReference(composition, 0, {
			omitBackground: false,
		});
		expect((await countNativePixels(native, actual)).mismatchedPixels).toBe(0);
	} finally {
		resolveFont(fontData);
		fetchFont?.mockRestore();
		canvas.width = 0;
		canvas.height = 0;
		root.unmount();
		host.remove();
		stylesheet.remove();
		await page.viewport(viewport.width, viewport.height);
	}
});
