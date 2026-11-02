export {createEffect, createEffectImplementation} from './create-effect.js';

// Types needed outside core for `effects` / `@remotion/effects` typing.
export type {
	Backend,
	PreferredEffectBackend,
	EffectImplementation,
	MultiBackendEffectDefinition,
	EffectApplyParams,
	EffectDefinitionAndStack,
	EffectDescriptor,
	EffectsProp,
	EffectsOutputSize,
	EffectDefinition,
	EffectFactory,
} from './effect-types.js';
