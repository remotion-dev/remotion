import type {SequenceFieldSchema, SequenceSchema} from 'remotion';

export const keyframeInterpolationFunctions = [
	'interpolate',
	'interpolateColors',
	'interpolateTranslate',
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

export const getKeyframeInterpolationFunctionForSchemaField = ({
	schema,
	key,
}: {
	schema: SequenceSchema | null;
	key: string;
}): KeyframeInterpolationFunction | null => {
	const field = schema ? findFieldInSchema(schema, key) : undefined;

	if (field?.type === 'translate') {
		return 'interpolateTranslate';
	}

	if (field?.type === 'color') {
		return 'interpolateColors';
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
