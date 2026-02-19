/**
 * Normalizes zod schema type detection across v3 and v4.
 *
 * v3 schemas have `_def.typeName` (e.g. "ZodString")
 * v4 schemas have `_def.type` (e.g. "string") and `_zod` property
 *
 * This module provides a unified type name using v4-style lowercase strings,
 * and accessor helpers that abstract v3/v4 `_def` property differences.
 */

/**
 * Structural type for any Zod schema (v3 or v4).
 *
 * v3 schemas have `_def` with `typeName` property.
 * v4 classic schemas have `_def` with `type` property.
 * v4 core schemas have `_zod.def` with `type` property.
 * At runtime, all zod schemas have `_def` (classic layer adds it for v4).
 */
export interface ZodValidationError {
	format(): {_errors: string[]};
	issues: readonly {
		code: string;
		message: string;
		path: readonly PropertyKey[];
	}[];
}

export type ZodSafeParseResult =
	| {success: true; data: unknown}
	| {success: false; error: ZodValidationError};

export interface AnyZodSchema {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly _def?: Record<string, any>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly _zod?: {def: Record<string, any>; [key: string]: any};
	readonly description?: string;
}

/**
 * Call safeParse on any Zod schema (v3 or v4).
 * All Zod schemas have safeParse at runtime, but some v4 internal types
 * (like $ZodObject) don't declare it in their type definition.
 */
export const zodSafeParse = (
	schema: AnyZodSchema,
	data: unknown,
): ZodSafeParseResult => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (schema as any).safeParse(data);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getZodDef = (schema: AnyZodSchema): Record<string, any> => {
	if (schema._def) return schema._def;
	if (schema._zod) return schema._zod.def;
	throw new Error('Invalid zod schema: missing _def and _zod');
};

export type ZodSchemaType =
	| 'string'
	| 'number'
	| 'boolean'
	| 'object'
	| 'array'
	| 'enum'
	| 'union'
	| 'discriminatedUnion'
	| 'optional'
	| 'nullable'
	| 'default'
	| 'tuple'
	| 'date'
	| 'any'
	| 'unknown'
	| 'bigint'
	| 'null'
	| 'undefined'
	| 'effects'
	| 'literal'
	| 'record'
	| 'never'
	| (string & {});

const v3TypeNameMap: Record<string, ZodSchemaType> = {
	ZodString: 'string',
	ZodNumber: 'number',
	ZodBoolean: 'boolean',
	ZodObject: 'object',
	ZodArray: 'array',
	ZodEnum: 'enum',
	ZodUnion: 'union',
	ZodDiscriminatedUnion: 'discriminatedUnion',
	ZodOptional: 'optional',
	ZodNullable: 'nullable',
	ZodDefault: 'default',
	ZodTuple: 'tuple',
	ZodDate: 'date',
	ZodAny: 'any',
	ZodUnknown: 'unknown',
	ZodBigInt: 'bigint',
	ZodNull: 'null',
	ZodUndefined: 'undefined',
	ZodEffects: 'effects',
	ZodLiteral: 'literal',
	ZodRecord: 'record',
	ZodNever: 'never',
	ZodVoid: 'void',
	ZodNaN: 'nan',
	ZodSymbol: 'symbol',
	ZodIntersection: 'intersection',
	ZodMap: 'map',
	ZodSet: 'set',
	ZodLazy: 'lazy',
	ZodFunction: 'function',
	ZodNativeEnum: 'nativeEnum',
	ZodCatch: 'catch',
	ZodPromise: 'promise',
	ZodBranded: 'branded',
	ZodPipeline: 'pipeline',
};

export const isZodV3Schema = (schema: AnyZodSchema): boolean => {
	const def = getZodDef(schema);
	return 'typeName' in def;
};

/**
 * Get the normalized type name for a zod schema (v3 or v4).
 *
 * In v4, discriminatedUnion is a union with a `discriminator` property on `_def`.
 * This function returns 'discriminatedUnion' for that case.
 */
export const getZodSchemaType = (schema: AnyZodSchema): ZodSchemaType => {
	const def = getZodDef(schema);

	if ('typeName' in def) {
		const {typeName} = def;
		return v3TypeNameMap[typeName] ?? typeName;
	}

	// v4 schema: def.type is a string like "string", "number", etc.
	const {type} = def;

	// In v4, discriminatedUnion has def.type === "union" with def.discriminator
	if (type === 'union' && def.discriminator !== undefined) {
		return 'discriminatedUnion';
	}

	return type;
};

/**
 * Get the description of a schema, handling v3 vs v4 differences.
 *
 * v3: _def.description
 * v4: schema.description
 */
export const getZodSchemaDescription = (
	schema: AnyZodSchema,
): string | undefined => {
	if (isZodV3Schema(schema)) {
		return getZodDef(schema).description;
	}

	return schema.description;
};

/**
 * Get the shape of an object schema.
 * v3: _def.shape() (function)
 * v4: _def.shape (plain object)
 */
export const getObjectShape = (
	schema: AnyZodSchema,
): Record<string, AnyZodSchema> => {
	const {shape} = getZodDef(schema);
	return typeof shape === 'function' ? shape() : shape;
};

/**
 * Get the element schema of an array.
 * v3: _def.type
 * v4: _def.element
 */
export const getArrayElement = (schema: AnyZodSchema): AnyZodSchema => {
	const def = getZodDef(schema);
	return isZodV3Schema(schema) ? def.type : def.element;
};

/**
 * Get the inner type for wrappers like optional, nullable, default, catch.
 * Both v3 and v4 use _def.innerType.
 */
export const getInnerType = (schema: AnyZodSchema): AnyZodSchema => {
	return getZodDef(schema).innerType;
};

/**
 * Get the inner schema for effects (v3 only - v4 doesn't wrap).
 * v3: _def.schema
 */
export const getEffectsInner = (schema: AnyZodSchema): AnyZodSchema => {
	return getZodDef(schema).schema;
};

/**
 * Get the literal value.
 * v3: _def.value (single value)
 * v4: _def.values (array of values) - take the first
 */
export const getLiteralValue = (schema: AnyZodSchema): unknown => {
	const def = getZodDef(schema);
	if (isZodV3Schema(schema)) {
		return def.value;
	}

	return def.values?.[0];
};

/**
 * Get enum values as an array of strings.
 * v3: _def.values (string[])
 * v4: _def.entries (Record<string,string>) - convert to values array
 */
export const getEnumValues = (schema: AnyZodSchema): string[] => {
	const def = getZodDef(schema);
	if (isZodV3Schema(schema)) {
		return def.values;
	}

	const {entries} = def;
	return Object.values(entries);
};

/**
 * Get the first valid value from an enum schema.
 * Handles both regular enums and nativeEnums.
 *
 * In v4, nativeEnums are represented as regular enums with bidirectional
 * entries (e.g. { Apple: 0, "0": "Apple" }). This function filters out
 * the reverse mappings to return actual enum values.
 */
export const getFirstEnumValue = (schema: AnyZodSchema): unknown => {
	const def = getZodDef(schema);

	if (isZodV3Schema(schema)) {
		if (def.typeName === 'ZodNativeEnum') {
			const vals = Object.values(def.values);
			return vals[0];
		}

		return def.values[0];
	}

	const {entries} = def;
	const pairs = Object.entries(entries);

	// Check for native enum with bidirectional mapping
	const hasReverseMapping = pairs.some(([key, value]) => key !== String(value));
	if (hasReverseMapping) {
		// For numeric native enums, filter out the numeric-key reverse mappings
		const forwardPairs = pairs.filter(([key]) => Number.isNaN(Number(key)));
		if (forwardPairs.length > 0) {
			return forwardPairs[0][1];
		}
	}

	return Object.values(entries)[0];
};

/**
 * Get the union/discriminatedUnion options array.
 * Both v3 and v4 use _def.options.
 */
export const getUnionOptions = (schema: AnyZodSchema): AnyZodSchema[] => {
	return getZodDef(schema).options;
};

/**
 * Get the default value from a ZodDefault.
 * v3: _def.defaultValue() (function)
 * v4: _def.defaultValue (plain value)
 */
export const getDefaultValue = (schema: AnyZodSchema): unknown => {
	const dv = getZodDef(schema).defaultValue;
	return typeof dv === 'function' ? dv() : dv;
};

/**
 * Get the discriminator key from a discriminated union.
 * v3: _def.discriminator
 * v4: _def.discriminator
 */
export const getDiscriminator = (schema: AnyZodSchema): string => {
	return getZodDef(schema).discriminator;
};

/**
 * Get all discriminator option keys from a discriminated union.
 * v3: [..._def.optionsMap.keys()]
 * v4: iterate options and extract literal values from discriminator field
 */
export const getDiscriminatedOptionKeys = (schema: AnyZodSchema): string[] => {
	const def = getZodDef(schema);
	const discriminator = getDiscriminator(schema);

	// v3 has optionsMap
	if (isZodV3Schema(schema) && def.optionsMap) {
		return [...def.optionsMap.keys()];
	}

	// v4: iterate options
	const options = getUnionOptions(schema);
	return options.map((option) => {
		const shape = getObjectShape(option);
		const discriminatorSchema = shape[discriminator];
		return getLiteralValue(discriminatorSchema) as string;
	});
};

/**
 * Get the option schema matching a discriminator value.
 * v3: _def.optionsMap.get(value)
 * v4: find matching option by inspecting literal values
 */
export const getDiscriminatedOption = (
	schema: AnyZodSchema,
	discriminatorValue: string,
): AnyZodSchema | undefined => {
	const def = getZodDef(schema);
	const discriminator = getDiscriminator(schema);

	// v3 has optionsMap
	if (isZodV3Schema(schema) && def.optionsMap) {
		return def.optionsMap.get(discriminatorValue);
	}

	// v4: iterate options
	const options = getUnionOptions(schema);
	return options.find((option) => {
		const shape = getObjectShape(option);
		const discriminatorSchema = shape[discriminator];
		return getLiteralValue(discriminatorSchema) === discriminatorValue;
	});
};

/**
 * Get the left and right schemas from an intersection.
 * Both v3 and v4 use _def.left and _def.right.
 */
export const getIntersectionSchemas = (
	schema: AnyZodSchema,
): {left: AnyZodSchema; right: AnyZodSchema} => {
	const def = getZodDef(schema);
	return {left: def.left, right: def.right};
};

/**
 * Get the items array from a tuple schema.
 * Both v3 and v4 use _def.items.
 */
export const getTupleItems = (schema: AnyZodSchema): AnyZodSchema[] => {
	return getZodDef(schema).items;
};

/**
 * Get the value type schema from a record.
 * Both v3 and v4 use _def.valueType.
 */
export const getRecordValueType = (schema: AnyZodSchema): AnyZodSchema => {
	return getZodDef(schema).valueType;
};

/**
 * Get the key type schema from a record.
 * Both v3 and v4 use _def.keyType.
 */
export const getRecordKeyType = (schema: AnyZodSchema): AnyZodSchema => {
	return getZodDef(schema).keyType;
};

/**
 * Get the output schema from a pipeline/pipe.
 * Both v3 and v4 use _def.out.
 */
export const getPipelineOutput = (schema: AnyZodSchema): AnyZodSchema => {
	return getZodDef(schema).out;
};

/**
 * Get the input schema from a pipeline/pipe.
 * Both v3 and v4 use _def.in.
 */
export const getPipelineInput = (schema: AnyZodSchema): AnyZodSchema => {
	return getZodDef(schema).in;
};

/**
 * Get the inner schema from a branded type.
 * v3: _def.type
 * v4: branded is the schema itself (branding is type-level only)
 */
export const getBrandedInner = (schema: AnyZodSchema): AnyZodSchema => {
	return isZodV3Schema(schema) ? getZodDef(schema).type : schema;
};
