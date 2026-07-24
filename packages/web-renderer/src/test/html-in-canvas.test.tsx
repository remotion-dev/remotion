import {AbsoluteFill, Internals} from 'remotion';
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
import {testImage} from './utils';

setForceDisableHtmlInCanvasForTesting(false);

test('uses native HTML-in-canvas for compositions without nested layout canvases', async () => {
	if (!supportsNativeHtmlInCanvas()) {
		return;
	}

	const warn = vi
		.spyOn(Internals.Log, 'warn')
		.mockImplementation(() => undefined);

	try {
		const result = await renderStillOnWeb({
			composition: {
				component: () => (
					<AbsoluteFill style={{backgroundColor: 'rgb(255, 0, 0)'}} />
				),
				durationInFrames: 1,
				fps: 30,
				height: 100,
				id: 'non-nested-html-in-canvas',
				width: 100,
			},
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
		});
		const canvas = await result.canvas();
		const context = canvas.getContext('2d');
		const pixel = context?.getImageData(50, 50, 1, 1).data;

		expect(pixel?.[0]).toBeGreaterThan(250);
		expect(pixel?.[1]).toBeLessThan(5);
		expect(pixel?.[2]).toBeLessThan(5);
		expect(
			warn.mock.calls.some((call) =>
				call.some(
					(value) =>
						typeof value === 'string' &&
						value.includes('Using Chromium experimental HTML-in-canvas'),
				),
			),
		).toBe(true);
	} finally {
		warn.mockRestore();
	}
});

test('captures three nested HTML-in-canvas effect layers natively', async () => {
	const supportsNesting = await supportsNestedHtmlInCanvas();
	if (!supportsNesting) {
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
	if (!supportsNesting) {
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
	if (!supportsNesting) {
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
	if (!supportsNativeHtmlInCanvas()) {
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
