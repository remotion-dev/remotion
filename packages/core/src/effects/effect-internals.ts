import type {Backend, EffectDefinitionAndStack} from './effect-types.js';

// Internal helpers for the chain runtime. Exported separately so they can be
// unit-tested without spinning up the React lifecycle / canvas mocking.

export type Run<T = EffectDefinitionAndStack<unknown>> = {
	readonly backend: Backend;
	readonly effects: T[];
};

export const groupByBackend = <T extends {definition: {backend: Backend}}>(
	effects: T[],
): Run<T>[] => {
	const runs: Run<T>[] = [];
	let current: T[] = [];
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
