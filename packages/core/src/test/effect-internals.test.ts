import {expect, test} from 'bun:test';
import {flattenEffects, groupByBackend} from '../effects/effect-internals.js';
import type {
	Backend,
	EffectDefinition,
	EffectDefinitionAndStack,
	EffectDescriptor,
} from '../effects/effect-types.js';

const makeDef = (
	type: string,
	backend: Backend,
): EffectDefinition<unknown, unknown> => ({
	type,
	label: type,
	backend,
	calculateKey: () => type,
	setup: () => null,
	apply: () => undefined,
	cleanup: () => undefined,
	schema: null,
});

const makeDesc = (
	type: string,
	backend: Backend,
): EffectDescriptor<unknown> => ({
	definition: makeDef(type, backend),
	params: {},
	stack: new Error().stack!,
	effectKey: type,
	sourceIndex: -1,
	memoized: false,
});

const memoizeEffects = (
	effects: EffectDescriptor<unknown>[],
): EffectDefinitionAndStack<unknown>[] => {
	return effects.map((e) => ({
		...e,
		memoized: true,
	}));
};

test('flattenEffects assigns sourceIndex from array order', () => {
	const a = makeDesc('a', '2d');
	const b = makeDesc('b', '2d');
	const c = makeDesc('c', 'webgl2');

	const result = memoizeEffects(flattenEffects([a, b, c]));
	expect(result.map((d) => d.definition.type)).toEqual(['a', 'b', 'c']);
	expect(result.map((d) => d.sourceIndex)).toEqual([0, 1, 2]);
});

test('flattenEffects handles empty input', () => {
	expect(flattenEffects([])).toEqual([]);
});

test('groupByBackend collapses adjacent same-backend effects', () => {
	const effects = [
		makeDesc('a', '2d'),
		makeDesc('b', '2d'),
		makeDesc('c', 'webgl2'),
		makeDesc('d', 'webgl2'),
		makeDesc('e', '2d'),
	];

	const runs = groupByBackend(memoizeEffects(effects));
	expect(runs).toHaveLength(3);
	expect(runs[0].backend).toBe('2d');
	expect(runs[0].effects.map((e) => e.definition.type)).toEqual(['a', 'b']);
	expect(runs[1].backend).toBe('webgl2');
	expect(runs[1].effects.map((e) => e.definition.type)).toEqual(['c', 'd']);
	expect(runs[2].backend).toBe('2d');
	expect(runs[2].effects.map((e) => e.definition.type)).toEqual(['e']);
});

test('groupByBackend returns single run for uniform backend', () => {
	const effects = [
		makeDesc('a', '2d'),
		makeDesc('b', '2d'),
		makeDesc('c', '2d'),
	];

	const runs = groupByBackend(memoizeEffects(effects));
	expect(runs).toHaveLength(1);
	expect(runs[0].backend).toBe('2d');
	expect(runs[0].effects).toHaveLength(3);
});

test('groupByBackend returns empty for empty input', () => {
	expect(groupByBackend([])).toEqual([]);
});

test('groupByBackend returns one run per backend transition', () => {
	const effects = [
		makeDesc('a', '2d'),
		makeDesc('b', 'webgl2'),
		makeDesc('c', '2d'),
		makeDesc('d', 'webgl2'),
	];

	const runs = groupByBackend(memoizeEffects(effects));
	expect(runs).toHaveLength(4);
	expect(runs.map((r) => r.backend)).toEqual(['2d', 'webgl2', '2d', 'webgl2']);
});
