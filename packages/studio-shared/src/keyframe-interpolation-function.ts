import type {InteractivitySchema, InteractivitySchemaField} from 'remotion';

export const keyframeInterpolationFunctions = [
	'interpolate',
	'interpolateColors',
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

export const isInteractivitySchemaFieldKeyframable = (
	field: InteractivitySchemaField | undefined,
): boolean => {
	if (!field) {
		return true;
	}

	if (
		field.type === 'array' ||
		field.type === 'boolean' ||
		field.type === 'enum' ||
		field.type === 'font-family' ||
		field.type === 'font-weight'
	) {
		return false;
	}

	return field.keyframable !== false;
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

	if (field?.type === 'color') {
		return 'interpolateColors';
	}

	if (
		field?.type === 'scale' ||
		field?.type === 'translate' ||
		field?.type === 'transform-origin' ||
		field?.type === 'rotation-css'
	) {
		return 'interpolate';
	}

	return null;
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
