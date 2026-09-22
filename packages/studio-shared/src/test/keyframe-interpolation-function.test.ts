import {expect, test} from 'bun:test';
import type {InteractivitySchema} from 'remotion';
import {Interactive} from 'remotion';
import {
	canEditEasingForInterpolationFunction,
	getKeyframeInterpolationFunctionForSchemaField,
	getKeyframeOutputTypeForSchemaField,
	isInteractivitySchemaFieldKeyframable,
	isSchemaFieldHoldOnly,
	isSchemaFieldKeyframable,
} from '../keyframe-interpolation-function';

test('border longhand fields keyframe width and color, but not style', () => {
	const schema = {
		...Interactive.borderSchema,
		...Interactive.borderRadiusSchema,
	};

	expect(isSchemaFieldKeyframable({schema, key: 'style.borderWidth'})).toBe(
		true,
	);
	expect(isSchemaFieldKeyframable({schema, key: 'style.borderColor'})).toBe(
		true,
	);
	expect(isSchemaFieldKeyframable({schema, key: 'style.borderStyle'})).toBe(
		false,
	);
	expect(isSchemaFieldKeyframable({schema, key: 'style.borderRadius'})).toBe(
		true,
	);
	expect(
		isSchemaFieldKeyframable({schema, key: 'style.borderTopLeftRadius'}),
	).toBe(true);
});

test('background color is keyframable', () => {
	expect(
		isSchemaFieldKeyframable({
			schema: Interactive.backgroundSchema,
			key: 'style.backgroundColor',
		}),
	).toBe(true);
});

test('known interpolation functions explicitly support easing', () => {
	expect(canEditEasingForInterpolationFunction('interpolate')).toBe(true);
	expect(canEditEasingForInterpolationFunction('interpolateColors')).toBe(true);
	expect(canEditEasingForInterpolationFunction('unknown')).toBe(false);
});

test('field type keyframe support is explicit', () => {
	expect(isInteractivitySchemaFieldKeyframable({type: 'hidden'})).toBe(true);
	expect(
		isInteractivitySchemaFieldKeyframable({
			type: 'text-content',
			default: '',
		}),
	).toBe(false);
});

test('enum fields are keyframable and hold-only when explicitly enabled', () => {
	const schema = {
		layout: {
			type: 'enum',
			default: 'absolute-fill',
			keyframable: true,
			variants: {
				'absolute-fill': {},
				none: {},
			},
		},
	} satisfies InteractivitySchema;

	expect(isSchemaFieldKeyframable({schema, key: 'layout'})).toBe(true);
	expect(isSchemaFieldHoldOnly({schema, key: 'layout'})).toBe(true);
	expect(
		getKeyframeInterpolationFunctionForSchemaField({schema, key: 'layout'}),
	).toBe('interpolate');
});

test('enum fields are not keyframable by default', () => {
	const schema = {
		layout: {
			type: 'enum',
			default: 'absolute-fill',
			variants: {
				'absolute-fill': {},
				none: {},
			},
		},
	} satisfies InteractivitySchema;

	expect(isSchemaFieldKeyframable({schema, key: 'layout'})).toBe(false);
	expect(isSchemaFieldHoldOnly({schema, key: 'layout'})).toBe(false);
});

test('isSchemaFieldKeyframable rejects explicitly disabled fields', () => {
	const schema = {
		playbackRate: {
			type: 'number',
			default: 1,
			hiddenFromList: false,
			keyframable: false,
		},
	} satisfies InteractivitySchema;

	expect(isSchemaFieldKeyframable({schema, key: 'playbackRate'})).toBe(false);
});

test('isSchemaFieldKeyframable rejects boolean fields', () => {
	const schema = {
		loop: {
			type: 'boolean',
			default: false,
		},
	} satisfies InteractivitySchema;

	expect(isSchemaFieldKeyframable({schema, key: 'loop'})).toBe(false);
});

test('isSchemaFieldKeyframable rejects font-family fields', () => {
	const schema = {
		'style.fontFamily': {
			type: 'font-family',
			default: undefined,
			keyframable: false,
		},
	} satisfies InteractivitySchema;

	expect(isSchemaFieldKeyframable({schema, key: 'style.fontFamily'})).toBe(
		false,
	);
});

test('font-weight fields use interpolate keyframes', () => {
	const schema = {
		'style.fontWeight': {
			type: 'font-weight',
			default: 400,
		},
	} satisfies InteractivitySchema;

	expect(isSchemaFieldKeyframable({schema, key: 'style.fontWeight'})).toBe(
		true,
	);
	expect(
		getKeyframeInterpolationFunctionForSchemaField({
			schema,
			key: 'style.fontWeight',
		}),
	).toBe('interpolate');
	expect(
		getKeyframeOutputTypeForSchemaField({
			schema,
			key: 'style.fontWeight',
		}),
	).toBe('font-weight');
});

test('isSchemaFieldKeyframable rejects asset fields', () => {
	const schema = {
		src: {
			type: 'asset',
			default: undefined,
			keyframable: false,
		},
	} satisfies InteractivitySchema;

	expect(isSchemaFieldKeyframable({schema, key: 'src'})).toBe(false);
});

test('isSchemaFieldKeyframable rejects boolean fields in enum variants', () => {
	const schema = {
		layout: {
			type: 'enum',
			default: 'absolute-fill',
			variants: {
				'absolute-fill': {
					horizontal: {
						type: 'boolean',
						default: true,
					},
				},
				none: {},
			},
		},
	} satisfies InteractivitySchema;

	expect(isSchemaFieldKeyframable({schema, key: 'horizontal'})).toBe(false);
});

test('isSchemaFieldKeyframable finds keyframable fields in enum variants', () => {
	const schema = {
		layout: {
			type: 'enum',
			default: 'absolute-fill',
			variants: {
				'absolute-fill': {
					'style.opacity': {
						type: 'number',
						default: 1,
						hiddenFromList: false,
					},
				},
				none: {},
			},
		},
	} satisfies InteractivitySchema;

	expect(isSchemaFieldKeyframable({schema, key: 'style.opacity'})).toBe(true);
});

test('transform-origin fields use interpolate keyframes', () => {
	const schema = {
		'style.transformOrigin': {
			type: 'transform-origin',
			default: '50% 50%',
		},
	} satisfies InteractivitySchema;

	expect(
		getKeyframeInterpolationFunctionForSchemaField({
			schema,
			key: 'style.transformOrigin',
		}),
	).toBe('interpolate');
	expect(
		getKeyframeOutputTypeForSchemaField({
			schema,
			key: 'style.transformOrigin',
		}),
	).toBe('transform-origin');
});

test('CSS transform schema fields expose their interpolation output types', () => {
	const schema = {
		'style.scale': {
			type: 'scale',
			default: 1,
		},
		'style.translate': {
			type: 'translate',
			default: '0px',
		},
		'style.rotate': {
			type: 'rotation-css',
			default: '0deg',
		},
	} satisfies InteractivitySchema;

	expect(
		getKeyframeOutputTypeForSchemaField({schema, key: 'style.scale'}),
	).toBe('scale');
	expect(
		getKeyframeOutputTypeForSchemaField({schema, key: 'style.translate'}),
	).toBe('translate');
	expect(
		getKeyframeOutputTypeForSchemaField({schema, key: 'style.rotate'}),
	).toBe('rotate');
});
