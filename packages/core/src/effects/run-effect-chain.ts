import {CanvasPool} from './canvas-pool.js';
import {groupByBackend} from './effect-internals.js';
import {
	invalidateEffectChainSources,
	publishEffectSource,
} from './effect-source-observer.js';
import type {
	EffectImplementation,
	PreferredEffectBackend,
	Backend,
	EffectDefinitionAndStack,
} from './effect-types.js';
import {getGpuDevice} from './gpu-device.js';

export type EffectChainState = {
	preferredEffectBackend: PreferredEffectBackend;
	strictBackend: Backend | null;
	gpuDevice: unknown | null;
	selections: WeakMap<
		object,
		{backend: Backend; implementation: EffectImplementation<unknown, unknown>}
	>;
	readonly width: number;
	readonly height: number;
	pool: CanvasPool;
	setupCache: WeakMap<
		EffectImplementation<unknown, unknown>,
		WeakMap<HTMLCanvasElement, unknown>
	>;
	cleanupRegistry: Array<{
		definition: EffectImplementation<unknown, unknown>;
		state: unknown;
		target: HTMLCanvasElement;
	}>;
	currentRunId: number;
};

export const createEffectChainState = (
	width: number,
	height: number,
): EffectChainState => {
	const state: EffectChainState = {
		width,
		height,
		preferredEffectBackend:
			typeof window === 'undefined'
				? 'auto'
				: (window.remotion_preferredEffectBackend ?? 'auto'),
		gpuDevice: null,
		strictBackend: null,
		selections: new WeakMap(),
		pool: new CanvasPool(width, height, (canvas) => {
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

			for (const entry of dead) {
				entry.definition.cleanup(entry.state);
			}
		}),
		setupCache: new WeakMap(),
		cleanupRegistry: [],
		currentRunId: 0,
	};

	return state;
};

// Cancels in-flight runs, releases per-effect resources and then the pool's
// canvases and contexts. The state must not be used afterwards.
export const cleanupEffectChainState = (state: EffectChainState): void => {
	state.currentRunId++;
	invalidateEffectChainSources(state);
	try {
		for (const entry of state.cleanupRegistry) {
			entry.definition.cleanup(entry.state);
		}
	} finally {
		state.cleanupRegistry.length = 0;
		state.pool.dispose();
	}
};

const ensureSetup = <S>(
	state: EffectChainState,
	def: EffectImplementation<unknown, S>,
	target: HTMLCanvasElement,
): S => {
	const widened = def as EffectImplementation<unknown, unknown>;
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
	{state, source, output, width, height}: RunEffectChainOptions,
	initialFlipSourceY: boolean,
	runId: number,
	{
		resolved,
		gpuDevice,
	}: {resolved: ResolvedEffect[]; gpuDevice: unknown | null},
): Promise<boolean> => {
	const isCancelled = () => state.currentRunId !== runId;

	const runs = groupByBackend(resolved);

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
				const dst = state.pool.getCanvas(run.backend, canvasIndex);
				const def = eff.implementation;
				if (run.backend === 'webgl2') {
					// Checked before `setup()`: a lost context cannot compile shaders,
					// and this surfaces the dedicated error instead of an effect's own.
					state.pool.assertContextNotLost(dst);
				}

				const setupState = ensureSetup(state, def, dst);

				publishEffectSource(eff.original, currentImage, state);
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

type ResolvedEffect = {
	definition: {backend: Backend};
	implementation: EffectImplementation<unknown, unknown>;
	original: EffectDefinitionAndStack<unknown>;
	params: unknown;
};

// Keep ownership of the optional resized source until the existing chain settles.
export const runEffectChain = async (
	options: RunEffectChainOptions,
): Promise<boolean> => {
	const {state, source, width, height, effects} = options;
	// Keep one ID across resizing and effect passes so callers can cancel the run.
	const runId = ++state.currentRunId;
	const order: Backend[] =
		state.strictBackend === null
			? ['webgpu', 'webgl2', '2d']
			: [state.strictBackend];
	if (state.strictBackend === null && state.preferredEffectBackend !== 'auto') {
		order.splice(order.indexOf(state.preferredEffectBackend), 1);
		order.unshift(state.preferredEffectBackend);
	}

	const resolved: ResolvedEffect[] = [];
	let gpuDevice: unknown | null = null;
	for (const effect of effects) {
		if ((effect.params as {disabled: boolean | undefined}).disabled) continue;
		const implementations = effect.definition.implementations ?? {
			[effect.definition.backend]: effect.definition,
		};
		let selected = false;
		const cached =
			state.strictBackend === null
				? state.selections.get(effect.definition)
				: undefined;
		const candidates =
			cached === undefined
				? order
				: [
						cached.backend,
						...order.filter((backend) => backend !== cached.backend),
					];
		for (const backend of candidates) {
			const implementation = implementations[backend];
			if (!implementation) continue;
			if (backend === 'webgpu') {
				if (
					typeof window !== 'undefined' &&
					window.remotion_disableWebGpuEffects
				)
					continue;
				gpuDevice = await getGpuDevice();
				if (state.currentRunId !== runId) return false;
				if (!gpuDevice) continue;
				const {limits} = gpuDevice as {limits: {maxTextureDimension2D: number}};
				if (
					limits &&
					(state.width > limits.maxTextureDimension2D ||
						state.height > limits.maxTextureDimension2D)
				)
					continue;
			}

			// Allocation failure is a capability failure; setup/apply errors are bugs and propagate.
			if (Object.keys(implementations).length > 1) {
				try {
					state.pool.getCanvas(backend, 0);
				} catch {
					continue;
				}
			}

			state.selections.set(effect.definition, {backend, implementation});
			resolved.push({
				definition: {backend},
				implementation,
				original: effect,
				params: effect.params,
			});
			selected = true;
			break;
		}

		if (!selected)
			throw new Error(
				`No supported implementation for effect "${effect.definition.type}" (preferred backend: ${state.preferredEffectBackend})`,
			);
	}

	if (gpuDevice !== state.gpuDevice) {
		for (const entry of state.cleanupRegistry)
			entry.definition.cleanup(entry.state);
		state.cleanupRegistry.length = 0;
		state.setupCache = new WeakMap();
		state.gpuDevice = gpuDevice;
	}

	if (
		(state.width === width && state.height === height) ||
		!effects.some(
			(effect) => !(effect.params as {disabled: boolean | undefined}).disabled,
		)
	) {
		return runEffectChainWithoutResize(options, true, runId, {
			resolved,
			gpuDevice,
		});
	}

	const firstEnabledEffect = resolved[0];
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
			{resolved, gpuDevice},
		);
	} finally {
		resized.close();
	}
};
