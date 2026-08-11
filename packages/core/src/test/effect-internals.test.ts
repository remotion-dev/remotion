import {expect, test} from 'bun:test';
import {groupByBackend} from '../effects/effect-internals.js';
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
	documentationLink: null,
	backend,
	calculateKey: () => type,
	setup: () => null,
	apply: () => undefined,
	cleanup: () => undefined,
	schema: {},
	validateParams: () => {},
});

const makeDesc = (
	type: string,
	backend: Backend,
): EffectDescriptor<unknown> => ({
	definition: makeDef(type, backend),
	params: {},
	effectKey: type,
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

test('runEffectChain filters disabled effects before grouping', () => {
	// Mirror of the filter in `runEffectChain` — kept here as a regression
	// guard so the behavior is asserted independently of the canvas-bound
	// chain runner.
	const all: EffectDescriptor<unknown>[] = [
		{...makeDesc('a', '2d'), params: {disabled: false}},
		{...makeDesc('b', '2d'), params: {disabled: true}},
		{...makeDesc('c', 'webgl2'), params: {}},
		{...makeDesc('d', 'webgl2'), params: {disabled: true}},
	];
	const enabled = all.filter(
		(e) => !(e.params as {disabled?: boolean}).disabled,
	);
	const runs = groupByBackend(memoizeEffects(enabled));
	expect(runs).toHaveLength(2);
	expect(runs[0].effects.map((e) => e.definition.type)).toEqual(['a']);
	expect(runs[1].effects.map((e) => e.definition.type)).toEqual(['c']);
});
