import {expect, test} from 'bun:test';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import * as zodTypes from '@remotion/zod-types';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import {z} from 'zod';
import {
	inferZodSchemaFromValue,
	resolveCompositionSchema,
} from '../components/RenderModal/SchemaEditor/infer-zod-schema-from-value';
import {
	getArrayElement,
	getObjectShape,
	getZodSchemaDescription,
	getZodSchemaType,
} from '../components/RenderModal/SchemaEditor/zod-schema-type';

test('infers primitive and nested object schemas', () => {
	const schema = inferZodSchemaFromValue({
		value: {
			title: 'Hello',
			count: 2,
			enabled: true,
			nested: {type: 'current', label: 'Nested'},
			nullable: null,
			missing: undefined,
			date: new Date('2026-08-22T00:00:00.000Z'),
		},
		z,
		zodTypes,
		path: [],
	});

	const shape = getObjectShape(schema);
	expect(getZodSchemaType(shape.title)).toBe('string');
	expect(getZodSchemaType(shape.count)).toBe('number');
	expect(getZodSchemaType(shape.enabled)).toBe('boolean');
	expect(getZodSchemaType(shape.nested)).toBe('object');
	expect(getZodSchemaType(getObjectShape(shape.nested).type)).toBe('literal');
	expect(getZodSchemaType(getObjectShape(shape.nested).label)).toBe('string');
	expect(getZodSchemaType(shape.nullable)).toBe('null');
	expect(getZodSchemaType(shape.missing)).toBe('undefined');
	expect(getZodSchemaType(shape.date)).toBe('date');
});

test('infers colors without interpreting ambiguous text as a color', () => {
	const schema = inferZodSchemaFromValue({
		value: {
			title: 'red',
			accent: '#3124',
			titleColor: 'red',
			invalidColor: 'not-a-color',
		},
		z,
		zodTypes,
		path: [],
	});
	const shape = getObjectShape(schema);

	expect(getZodSchemaDescription(shape.title)).toBeUndefined();
	expect(getZodSchemaDescription(shape.accent)).toBe(
		zodTypes.ZodZypesInternals.REMOTION_COLOR_BRAND,
	);
	expect(getZodSchemaDescription(shape.titleColor)).toBe(
		zodTypes.ZodZypesInternals.REMOTION_COLOR_BRAND,
	);
	expect(getZodSchemaDescription(shape.invalidColor)).toBeUndefined();
});

test('infers homogeneous arrays and leaves ambiguous arrays uneditable', () => {
	const schema = inferZodSchemaFromValue({
		value: {
			numbers: [1, 2, 3],
			mixed: [1, '2'],
			empty: [],
		},
		z,
		zodTypes,
		path: [],
	});
	const shape = getObjectShape(schema);

	expect(getZodSchemaType(shape.numbers)).toBe('array');
	expect(getZodSchemaType(getArrayElement(shape.numbers))).toBe('number');
	expect(getZodSchemaType(shape.mixed)).toBe('any');
	expect(getZodSchemaType(shape.empty)).toBe('any');
});

test('prefers an explicit schema and skips empty default props', () => {
	const explicitSchema = z.object({title: z.literal('Hello')});
	expect(
		resolveCompositionSchema({
			explicitSchema,
			defaultProps: {title: 'Hello'},
			z,
			zodTypes,
		}),
	).toBe(explicitSchema);
	expect(
		resolveCompositionSchema({
			explicitSchema: null,
			defaultProps: {},
			z,
			zodTypes,
		}),
	).toBe('no-schema');
});
