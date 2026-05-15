import type {EffectDefinition, EffectDescriptor} from './effect-types.js';

// `disabled` is injected by the framework into every effect factory's
// parameter type. When truthy, `runEffectChain` bypasses the effect entirely
// (see `run-effect-chain.ts`). Effect authors do not declare it themselves —
// `createEffect` adds it here so every current and future effect inherits it.
export type WithDisabled<P> = P & {readonly disabled?: boolean};

type EffectFactory<P> = {} extends P
	? (params?: WithDisabled<P>) => EffectDescriptor<unknown>
	: (params: WithDisabled<P>) => EffectDescriptor<unknown>;

// Defines an effect and returns a factory that produces per-frame descriptors.
// The returned function is the public API effect authors expose to users:
//
//   export const blur = createEffect<BlurParams, BlurState>({ ... });
//   // usage: blur({ radius: 4, disabled: false })
//
// The descriptor erases `P` and `S` to `unknown` so descriptors of different
// effects can be freely composed inside `EffectsProp` arrays. Without that
// erasure the descriptor would be contravariant in `P` (via `apply`'s
// argument) and concrete descriptors could not flow into `unknown` slots.
export const createEffect = <P, S>(
	definition: EffectDefinition<P, S>,
): EffectFactory<P> => {
	// Wrap `calculateKey` to fold the framework-level `disabled` flag into the
	// memoization key. Without this, toggling `disabled` via code/drag overrides
	// would not invalidate the cached `EffectDefinitionAndStack`.
	const userCalculateKey = definition.calculateKey;
	const widened: EffectDefinition<unknown, unknown> = {
		...(definition as unknown as EffectDefinition<unknown, unknown>),
		calculateKey: (params: unknown) => {
			const disabled = (params as {disabled?: boolean})?.disabled ?? false;
			return `${userCalculateKey(params as P)}-disabled-${disabled}`;
		},
	};
	const factory = (
		params: WithDisabled<P> = {} as WithDisabled<P>,
	): EffectDescriptor<unknown> => ({
		definition: widened,
		params,
		effectKey: widened.calculateKey(params),
		memoized: false,
	});
	return factory as EffectFactory<P>;
};
