import type {Backend} from './effect-types.js';
import {createWebGL2ContextError} from './webgl2-context-error.js';

// A pair of scratch canvases for ping-ponging within a same-backend run.
type CanvasPair = readonly [HTMLCanvasElement, HTMLCanvasElement];

// Per-chain canvas pool. Each chain owns its own pool; pools are not shared
// across chains because dimensions are chain-specific.
//
// Canvases are allocated lazily on first use of a given backend. Once
// allocated, they are reused every frame for the chain's lifetime. Contexts
// are created with the cross-backend alpha/sRGB contract enforced (see
// `effect-types.ts`).
//
// Browsers keep only a limited number of WebGL contexts alive (16 in Chrome
// and Safari) and force-lose the oldest one beyond that, while unreferenced
// canvases are only collected lazily. `dispose()` therefore releases the
// contexts and backing stores as soon as the chain is torn down instead of
// leaving that to the garbage collector.
export class CanvasPool {
	private readonly width: number;
	private readonly height: number;
	private readonly pairs: Map<Backend, CanvasPair> = new Map();
	// Tracked individually rather than through `pairs` so that a canvas whose
	// sibling failed to allocate still gets released.
	private readonly allocated: Array<{
		canvas: HTMLCanvasElement;
		gl: WebGL2RenderingContext | null;
	}> = [];

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

	public getPair(backend: Backend): CanvasPair {
		if (this.disposed) {
			throw new Error(
				'Effect chain state was used after it had been cleaned up',
			);
		}

		const existing = this.pairs.get(backend);
		if (existing) {
			return existing;
		}

		const pair = [
			this.allocateCanvas(backend),
			this.allocateCanvas(backend),
		] as const;
		this.pairs.set(backend, pair);
		return pair;
	}

	public assertContextNotLost(canvas: HTMLCanvasElement): void {
		if (this.lostContexts.has(canvas)) {
			throw new Error(
				'WebGL context was lost during canvas effect rendering. ' +
					'This typically happens in headless or memory-constrained environments (e.g. Remotion Lambda). ' +
					'Try reducing concurrency or increasing the Lambda function memory.',
			);
		}
	}

	// Makes the pool unusable and releases its resources right away.
	public dispose(): void {
		if (this.disposed) {
			return;
		}

		this.disposed = true;
		for (const {canvas, gl} of this.allocated) {
			// Frees the slot in the browser's live-context budget immediately.
			// Resizing to 0x0 drops the backing store even where the extension
			// is unavailable.
			gl?.getExtension('WEBGL_lose_context')?.loseContext();
			canvas.width = 0;
			canvas.height = 0;
		}

		this.allocated.length = 0;
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
					throw new Error('Failed to acquire 2D context for canvas effect');
				}

				this.allocated.push({canvas, gl: null});
				return canvas;
			}

			case 'webgl2': {
				const ctx = canvas.getContext('webgl2', {
					premultipliedAlpha: true,
					alpha: true,
					preserveDrawingBuffer: true,
				});
				if (!ctx) {
					throw createWebGL2ContextError('canvas effect');
				}

				canvas.addEventListener('webglcontextlost', (e) => {
					// `dispose()` loses the context on purpose. Not preventing the
					// default keeps the browser from restoring a context nobody uses.
					if (this.disposed) {
						return;
					}

					e.preventDefault();
					this.lostContexts.add(canvas);
					this.onContextLost(canvas);
				});
				canvas.addEventListener('webglcontextrestored', () => {
					if (this.disposed) {
						return;
					}

					// A restored context starts from the initial GL state.
					ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
					this.lostContexts.delete(canvas);
				});

				ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
				this.allocated.push({canvas, gl: ctx});
				return canvas;
			}

			case 'webgpu': {
				if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
					throw new Error(
						'WebGPU is not available in this environment for canvas effect',
					);
				}

				this.allocated.push({canvas, gl: null});
				return canvas;
			}

			default: {
				const exhaustive: never = backend;
				throw new Error(`Unknown effect backend: ${exhaustive as string}`);
			}
		}
	}
}
