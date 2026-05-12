import {CanvasPool} from './canvas-pool.js';
import {flattenEffects, groupByBackend} from './effect-internals.js';
import type {EffectDefinition, EffectsProp} from './effect-types.js';
import {getGpuDevice} from './gpu-device.js';

export type EffectChainState = {
	pool: CanvasPool;
	setupCache: WeakMap<EffectDefinition<unknown, unknown>, unknown>;
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
	if (state.setupCache.has(widened)) {
		return state.setupCache.get(widened) as S;
	}

	const setupState = def.setup(target);
	state.setupCache.set(widened, setupState);
	state.cleanupRegistry.push({definition: widened, state: setupState});
	return setupState;
};

export type RunEffectChainOptions = {
	readonly state: EffectChainState;
	readonly source: CanvasImageSource;
	readonly effects: EffectsProp;
	readonly output: HTMLCanvasElement;
	readonly frame: number;
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
	frame,
	width,
	height,
}: RunEffectChainOptions): Promise<boolean> => {
	const runId = ++state.currentRunId;
	const isCancelled = () => state.currentRunId !== runId;

	const flattened = flattenEffects(effects);
	const runs = groupByBackend(flattened);

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
				frame,
				width,
				height,
				gpuDevice,
			});

			if (run.backend === 'webgl2') {
				state.pool.assertContextNotLost(dst);
			}

			currentImage = dst;
			dst = dst === a ? b : a;
		}

		lastTarget = (currentImage as HTMLCanvasElement | null) ?? lastTarget;

		const nextRun = runs[runIndex + 1];
		if (nextRun && nextRun.backend !== run.backend && lastTarget) {
			// Bridge between backend groups via `createImageBitmap` rather than
			// passing the canvas straight through. A direct `drawImage(webglCanvas)`
			// in the next backend's first effect forces an implicit GPU readback /
			// finish on the consuming context, which empirically blows the per-frame
			// vsync budget and halves the paint rate. `createImageBitmap` performs
			// the same handoff but pipelines the GPU work, so the next effect reads
			// from a ready-to-sample bitmap without stalling.
			const bitmap = await createImageBitmap(lastTarget);
			if (isCancelled()) {
				bitmap.close();
				return false;
			}

			currentImage = bitmap;
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
