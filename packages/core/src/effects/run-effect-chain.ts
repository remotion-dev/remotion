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
import {
	acquireSharedWebGLPool,
	cleanupWithSharedWebGLPool,
	subscribeToSharedWebGLContextLoss,
} from './shared-webgl-pool.js';
import {WebGLContextLostError} from './webgl-context-lost-error.js';
import {WebGL2ContextCreationError} from './webgl2-context-error.js';

export type EffectChainState = {
	preferredEffectBackend: PreferredEffectBackend;
	gpuDevice: unknown | null;
	selections: WeakMap<
		object,
		{backend: Backend; implementation: EffectImplementation<unknown, unknown>}
	>;
	readonly width: number;
	readonly height: number;
	pool: CanvasPool;
	webglPool: CanvasPool | null;
	releaseWebGL: (() => void) | null;
	unsubscribeWebGL: (() => void) | null;
	onWebGLContextLost: (canvas: HTMLCanvasElement) => void;
	webglGeneration: number;
	lastLostWebGLCanvas: HTMLCanvasElement | null;
	requestRedraw: (() => void) | null;
	setupCache: WeakMap<
		EffectImplementation<unknown, unknown>,
		WeakMap<HTMLCanvasElement, unknown>
	>;
	cleanupRegistry: Array<{
		backend: Backend;
		definition: EffectImplementation<unknown, unknown>;
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
		try {
			state.unsubscribeWebGL?.();
			state.unsubscribeWebGL = null;
			state.webglPool = null;
			state.requestRedraw = null;
		} finally {
			state.pool.dispose();
		}
	}
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
		selections: new WeakMap(),
		pool: new CanvasPool(width, height, () => undefined),
		webglPool: null,
		releaseWebGL: null,
		unsubscribeWebGL: null,
		webglGeneration: 0,
		lastLostWebGLCanvas: null,
		requestRedraw: null,
		onWebGLContextLost: (canvas) => {
			// The GL objects these setups hold died with the context and stay
			// invalid on a restored one, so the next run has to recreate them.
			// While the context is lost, GL calls are no-ops, which makes this
			// the moment to run the cleanups without side effects on the
			// context's error state.
			const dead = state.cleanupRegistry.filter(
				(entry) => entry.target === canvas,
			);
			if (
				dead.length === 0 &&
				!(state.releaseWebGL && state.webglPool?.owns(canvas))
			)
				return;
			state.webglGeneration++;
			state.lastLostWebGLCanvas = canvas;
			state.cleanupRegistry = state.cleanupRegistry.filter(
				(entry) => entry.target !== canvas,
			);
			for (const entry of dead) {
				state.setupCache.get(entry.definition)?.delete(canvas);
			}

			try {
				cleanupEntries(dead);
			} finally {
				// Active runs recover from their original source. An idle React
				// preview needs a new capture, including when its timeline is paused.
				if (!state.pendingRun && !state.cleanupRequested)
					state.requestRedraw?.();
			}
		},
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
	if (!state.pendingRun) {
		if (state.webglPool) {
			cleanupWithSharedWebGLPool(() => disposeEffectChainState(state));
		} else {
			disposeEffectChainState(state);
		}
	}
};

const ensureSetup = <S>(
	state: EffectChainState,
	def: EffectImplementation<unknown, S>,
	target: HTMLCanvasElement,
	backend: Backend,
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

	if (backend === 'webgl2') state.webglPool!.prepareWebGL(target, false);
	let setupState: S;
	try {
		setupState = def.setup(target);
	} catch (error) {
		if (backend === 'webgl2') {
			// Allocation/compilation can fail because the GPU was lost during
			// setup. Keep that distinct from a broken shader or effect implementation.
			state.webglPool!.assertContextNotLost(target);
			try {
				state.webglPool!.retireWebGL(target);
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
	state.cleanupRegistry.push({
		backend,
		definition: widened,
		state: setupState,
		target,
	});
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
	const {webglGeneration} = state;
	const assertWebGLValid = () => {
		if (!state.releaseWebGL) return;
		if (
			state.webglGeneration !== webglGeneration &&
			state.lastLostWebGLCanvas
		) {
			throw new WebGLContextLostError(state.lastLostWebGLCanvas);
		}

		state.webglPool!.assertWebGLContextsNotLost();
	};

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
				if (isCancelled()) return false;
				const canvasPool =
					run.backend === 'webgl2' ? state.webglPool! : state.pool;
				const dst = canvasPool.getCanvas(run.backend, canvasIndex);
				const def = eff.implementation;
				const setupState = ensureSetup(state, def, dst, run.backend);
				if (isCancelled()) return false;
				assertWebGLValid();

				publishEffectSource(eff.original, currentImage, state);
				if (isCancelled()) return false;
				if (run.backend === 'webgl2')
					canvasPool.prepareWebGL(dst, flipWebGLSourceY);
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
				if (run.backend === 'webgl2') canvasPool.assertContextNotLost(dst);
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
					// WebGL ignores UNPACK_FLIP_Y_WEBGL for ImageBitmap uploads.
					// Normalize the orientation here rather than relying on the
					// underlying canvas backing store's orientation.
					bridgeBitmap = await createImageBitmap(lastTarget, {
						imageOrientation: nextRun.backend === 'webgl2' ? 'flipY' : 'none',
					});
					if (isCancelled()) {
						return false;
					}

					assertWebGLValid();

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
	assertWebGLValid();
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
const runEffectChainWithResize = async (
	options: RunEffectChainOptions,
	runId: number,
	allowBackendFallback: boolean,
): Promise<boolean> => {
	const {state, source, width, height, effects} = options;
	const order: Backend[] = ['webgpu', 'webgl2', '2d'];
	if (state.preferredEffectBackend !== 'auto') {
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
		const cached = state.selections.get(effect.definition);
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

			if (backend === 'webgl2' && !state.releaseWebGL) {
				state.unsubscribeWebGL ??= subscribeToSharedWebGLContextLoss(
					state.onWebGLContextLost,
				);
				const lease = await acquireSharedWebGLPool(state.width, state.height);
				state.webglPool = lease.pool;
				state.releaseWebGL = lease.release;
				if (state.currentRunId !== runId) return false;
			}

			// Allocation failure is a capability failure; setup/apply errors are bugs and propagate.
			if (Object.keys(implementations).length > 1) {
				try {
					(backend === 'webgl2' ? state.webglPool! : state.pool).getCanvas(
						backend,
						0,
					);
				} catch (error) {
					if (!allowBackendFallback) throw error;
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

	const deviceChanged = gpuDevice !== state.gpuDevice;
	const activeImplementations = new Set(
		resolved.map((effect) => effect.implementation),
	);
	const entries = state.cleanupRegistry.filter(
		(entry) => deviceChanged || !activeImplementations.has(entry.definition),
	);
	if (entries.length > 0) {
		state.cleanupRegistry = state.cleanupRegistry.filter(
			(entry) => !deviceChanged && activeImplementations.has(entry.definition),
		);
		for (const entry of entries) {
			state.setupCache.get(entry.definition)?.delete(entry.target);
		}

		if (state.webglPool && !state.releaseWebGL) {
			// Local WebGPU cleanup must finish before its canvas is configured by
			// the replacement implementation. Only WebGL shares another chain's lease.
			try {
				cleanupEntries(entries.filter((entry) => entry.backend !== 'webgl2'));
			} finally {
				const webglEntries = entries.filter(
					(entry) => entry.backend === 'webgl2',
				);
				if (webglEntries.length > 0) {
					cleanupWithSharedWebGLPool(() => cleanupEntries(webglEntries));
				}
			}
		} else {
			cleanupEntries(entries);
		}
	}

	state.gpuDevice = gpuDevice;

	if (state.currentRunId !== runId) return false;

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
		for (let attempt = 0; ; attempt++) {
			try {
				return await runEffectChainWithResize(options, runId, attempt === 0);
			} catch (error) {
				if (state.currentRunId !== runId) return false;
				let failure = error;
				if (state.releaseWebGL) {
					try {
						// GPU loss can make a shader compile, upload, or asynchronous
						// bitmap bridge fail before the browser delivers its lost event.
						state.webglPool!.assertWebGLContextsNotLost();
					} catch (contextError) {
						failure = contextError;
					}
				}

				if (
					!(failure instanceof WebGLContextLostError) &&
					!(attempt > 0 && failure instanceof WebGL2ContextCreationError)
				)
					throw failure;
				if (attempt === 2) {
					if (failure instanceof WebGLContextLostError) {
						// Retire before ending the run so its delayed lost event cannot
						// schedule another automatic redraw and restart the retry budget.
						state.webglPool!.retireWebGL(failure.canvas);
					}

					throw new Error(
						'WebGL context was lost repeatedly while rendering effects. ' +
							'Recovery failed after two retries. Try reducing rendering concurrency or GPU memory usage.',
						{cause: failure},
					);
				}

				if (failure instanceof WebGLContextLostError) {
					state.webglPool!.retireWebGL(failure.canvas);
				}

				// Yield so the browser can finish releasing the old GPU context.
				// The next attempt acquires fresh canvases and reruns the whole chain.
				await new Promise<void>((resolve) => setTimeout(resolve, attempt * 50));
				if (state.currentRunId !== runId) return false;
			}
		}
	} finally {
		try {
			if (state.pendingRun === completion) {
				state.pendingRun = null;
				if (state.cleanupRequested) disposeEffectChainState(state);
			}
		} finally {
			try {
				const {releaseWebGL} = state;
				state.releaseWebGL = null;
				releaseWebGL?.();
			} finally {
				release();
			}
		}
	}
};
