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

import type {SequenceSchema} from '../sequence-field-schema.js';

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
	readonly frame: number;
	readonly width: number;
	readonly height: number;
	readonly gpuDevice: AnyGpuDevice | null;
};

export type EffectDefinition<P, S = unknown> = {
	readonly type: string;
	readonly label: string;
	/**
	 * Public source identifier of the factory function the user calls in their
	 * code (e.g. `'tint'` for `tint({...})`). Used by the studio to verify
	 * that an effect at array index `i` in `_experimentalEffects` still
	 * matches the runtime effect when saving prop edits back to source.
	 */
	readonly factoryName: string;
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
	readonly schema: SequenceSchema | null;
};

type BaseEffectDescriptor<P = unknown> = {
	readonly definition: EffectDefinition<P, unknown>;
	readonly stack: string;
	readonly effectKey: string;
	readonly params: P;
	/**
	 * Index of this descriptor in the user's `_experimentalEffects` source array
	 * (pre-flatten). Compound factories like `blur()` produce multiple
	 * descriptors that share the same `sourceIndex`. `-1` means the descriptor
	 * has not yet been placed in an effects array (e.g. fresh from `createEffect`).
	 */
	readonly sourceIndex: number;
};

export type EffectDescriptor<P = unknown> = BaseEffectDescriptor<P> & {
	readonly memoized: false;
};

export type EffectDefinitionAndStack<P = unknown> = BaseEffectDescriptor<P> & {
	// just to distinguish and make it typesafe
	readonly memoized: true;
};

// Prop type for `effects`: callers may interleave single descriptors
// with arrays of descriptors. The runtime calls `.flat()` once before
// processing, which lets a single factory call (e.g. `blur(...)`) expand into
// multiple passes (e.g. horizontal + vertical) without leaking that detail to
// the call site.
export type EffectsProp = ReadonlyArray<
	EffectDescriptor<unknown> | ReadonlyArray<EffectDescriptor<unknown>>
>;
