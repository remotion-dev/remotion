import type {Backend} from './effect-types.js';
import {createWebGL2ContextError} from './webgl2-context-error.js';

type CanvasSlots = [HTMLCanvasElement | null, HTMLCanvasElement | null];

// Per-chain canvas pool. Each chain owns its own pool; pools are not shared
// across chains because dimensions are chain-specific.
//
// Canvases are allocated lazily on first use of a given backend. Once
// allocated, they are reused every frame for the chain's lifetime. Contexts
// are created with the cross-backend alpha/sRGB contract enforced (see
// `effect-types.ts`).
export class CanvasPool {
	private readonly width: number;
	private readonly height: number;
	private readonly canvases: Map<Backend, CanvasSlots> = new Map();
	private readonly lostContexts: Set<HTMLCanvasElement> = new Set();
	private disposed = false;

	public constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	public getCanvas(backend: Backend, slot: 0 | 1): HTMLCanvasElement {
		if (this.disposed) {
			throw new Error('Cannot allocate a canvas from a disposed effect pool');
		}

		const canvases = this.canvases.get(backend) ?? [null, null];
		const existing = canvases[slot];
		if (existing) {
			return existing;
		}

		const canvas = this.allocateCanvas(backend);
		canvases[slot] = canvas;
		this.canvases.set(backend, canvases);
		return canvas;
	}

	public assertContextNotLost(canvas: HTMLCanvasElement): void {
		const context = canvas.getContext('webgl2');
		if (!context || context.isContextLost() || this.lostContexts.has(canvas)) {
			throw new Error(
				'WebGL context was lost during canvas effect rendering. ' +
					'This typically happens in headless or memory-constrained environments (e.g. Remotion Lambda). ' +
					'Try reducing concurrency or increasing the Lambda function memory.',
			);
		}
	}

	public dispose(): void {
		if (this.disposed) {
			return;
		}

		this.disposed = true;
		for (const [backend, canvases] of this.canvases) {
			for (const canvas of canvases) {
				if (!canvas) {
					continue;
				}

				if (backend === 'webgl2') {
					const context = canvas.getContext('webgl2');
					context?.getExtension('WEBGL_lose_context')?.loseContext();
				}

				canvas.width = 0;
				canvas.height = 0;
			}
		}

		this.canvases.clear();
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
					if (this.disposed) {
						return;
					}

					e.preventDefault();
					this.lostContexts.add(canvas);
				});
				canvas.addEventListener('webglcontextrestored', () => {
					if (this.disposed) {
						return;
					}

					this.lostContexts.delete(canvas);
				});

				ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
				return canvas;
			}

			case 'webgpu': {
				if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
					throw new Error(
						'WebGPU is not available in this environment for canvas effect',
					);
				}

				return canvas;
			}

			default: {
				const exhaustive: never = backend;
				throw new Error(`Unknown effect backend: ${exhaustive as string}`);
			}
		}
	}
}
