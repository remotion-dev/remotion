// Internal types for the effects system (exported via `remotion` → `./internals.js`).
//
// An effect is a description of how to transform an input image into an output
// image, executed inside a per-frame chain runtime owned by a source component
// (`<Solid>`, `<HtmlInCanvas>`, ...). The chain runtime owns scratch canvases
// and ping-pongs between them, so effects do not allocate per frame.
//
// Cross-backend contract: all canvases store premultiplied alpha and are
// sRGB-encoded. Effects that perform color math in linear space are responsible
// for converting to/from sRGB themselves.

import type {InteractivitySchema} from '../interactivity-schema.js';

export type Backend = '2d' | 'webgl2' | 'webgpu';

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
