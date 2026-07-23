import type {InteractivitySchemaField, InteractivitySchema} from 'remotion';

export const keyframeInterpolationFunctions = [
	'interpolate',
	'interpolateColors',
] as const;

export type KeyframeInterpolationFunction =
	(typeof keyframeInterpolationFunctions)[number];

// Keep these tables exhaustive so every schema field requires explicit
// keyframe and interpolation decisions.
const KEYFRAME_FIELD_TYPE_SUPPORT = {
	array: false,
	asset: false,
	boolean: false,
	captions: false,
	color: true,
	enum: false,
	'font-family': false,
	hidden: true,
	number: true,
	'rotation-css': true,
	'rotation-degrees': true,
	scale: true,
	'text-content': false,
	'transform-origin': true,
	translate: true,
	'uv-coordinate': true,
} as const satisfies Record<InteractivitySchemaField['type'], boolean>;

type KeyframeInterpolationStrategy =
	| KeyframeInterpolationFunction
	| 'infer'
	| 'unsupported';

const KEYFRAME_FIELD_TYPE_INTERPOLATION = {
	array: 'unsupported',
	asset: 'unsupported',
	boolean: 'unsupported',
	captions: 'unsupported',
	color: 'interpolateColors',
	enum: 'unsupported',
	'font-family': 'unsupported',
	hidden: 'infer',
	number: 'infer',
	'rotation-css': 'interpolate',
	'rotation-degrees': 'infer',
	scale: 'interpolate',
	'text-content': 'unsupported',
	'transform-origin': 'interpolate',
	translate: 'interpolate',
	'uv-coordinate': 'infer',
} as const satisfies Record<
	InteractivitySchemaField['type'],
	KeyframeInterpolationStrategy
>;

const KEYFRAME_INTERPOLATION_EASING_SUPPORT = {
	interpolate: true,
	interpolateColors: true,
} as const satisfies Record<KeyframeInterpolationFunction, boolean>;

export const isKeyframeInterpolationFunction = (
	name: string,
): name is KeyframeInterpolationFunction => {
	return keyframeInterpolationFunctions.includes(
		name as KeyframeInterpolationFunction,
	);
};

export const canEditEasingForInterpolationFunction = (
	interpolationFunction: string,
): boolean =>
	isKeyframeInterpolationFunction(interpolationFunction) &&
	KEYFRAME_INTERPOLATION_EASING_SUPPORT[interpolationFunction];

export const isInteractivitySchemaFieldKeyframable = (
	field: InteractivitySchemaField | undefined,
): boolean => {
	if (!field) {
		return true;
	}

	return KEYFRAME_FIELD_TYPE_SUPPORT[field.type] && field.keyframable !== false;
};

const findFieldInSchema = (
	schema: InteractivitySchema,
	key: string,
): InteractivitySchemaField | undefined => {
	if (key in schema) {
		return schema[key];
	}

	for (const field of Object.values(schema)) {
		if (field.type !== 'enum') {
			continue;
		}

		for (const variant of Object.values(field.variants)) {
			const found = findFieldInSchema(variant, key);
			if (found) {
				return found;
			}
		}
	}

	return undefined;
};

export const isSchemaFieldKeyframable = ({
	schema,
	key,
}: {
	schema: InteractivitySchema | null;
	key: string;
}): boolean => {
	const field = schema ? findFieldInSchema(schema, key) : undefined;
	return isInteractivitySchemaFieldKeyframable(field);
};

export const getKeyframeInterpolationFunctionForSchemaField = ({
	schema,
	key,
}: {
	schema: InteractivitySchema | null;
	key: string;
}): KeyframeInterpolationFunction | null => {
	const field = schema ? findFieldInSchema(schema, key) : undefined;

	if (!field) {
		return null;
	}

	const strategy = KEYFRAME_FIELD_TYPE_INTERPOLATION[field.type];
	return strategy === 'infer' || strategy === 'unsupported' ? null : strategy;
};

export const getKeyframeInterpolationFunction = ({
	schema,
	key,
	staticValue,
	newValue,
}: {
	schema: InteractivitySchema | null;
	key: string;
	staticValue: unknown;
	newValue: unknown;
}): KeyframeInterpolationFunction => {
	const schemaFunction = getKeyframeInterpolationFunctionForSchemaField({
		schema,
		key,
	});
	if (schemaFunction) {
		return schemaFunction;
	}

	return typeof staticValue === 'string' && typeof newValue === 'string'
		? 'interpolateColors'
		: 'interpolate';
};
