import {Internals} from 'remotion';
import {expect, test, vi} from 'vitest';
import {createScaffold} from '../create-scaffold';
import {supportsNativeHtmlInCanvas} from '../html-in-canvas';
import {makeInternalState} from '../internal-state';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {createLayer, type HtmlInCanvasLayerOutcome} from '../take-screenshot';
import {backgroundColor} from './fixtures/background-color';

test('uses the DOM composer by default', async () => {
	const contextPrototype =
		CanvasRenderingContext2D.prototype as CanvasRenderingContext2D & {
			drawElementImage?: () => DOMMatrix;
		};
	const originalDrawElementImage = Object.getOwnPropertyDescriptor(
		contextPrototype,
		'drawElementImage',
	);
	const originalRequestPaint = Object.getOwnPropertyDescriptor(
		HTMLCanvasElement.prototype,
		'requestPaint',
	);
	Object.defineProperty(contextPrototype, 'drawElementImage', {
		configurable: true,
		value: () => new DOMMatrix(),
	});
	Object.defineProperty(HTMLCanvasElement.prototype, 'requestPaint', {
		configurable: true,
		value(this: HTMLCanvasElement) {
			this.dispatchEvent(new Event('paint'));
		},
	});
	const warn = vi
		.spyOn(Internals.Log, 'warn')
		.mockImplementation(() => undefined);

	try {
		const result = await renderStillOnWeb({
			composition: backgroundColor,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
		});
		const canvas = await result.canvas();
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not get canvas context');
		}

		expect(Array.from(context.getImageData(100, 100, 1, 1).data)).toEqual([
			255, 0, 0, 255,
		]);
		expect(
			warn.mock.calls.some((call) =>
				call.some(
					(value) =>
						typeof value === 'string' &&
						value.includes('Using Chromium experimental HTML-in-canvas'),
				),
			),
		).toBe(false);
	} finally {
		warn.mockRestore();
		if (originalDrawElementImage) {
			Object.defineProperty(
				contextPrototype,
				'drawElementImage',
				originalDrawElementImage,
			);
		} else {
			Reflect.deleteProperty(contextPrototype, 'drawElementImage');
		}

		if (originalRequestPaint) {
			Object.defineProperty(
				HTMLCanvasElement.prototype,
				'requestPaint',
				originalRequestPaint,
			);
		} else {
			Reflect.deleteProperty(HTMLCanvasElement.prototype, 'requestPaint');
		}
	}
});

test('uses native HTML-in-canvas only when explicitly enabled', async () => {
	if (!supportsNativeHtmlInCanvas()) {
		return;
	}

	const warn = vi
		.spyOn(Internals.Log, 'warn')
		.mockImplementation(() => undefined);

	try {
		const result = await renderStillOnWeb({
			allowHtmlInCanvas: true,
			composition: backgroundColor,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
		});
		await result.canvas();

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

test('does not create a nested HTML-in-canvas capture', async () => {
	const element = document.createElement('div');
	const nestedLayoutCanvas = document.createElement(
		'canvas',
	) as HTMLCanvasElement & {
		layoutSubtree?: boolean;
	};
	nestedLayoutCanvas.layoutSubtree = true;
	element.appendChild(nestedLayoutCanvas);
	document.body.appendChild(element);

	const outerLayoutCanvas = document.createElement('canvas');
	const context = outerLayoutCanvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get canvas context');
	}

	const drawElementImage = vi.fn();
	Object.assign(context, {drawElementImage});
	let outcome: HtmlInCanvasLayerOutcome | null = null;
	const internalState = makeInternalState({
		signal: null,
		maskImageTimeoutInMilliseconds: 30_000,
	});

	try {
		await createLayer({
			cutout: new DOMRect(0, 0, 10, 10),
			element,
			htmlInCanvasContext: {
				ctx: context as CanvasRenderingContext2D & {
					drawElementImage: typeof drawElementImage;
				},
				layoutCanvas: outerLayoutCanvas,
			},
			internalState,
			logLevel: 'error',
			onHtmlInCanvasLayerOutcome: (newOutcome) => {
				outcome = newOutcome;
			},
			onlyBackgroundClipText: false,
			scale: 1,
			waitForPageResponsiveness: null,
		});

		expect(drawElementImage).not.toHaveBeenCalled();
		expect(outcome).toEqual({
			native: false,
			reason:
				'The composition contains an <HtmlInCanvas> element. Nested HTML-in-canvas capture is unsupported, so the built-in DOM composer is used.',
			shouldWarn: false,
		});
	} finally {
		internalState[Symbol.dispose]();
		element.remove();
	}
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
