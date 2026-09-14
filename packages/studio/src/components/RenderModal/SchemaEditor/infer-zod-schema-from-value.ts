import type {
	ZodType as ZodNamespace,
	ZodTypesType,
} from '../../get-zod-if-possible';
import type {AnyZodSchema} from './zod-schema-type';
import {zodSafeParse} from './zod-schema-type';

const hasUnambiguousColorSyntax = (value: string) => {
	return /^(?:#|(?:rgb|hsl|hwb|lab|lch|oklab|oklch|color)\()/i.test(
		value.trim(),
	);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
};

export function inferZodSchemaFromValue({
	value,
	z,
	zodTypes,
	path,
}: {
	readonly value: unknown;
	readonly z: ZodNamespace;
	readonly zodTypes: ZodTypesType | null;
	readonly path: readonly string[];
}): AnyZodSchema {
	if (typeof value === 'string') {
		const key = path.at(-1)?.toLowerCase();
		if (key === 'type') {
			return z.literal(value);
		}

		const keySuggestsColor = key?.includes('color');
		if (zodTypes && (keySuggestsColor || hasUnambiguousColorSyntax(value))) {
			try {
				zodTypes.ZodZypesInternals.parseColor(value);
				return zodTypes.zColor();
			} catch {}
		}

		return z.string();
	}

	if (typeof value === 'number') {
		return z.number();
	}

	if (typeof value === 'boolean') {
		return z.boolean();
	}

	if (value === null) {
		return z.null();
	}

	if (typeof value === 'undefined') {
		return z.undefined();
	}

	if (value instanceof Date) {
		return z.date();
	}

	if (Array.isArray(value)) {
		if (value.length === 0) {
			return z.any();
		}

		const elementSchema = inferZodSchemaFromValue({
			value: value[0],
			z,
			zodTypes,
			path,
		});
		if (!value.every((item) => zodSafeParse(elementSchema, item).success)) {
			return z.any();
		}

		return z.array(elementSchema as never);
	}

	if (isPlainObject(value)) {
		return z.object(
			Object.fromEntries(
				Object.entries(value).map(([key, child]) => [
					key,
					inferZodSchemaFromValue({
						value: child,
						z,
						zodTypes,
						path: [...path, key],
					}),
				]),
			) as never,
		);
	}

	return z.any();
}

export type ResolvedCompositionSchema = AnyZodSchema | 'no-schema' | 'no-zod';

export function resolveCompositionSchema({
	explicitSchema,
	defaultProps,
	z,
	zodTypes,
}: {
	readonly explicitSchema: unknown;
	readonly defaultProps: Record<string, unknown>;
	readonly z: ZodNamespace | null;
	readonly zodTypes: ZodTypesType | null;
}): ResolvedCompositionSchema {
	if (!z) {
		return 'no-zod';
	}

	if (explicitSchema) {
		if (
			typeof (explicitSchema as {safeParse?: unknown}).safeParse !== 'function'
		) {
			throw new Error(
				'A value which is not a Zod schema was passed to `schema`',
			);
		}

		return explicitSchema as AnyZodSchema;
	}

	if (Object.keys(defaultProps).length === 0) {
		return 'no-schema';
	}

	return inferZodSchemaFromValue({
		value: defaultProps,
		z,
		zodTypes,
		path: [],
	});
}
