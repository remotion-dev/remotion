import type {Backend} from './effect-types.js';
import {createWebGLStateReset} from './reset-webgl-state.js';
import {WebGLContextLostError} from './webgl-context-lost-error.js';
import {createWebGL2ContextError} from './webgl2-context-error.js';

// A pair of scratch canvases for ping-ponging within a same-backend run.
type CanvasPair = readonly [HTMLCanvasElement, HTMLCanvasElement];

const scheduleContextLoss = (gl: WebGL2RenderingContext): void => {
	// Losing a WebGL context during an HTML-in-canvas paint event (including
	// its microtasks) crashes Chromium. Release it in the next task instead.
	// Remove this deferral once the fix is available in all supported Chromium versions.
	// https://github.com/remotion-dev/remotion/issues/12293
	// https://issues.chromium.org/issues/575053149
	setTimeout(() => {
		gl.getExtension('WEBGL_lose_context')?.loseContext();
	}, 0);
};

// Chains own their 2D/WebGPU pools. WebGL chains borrow one shared pool and
// resize its scratch canvases while holding an exclusive lease.
//
// Canvases are allocated lazily on first use of a given backend. Once
// allocated, they are reused every frame for the chain's lifetime. Contexts
// are created with the cross-backend alpha/sRGB contract enforced (see
// `effect-types.ts`).
//
// Browsers keep only a limited number of WebGL contexts alive (16 in Chrome
// and Safari) and force-lose the oldest one beyond that, while unreferenced
// canvases are only collected lazily. `dispose()` therefore releases the
// backing stores as soon as the chain is torn down and the contexts in the
// next task instead of leaving that to the garbage collector.
export class CanvasPool {
	private width: number;
	private height: number;
	private readonly pairs: Map<
		Backend,
		[HTMLCanvasElement | null, HTMLCanvasElement | null]
	> = new Map();

	// Tracked individually rather than through `pairs` so that a canvas whose
	// sibling failed to allocate still gets released.
	private readonly allocated = new Map<
		HTMLCanvasElement,
		{
			gl: WebGL2RenderingContext | null;
			reset: ReturnType<typeof createWebGLStateReset> | null;
		}
	>();

	private readonly lostContexts: Set<HTMLCanvasElement> = new Set();
	private readonly onContextLost: (canvas: HTMLCanvasElement) => void;
	private disposed = false;

	public constructor(
		width: number,
		height: number,
		onContextLost: (canvas: HTMLCanvasElement) => void,
	) {
		this.width = width;
		this.height = height;
		this.onContextLost = onContextLost;
	}

	public resize(width: number, height: number): void {
		this.width = width;
		this.height = height;
		for (const canvas of this.allocated.keys()) {
			// Assigning even the same dimension clears/reallocates the buffer.
			if (canvas.width !== width) canvas.width = width;
			if (canvas.height !== height) canvas.height = height;
		}
	}

	public owns(canvas: HTMLCanvasElement): boolean {
		return this.allocated.has(canvas);
	}

	public assertWebGLContextsNotLost(): void {
		for (const [canvas, entry] of this.allocated) {
			if (entry.gl) this.getCheckedEntry(canvas);
		}
	}

	public getCanvas(backend: Backend, index: 0 | 1): HTMLCanvasElement {
		if (this.disposed) {
			throw new Error(
				'Effect chain state was used after it had been cleaned up',
			);
		}

		let pair = this.pairs.get(backend);
		if (!pair) {
			pair = [null, null];
			this.pairs.set(backend, pair);
		}

		// A single effect needs one target. Allocate its ping-pong partner only
		// when a later pass actually uses it.
		pair[index] ??= this.allocateCanvas(backend);
		return pair[index];
	}

	public getPair(backend: Backend): CanvasPair {
		this.getCanvas(backend, 0);
		this.getCanvas(backend, 1);
		return this.pairs.get(backend) as CanvasPair;
	}

	private getCheckedEntry(canvas: HTMLCanvasElement) {
		const entry = this.allocated.get(canvas);
		if (this.lostContexts.has(canvas) || entry?.gl?.isContextLost()) {
			throw new WebGLContextLostError(canvas);
		}

		return entry ?? null;
	}

	public assertContextNotLost(canvas: HTMLCanvasElement): void {
		this.getCheckedEntry(canvas);
	}

	public prepareWebGL(canvas: HTMLCanvasElement, flipSourceY: boolean): void {
		const entry = this.getCheckedEntry(canvas);
		if (!entry?.reset) {
			throw new Error('WebGL effect target is not owned by this pool');
		}

		entry.reset(canvas.width, canvas.height, flipSourceY);
	}

	// A failed setup may have allocated objects it never returned. Scheduling
	// context loss also releases those unreachable objects; no cached state survives.
	public retireWebGL(canvas: HTMLCanvasElement): void {
		const entry = this.allocated.get(canvas);
		if (!entry) return;
		const {gl} = entry;
		this.allocated.delete(canvas);
		const pair = this.pairs.get('webgl2');
		if (pair) {
			if (pair[0] === canvas) pair[0] = null;
			if (pair[1] === canvas) pair[1] = null;
		}

		try {
			if (gl) scheduleContextLoss(gl);
			// Invalidate cached setups now, before the deferred context loss.
			this.onContextLost(canvas);
		} finally {
			canvas.width = 0;
			canvas.height = 0;
			this.lostContexts.delete(canvas);
		}
	}

	// Makes the pool unusable immediately and schedules WebGL context release.
	public dispose(): void {
		if (this.disposed) {
			return;
		}

		this.disposed = true;
		for (const [canvas, {gl}] of this.allocated) {
			// Frees the slot in the browser's live-context budget in the next task.
			// Resizing to 0x0 drops the backing store even where the extension
			// is unavailable.
			if (gl) scheduleContextLoss(gl);
			canvas.width = 0;
			canvas.height = 0;
		}

		this.allocated.clear();
		this.pairs.clear();
		this.lostContexts.clear();
	}

	private allocateCanvas(backend: Backend): HTMLCanvasElement {
		const canvas = document.createElement('canvas');
		canvas.width = this.width;
		canvas.height = this.height;

		switch (backend) {
			case '2d': {
				const ctx = canvas.getContext('2d', {
					colorSpace: 'srgb',
				});
				if (!ctx) {
					throw new Error('Failed to acquire 2D context for effects');
				}

				this.allocated.set(canvas, {gl: null, reset: null});
				return canvas;
			}

			case 'webgl2': {
				const ctx = canvas.getContext('webgl2', {
					premultipliedAlpha: true,
					alpha: true,
					preserveDrawingBuffer: true,
				});
				if (!ctx) {
					throw createWebGL2ContextError('effects');
				}

				canvas.addEventListener('webglcontextlost', () => {
					// Recovery replaces the canvas. Do not request restoration of a
					// retired context, which would consume an unowned browser slot.
					if (this.disposed || !this.allocated.has(canvas)) {
						return;
					}

					this.lostContexts.add(canvas);
					this.onContextLost(canvas);
				});
				canvas.addEventListener('webglcontextrestored', () => {
					if (this.disposed || !this.allocated.has(canvas)) {
						return;
					}

					// A restored context starts from the initial GL state.
					ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
					this.lostContexts.delete(canvas);
				});

				ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
				this.allocated.set(canvas, {
					gl: ctx,
					reset: createWebGLStateReset(
						ctx,
						ctx.getParameter(ctx.MAX_COMBINED_TEXTURE_IMAGE_UNITS) as number,
					),
				});
				return canvas;
			}

			case 'webgpu': {
				if (
					typeof navigator === 'undefined' ||
					!('gpu' in navigator) ||
					!canvas.getContext('webgpu')
				) {
					throw new Error(
						'WebGPU is not available in this environment for effects',
					);
				}

				this.allocated.set(canvas, {gl: null, reset: null});
				return canvas;
			}

			default: {
				const exhaustive: never = backend;
				throw new Error(`Unknown effect backend: ${exhaustive as string}`);
			}
		}
	}
}
