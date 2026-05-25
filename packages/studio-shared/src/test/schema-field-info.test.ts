import {expect, test} from 'bun:test';
import {
	Internals,
	type EffectDefinition,
	type SequencePropsSubscriptionKey,
} from 'remotion';
import {getEffectFieldsToShow} from '../schema-field-info';

const effect = {
	type: 'test/effect',
	label: 'Test effect',
	documentationLink: null,
	backend: '2d',
	calculateKey: () => 'test',
	setup: () => null,
	apply: () => undefined,
	cleanup: () => undefined,
	validateParams: () => undefined,
	schema: {
		colorMode: {
			type: 'enum',
			default: 'solid' as const,
			variants: {
				solid: {
					dotColor: {
						type: 'color',
						default: 'black',
					},
				},
				source: {},
			},
		},
	},
} satisfies EffectDefinition<unknown>;

const nodePath: SequencePropsSubscriptionKey = {
	absolutePath: 'Comp',
	nodePath: [],
	sequenceKeys: [],
	effectKeys: [],
};

test('getEffectFieldsToShow uses the active enum variant', () => {
	const fields = getEffectFieldsToShow({
		effect,
		effectIndex: 0,
		nodePath,
		codeValues: {
			[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
				canUpdate: true,
				props: {},
				effects: [
					{
						canUpdate: true,
						callee: 'halftone',
						effectIndex: 0,
						props: {
							colorMode: {canUpdate: true, codeValue: 'source'},
						},
					},
				],
			},
		},
		getEffectDragOverrides: () => ({}),
	});

	expect(fields.map((field) => field.key)).toEqual(['colorMode']);
});

test('getEffectFieldsToShow uses default enum variant if no code value exists', () => {
	const fields = getEffectFieldsToShow({
		effect,
		effectIndex: 0,
		nodePath: null,
		codeValues: {},
		getEffectDragOverrides: () => ({}),
	});

	expect(fields.map((field) => field.key)).toEqual(['colorMode', 'dotColor']);
});
