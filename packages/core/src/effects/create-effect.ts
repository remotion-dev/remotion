import type {InteractivitySchemaField} from '../interactivity-schema.js';
import type {
	EffectDefinition,
	EffectDescriptor,
	EffectFactory,
} from './effect-types.js';

// Framework-level field that every effect inherits. Mirrors `hidden` for
// sequences: rendered as the eye toggle on the timeline effect row and saved
// to source via `/api/save-effect-props`. `getEffectFieldsToShow` filters it
// out of the regular field list so the toggle is the only control.
export const disabledEffectField: InteractivitySchemaField = {
	type: 'boolean',
	default: false,
	description: 'Disabled',
};

// Defines an effect and returns a factory that produces effect descriptors.
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
	const {calculateKey: userCalculateKey, validateParams} = definition;
	const widened: EffectDefinition<unknown, unknown> = {
		...(definition as unknown as EffectDefinition<unknown, unknown>),
		documentationLink: definition.documentationLink ?? null,
		calculateKey: (params: unknown) => {
			const disabled = (params as {disabled?: boolean}).disabled ?? false;
			return `${userCalculateKey(params as P)}-disabled-${disabled}`;
		},
		schema: {
			disabled: disabledEffectField,
			...definition.schema,
		},
	};
	const factory = (
		params: P & {readonly disabled?: boolean} = {} as P & {
			readonly disabled?: boolean;
		},
	): EffectDescriptor<unknown> => {
		validateParams(params as P);
		return {
			definition: widened,
			params,
			effectKey: widened.calculateKey(params),
			memoized: false,
		};
	};

	return factory;
};
