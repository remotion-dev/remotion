import type {
	Backend,
	EffectDefinitionAndStack,
	EffectDescriptor,
	EffectsProp,
} from './effect-types.js';

// Internal helpers for the chain runtime. Exported separately so they can be
// unit-tested without spinning up the React lifecycle / canvas mocking.

export const flattenEffects = (
	effects: EffectsProp,
): EffectDescriptor<unknown>[] => {
	const out: EffectDescriptor<unknown>[] = [];
	for (let sourceIndex = 0; sourceIndex < effects.length; sourceIndex++) {
		const item = effects[sourceIndex];
		if (Array.isArray(item)) {
			for (const inner of item) {
				out.push({...inner, sourceIndex});
			}
		} else {
			const descriptor = item as EffectDescriptor<unknown>;
			out.push({...descriptor, sourceIndex});
		}
	}

	return out;
};

export type Run = {
	readonly backend: Backend;
	readonly effects: EffectDefinitionAndStack<unknown>[];
};

export const groupByBackend = (
	effects: EffectDefinitionAndStack<unknown>[],
): Run[] => {
	const runs: Run[] = [];
	let current: EffectDefinitionAndStack<unknown>[] = [];
	let currentBackend: Backend | null = null;
	for (const eff of effects) {
		const {backend} = eff.definition;
		if (currentBackend === null || backend === currentBackend) {
			current.push(eff);
			currentBackend = backend;
		} else {
			runs.push({backend: currentBackend, effects: current});
			current = [eff];
			currentBackend = backend;
		}
	}

	if (currentBackend !== null && current.length > 0) {
		runs.push({backend: currentBackend, effects: current});
	}

	return runs;
};
