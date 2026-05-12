import type {EffectDefinition, EffectDescriptor} from './effect-types.js';

// Identity helper for declaring an effect definition with proper type
// inference. Wrapping the literal in `defineEffect(...)` lets TypeScript infer
// `<P, S>` from the `setup` and `apply` signatures while still enforcing the
// shape of the definition.
export const defineEffect = <P, S>(
	definition: EffectDefinition<P, S>,
): EffectDefinition<P, S> => definition;

// Factory helper for constructing per-frame descriptors from a definition.
// Effect authors typically expose a small wrapper (e.g.
// `export const blur = (params) => createDescriptor(blurDef, params)`) so users
// don't reach into the internal definition object.
//
// `params` is type-checked against `P` at the call site, but the returned
// descriptor erases both `P` and `S` to `unknown` so it can be freely
// composed in `EffectsProp` arrays alongside descriptors of other effects.
// Without this erasure the descriptor would be contravariant in `P` (via
// `apply`'s argument), which would prevent assigning a concrete
// `EffectDescriptor<MyParams>` into an `EffectDescriptor<unknown>` slot.
export const createDescriptor = <P, S>(
	definition: EffectDefinition<P, S>,
	params: P,
): EffectDescriptor<unknown> => {
	return {
		definition: definition as unknown as EffectDefinition<unknown, unknown>,
		params,
		stack: new Error().stack!,
	};
};
