import {expect, test} from 'bun:test';
import {solidSchema} from '../effects/Solid.js';
import {getFlatSchemaWithAllKeys} from '../flatten-schema.js';
import {htmlInCanvasSchema} from '../HtmlInCanvas.js';
import {Interactive} from '../Interactive.js';
import {
	baseSchema,
	extendSchemaWithSequenceName,
	premountSchema,
	sequenceSchema,
	sequenceSchemaWithoutFrom,
	sequenceStyleSchema,
	textContentSchema,
	textSchema,
	transformSchema,
} from '../interactivity-schema.js';
import {
	getNestedValue,
	mergeValues,
	readValuesFromProps,
	selectActiveKeys,
} from '../with-interactivity-schema.js';

test('sequenceStyleSchema is the union of transform and premount fields', () => {
	expect(Object.keys(sequenceStyleSchema).sort()).toEqual(
		[...Object.keys(transformSchema), ...Object.keys(premountSchema)].sort(),
	);
});

test('baseSchema exposes common timeline fields', () => {
	expect(Object.keys(baseSchema).sort()).toEqual(
		[
			'durationInFrames',
			'freeze',
			'from',
			'hidden',
			'name',
			'showInTimeline',
			'trimBefore',
		].sort(),
	);
});

test('pixelDensity is exposed only by canvas-backed component schemas', () => {
	const pixelDensitySchema = {
		type: 'number',
		min: 1,
		max: 3,
		step: 0.1,
		default: 1,
		description: 'Pixel density',
		hiddenFromList: false,
	} as const;

	expect(htmlInCanvasSchema.pixelDensity).toEqual(pixelDensitySchema);
	expect(solidSchema.pixelDensity).toEqual(pixelDensitySchema);
	expect('pixelDensity' in baseSchema).toBe(false);
	expect('pixelDensity' in Interactive.baseSchema).toBe(false);
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
			'trimBefore',
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
	expect(Object.keys(flat)).toContain('trimBefore');
});

test('style.scale does not impose a minimum value', () => {
	const scaleSchema = transformSchema['style.scale'];
	expect('min' in scaleSchema).toBe(false);
});

test('textSchema exposes common text style fields', () => {
	expect(Object.keys(textSchema).sort()).toEqual(
		[
			'style.color',
			'style.fontSize',
			'style.fontStyle',
			'style.fontWeight',
			'style.letterSpacing',
			'style.lineHeight',
			'style.textAlign',
		].sort(),
	);
	expect(textSchema['style.color'].type).toBe('color');
	expect(textSchema['style.color'].default).toBeUndefined();
	expect(textSchema['style.fontSize']).toMatchObject({
		type: 'number',
		default: undefined,
		min: 0,
		step: 1,
		hiddenFromList: false,
	});
	expect(textSchema['style.lineHeight']).toMatchObject({
		type: 'number',
		default: undefined,
		min: 0,
		step: 0.05,
		hiddenFromList: false,
	});
	expect(Object.keys(textSchema['style.fontWeight'].variants)).toEqual([
		'100',
		'200',
		'300',
		'400',
		'500',
		'600',
		'700',
		'800',
		'900',
		'normal',
		'bold',
	]);
	expect(Object.keys(textSchema['style.fontStyle'].variants)).toEqual([
		'normal',
		'italic',
		'oblique',
	]);
	expect(Object.keys(textSchema['style.textAlign'].variants)).toEqual([
		'left',
		'center',
		'right',
		'justify',
		'start',
		'end',
	]);
	expect(textSchema['style.letterSpacing']).toMatchObject({
		type: 'number',
		default: undefined,
		step: 0.1,
		hiddenFromList: false,
	});
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

test('readValuesFromProps ignores non-string text content runtime values', () => {
	const props = {
		children: {type: 'span'},
	};
	const flatSchema = getFlatSchemaWithAllKeys(textContentSchema);
	const values = readValuesFromProps(props, ['children'], flatSchema);
	expect(values.children).toBeUndefined();

	const stringValues = readValuesFromProps(
		{children: 'Hello'},
		['children'],
		flatSchema,
	);
	expect(stringValues.children).toBe('Hello');
});

test('selectActiveKeys returns only the hidden + layout keys when layout=none', () => {
	const values = {
		layout: 'none',
		'style.scale': 2,
	};
	expect(selectActiveKeys(sequenceSchema, values).sort()).toEqual(
		[
			'hidden',
			'layout',
			'durationInFrames',
			'from',
			'trimBefore',
			'freeze',
		].sort(),
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
			'trimBefore',
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
		[
			'hidden',
			'layout',
			'durationInFrames',
			'from',
			'trimBefore',
			'freeze',
		].sort(),
	);
});

test('mergeValues writes nested values back into props with dot keys', () => {
	const props = {layout: 'absolute-fill', style: {scale: 1}};
	const values = {layout: 'absolute-fill', 'style.scale': 2};
	const merged = mergeValues({
		flatSchema: getFlatSchemaWithAllKeys(sequenceSchema),
		props,
		valuesDotNotation: values,
		schemaKeys: ['layout', 'style.scale'],
		propsToDelete: new Set(),
	});
	expect(merged.layout).toBe('absolute-fill');
	expect((merged.style as {scale: number}).scale).toBe(2);
});

test('mergeValues preserves non-string text content props', () => {
	const children = {type: 'span'};
	const merged = mergeValues({
		flatSchema: getFlatSchemaWithAllKeys(textContentSchema),
		props: {children},
		valuesDotNotation: {children: undefined},
		schemaKeys: ['children'],
		propsToDelete: new Set(),
	});
	expect(merged.children).toBe(children);
});

test('end-to-end: layout=none drops style.scale from active props', () => {
	const props = {layout: 'none', style: {scale: 2}};
	const flatKeys = Object.keys(getFlatSchemaWithAllKeys(sequenceSchema));
	const values = readValuesFromProps(props, flatKeys);
	const activeKeys = selectActiveKeys(sequenceSchema, values);
	const flatSchema = getFlatSchemaWithAllKeys(sequenceSchema);
	const merged = mergeValues({
		flatSchema,
		props,
		valuesDotNotation: values,
		schemaKeys: activeKeys,
		propsToDelete: new Set(),
	});
	expect(activeKeys.sort()).toEqual(
		[
			'hidden',
			'layout',
			'durationInFrames',
			'from',
			'trimBefore',
			'freeze',
		].sort(),
	);
	// style.scale was not in activeKeys → original style preserved, not overwritten
	expect((merged.style as {scale: number}).scale).toBe(2);
});

test('getNestedValue returns undefined for missing nested keys', () => {
	expect(getNestedValue({a: {}}, 'a.b.c')).toBeUndefined();
	expect(getNestedValue({a: {b: 1}}, 'a.b')).toBe(1);
});
