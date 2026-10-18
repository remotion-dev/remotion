import type {Backend} from './effect-types.js';
import {createWebGL2ContextError} from './webgl2-context-error.js';

// A pair of scratch canvases for ping-ponging within a same-backend run.
type CanvasPair = readonly [HTMLCanvasElement, HTMLCanvasElement];

// Browsers keep only a limited number of WebGL contexts alive (16 in Chrome
// and Safari) and force-lose the oldest one beyond that. Giving every effect
// chain its own WebGL canvases made a handful of `<CanvasImage>`s or
// `<HtmlInCanvas>`es with effects enough to lose contexts.
//
// All chains therefore share one pair of WebGL2 scratch canvases, which costs
// at most two WebGL contexts no matter how many chains are mounted. A chain
// resizes a shared canvas to its own dimensions when it picks it up.
//
// Sharing is safe because a WebGL run never yields: its effects apply
// synchronously, and its result is taken off the shared canvas synchronously,
// either by `createImageBitmap()` (which snapshots a canvas source when it is
// called) or by drawing it onto the chain's output. No other chain can touch
// the canvases in between.
//
// Each chain still sets up its own effect state (programs, buffers,
// textures) in the shared context and frees it in the effects' `cleanup()`.
type SharedWebGl = {
	readonly canvases: [HTMLCanvasElement | null, HTMLCanvasElement | null];
	readonly contexts: WebGL2RenderingContext[];
	readonly users: Set<CanvasPool>;
	readonly lost: Set<HTMLCanvasElement>;
};

let sharedWebGl: SharedWebGl | null = null;

const allocateSharedWebGlCanvas = (
	shared: SharedWebGl,
	width: number,
	height: number,
): HTMLCanvasElement => {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!ctx) {
		throw createWebGL2ContextError('canvas effect');
	}

	canvas.addEventListener('webglcontextlost', (e) => {
		// Released on purpose after the last chain was disposed. Not preventing
		// the default keeps the browser from restoring a context nobody uses.
		if (sharedWebGl !== shared) {
			return;
		}

		e.preventDefault();
		shared.lost.add(canvas);
		for (const user of shared.users) {
			user.onSharedContextLost(canvas);
		}
	});
	canvas.addEventListener('webglcontextrestored', () => {
		if (sharedWebGl !== shared) {
			return;
		}

		// A restored context starts from the initial GL state.
		ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		shared.lost.delete(canvas);
	});

	ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	shared.contexts.push(ctx);
	return canvas;
};

// Per-chain canvas pool. 2D and WebGPU canvases belong to the chain; WebGL2
// canvases are the shared ones above.
//
// Canvases are allocated lazily on first use of a given backend. Once
// allocated, they are reused every frame for the chain's lifetime. Contexts
// are created with the cross-backend alpha/sRGB contract enforced (see
// `effect-types.ts`).
//
// Unreferenced canvases are only collected lazily, so `dispose()` releases the
// chain's own canvases right away, and the shared WebGL contexts once the last
// chain using them is gone, instead of leaving that to the garbage collector.
export class CanvasPool {
	private readonly width: number;
	private readonly height: number;
	private readonly pairs: Map<
		Backend,
		[HTMLCanvasElement | null, HTMLCanvasElement | null]
	> = new Map();

	// Tracked individually rather than through `pairs` so that a canvas whose
	// sibling failed to allocate still gets released.
	private readonly allocated: HTMLCanvasElement[] = [];

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

		if (backend === 'webgl2') {
			if (!sharedWebGl) {
				sharedWebGl = {
					canvases: [null, null],
					contexts: [],
					users: new Set(),
					lost: new Set(),
				};
			}

			const shared = sharedWebGl;
			shared.users.add(this);
			// A single effect needs one target. Allocate its ping-pong partner
			// only when a later pass actually uses it.
			shared.canvases[index] ??= allocateSharedWebGlCanvas(
				shared,
				this.width,
				this.height,
			);
			const canvas = shared.canvases[index];
			// Another chain may have resized it. Only assign on a mismatch:
			// any assignment reallocates the drawing buffer.
			if (canvas.width !== this.width) {
				canvas.width = this.width;
			}

			if (canvas.height !== this.height) {
				canvas.height = this.height;
			}

			pair[index] = canvas;
			return canvas;
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

	public assertContextNotLost(canvas: HTMLCanvasElement): void {
		if (sharedWebGl?.lost.has(canvas)) {
			throw new Error(
				'WebGL context was lost during canvas effect rendering. ' +
					'This can happen when the page creates too many WebGL contexts (browsers keep only about 16 alive), ' +
					'or in headless and memory-constrained environments (e.g. Remotion Lambda). ' +
					'Check for other WebGL content on the page, reduce concurrency or increase the Lambda function memory.',
			);
		}
	}

	// Called for every chain using the shared WebGL canvases when one of them
	// loses its context.
	public onSharedContextLost(canvas: HTMLCanvasElement): void {
		if (this.disposed) {
			return;
		}

		this.onContextLost(canvas);
	}

	// Makes the pool unusable and releases its resources right away.
	public dispose(): void {
		if (this.disposed) {
			return;
		}

		this.disposed = true;
		for (const canvas of this.allocated) {
			// Resizing to 0x0 drops the backing store right away.
			canvas.width = 0;
			canvas.height = 0;
		}

		this.allocated.length = 0;
		this.pairs.clear();

		const shared = sharedWebGl;
		if (shared && shared.users.delete(this) && shared.users.size === 0) {
			// Last chain gone: free the slots in the browser's live-context
			// budget immediately. Detached first so the `webglcontextlost` events
			// this causes are ignored.
			sharedWebGl = null;
			for (const ctx of shared.contexts) {
				ctx.getExtension('WEBGL_lose_context')?.loseContext();
			}

			for (const canvas of shared.canvases) {
				if (canvas) {
					canvas.width = 0;
					canvas.height = 0;
				}
			}
		}
	}

	private allocateCanvas(backend: '2d' | 'webgpu'): HTMLCanvasElement {
		const canvas = document.createElement('canvas');
		canvas.width = this.width;
		canvas.height = this.height;

		switch (backend) {
			case '2d': {
				const ctx = canvas.getContext('2d', {
					colorSpace: 'srgb',
				});
				if (!ctx) {
					throw new Error('Failed to acquire 2D context for canvas effect');
				}

				this.allocated.push(canvas);
				return canvas;
			}

			case 'webgpu': {
				if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
					throw new Error(
						'WebGPU is not available in this environment for canvas effect',
					);
				}

				this.allocated.push(canvas);
				return canvas;
			}

			default: {
				const exhaustive: never = backend;
				throw new Error(`Unknown effect backend: ${exhaustive as string}`);
			}
		}
	}
}
