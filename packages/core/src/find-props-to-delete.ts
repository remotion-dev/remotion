import type {InteractivitySchema} from './internals';

export const findPropsToDelete = ({
	schema,
	key,
	value,
}: {
	schema: InteractivitySchema;
	key: string;
	value: unknown;
}) => {
	const fieldSchema = schema[key];

	if (!fieldSchema) {
		throw new Error('Key ' + JSON.stringify(key) + ' not found in schema');
	}

	if (typeof value !== 'string') {
		throw new Error('Value must be a string, but is ' + JSON.stringify(value));
	}

	if (fieldSchema.type !== 'enum') {
		throw new Error('Key ' + JSON.stringify(key) + ' is not an enum');
	}

	const currentVariant = fieldSchema.variants[value as string];
	if (!currentVariant) {
		throw new Error(
			'Value for ' +
				JSON.stringify(key) +
				' must be one of ' +
				Object.keys(fieldSchema.variants)
					.map((v) => JSON.stringify(v))
					.join(', ') +
				', got ' +
				JSON.stringify(value),
		);
	}

	const otherVariants = Object.keys(fieldSchema.variants).filter(
		(v) => v !== value,
	);

	const otherKeys = new Set<string>();
	for (const variant of otherVariants) {
		const otherVariant = fieldSchema.variants[variant];
		const keys = Object.keys(otherVariant);
		for (const k of keys) {
			otherKeys.add(k);
		}
	}

	return [...otherKeys];
};
