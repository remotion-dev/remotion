import {expect, test} from 'bun:test';
import {
	Internals,
	type EffectDefinition,
	type SequencePropsSubscriptionKey,
} from 'remotion';
import {
	SCHEMA_FIELD_ROW_HEIGHT,
	getEffectFieldsToShow,
	getFieldsToShow,
} from '../schema-field-info';

const effect = {
	type: 'dev.remotion.test.effect',
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
	videoConfigValues: null,
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

test('getFieldsToShow sorts fields by inspector group order', () => {
	const fields = getFieldsToShow({
		schema: {
			'style.translate': {
				type: 'translate',
				default: '0px 0px',
			},
			playbackRate: {
				type: 'number',
				default: 1,
				hiddenFromList: false,
			},
			'style.fontSize': {
				type: 'number',
				default: undefined,
				hiddenFromList: false,
			},
			'style.color': {
				type: 'color',
				default: undefined,
			},
			'style.fontFamily': {
				type: 'font-family',
				default: undefined,
				keyframable: false,
			},
			'style.rotate': {
				type: 'rotation-css',
				default: '0deg',
			},
			'style.opacity': {
				type: 'number',
				default: 1,
				hiddenFromList: false,
			},
			volume: {
				type: 'number',
				default: 1,
				hiddenFromList: false,
			},
			'style.letterSpacing': {
				type: 'number',
				default: undefined,
				hiddenFromList: false,
			},
			'style.textAlign': {
				type: 'enum',
				default: 'left',
				variants: {
					left: {},
					center: {},
				},
			},
		},
		currentRuntimeValueDotNotation: {},
		getDragOverrides: () => ({}),
		propStatuses: {},
		nodePath,
	});

	expect(fields?.map((field) => field.key)).toEqual([
		'playbackRate',
		'volume',
		'style.translate',
		'style.rotate',
		'style.opacity',
		'style.fontSize',
		'style.color',
		'style.fontFamily',
		'style.letterSpacing',
		'style.textAlign',
	]);
	expect(fields?.map((field) => field.group)).toEqual([
		'controls',
		'controls',
		'transforms',
		'transforms',
		'transforms',
		'text',
		'text',
		'text',
		'text',
		'text',
	]);
});

test('getFieldsToShow does not reserve extra height for text content fields', () => {
	const fields = getFieldsToShow({
		schema: {
			children: {
				type: 'text-content',
				default: '',
			},
		},
		currentRuntimeValueDotNotation: {},
		getDragOverrides: () => ({}),
		propStatuses: {},
		nodePath,
		includeTextContent: true,
	});

	expect(fields?.[0].rowHeight).toBe(SCHEMA_FIELD_ROW_HEIGHT);
});

test('getEffectFieldsToShow sorts fields by inspector group order', () => {
	const fields = getEffectFieldsToShow({
		effect: {
			...effect,
			schema: {
				'style.scale': {
					type: 'scale',
					default: 1,
				},
				intensity: {
					type: 'number',
					default: 1,
					hiddenFromList: false,
				},
				'style.fontWeight': {
					type: 'enum',
					default: '400',
					variants: {
						'400': {},
						'700': {},
					},
				},
				'style.translate': {
					type: 'translate',
					default: '0px 0px',
				},
			},
		},
		effectIndex: 0,
		nodePath: null,
		propStatuses: {},
		getEffectDragOverrides: () => ({}),
	});

	expect(fields.map((field) => field.key)).toEqual([
		'intensity',
		'style.scale',
		'style.translate',
		'style.fontWeight',
	]);
});
