import {expect, test} from 'bun:test';
import {getFlatSchemaWithAllKeys} from '../flatten-schema.js';
import {
	extendSchemaWithSequenceName,
	sequencePremountSchema,
	sequenceSchema,
	sequenceSchemaWithoutFrom,
	sequenceStyleSchema,
	sequenceVisualStyleSchema,
} from '../sequence-field-schema.js';
import {
	getNestedValue,
	mergeValues,
	readValuesFromProps,
	selectActiveKeys,
} from '../wrap-in-schema.js';

test('sequenceStyleSchema is the union of visual style and premount fields', () => {
	expect(Object.keys(sequenceStyleSchema).sort()).toEqual(
		[
			...Object.keys(sequenceVisualStyleSchema),
			...Object.keys(sequencePremountSchema),
		].sort(),
	);
});

test('getFlatSchema(sequenceSchema) exposes every variant key', () => {
	const flat = getFlatSchemaWithAllKeys(sequenceSchema);
	expect(Object.keys(flat).sort()).toEqual(
		[
			'hidden',
			'name',
			'showInTimeline',
			'layout',
			'style.translate',
			'style.scale',
			'style.rotate',
			'style.transformOrigin',
			'style.opacity',
			'premountFor',
			'postmountFor',
			'styleWhilePremounted',
			'styleWhilePostmounted',
			'durationInFrames',
			'from',
			'freeze',
		].sort(),
	);
});

test('extendSchemaWithSequenceName adds hidden name to wrapped schemas', () => {
	const flat = getFlatSchemaWithAllKeys(
		extendSchemaWithSequenceName({
			opacity: {
				type: 'number',
				default: 1,
				hiddenFromList: false,
			},
		}),
	);

	expect(flat.name).toEqual({type: 'hidden'});
	expect(flat.opacity.type).toBe('number');
});

test('sequenceSchemaWithoutFrom does not expose from', () => {
	const flat = getFlatSchemaWithAllKeys(sequenceSchemaWithoutFrom);
	expect(Object.keys(flat)).not.toContain('from');
	expect(Object.keys(flat)).toContain('durationInFrames');
	expect(Object.keys(flat)).toContain('freeze');
});

test('style.scale does not impose a minimum value', () => {
	const scaleSchema = sequenceVisualStyleSchema['style.scale'];
	expect('min' in scaleSchema).toBe(false);
});

test('readValuesFromProps reads dot-notation keys via getNestedValue', () => {
	const props = {
		layout: 'absolute-fill',
		style: {scale: 1.74, opacity: 0.5},
	};
	const flatKeys = Object.keys(getFlatSchemaWithAllKeys(sequenceSchema));
	const values = readValuesFromProps(props, flatKeys);
	expect(values.layout).toBe('absolute-fill');
	expect(values['style.scale']).toBe(1.74);
	expect(values['style.opacity']).toBe(0.5);
	expect(values['style.rotate']).toBeUndefined();
});

test('selectActiveKeys returns only the hidden + layout keys when layout=none', () => {
	const values = {
		layout: 'none',
		'style.scale': 2,
	};
	expect(selectActiveKeys(sequenceSchema, values).sort()).toEqual(
		['hidden', 'layout', 'durationInFrames', 'from', 'freeze'].sort(),
	);
});

test('selectActiveKeys exposes style.* keys when layout=absolute-fill', () => {
	const values = {
		layout: 'absolute-fill',
		'style.scale': 2,
	};
	expect(selectActiveKeys(sequenceSchema, values).sort()).toEqual(
		[
			'hidden',
			'layout',
			'durationInFrames',
			'from',
			'freeze',
			'style.translate',
			'style.scale',
			'style.rotate',
			'style.transformOrigin',
			'style.opacity',
			'premountFor',
			'postmountFor',
		].sort(),
	);

	const values2 = {
		layout: 'none',
		'style.scale': 2,
	};
	expect(selectActiveKeys(sequenceSchema, values2).sort()).toEqual(
		['hidden', 'layout', 'durationInFrames', 'from', 'freeze'].sort(),
	);
});

test('mergeValues writes nested values back into props with dot keys', () => {
	const props = {layout: 'absolute-fill', style: {scale: 1}};
	const values = {layout: 'absolute-fill', 'style.scale': 2};
	const merged = mergeValues({
		props,
		valuesDotNotation: values,
		schemaKeys: ['layout', 'style.scale'],
		propsToDelete: new Set(),
	});
	expect(merged.layout).toBe('absolute-fill');
	expect((merged.style as {scale: number}).scale).toBe(2);
});

test('end-to-end: layout=none drops style.scale from active props', () => {
	const props = {layout: 'none', style: {scale: 2}};
	const flatKeys = Object.keys(getFlatSchemaWithAllKeys(sequenceSchema));
	const values = readValuesFromProps(props, flatKeys);
	const activeKeys = selectActiveKeys(sequenceSchema, values);
	const merged = mergeValues({
		props,
		valuesDotNotation: values,
		schemaKeys: activeKeys,
		propsToDelete: new Set(),
	});
	expect(activeKeys.sort()).toEqual(
		['hidden', 'layout', 'durationInFrames', 'from', 'freeze'].sort(),
	);
	// style.scale was not in activeKeys → original style preserved, not overwritten
	expect((merged.style as {scale: number}).scale).toBe(2);
});

test('getNestedValue returns undefined for missing nested keys', () => {
	expect(getNestedValue({a: {}}, 'a.b.c')).toBeUndefined();
	expect(getNestedValue({a: {b: 1}}, 'a.b')).toBe(1);
});
