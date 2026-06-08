import type {SequenceFieldSchema, SequenceSchema} from 'remotion';

export const keyframeInterpolationFunctions = [
	'interpolate',
	'interpolateColors',
	'interpolateTransformOrigin',
] as const;

export type KeyframeInterpolationFunction =
	(typeof keyframeInterpolationFunctions)[number];

export const isKeyframeInterpolationFunction = (
	name: string,
): name is KeyframeInterpolationFunction => {
	return keyframeInterpolationFunctions.includes(
		name as KeyframeInterpolationFunction,
	);
};

export const isSequenceFieldSchemaKeyframable = (
	field: SequenceFieldSchema | undefined,
): boolean => {
	if (!field) {
		return true;
	}

	if (field.type === 'array' || field.type === 'enum') {
		return false;
	}

	return field.keyframable !== false;
};

const findFieldInSchema = (
	schema: SequenceSchema,
	key: string,
): SequenceFieldSchema | undefined => {
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
	schema: SequenceSchema | null;
	key: string;
}): boolean => {
	const field = schema ? findFieldInSchema(schema, key) : undefined;
	return isSequenceFieldSchemaKeyframable(field);
};

export const getKeyframeInterpolationFunctionForSchemaField = ({
	schema,
	key,
}: {
	schema: SequenceSchema | null;
	key: string;
}): KeyframeInterpolationFunction | null => {
	const field = schema ? findFieldInSchema(schema, key) : undefined;

	if (field?.type === 'color') {
		return 'interpolateColors';
	}

	if (
		field?.type === 'scale' ||
		field?.type === 'translate' ||
		field?.type === 'rotation-css'
	) {
		return 'interpolate';
	}

	if (field?.type === 'transform-origin') {
		return 'interpolateTransformOrigin';
	}

	return null;
};

export const getKeyframeInterpolationFunction = ({
	schema,
	key,
	staticValue,
	newValue,
}: {
	schema: SequenceSchema | null;
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
