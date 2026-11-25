import {expect, test, vi} from 'vitest';
import {transformIn3d} from '../drawing/transform-in-3d';
import {makeInternalState} from '../internal-state';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {gridSamplerParent} from './fixtures/preserve-3d-depth';

type SelectionCase = {
	id: string;
	matrix: number[];
	source: [number, number, number, number];
	destination: [number, number, number, number];
	pixels: [number, number];
	scale: number;
	nearest: boolean;
	parentCopyPixelAligned: boolean;
};
const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const defineCase = (
	id: string,
	input: Partial<Omit<SelectionCase, 'id'>>,
): SelectionCase => ({
	id,
	matrix: identity,
	source: [4, 4, 16, 16],
	destination: [0, 0, 32, 32],
	pixels: [16, 16],
	scale: 1,
	nearest: true,
	parentCopyPixelAligned: true,
	...input,
});
const cases = [
	defineCase('unit', {}),
	defineCase('large-origin-cancellation', {
		matrix: [3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, -25165824, 0, 0, 1],
		source: [8388608, 0, 17, 17],
		pixels: [51, 51],
		destination: [0, 0, 64, 64],
		nearest: false,
	}),
	defineCase('large-exponent-addition-loss', {
		matrix: [2 ** 80, 0, 0, 0, 0, 2 ** 80, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2 ** 80],
		nearest: false,
	}),
	defineCase('fractional-actual-parent-copy', {
		parentCopyPixelAligned: false,
		nearest: false,
	}),
	defineCase('reflected-x', {
		matrix: [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 24, 0, 0, 1],
	}),
	defineCase('exact-axis-swap', {
		matrix: [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 24, 0, 0, 1],
	}),
	defineCase('normalized-positive-w', {
		matrix: [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2],
	}),
	defineCase('perspective-z-zero', {
		matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -1 / 700, 0, 0, 0, 1],
	}),
	// Cancel the local fractional translation so only final-parent placement rejects it.
	defineCase('fractional-parent-x', {
		matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0.25, 0, 0, 1],
		destination: [0.25, 0, 32, 32],
		nearest: false,
	}),
	defineCase('fractional-parent-y', {
		matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0.25, 0, 1],
		destination: [0, 0.25, 32, 32],
		nearest: false,
	}),
	defineCase('fractional-output-width', {
		destination: [0, 0, 32.25, 32],
		nearest: false,
	}),
	defineCase('fractional-output-height', {
		destination: [0, 0, 32, 32.25],
		nearest: false,
	}),
	defineCase('sub-float-fractional-width', {
		destination: [0, 0, 32 + 2 ** -40, 32],
		nearest: false,
	}),
	defineCase('fractional-local-origin', {
		matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0.25, 0, 0, 1],
		nearest: false,
	}),
	defineCase('near-unit-up', {
		matrix: [1 + 2 ** -20, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
		nearest: false,
	}),
	defineCase('near-unit-down', {
		matrix: [1 - 2 ** -20, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
		nearest: false,
	}),
	defineCase('source-density-mismatch', {pixels: [15, 16], nearest: false}),
	defineCase('projective-x', {
		matrix: [1, 0, 0, 1 / 1000, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
		nearest: false,
	}),
	defineCase('projective-y', {
		matrix: [1, 0, 0, 0, 0, 1, 0, 1 / 1000, 0, 0, 1, 0, 0, 0, 0, 1],
		nearest: false,
	}),
	defineCase('original-projective-underflow', {
		matrix: [1, 0, 0, Number.MIN_VALUE, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
		nearest: false,
	}),
	defineCase('negative-w', {
		matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1],
		nearest: false,
	}),
	defineCase('zero-w', {
		matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
		nearest: false,
	}),
	defineCase('negative-source-span', {source: [20, 4, -16, 16]}),
	defineCase('negative-parent-origin', {destination: [-4, -4, 32, 32]}),
	defineCase('scale-1.25-density', {
		pixels: [20, 20],
		scale: 1.25,
		destination: [0, 0, 40, 40],
	}),
	defineCase('scale-2-density', {
		pixels: [32, 32],
		scale: 2,
		destination: [0, 0, 64, 64],
	}),
];

// PR #12686: preserve one-to-one samples without admitting resampling or stale texture state.
test.each(cases)('exact grid sampler selects safely for $id', (entry) => {
	using state = makeInternalState({experimental3DRendering: true});
	const source = new OffscreenCanvas(...entry.pixels);
	const context = source.getContext('2d')!;
	context.fillStyle = '#2870b0';
	context.fillRect(2, 2, source.width - 4, source.height - 4);
	const matrix = new DOMMatrix(entry.matrix);
	const matrixBefore = matrix.toFloat64Array();
	const calls: number[] = [];
	const original = WebGLRenderingContext.prototype.texParameteri;
	const spy = vi
		.spyOn(WebGLRenderingContext.prototype, 'texParameteri')
		.mockImplementation(function (this: WebGLRenderingContext, ...args) {
			if (
				args[1] === this.TEXTURE_MIN_FILTER ||
				args[1] === this.TEXTURE_MAG_FILTER
			)
				calls.push(args[2]);
			return original.apply(this, args);
		});
	try {
		transformIn3d({
			matrix,
			sourceCanvas: source,
			sourceRect: new DOMRect(...entry.source),
			destRect: new DOMRect(...entry.destination),
			internalState: state,
			parentCopyPixelAligned: entry.parentCopyPixelAligned,
			scale: entry.scale,
		});
		const {gl, program, locations} = state.helperCanvasState.current!;
		expect(calls).toEqual([
			entry.nearest ? gl.NEAREST : gl.LINEAR,
			entry.nearest ? gl.NEAREST : gl.LINEAR,
		]);
		expect(matrix.toFloat64Array()).toEqual(matrixBefore);
		const resolution = Array.from(
			gl.getUniform(program, locations.uResolution!) as Float32Array,
		);
		expect(resolution).toEqual(entry.destination.slice(2).map(Math.fround));
	} finally {
		spy.mockRestore();
		source.width = 0;
		source.height = 0;
	}

	expect(WebGLRenderingContext.prototype.texParameteri).toBe(original);
});

test('exact grid sampler leaves the disabled policy on LINEAR', () => {
	using state = makeInternalState({experimental3DRendering: false});
	const source = new OffscreenCanvas(16, 16);
	const original = WebGLRenderingContext.prototype.texParameteri;
	const calls: number[] = [];
	const spy = vi
		.spyOn(WebGLRenderingContext.prototype, 'texParameteri')
		.mockImplementation(function (this: WebGLRenderingContext, ...args) {
			if (
				args[1] === this.TEXTURE_MIN_FILTER ||
				args[1] === this.TEXTURE_MAG_FILTER
			)
				calls.push(args[2]);
			return original.apply(this, args);
		});
	try {
		transformIn3d({
			matrix: new DOMMatrix(),
			sourceCanvas: source,
			sourceRect: new DOMRect(0, 0, 16, 16),
			destRect: new DOMRect(0, 0, 32, 32),
			internalState: state,
			parentCopyPixelAligned: true,
			scale: 1,
		});
		expect(calls).toEqual([
			WebGLRenderingContext.LINEAR,
			WebGLRenderingContext.LINEAR,
		]);
	} finally {
		spy.mockRestore();
		source.width = 0;
		source.height = 0;
	}
});

test('exact grid sampler restores LINEAR after a qualified draw', () => {
	using state = makeInternalState({experimental3DRendering: true});
	const source = new OffscreenCanvas(16, 16);
	const calls: number[] = [];
	const original = WebGLRenderingContext.prototype.texParameteri;
	const spy = vi
		.spyOn(WebGLRenderingContext.prototype, 'texParameteri')
		.mockImplementation(function (this: WebGLRenderingContext, ...args) {
			if (
				args[1] === this.TEXTURE_MIN_FILTER ||
				args[1] === this.TEXTURE_MAG_FILTER
			)
				calls.push(args[2]);
			return original.apply(this, args);
		});
	try {
		for (const width of [32, 32.25])
			transformIn3d({
				matrix: new DOMMatrix(),
				sourceCanvas: source,
				sourceRect: new DOMRect(0, 0, 16, 16),
				destRect: new DOMRect(0, 0, width, 32),
				internalState: state,
				parentCopyPixelAligned: true,
				scale: 1,
			});
		const first = WebGLRenderingContext.NEAREST;
		expect(calls).toEqual([
			first,
			first,
			WebGLRenderingContext.LINEAR,
			WebGLRenderingContext.LINEAR,
		]);
	} finally {
		spy.mockRestore();
		source.width = 0;
		source.height = 0;
	}
});

// Observe the actual process-node copy, rather than substituting the alignment input.
test.each([1, 1.25, 2])(
	'keeps actual parent-copy sampling aligned at export scale %s',
	async (scale) => {
		const modes = new WeakMap<
			object,
			{mode: number[]; size: number[]; resolution: number[]}
		>();
		const copies: {
			mode: number[];
			size: number[];
			resolution: number[];
			x: number;
			y: number;
		}[] = [];
		const originalDraw = WebGLRenderingContext.prototype.drawArrays;
		const originalCopy = OffscreenCanvasRenderingContext2D.prototype.drawImage;
		const draw = vi
			.spyOn(WebGLRenderingContext.prototype, 'drawArrays')
			.mockImplementation(function (this: WebGLRenderingContext, ...args) {
				const program = this.getParameter(this.CURRENT_PROGRAM) as WebGLProgram;
				modes.set(this.canvas, {
					mode: [
						this.getTexParameter(
							this.TEXTURE_2D,
							this.TEXTURE_MIN_FILTER,
						) as number,
						this.getTexParameter(
							this.TEXTURE_2D,
							this.TEXTURE_MAG_FILTER,
						) as number,
					],
					size: [this.canvas.width, this.canvas.height],
					resolution: Array.from(
						this.getUniform(
							program,
							this.getUniformLocation(program, 'uResolution')!,
						) as Float32Array,
					),
				});
				return originalDraw.apply(this, args);
			});
		const copy = vi
			.spyOn(OffscreenCanvasRenderingContext2D.prototype, 'drawImage')
			.mockImplementation(function (
				this: OffscreenCanvasRenderingContext2D,
				...args: unknown[]
			) {
				const sample = modes.get(args[0] as object);
				if (sample && args.length === 9)
					copies.push({...sample, x: args[5] as number, y: args[6] as number});
				return Reflect.apply(originalCopy, this, args) as void;
			});
		try {
			for (const frame of [0, 1]) {
				const result = await renderStillOnWeb({
					composition: gridSamplerParent,
					frame,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
					experimental3DRendering: true,
					scale,
				});
				const canvas = await result.canvas();
				try {
					expect(canvas.width).toBe(300 * scale);
					expect(canvas.height).toBe(300 * scale);
				} finally {
					canvas.width = 0;
					canvas.height = 0;
				}
			}
		} finally {
			try {
				draw.mockRestore();
			} finally {
				copy.mockRestore();
			}
		}

		expect(WebGLRenderingContext.prototype.drawArrays).toBe(originalDraw);
		expect(OffscreenCanvasRenderingContext2D.prototype.drawImage).toBe(
			originalCopy,
		);
		expect(copies.length).toBeGreaterThan(0);
		const fractional = copies.filter(
			({x, y}) => !Number.isInteger(x) || !Number.isInteger(y),
		);
		if (scale === 1.25) expect(fractional.length).toBeGreaterThan(0);
		else expect(fractional.length).toBe(0);
		for (const {mode, size, resolution} of fractional) {
			expect(size).toEqual([80, 60]);
			expect(resolution).toEqual(size);
			expect(mode).toEqual([
				WebGLRenderingContext.LINEAR,
				WebGLRenderingContext.LINEAR,
			]);
		}
	},
);
