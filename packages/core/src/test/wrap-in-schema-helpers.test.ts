import {expect, test} from 'bun:test';
import {getFlatSchemaWithAllKeys} from '../flatten-schema.js';
import {sequenceSchema} from '../sequence-field-schema.js';
import {
	getNestedValue,
	mergeValues,
	readValuesFromProps,
	selectActiveKeys,
} from '../wrap-in-schema.js';

test('getFlatSchema(sequenceSchema) exposes every variant key', () => {
	const flat = getFlatSchemaWithAllKeys(sequenceSchema);
	expect(Object.keys(flat).sort()).toEqual(
		[
			'layout',
			'style.translate',
			'style.scale',
			'style.rotate',
			'style.opacity',
		].sort(),
	);
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

test('selectActiveKeys returns only the layout key when layout=none', () => {
	const values = {
		layout: 'none',
		'style.scale': 2,
	};
	expect(selectActiveKeys(sequenceSchema, values)).toEqual(['layout']);
});

test('selectActiveKeys exposes style.* keys when layout=absolute-fill', () => {
	const values = {
		layout: 'absolute-fill',
		'style.scale': 2,
	};
	expect(selectActiveKeys(sequenceSchema, values).sort()).toEqual(
		[
			'layout',
			'style.translate',
			'style.scale',
			'style.rotate',
			'style.opacity',
		].sort(),
	);
});

test('mergeValues writes nested values back into props with dot keys', () => {
	const props = {layout: 'absolute-fill', style: {scale: 1}};
	const values = {layout: 'absolute-fill', 'style.scale': 2};
	const merged = mergeValues({
		props,
		valuesDotNotation: values,
		schemaKeys: ['layout', 'style.scale'],
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
	});
	expect(activeKeys).toEqual(['layout']);
	// style.scale was not in activeKeys → original style preserved, not overwritten
	expect((merged.style as {scale: number}).scale).toBe(2);
});

test('getNestedValue returns undefined for missing nested keys', () => {
	expect(getNestedValue({a: {}}, 'a.b.c')).toBeUndefined();
	expect(getNestedValue({a: {b: 1}}, 'a.b')).toBe(1);
});
