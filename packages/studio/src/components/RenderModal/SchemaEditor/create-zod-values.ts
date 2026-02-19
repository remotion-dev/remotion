import type {ZodTypesType} from '../../get-zod-if-possible';
import {
	type AnyZodSchema,
	getArrayElement,
	getBrandedInner,
	getDefaultValue,
	getEffectsInner,
	getFirstEnumValue,
	getInnerType,
	getIntersectionSchemas,
	getLiteralValue,
	getObjectShape,
	getPipelineInput,
	getPipelineOutput,
	getRecordKeyType,
	getRecordValueType,
	getTupleItems,
	getUnionOptions,
	getZodDef,
	getZodSchemaDescription,
	getZodSchemaType,
	isZodV3Schema,
} from './zod-schema-type';

export const createZodValues = (
	schema: AnyZodSchema,
	zodRuntime: unknown,
	zodTypes: ZodTypesType | null,
): unknown => {
	if (!schema) {
		throw new Error('Invalid zod schema');
	}

	// In v4, .refine()/.describe() don't wrap in effects — the description
	// lives directly on the schema. Check for branded descriptions early
	// so they are detected regardless of the underlying type.
	const description = getZodSchemaDescription(schema);
	if (zodTypes) {
		if (description === zodTypes.ZodZypesInternals.REMOTION_COLOR_BRAND) {
			return '#ffffff';
		}

		if (description === zodTypes.ZodZypesInternals.REMOTION_TEXTAREA_BRAND) {
			return '';
		}

		if (description === zodTypes.ZodZypesInternals.REMOTION_MATRIX_BRAND) {
			return [
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
			];
		}
	}

	const typeName = getZodSchemaType(schema);

	switch (typeName) {
		case 'string':
			return '';
		case 'number': {
			const {checks} = getZodDef(schema);
			if (checks) {
				if (isZodV3Schema(schema)) {
					for (const check of checks) {
						if (check.kind === 'min') return check.value;
						if (check.kind === 'max' && check.value < 0) return check.value;
					}
				} else {
					for (const check of checks) {
						const cd = check._zod?.def;
						if (cd?.check === 'greater_than') return cd.value;
						if (cd?.check === 'less_than' && cd.value < 0) return cd.value;
					}
				}
			}

			return 0;
		}

		case 'bigint':
			return BigInt(0);
		case 'boolean':
			return false;
		case 'nan':
			return NaN;
		case 'date':
			return new Date();
		case 'symbol':
			return Symbol('remotion');
		case 'undefined':
		case 'void':
			return undefined;
		case 'null':
			return null;
		case 'any':
		case 'custom':
			throw new Error('Cannot create a value for type z.any()');
		case 'unknown':
			throw new Error('Cannot create a value for type z.unknown()');
		case 'never':
			throw new Error('Cannot create a value for type z.never()');
		case 'object': {
			const shape = getObjectShape(schema);
			const keys = Object.keys(shape);
			const returnValue = keys.reduce(
				(existing, key) => {
					existing[key] = createZodValues(shape[key], zodRuntime, zodTypes);
					return existing;
				},
				{} as Record<string, unknown>,
			);
			return returnValue;
		}

		case 'array': {
			return [createZodValues(getArrayElement(schema), zodRuntime, zodTypes)];
		}

		case 'union': {
			const firstOption = getUnionOptions(schema)[0];
			return firstOption
				? createZodValues(firstOption, zodRuntime, zodTypes)
				: undefined;
		}

		case 'discriminatedUnion': {
			const firstOption = getUnionOptions(schema)[0];
			return createZodValues(firstOption, zodRuntime, zodTypes);
		}

		case 'literal': {
			return getLiteralValue(schema);
		}

		case 'effects': {
			return createZodValues(getEffectsInner(schema), zodRuntime, zodTypes);
		}

		case 'intersection': {
			const {left, right} = getIntersectionSchemas(schema);
			const leftValue = createZodValues(left, zodRuntime, zodTypes);
			if (typeof leftValue !== 'object') {
				throw new Error(
					'Cannot create value for type z.intersection: Left side is not an object',
				);
			}

			const rightValue = createZodValues(right, zodRuntime, zodTypes);

			if (typeof rightValue !== 'object') {
				throw new Error(
					'Cannot create value for type z.intersection: Right side is not an object',
				);
			}

			return {...leftValue, ...rightValue};
		}

		case 'tuple': {
			return getTupleItems(schema).map((item) =>
				createZodValues(item, zodRuntime, zodTypes),
			);
		}

		case 'record': {
			const values = createZodValues(
				getRecordValueType(schema),
				zodRuntime,
				zodTypes,
			);
			return {key: values};
		}

		case 'map': {
			const values = createZodValues(
				getRecordValueType(schema),
				zodRuntime,
				zodTypes,
			);
			const key = createZodValues(
				getRecordKeyType(schema),
				zodRuntime,
				zodTypes,
			);
			return new Map([[key, values]]);
		}

		case 'lazy': {
			const type = getZodDef(schema).getter();
			return createZodValues(type, zodRuntime, zodTypes);
		}

		case 'set': {
			const values = createZodValues(
				getZodDef(schema).valueType,
				zodRuntime,
				zodTypes,
			);
			return new Set([values]);
		}

		case 'function': {
			throw new Error('Cannot create a value for type function');
		}

		case 'enum': {
			return getFirstEnumValue(schema);
		}

		case 'nativeEnum': {
			return 0;
		}

		case 'optional':
		case 'nullable':
		case 'catch': {
			return createZodValues(getInnerType(schema), zodRuntime, zodTypes);
		}

		case 'default': {
			return getDefaultValue(schema);
		}

		case 'promise': {
			const def = getZodDef(schema);
			// v3: _def.type, v4: _def.innerType
			const inner = isZodV3Schema(schema) ? def.type : def.innerType;
			const value = createZodValues(inner, zodRuntime, zodTypes);
			return Promise.resolve(value);
		}

		case 'branded': {
			return createZodValues(getBrandedInner(schema), zodRuntime, zodTypes);
		}

		case 'pipeline':
		case 'pipe': {
			const out = getPipelineOutput(schema);
			// In v4, .transform() creates pipe { in, out: transform }.
			// Since we don't apply transforms, use the input side.
			if (getZodSchemaType(out) === 'transform') {
				return createZodValues(getPipelineInput(schema), zodRuntime, zodTypes);
			}

			return createZodValues(out, zodRuntime, zodTypes);
		}

		default:
			throw new Error('Not implemented: ' + typeName);
	}
};
