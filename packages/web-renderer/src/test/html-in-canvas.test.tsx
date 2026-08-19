import {Internals} from 'remotion';
import {expect, test, vi} from 'vitest';
import {createScaffold} from '../create-scaffold';
import {
	setForceDisableHtmlInCanvasForTesting,
	supportsNativeHtmlInCanvas,
	supportsNestedHtmlInCanvas,
} from '../html-in-canvas';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {nestedHtmlInCanvas} from './fixtures/nested-html-in-canvas';
import {
	elementImageOnPaintHtmlInCanvas,
	webGlOnPaintHtmlInCanvas,
} from './fixtures/on-paint-html-in-canvas';
import {testImage} from './utils';

setForceDisableHtmlInCanvasForTesting(false);

const chromeMajorVersion = Number(
	navigator.userAgent.match(/\b(?:HeadlessChrome|Chrome)\/(\d+)/)?.[1],
);
const canRenderNestedHtmlInCanvas =
	!Number.isFinite(chromeMajorVersion) || chromeMajorVersion >= 152;

test('captures three nested HTML-in-canvas effect layers natively', async () => {
	const supportsNesting = await supportsNestedHtmlInCanvas();
	if (!supportsNesting || !canRenderNestedHtmlInCanvas) {
		return;
	}

	const warn = vi
		.spyOn(Internals.Log, 'warn')
		.mockImplementation(() => undefined);

	try {
		const nested = await renderStillOnWeb({
			composition: nestedHtmlInCanvas,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
		});
		const blob = await nested.blob({format: 'png'});

		expect(
			warn.mock.calls.some((call) =>
				call.some(
					(value) =>
						typeof value === 'string' &&
						value.includes('Using Chromium experimental HTML-in-canvas'),
				),
			),
		).toBe(true);

		await testImage({blob, testId: 'nested-html-in-canvas'});
	} finally {
		warn.mockRestore();
	}
});

test('captures three nested HTML-in-canvas effect layers across video frames', async () => {
	const supportsNesting = await supportsNestedHtmlInCanvas();
	if (!supportsNesting || !canRenderNestedHtmlInCanvas) {
		return;
	}

	await renderMediaOnWeb({
		composition: nestedHtmlInCanvas,
		inputProps: {},
		licenseKey: 'free-license',
		muted: true,
	});
});

test('retries a transient missing nested paint record during a client-side render', async () => {
	const supportsNesting = await supportsNestedHtmlInCanvas();
	if (!supportsNesting || !canRenderNestedHtmlInCanvas) {
		return;
	}

	const descriptor = Object.getOwnPropertyDescriptor(
		HTMLCanvasElement.prototype,
		'captureElementImage',
	);
	if (!descriptor || typeof descriptor.value !== 'function') {
		throw new Error('Expected captureElementImage() to be available');
	}

	const originalCapture = descriptor.value as (
		this: HTMLCanvasElement,
		element: Element,
	) => ElementImage;
	let simulatedMissingRecord = false;

	Object.defineProperty(HTMLCanvasElement.prototype, 'captureElementImage', {
		...descriptor,
		value(this: HTMLCanvasElement, element: Element) {
			const ancestorCanvas = this.parentElement?.closest('canvas');
			if (!simulatedMissingRecord && ancestorCanvas) {
				simulatedMissingRecord = true;
				throw new DOMException(
					'No cached paint record for element',
					'InvalidStateError',
				);
			}

			return originalCapture.call(this, element);
		},
	});

	try {
		await renderMediaOnWeb({
			composition: nestedHtmlInCanvas,
			inputProps: {},
			licenseKey: 'free-license',
			muted: true,
		});
	} finally {
		Object.defineProperty(
			HTMLCanvasElement.prototype,
			'captureElementImage',
			descriptor,
		);
	}

	expect(simulatedMissingRecord).toBe(true);
});

test('keeps a scaffold without HTML-in-canvas hidden', () => {
	const scaffold = createScaffold({
		Component: () => null,
		audioEnabled: false,
		defaultCodec: null,
		defaultOutName: null,
		delayRenderTimeoutInMilliseconds: 30_000,
		durationInFrames: 1,
		fps: 30,
		height: 100,
		id: 'html-in-canvas-scaffold-visibility',
		initialFrame: 0,
		logLevel: 'error',
		mediaCacheSizeInBytes: null,
		pixelDensity: 1,
		resolvedProps: {},
		schema: null,
		useHtmlInCanvas: false,
		videoEnabled: false,
		width: 100,
	});

	try {
		expect(getComputedStyle(scaffold.div.parentElement!).visibility).toBe(
			'hidden',
		);
		expect(getComputedStyle(scaffold.div.parentElement!).filter).toBe(
			'opacity(0)',
		);
		expect(getComputedStyle(scaffold.div).visibility).toBe('hidden');
	} finally {
		scaffold[Symbol.dispose]();
	}
});

test('keeps the DOM composer scaffold paintable', () => {
	const scaffold = createScaffold({
		Component: () => (
			<canvas
				ref={(node) => {
					if (node) {
						(
							node as HTMLCanvasElement & {layoutSubtree?: boolean}
						).layoutSubtree = true;
					}
				}}
			/>
		),
		audioEnabled: false,
		defaultCodec: null,
		defaultOutName: null,
		delayRenderTimeoutInMilliseconds: 30_000,
		durationInFrames: 1,
		fps: 30,
		height: 100,
		id: 'html-in-canvas-scaffold-visibility',
		initialFrame: 0,
		logLevel: 'error',
		mediaCacheSizeInBytes: null,
		pixelDensity: 1,
		resolvedProps: {},
		schema: null,
		useHtmlInCanvas: false,
		videoEnabled: false,
		width: 100,
	});

	try {
		expect(getComputedStyle(scaffold.div.parentElement!).visibility).toBe(
			'hidden',
		);
		expect(getComputedStyle(scaffold.div.parentElement!).filter).toBe(
			'opacity(0)',
		);
		expect(getComputedStyle(scaffold.div).visibility).toBe('visible');
	} finally {
		scaffold[Symbol.dispose]();
	}
});

test('uses the DOM composer when native HTML-in-canvas does not support nesting', async () => {
	if (!supportsNativeHtmlInCanvas() || !canRenderNestedHtmlInCanvas) {
		return;
	}

	setForceDisableHtmlInCanvasForTesting(true);
	const warn = vi
		.spyOn(Internals.Log, 'warn')
		.mockImplementation(() => undefined);

	try {
		const result = await renderStillOnWeb({
			composition: nestedHtmlInCanvas,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
		});

		expect(
			warn.mock.calls.some((call) =>
				call.some(
					(value) =>
						typeof value === 'string' &&
						value.includes('Using Chromium experimental HTML-in-canvas'),
				),
			),
		).toBe(false);

		const blob = await result.blob({format: 'png'});
		await testImage({blob, testId: 'nested-html-in-canvas'});
	} finally {
		setForceDisableHtmlInCanvasForTesting(false);
		warn.mockRestore();
	}
});

test('publishes custom paint output during software composition', async () => {
	if (!supportsNativeHtmlInCanvas()) {
		if (/\b(?:HeadlessChrome|Chrome)\//.test(navigator.userAgent)) {
			throw new Error(
				'Expected CanvasDrawElement to be enabled for Chromium web renderer tests',
			);
		}

		return;
	}

	setForceDisableHtmlInCanvasForTesting(true);

	try {
		const elementImageResult = await renderStillOnWeb({
			composition: elementImageOnPaintHtmlInCanvas,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
		});
		const elementImageBlob = await elementImageResult.blob({format: 'png'});
		const elementImageBitmap = await createImageBitmap(elementImageBlob);
		const elementImageProbe = new OffscreenCanvas(100, 100);
		const elementImageCtx = elementImageProbe.getContext('2d');
		if (!elementImageCtx) {
			throw new Error('Expected a 2D context');
		}

		elementImageCtx.drawImage(elementImageBitmap, 0, 0);
		elementImageBitmap.close();
		const elementImagePixel = elementImageCtx.getImageData(50, 50, 1, 1).data;

		// The custom paint stage consumes the red ElementImage and masks it green.
		expect([...elementImagePixel]).toEqual([0, 255, 0, 255]);

		const webGlResult = await renderStillOnWeb({
			composition: webGlOnPaintHtmlInCanvas,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
		});
		const webGlBlob = await webGlResult.blob({format: 'png'});
		const webGlBitmap = await createImageBitmap(webGlBlob);
		const webGlProbe = new OffscreenCanvas(100, 100);
		const webGlCtx = webGlProbe.getContext('2d');
		if (!webGlCtx) {
			throw new Error('Expected a 2D context');
		}

		webGlCtx.drawImage(webGlBitmap, 0, 0);
		webGlBitmap.close();
		const webGlPixel = webGlCtx.getImageData(50, 50, 1, 1).data;

		// The custom WebGL paint stage replaces the red layout child with cyan.
		expect([...webGlPixel]).toEqual([0, 255, 255, 255]);
	} finally {
		setForceDisableHtmlInCanvasForTesting(false);
	}
});
