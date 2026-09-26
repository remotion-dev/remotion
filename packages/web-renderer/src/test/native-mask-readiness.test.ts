import {afterEach, expect, test, vi} from 'vitest';
import {waitForNativeMaskImages} from '../drawing/mask-image';
import {
	getNativeMaskImage,
	makeMaskImageLoaderState,
} from '../drawing/mask-image-loader';
import {drawWithHtmlInCanvas, setupHtmlInCanvas} from '../html-in-canvas';
import '../symbol-dispose';
import type {InternalState} from '../internal-state';
import {createLayer} from '../take-screenshot';

const makeState = (
	signal: AbortSignal | null = null,
	timeoutInMilliseconds = 1000,
) => makeMaskImageLoaderState({signal, timeoutInMilliseconds});

const rasterUrl = async () => {
	const canvas = new OffscreenCanvas(20, 20);
	const ctx = canvas.getContext('2d')!;
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, 10, 20);
	return URL.createObjectURL(await canvas.convertToBlob());
};

afterEach(() => vi.restoreAllMocks());

test('keeps a native FontFace in SVG text with a same-document knockout mask', async () => {
	const font = new FontFace(
		'NativeMaskFont',
		`url("${new URL('../../../example/public/bangers.woff2', import.meta.url).href}")`,
	);
	await font.load();
	document.fonts.add(font);
	const wrapper = document.createElement('div');
	const element = document.createElement('div');
	element.style.cssText = 'width:240px;height:80px';
	element.innerHTML =
		'<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80"><defs><mask id="native-knockout"><rect width="240" height="80" fill="white"/><circle cx="220" cy="40" r="10" fill="black"/></mask></defs><g style="mask:url(#native-knockout)"><text x="0" y="60" style="font:48px NativeMaskFont" fill="red">Hamburge</text></g></svg>';
	wrapper.append(element);
	document.body.append(wrapper);
	using state = makeState();
	try {
		const context = setupHtmlInCanvas({
			wrapper,
			div: element,
			width: 240,
			height: 80,
		});
		expect(context).not.toBeNull();
		const outcome = vi.fn();
		const captured = await createLayer({
			element,
			scale: 1,
			logLevel: 'error',
			internalState: {maskImageLoaderState: state} as InternalState,
			onlyBackgroundClipText: false,
			cutout: new DOMRect(0, 0, 240, 80),
			htmlInCanvasContext: context!,
			onHtmlInCanvasLayerOutcome: outcome,
			waitForPageResponsiveness: null,
		});
		expect(outcome).toHaveBeenCalledWith({native: true});
		const actual = [...captured.getImageData(0, 0, 240, 80).data];
		expect(actual.some((value) => value !== 0)).toBe(true);
		(element.querySelector('text') as SVGTextElement).style.fontFamily =
			'serif';
		const fallback = await drawWithHtmlInCanvas({
			element,
			htmlInCanvasContext: context!,
			scaledWidth: 240,
			scaledHeight: 80,
		});
		expect([...fallback.getImageData(0, 0, 240, 80).data]).not.toEqual(actual);
	} finally {
		wrapper.remove();
		document.fonts.delete(font);
	}
});

test('waits for original URL decode and reuses readiness across frames', async () => {
	let resolve!: () => void;
	const decode = vi
		.spyOn(HTMLImageElement.prototype, 'decode')
		.mockImplementation(
			() =>
				new Promise<void>((done) => {
					resolve = done;
				}),
		);
	using state = makeState();
	const element = document.createElement('div');
	element.style.maskImage = 'url("/cold-mask.png")';
	document.body.append(element);
	try {
		let ready = false;
		const pending = waitForNativeMaskImages(element, state).then(() => {
			ready = true;
		});
		await Promise.resolve();
		expect(ready).toBe(false);
		resolve();
		await pending;
		await waitForNativeMaskImages(element, state);
		expect(decode).toHaveBeenCalledTimes(1);
		expect((decode.mock.instances[0] as HTMLImageElement).src).toBe(
			new URL('/cold-mask.png', document.baseURI).href,
		);
	} finally {
		element.remove();
	}
});

test('skips same-document SVG fragments and scans every URL layer', async () => {
	const decode = vi
		.spyOn(HTMLImageElement.prototype, 'decode')
		.mockResolvedValue();
	using state = makeState();
	const element = document.createElement('div');
	element.style.maskImage = `url("${location.href.split('#')[0]}#knockout"), linear-gradient(red, blue), url("/mask.png")`;
	document.body.append(element);
	try {
		await waitForNativeMaskImages(element, state);
		expect(decode).toHaveBeenCalledTimes(1);
		expect((decode.mock.instances[0] as HTMLImageElement).src).toBe(
			new URL('/mask.png', document.baseURI).href,
		);
	} finally {
		element.remove();
	}
});

test('cancels decode, rejects cached readiness after cancellation, and times out', async () => {
	vi.spyOn(HTMLImageElement.prototype, 'decode').mockImplementation(
		() => new Promise(() => {}),
	);
	const controller = new AbortController();
	using state = makeState(controller.signal);
	const pending = getNativeMaskImage({src: '/mask.png', state});
	controller.abort();
	await expect(pending).rejects.toThrow('was cancelled');
	await expect(getNativeMaskImage({src: '/mask.png', state})).rejects.toThrow(
		'was cancelled',
	);
	using timeoutState = makeState(null, 1);
	await expect(
		getNativeMaskImage({src: '/mask.png', state: timeoutState}),
	).rejects.toThrow('Timed out loading mask-image URL after 1ms');
});

test('does not reuse completed readiness after cancellation and releases native cache', async () => {
	const decode = vi
		.spyOn(HTMLImageElement.prototype, 'decode')
		.mockResolvedValue();
	const controller = new AbortController();
	const state = makeState(controller.signal);
	await getNativeMaskImage({src: '/mask.png', state});
	controller.abort();
	await expect(getNativeMaskImage({src: '/mask.png', state})).rejects.toThrow(
		'was cancelled',
	);
	expect(decode).toHaveBeenCalledTimes(1);
	state[Symbol.dispose]();
	expect(state.nativeCache.size).toBe(0);
});

test('evicts failed decodes and preserves origin validation', async () => {
	vi.spyOn(HTMLImageElement.prototype, 'decode')
		.mockRejectedValueOnce(new Error('failed'))
		.mockResolvedValue();
	using state = makeState();
	await expect(getNativeMaskImage({src: '/mask.png', state})).rejects.toThrow(
		'Could not load mask-image URL',
	);
	await getNativeMaskImage({src: '/mask.png', state});
	await expect(
		getNativeMaskImage({src: 'https://example.com/mask.png', state}),
	).rejects.toThrow('only supports same-origin');
});

test('captures a cold blob raster mask using native HTML-in-canvas', async () => {
	const src = await rasterUrl();
	const wrapper = document.createElement('div');
	const element = document.createElement('div');
	element.style.cssText = `width:20px;height:20px;background:red;mask-image:url("${src}");mask-size:100% 100%;mask-repeat:no-repeat`;
	wrapper.append(element);
	document.body.append(wrapper);
	using state = makeState();
	try {
		const context = setupHtmlInCanvas({
			wrapper,
			div: element,
			width: 20,
			height: 20,
		});
		expect(
			context,
			'Run with native HTML-in-canvas enabled in Chromium',
		).not.toBeNull();
		const outcome = vi.fn();
		const captured = await createLayer({
			htmlInCanvasContext: context!,
			element,
			scale: 1,
			logLevel: 'error',
			internalState: {maskImageLoaderState: state} as InternalState,
			onlyBackgroundClipText: false,
			cutout: new DOMRect(0, 0, 20, 20),
			onHtmlInCanvasLayerOutcome: outcome,
			waitForPageResponsiveness: null,
		});
		expect(outcome).toHaveBeenCalledWith({native: true});
		expect([...captured.getImageData(2, 10, 1, 1).data]).toEqual([
			255, 0, 0, 255,
		]);
		expect(captured.getImageData(18, 10, 1, 1).data[3]).toBe(0);
	} finally {
		wrapper.remove();
		URL.revokeObjectURL(src);
	}
});
