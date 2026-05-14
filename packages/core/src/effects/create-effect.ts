import type {EffectDefinition, EffectDescriptor} from './effect-types.js';

type EffectFactory<P> = {} extends P
	? (params?: P) => EffectDescriptor<unknown>
	: (params: P) => EffectDescriptor<unknown>;

// Defines an effect and returns a factory that produces per-frame descriptors.
// The returned function is the public API effect authors expose to users:
//
//   export const blur = createEffect<BlurParams, BlurState>({ ... });
//   // usage: blur({ radius: 4 })
//
// The descriptor erases `P` and `S` to `unknown` so descriptors of different
// effects can be freely composed inside `EffectsProp` arrays. Without that
// erasure the descriptor would be contravariant in `P` (via `apply`'s
// argument) and concrete descriptors could not flow into `unknown` slots.
export const createEffect = <P, S>(
	definition: EffectDefinition<P, S>,
): EffectFactory<P> => {
	const widened = definition as unknown as EffectDefinition<unknown, unknown>;
	const factory = (params: P = {} as P): EffectDescriptor<unknown> => ({
		definition: widened,
		params,
		stack: new Error().stack!,
		effectKey: widened.calculateKey(params),
		sourceIndex: -1,
		memoized: false,
	});
	return factory as EffectFactory<P>;
};
