import {CanvasPool} from './canvas-pool.js';
import {groupByBackend} from './effect-internals.js';
import type {
	EffectDefinition,
	EffectDefinitionAndStack,
} from './effect-types.js';
import {getGpuDevice} from './gpu-device.js';

export type EffectChainState = {
	pool: CanvasPool;
	setupCache: WeakMap<
		EffectDefinition<unknown, unknown>,
		WeakMap<HTMLCanvasElement, unknown>
	>;
	cleanupRegistry: Array<{
		definition: EffectDefinition<unknown, unknown>;
		state: unknown;
	}>;
	currentRunId: number;
};

export const createEffectChainState = (
	width: number,
	height: number,
): EffectChainState => ({
	pool: new CanvasPool(width, height),
	setupCache: new WeakMap(),
	cleanupRegistry: [],
	currentRunId: 0,
});

export const cleanupEffectChainState = (state: EffectChainState): void => {
	state.currentRunId++;
	for (const entry of state.cleanupRegistry) {
		entry.definition.cleanup(entry.state);
	}
};

const ensureSetup = <S>(
	state: EffectChainState,
	def: EffectDefinition<unknown, S>,
	target: HTMLCanvasElement,
): S => {
	const widened = def as EffectDefinition<unknown, unknown>;
	let cacheForDefinition = state.setupCache.get(widened);
	if (!cacheForDefinition) {
		cacheForDefinition = new WeakMap<HTMLCanvasElement, unknown>();
		state.setupCache.set(widened, cacheForDefinition);
	}

	if (cacheForDefinition.has(target)) {
		return cacheForDefinition.get(target) as S;
	}

	const setupState = def.setup(target);
	cacheForDefinition.set(target, setupState);
	state.cleanupRegistry.push({definition: widened, state: setupState});
	return setupState;
};

/** Final compositing target for an effect chain (layout canvas or transferred offscreen). */
export type EffectChainOutput = HTMLCanvasElement | OffscreenCanvas;

export type RunEffectChainOptions = {
	readonly state: EffectChainState;
	readonly source: CanvasImageSource;
	readonly effects: EffectDefinitionAndStack<unknown>[];
	readonly output: EffectChainOutput;
	readonly width: number;
	readonly height: number;
};

// Runs the effect pipeline imperatively. Returns `true` if the pipeline
// completed and wrote to `output`, `false` if it was superseded by a newer
// run (caller should not act on a stale result).
export const runEffectChain = async ({
	state,
	source,
	effects,
	output,
	width,
	height,
}: RunEffectChainOptions): Promise<boolean> => {
	const runId = ++state.currentRunId;
	const isCancelled = () => state.currentRunId !== runId;

	// Bypass any effect with `disabled: true` before grouping by backend, so
	// disabled effects don't create empty runs or force unnecessary backend
	// transitions. The `disabled` flag is injected by `createEffect` and lives
	// on `params` so it flows through code/drag override merging.
	const enabledEffects = effects.filter(
		(e) => !(e.params as {disabled?: boolean}).disabled,
	);
	const runs = groupByBackend(enabledEffects);

	let currentImage: CanvasImageSource = source;
	let lastTarget: HTMLCanvasElement | null = null;

	if (runs.length === 0) {
		// In-place pipeline (e.g. <HtmlInCanvas>: drawElementImage into the same
		// surface, no further effects) — the bitmap is already on `output`.
		if (source === output) {
			return true;
		}

		const ctx = output.getContext('2d');
		if (!ctx) {
			throw new Error('Failed to acquire 2D context for output canvas');
		}

		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(currentImage, 0, 0, width, height);
		return true;
	}

	let needsGpuDevice = false;
	for (const run of runs) {
		if (run.backend === 'webgpu') {
			needsGpuDevice = true;
			break;
		}
	}

	const gpuDevice = needsGpuDevice ? await getGpuDevice() : null;
	if (isCancelled()) {
		return false;
	}

	// Canvas sources are DOM-oriented. Flip them when uploading into WebGL so
	// texture coordinates match clip-space output. `ImageBitmap` bridges below
	// opt out because they are already oriented for upload.
	let flipWebGLSourceY = true;

	for (let runIndex = 0; runIndex < runs.length; runIndex++) {
		const run = runs[runIndex];
		const [a, b] = state.pool.getPair(run.backend);
		let dst = a;

		for (const eff of run.effects) {
			const def = eff.definition as EffectDefinition<unknown, unknown>;
			const setupState = ensureSetup(state, def, dst);

			def.apply({
				source: currentImage,
				target: dst,
				state: setupState,
				params: eff.params,
				width,
				height,
				gpuDevice,
				flipSourceY: run.backend === 'webgl2' ? flipWebGLSourceY : false,
			});

			if (run.backend === 'webgl2') {
				// Same-backend ping-pong passes feed the previous WebGL canvas back
				// through `texImage2D()`. That source is still a DOM canvas, so the
				// next upload also needs to be flipped.
				flipWebGLSourceY = true;
				state.pool.assertContextNotLost(dst);
			}

			currentImage = dst;
			dst = dst === a ? b : a;
		}

		lastTarget = (currentImage as HTMLCanvasElement | null) ?? lastTarget;

		const nextRun = runs[runIndex + 1];
		if (nextRun && nextRun.backend !== run.backend && lastTarget) {
			// 2D → WebGL: pass the 2D canvas directly so `texImage2D` + `UNPACK_FLIP_Y`
			// matches blur-only on a raw frame canvas. `createImageBitmap` here changes
			// upload orientation and produced upside-down stacks (wave + blur).
			if (run.backend === '2d' && nextRun.backend === 'webgl2') {
				currentImage = lastTarget;
				flipWebGLSourceY = true;
			} else {
				// Other bridges use `createImageBitmap` rather than passing the canvas
				// straight through. A direct `drawImage(webglCanvas)` in the next
				// backend's first effect forces an implicit GPU readback / finish on the
				// consuming context, which empirically blows the per-frame vsync budget and
				// halves the paint rate. `createImageBitmap` pipelines the GPU work.
				const bitmap = await createImageBitmap(lastTarget);
				if (isCancelled()) {
					bitmap.close();
					return false;
				}

				currentImage = bitmap;
				if (nextRun.backend === 'webgl2') {
					flipWebGLSourceY = false;
				}
			}
		}
	}

	if (!lastTarget) {
		return true;
	}

	const outCtx = output.getContext('2d');
	if (!outCtx) {
		throw new Error('Failed to acquire 2D context for output canvas');
	}

	outCtx.clearRect(0, 0, width, height);
	outCtx.drawImage(lastTarget, 0, 0, width, height);
	return true;
};
