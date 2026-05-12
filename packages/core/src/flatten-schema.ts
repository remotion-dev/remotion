import type {SequenceSchema} from './sequence-field-schema';

export type ResolveValue = (key: string) => unknown;

export const flattenActiveSchema = (
	schema: SequenceSchema,
	resolve: ResolveValue,
): SequenceSchema => {
	const out: SequenceSchema = {};
	for (const key of Object.keys(schema)) {
		const field = schema[key];
		if (field.type === 'enum') {
			out[key] = field;
			const current = (resolve(key) as string | undefined) ?? field.default;
			const variant = field.variants[current];
			if (variant) {
				Object.assign(out, flattenActiveSchema(variant, resolve));
			}
		} else {
			out[key] = field;
		}
	}

	return out;
};

export const getFlatSchemaWithAllKeys = (
	schema: SequenceSchema,
): SequenceSchema => {
	const out: SequenceSchema = {};

	const addKey = (key: string, field: SequenceSchema[string]) => {
		if (key in out) {
			throw new Error(
				`Duplicate key "${key}" in schema: discriminated union variants must not share keys`,
			);
		}

		out[key] = field;
	};

	for (const key of Object.keys(schema)) {
		const field = schema[key];
		addKey(key, field);

		if (field.type === 'enum') {
			for (const variant of Object.values(field.variants)) {
				const flatVariant = getFlatSchemaWithAllKeys(variant);
				for (const variantKey of Object.keys(flatVariant)) {
					addKey(variantKey, flatVariant[variantKey]);
				}
			}
		}
	}

	return out;
};
