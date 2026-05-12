import type {Backend} from './effect-types.js';

// A pair of scratch canvases for ping-ponging within a same-backend run.
type CanvasPair = readonly [HTMLCanvasElement, HTMLCanvasElement];

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
	private readonly pairs: Map<Backend, CanvasPair> = new Map();
	private readonly lostContexts: Set<HTMLCanvasElement> = new Set();

	public constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	public getPair(backend: Backend): CanvasPair {
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
					throw new Error('Failed to acquire WebGL2 context for canvas effect');
				}

				canvas.addEventListener('webglcontextlost', (e) => {
					e.preventDefault();
					this.lostContexts.add(canvas);
				});
				canvas.addEventListener('webglcontextrestored', () => {
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
