// Internal types for the effects system (exported via `remotion` → `./internals.js`).
//
// An effect is a description of how to transform an input image into an output
// image, executed inside a per-frame chain runtime owned by a source component
// (`<Solid>`, `<HtmlInCanvas>`, ...). Chains own 2D/WebGPU scratch canvases and
// borrow shared WebGL canvases exclusively through the final output copy.
// Effects reuse their resources, even when another chain resizes the target.
//
// Cross-backend contract: all canvases store premultiplied alpha and are
// sRGB-encoded. Effects that perform color math in linear space are responsible
// for converting to/from sRGB themselves.
//
// WebGL setup/apply enter with the default framebuffer and viewport, disabled
// raster tests/blending, full write masks, dithering enabled, no sampler objects
// or pixel buffers, and default pixel-store layout. Source uploads default to
// premultiplied alpha; apply starts with the supplied flipSourceY. See
// reset-webgl-state.ts for the complete baseline. Effects bind their own program,
// VAO, textures and uniforms, and explicitly set flags for auxiliary uploads.
// Only owned resources may be mutated/deleted. Do not leave active queries or
// transform feedback across callbacks. Every callback consumes its inputs
// synchronously; the runtime owns canvases through bridges and final copying.
// Setup state is cached by definition and target, not by effect instance. It
// must tolerate current dimensions/parameters on every apply. Failed WebGL
// setups retire the target; successful states receive cleanup before disposal.

import type {InteractivitySchema} from '../interactivity-schema.js';

export type Backend = '2d' | 'webgl2' | 'webgpu';
export type PreferredEffectBackend = Backend | 'auto';

export type EffectImplementation<P, S> = {
	readonly setup: (target: HTMLCanvasElement) => S;
	readonly apply: (params: EffectApplyParams<P, S>) => void;
	readonly cleanup: (state: S) => void;
};

export type MultiBackendEffectDefinition<P> = Omit<
	EffectDefinition<P>,
	'backend' | 'setup' | 'apply' | 'cleanup' | 'implementations'
> & {
	readonly implementations: Partial<
		Record<Backend, EffectImplementation<P, unknown>>
	>;
};

// `GPUDevice` is left as `unknown` to avoid pulling `@webgpu/types` into core.
// Effects that target the `webgpu` backend should narrow this themselves
// (e.g. via a local type assertion or by depending on `@webgpu/types`).
type AnyGpuDevice = unknown;

export type EffectApplyParams<P, S> = {
	readonly source: CanvasImageSource;
	readonly target: HTMLCanvasElement;
	readonly state: S;
	readonly params: P;
	readonly width: number;
	readonly height: number;
	readonly gpuDevice: AnyGpuDevice | null;
	/**
	 * When `true`, WebGL `texImage2D` uploads use `UNPACK_FLIP_Y_WEBGL` so DOM-style
	 * canvas sources match clip-space UVs. Set by `runEffectChain` — `false` for
	 * `ImageBitmap` bridges from WebGL, which are already oriented for upload.
	 */
	readonly flipSourceY: boolean;
};

export type EffectDefinition<P, S = unknown> = {
	readonly type: string;
	readonly label: string;
	readonly documentationLink: string | null;
	readonly backend: Backend;
	readonly implementations?: Partial<
		Record<Backend, EffectImplementation<P, unknown>>
	>;
	/**
	 * Stable string for comparing effect instances: two descriptors with the same
	 * `definition` and the same `calculateKey(params)` are treated as equivalent
	 * for memoization (e.g. timeline registration) even when `params` is a new object
	 * reference each render.
	 */
	readonly calculateKey: (params: P) => string;
	readonly setup: (target: HTMLCanvasElement) => S;
	readonly apply: (params: EffectApplyParams<P, S>) => void;
	readonly cleanup: (state: S) => void;
	readonly schema: InteractivitySchema;
	/** Throws when mandatory params are missing or invalid. Called by `createEffect` before returning a descriptor. */
	readonly validateParams: (params: P) => void;
};

type BaseEffectDescriptor<P = unknown> = {
	readonly definition: EffectDefinition<P, unknown>;
	readonly effectKey: string;
	readonly params: P;
};

export type EffectDescriptor<P = unknown> = BaseEffectDescriptor<P> & {
	readonly memoized: false;
};

export type EffectDefinitionAndStack<P = unknown> = BaseEffectDescriptor<P> & {
	// just to distinguish and make it typesafe
	readonly memoized: true;
};

export type EffectsProp = ReadonlyArray<EffectDescriptor<unknown>>;

// `disabled` is injected by the framework into every effect factory's
// parameter type. When truthy, `runEffectChain` bypasses the effect entirely.
// Defined here (rather than in `create-effect.ts`) so that the inferred type
// of factory exports in downstream packages is reachable through a path that
// is also referenced via `EffectDefinition` etc., avoiding TS2742 in `tsgo`.
//
// The `{} extends P` conditional preserves required-param enforcement: when
// the user's `P` has required fields (e.g. `TintParams.color`), the factory
// signature requires a params argument; when every field is optional, the
// argument is optional too.
export type EffectFactory<P> = {} extends P
	? (params?: P & {readonly disabled?: boolean}) => EffectDescriptor<unknown>
	: (params: P & {readonly disabled?: boolean}) => EffectDescriptor<unknown>;

export type EffectsOutputSize = {
	readonly width: number;
	readonly height: number;
};
