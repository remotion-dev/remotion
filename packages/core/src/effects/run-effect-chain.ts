import {CanvasPool} from './canvas-pool.js';
import {groupByBackend} from './effect-internals.js';
import {
	invalidateEffectChainSources,
	publishEffectSource,
} from './effect-source-observer.js';
import type {
	EffectDefinition,
	EffectDefinitionAndStack,
} from './effect-types.js';
import {getGpuDevice} from './gpu-device.js';

export type EffectChainState = {
	readonly width: number;
	readonly height: number;
	pool: CanvasPool;
	setupCache: WeakMap<
		EffectDefinition<unknown, unknown>,
		WeakMap<HTMLCanvasElement, unknown>
	>;
	cleanupRegistry: Array<{
		definition: EffectDefinition<unknown, unknown>;
		state: unknown;
		target: HTMLCanvasElement;
	}>;
	currentRunId: number;
	pendingRun: Promise<void> | null;
	cleanupRequested: boolean;
};

// Detach entries before calling user code. One broken cleanup must not prevent
// the remaining effects from releasing their resources.
const cleanupEntries = (entries: EffectChainState['cleanupRegistry']): void => {
	const errors: unknown[] = [];
	for (const entry of entries) {
		try {
			entry.definition.cleanup(entry.state);
		} catch (error) {
			errors.push(error);
		}
	}

	if (errors.length === 1) throw errors[0];
	if (errors.length > 1)
		throw new AggregateError(errors, 'Effect cleanup failed');
};

const disposeEffectChainState = (state: EffectChainState): void => {
	const entries = state.cleanupRegistry;
	state.cleanupRegistry = [];
	state.setupCache = new WeakMap();
	try {
		cleanupEntries(entries);
	} finally {
		state.pool.dispose();
	}
};

export const createEffectChainState = (
	width: number,
	height: number,
): EffectChainState => {
	const state: EffectChainState = {
		width,
		height,
		pool: new CanvasPool(width, height, (canvas) => {
			state.currentRunId++;
			// The GL objects these setups hold died with the context and stay
			// invalid on a restored one, so the next run has to recreate them.
			// While the context is lost, GL calls are no-ops, which makes this
			// the moment to run the cleanups without side effects on the
			// context's error state.
			const dead = state.cleanupRegistry.filter(
				(entry) => entry.target === canvas,
			);
			state.cleanupRegistry = state.cleanupRegistry.filter(
				(entry) => entry.target !== canvas,
			);
			for (const entry of dead) {
				state.setupCache.get(entry.definition)?.delete(canvas);
			}

			cleanupEntries(dead);
		}),
		setupCache: new WeakMap(),
		cleanupRegistry: [],
		currentRunId: 0,
		pendingRun: null,
		cleanupRequested: false,
	};

	return state;
};

// Cancel immediately, but do not destroy canvases borrowed by an asynchronous
// bridge or by an effect callback still on the stack.
export const cleanupEffectChainState = (state: EffectChainState): void => {
	if (state.cleanupRequested) return;
	state.cleanupRequested = true;
	state.currentRunId++;
	invalidateEffectChainSources(state);
	if (!state.pendingRun) disposeEffectChainState(state);
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

	if (def.backend === 'webgl2') state.pool.prepareWebGL(target, false);
	let setupState: S;
	try {
		setupState = def.setup(target);
	} catch (error) {
		if (def.backend === 'webgl2') {
			try {
				state.pool.retireWebGL(target);
			} catch (cleanupError) {
				throw new AggregateError(
					[error, cleanupError],
					'Effect setup and cleanup failed',
				);
			}
		}

		throw error;
	}

	cacheForDefinition.set(target, setupState);
	state.cleanupRegistry.push({definition: widened, state: setupState, target});
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
const runEffectChainWithoutResize = async (
	{state, source, effects, output, width, height}: RunEffectChainOptions,
	initialFlipSourceY: boolean,
	runId: number,
): Promise<boolean> => {
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
	let flipWebGLSourceY = initialFlipSourceY;
	// Only bridge bitmaps are owned here; the original source belongs to the caller.
	let bridgeBitmap: ImageBitmap | null = null;

	try {
		for (let runIndex = 0; runIndex < runs.length; runIndex++) {
			const run = runs[runIndex];
			let canvasIndex: 0 | 1 = 0;

			for (const eff of run.effects) {
				if (isCancelled()) return false;
				const dst = state.pool.getCanvas(run.backend, canvasIndex);
				const def = eff.definition as EffectDefinition<unknown, unknown>;
				if (run.backend === 'webgl2') {
					// Checked before `setup()`: a lost context cannot compile shaders,
					// and this surfaces the dedicated error instead of an effect's own.
					state.pool.assertContextNotLost(dst);
				}

				const setupState = ensureSetup(state, def, dst);
				if (isCancelled()) return false;

				publishEffectSource(eff, currentImage, state);
				if (isCancelled()) return false;
				if (run.backend === 'webgl2')
					state.pool.prepareWebGL(dst, flipWebGLSourceY);
				def.apply({
					source: currentImage,
					target: dst,
					state: setupState,
					params: eff.params,
					width: state.width,
					height: state.height,
					gpuDevice,
					flipSourceY: run.backend === 'webgl2' ? flipWebGLSourceY : false,
				});
				if (run.backend === 'webgl2') state.pool.assertContextNotLost(dst);
				if (isCancelled()) return false;
				// Effects consume their source synchronously. Release it before the
				// next bridge so a run never retains multiple temporary bitmaps.
				bridgeBitmap?.close();
				bridgeBitmap = null;

				if (run.backend === 'webgl2') {
					// Same-backend ping-pong passes feed the previous WebGL canvas back
					// through `texImage2D()`. That source is still a DOM canvas, so the
					// next upload also needs to be flipped.
					flipWebGLSourceY = true;
				}

				currentImage = dst;
				canvasIndex = canvasIndex === 0 ? 1 : 0;
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
					bridgeBitmap = await createImageBitmap(lastTarget);
					if (isCancelled()) {
						return false;
					}

					currentImage = bridgeBitmap;
					if (nextRun.backend === 'webgl2') {
						flipWebGLSourceY = false;
					}
				}
			}
		}
	} finally {
		// Also release a bridge if setup/apply throws or the run is cancelled.
		bridgeBitmap?.close();
	}

	if (isCancelled()) return false;
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

// Keep ownership of the optional resized source until the existing chain settles.
const runEffectChainWithResize = async (
	options: RunEffectChainOptions,
	runId: number,
): Promise<boolean> => {
	const {state, source, width, height, effects} = options;
	if (
		(state.width === width && state.height === height) ||
		!effects.some((effect) => !(effect.params as {disabled?: boolean}).disabled)
	) {
		return runEffectChainWithoutResize(options, true, runId);
	}

	const firstEnabledEffect = effects.find(
		(effect) => !(effect.params as {disabled?: boolean}).disabled,
	)!;
	const resized = await createImageBitmap(source as ImageBitmapSource, {
		resizeWidth: state.width,
		resizeHeight: state.height,
		// WebGL ignores UNPACK_FLIP_Y_WEBGL for ImageBitmap uploads.
		imageOrientation:
			firstEnabledEffect.definition.backend === 'webgl2' ? 'flipY' : 'none',
	});
	try {
		if (state.currentRunId !== runId) {
			return false;
		}

		return await runEffectChainWithoutResize(
			{...options, source: resized},
			false,
			runId,
		);
	} finally {
		resized.close();
	}
};

// Reserve the chain before invoking any effect or observer. A reentrant call
// supersedes this run, but cannot touch its canvases until every bridge settles.
export const runEffectChain = async (
	options: RunEffectChainOptions,
): Promise<boolean> => {
	const {state} = options;
	if (state.cleanupRequested) {
		throw new Error('Effect chain state was used after it had been cleaned up');
	}

	const runId = ++state.currentRunId;
	const previousRun = state.pendingRun;
	let release!: () => void;
	const completion = new Promise<void>((resolve) => {
		release = resolve;
	});
	state.pendingRun = completion;
	try {
		if (previousRun) await previousRun;
		if (state.currentRunId !== runId) return false;
		return await runEffectChainWithResize(options, runId);
	} finally {
		try {
			if (state.pendingRun === completion) {
				state.pendingRun = null;
				if (state.cleanupRequested) disposeEffectChainState(state);
			}
		} finally {
			release();
		}
	}
};
