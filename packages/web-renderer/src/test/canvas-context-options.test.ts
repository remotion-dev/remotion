import {expect, test, vi} from 'vitest';
import {getCanvasContextOptions} from '../drawing/canvas-context-options';
import {makeInternalState} from '../internal-state';
import '../symbol-dispose';
import {createLayer} from '../take-screenshot';

const observeCanvases = () => {
	const Original = OffscreenCanvas;
	const owned: OffscreenCanvas[] = [];
	vi.stubGlobal(
		'OffscreenCanvas',
		new Proxy(Original, {
			construct(target, args) {
				const canvas = Reflect.construct(target, args) as OffscreenCanvas;
				owned.push(canvas);
				return canvas;
			},
		}),
	);
	return owned;
};

test('owns and releases its capability probes once per render state', () => {
	const owned = observeCanvases();
	using first = makeInternalState();
	using second = makeInternalState();
	try {
		const transparent = getCanvasContextOptions(first, true);
		const count = owned.length;
		expect(count).toBeGreaterThan(0);
		expect(
			owned.every((canvas) => canvas.width === 0 && canvas.height === 0),
		).toBe(true);
		const opaque = getCanvasContextOptions(first, false);
		expect(owned).toHaveLength(count);
		expect(transparent.alpha).toBe(true);
		expect(opaque.alpha).toBe(false);
		expect(opaque.willReadFrequently).toBe(transparent.willReadFrequently);
		getCanvasContextOptions(second, true);
		expect(owned.length).toBeGreaterThan(count);
		expect(
			owned.every((canvas) => canvas.width === 0 && canvas.height === 0),
		).toBe(true);
	} finally {
		vi.unstubAllGlobals();
	}
});

test('keeps normal rendering available and releases probes when readback fails', () => {
	const context = new OffscreenCanvas(1, 1).getContext('2d')!;
	const prototype = Object.getPrototypeOf(
		context,
	) as OffscreenCanvasRenderingContext2D;
	context.canvas.width = 0;
	context.canvas.height = 0;
	const owned = observeCanvases();
	const failure = vi.spyOn(prototype, 'getImageData').mockImplementation(() => {
		throw new Error('Readback unavailable');
	});
	using state = makeInternalState();
	try {
		expect(getCanvasContextOptions(state, true)).toEqual({alpha: true});
		expect(owned.length).toBeGreaterThan(0);
		expect(
			owned.every((canvas) => canvas.width === 0 && canvas.height === 0),
		).toBe(true);
		const count = owned.length;
		expect(getCanvasContextOptions(state, false)).toEqual({alpha: false});
		expect(owned).toHaveLength(count);
	} finally {
		failure.mockRestore();
		vi.unstubAllGlobals();
	}
});

test('keeps normal rendering available when both contexts are unavailable', () => {
	const owned = observeCanvases();
	const failure = vi
		.spyOn(OffscreenCanvas.prototype, 'getContext')
		.mockReturnValue(null);
	using state = makeInternalState();
	try {
		expect(getCanvasContextOptions(state, false)).toEqual({alpha: false});
		expect(owned.length).toBeGreaterThan(0);
		expect(
			owned.every((canvas) => canvas.width === 0 && canvas.height === 0),
		).toBe(true);
	} finally {
		failure.mockRestore();
		vi.unstubAllGlobals();
	}
});

test('leaves the successful native HTML-in-canvas path outside probing', async () => {
	const element = document.createElement('div');
	document.body.appendChild(element);
	const layoutCanvas = document.createElement('canvas');
	const context = layoutCanvas.getContext('2d')!;
	const drawElementImage = vi.fn(() => {
		context.fillStyle = 'red';
		context.fillRect(0, 0, 10, 10);
	});
	Object.assign(context, {drawElementImage});
	Object.assign(layoutCanvas, {
		requestPaint: () => layoutCanvas.dispatchEvent(new Event('paint')),
	});
	const owned = observeCanvases();
	using state = makeInternalState();
	try {
		const result = await createLayer({
			element,
			scale: 1,
			logLevel: 'error',
			internalState: state,
			cutout: new DOMRect(0, 0, 10, 10),
			transparent: true,
			onlyBackgroundClipText: false,
			waitForPageResponsiveness: null,
			htmlInCanvasContext: {
				ctx: context as CanvasRenderingContext2D & {
					drawElementImage: typeof drawElementImage;
				},
				layoutCanvas,
				wasDrawable: false,
			},
			onHtmlInCanvasLayerOutcome: (outcome) =>
				expect(outcome).toEqual({native: true}),
		});
		expect(drawElementImage).toHaveBeenCalledOnce();
		expect(owned).toHaveLength(1);
		expect(result.canvas).toBe(owned[0]);
		expect(state.canvasContextState.willReadFrequently).toBe(null);
	} finally {
		for (const canvas of owned) {
			canvas.width = 0;
			canvas.height = 0;
		}

		layoutCanvas.width = 0;
		layoutCanvas.height = 0;
		element.remove();
		vi.unstubAllGlobals();
	}
});
