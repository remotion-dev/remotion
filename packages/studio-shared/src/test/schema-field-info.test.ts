import {expect, test} from 'bun:test';
import {
	Internals,
	type EffectDefinition,
	type SequencePropsSubscriptionKey,
} from 'remotion';
import {
	SCHEMA_FIELD_ROW_HEIGHT,
	getEffectFieldsToShow,
} from '../schema-field-info';

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
						default: 'red',
					},
				},
				source: {},
			},
		},
		position: {
			type: 'uv-coordinate',
			default: [0, 0.5] as const,
			description: 'Position',
		},
		colors: {
			type: 'array',
			item: {
				type: 'color',
			},
			default: undefined,
			minLength: 2,
			newItemDefault: '#ff0000',
			description: 'Colors',
			keyframable: false,
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
		propStatuses: {
			[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
				canUpdate: true,
				props: {},
				effects: [
					{
						canUpdate: true,
						callee: 'halftone',
						importPath: null,
						effectIndex: 0,
						props: {
							colorMode: {
								status: 'static',
								codeValue: 'source',
							},
						},
					},
				],
			},
		},
		getEffectDragOverrides: () => ({}),
	});

	expect(fields.map((field) => field.key)).toEqual([
		'colorMode',
		'position',
		'colors',
	]);
});

test('getEffectFieldsToShow uses default enum variant if no code value exists', () => {
	const fields = getEffectFieldsToShow({
		effect,
		effectIndex: 0,
		nodePath: null,
		propStatuses: {},
		getEffectDragOverrides: () => ({}),
	});

	expect(fields.map((field) => field.key)).toEqual([
		'colorMode',
		'dotColor',
		'position',
		'colors',
	]);
});

test('getEffectFieldsToShow returns array fields', () => {
	const fields = getEffectFieldsToShow({
		effect,
		effectIndex: 0,
		nodePath: null,
		propStatuses: {},
		getEffectDragOverrides: () => ({}),
	});

	const colors = fields.find((field) => field.key === 'colors');
	expect(colors?.typeName).toBe('array');
	expect(colors?.rowHeight).toBe(SCHEMA_FIELD_ROW_HEIGHT * 3);
});

test('getEffectFieldsToShow sizes array fields from the current value', () => {
	const fields = getEffectFieldsToShow({
		effect,
		effectIndex: 0,
		nodePath,
		propStatuses: {
			[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
				canUpdate: true,
				props: {},
				effects: [
					{
						canUpdate: true,
						callee: 'starburst',
						importPath: null,
						effectIndex: 0,
						props: {
							colors: {
								status: 'static',
								codeValue: ['red', 'green', 'blue'],
							},
						},
					},
				],
			},
		},
		getEffectDragOverrides: () => ({}),
	});

	const colors = fields.find((field) => field.key === 'colors');
	expect(colors?.rowHeight).toBe(SCHEMA_FIELD_ROW_HEIGHT * 4);
});
