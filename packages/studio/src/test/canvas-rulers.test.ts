import {expect, test} from 'bun:test';

Object.defineProperty(globalThis, 'localStorage', {
	configurable: true,
	value: {
		getItem: () => null,
		setItem: () => undefined,
	},
});

const getRulerModules = async () => {
	const [{applyRulerInsetsToCanvasSize, getRulerCanvasSize}, {RULER_WIDTH}] =
		await Promise.all([
			import('../helpers/ruler-canvas-size'),
			import('../state/editor-rulers'),
		]);

	return {applyRulerInsetsToCanvasSize, getRulerCanvasSize, RULER_WIDTH};
};

const size = {
	height: 768,
	left: 100,
	refresh: () => undefined,
	top: 50,
	width: 1024,
	windowSize: {
		height: 900,
		width: 1440,
	},
};

test('ruler insets move the canvas origin with the padded preview area', async () => {
	const {applyRulerInsetsToCanvasSize, RULER_WIDTH} = await getRulerModules();

	expect(applyRulerInsetsToCanvasSize({rulersAreVisible: true, size})).toEqual({
		...size,
		height: size.height - RULER_WIDTH,
		left: size.left + RULER_WIDTH,
		top: size.top + RULER_WIDTH,
		width: size.width - RULER_WIDTH,
	});
});

test('canvas size is unchanged if rulers are hidden', async () => {
	const {applyRulerInsetsToCanvasSize} = await getRulerModules();

	expect(applyRulerInsetsToCanvasSize({rulersAreVisible: false, size})).toBe(
		size,
	);
});

test('rulers cover the full inset canvas size', async () => {
	const {applyRulerInsetsToCanvasSize, getRulerCanvasSize, RULER_WIDTH} =
		await getRulerModules();
	const insetSize = applyRulerInsetsToCanvasSize({
		rulersAreVisible: true,
		size,
	});

	expect(
		getRulerCanvasSize({orientation: 'horizontal', size: insetSize}),
	).toEqual({
		height: RULER_WIDTH,
		width: insetSize.width,
	});
	expect(
		getRulerCanvasSize({orientation: 'vertical', size: insetSize}),
	).toEqual({
		height: insetSize.height,
		width: RULER_WIDTH,
	});
});
