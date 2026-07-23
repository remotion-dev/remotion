import {
	Internals,
	type InteractivitySchemaField,
	type InteractivitySchema,
} from 'remotion';

const shouldSkipField = (
	key: string,
	field: InteractivitySchemaField,
): boolean => {
	return field.type === 'hidden' || key === 'disabled';
};

export const getDefaultValueFromSchema = (
	field: InteractivitySchemaField,
): unknown => {
	if (field.type === 'hidden') {
		return undefined;
	}

	if (field.default !== undefined) {
		return field.default;
	}

	if (field.type === 'number') {
		return field.min ?? 0;
	}

	if (field.type === 'color') {
		return '#000000';
	}

	if (field.type === 'rotation-css') {
		return '0deg';
	}

	if (field.type === 'rotation-degrees') {
		return 0;
	}

	if (field.type === 'translate') {
		return '0px 0px';
	}

	if (field.type === 'uv-coordinate') {
		return [0.5, 0.5] as const;
	}

	if (field.type === 'array') {
		if (field.default !== undefined) {
			return field.default;
		}

		return Array.from(
			{length: field.minLength ?? 0},
			() => field.newItemDefault,
		);
	}

	return undefined;
};

export const fillSchemaDefaults = ({
	schema,
	values,
}: {
	readonly schema: InteractivitySchema;
	readonly values: Record<string, unknown>;
}): Record<string, unknown> => {
	const next = {...values};

	for (let i = 0; i < 10; i++) {
		let changed = false;
		const activeSchema = Internals.flattenActiveSchema(
			schema,
			(key) => next[key],
		);

		for (const [key, field] of Object.entries(activeSchema)) {
			if (shouldSkipField(key, field) || next[key] !== undefined) {
				continue;
			}

			next[key] = getDefaultValueFromSchema(field);
			changed = true;
		}

		if (!changed) {
			break;
		}
	}

	return next;
};

export const getInitialValuesFromSchema = ({
	schema,
	initialValues,
}: {
	readonly schema: InteractivitySchema;
	readonly initialValues?: Record<string, unknown>;
}): Record<string, unknown> => {
	return fillSchemaDefaults({
		schema,
		values: initialValues ?? {},
	});
};

export const getActiveSchemaFields = ({
	schema,
	values,
}: {
	readonly schema: InteractivitySchema;
	readonly values: Record<string, unknown>;
}) => {
	return Object.entries(
		Internals.flattenActiveSchema(schema, (key) => values[key]),
	).filter(([key, field]) => !shouldSkipField(key, field));
};
