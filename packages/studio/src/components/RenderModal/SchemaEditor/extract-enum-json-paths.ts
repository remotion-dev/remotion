import type {ZodTypesType} from '../../get-zod-if-possible';
import {
	type AnyZodSchema,
	getArrayElement,
	getBrandedInner,
	getEffectsInner,
	getInnerType,
	getIntersectionSchemas,
	getObjectShape,
	getPipelineOutput,
	getRecordKeyType,
	getRecordValueType,
	getTupleItems,
	getUnionOptions,
	getZodSchemaDescription,
	getZodSchemaType,
} from './zod-schema-type';

export const extractEnumJsonPaths = ({
	schema,
	zodRuntime,
	currentPath,
	zodTypes,
}: {
	schema: AnyZodSchema;
	zodRuntime: unknown;
	zodTypes: ZodTypesType | null;
	currentPath: (string | number)[];
}): (string | number)[][] => {
	// In v4, .refine()/.describe() don't wrap in effects — the description
	// lives directly on the schema. Check for branded descriptions early
	// so they are detected regardless of the underlying type.
	const description = getZodSchemaDescription(schema);
	if (
		zodTypes &&
		description === zodTypes.ZodZypesInternals.REMOTION_MATRIX_BRAND
	) {
		return [currentPath];
	}

	const typeName = getZodSchemaType(schema);

	switch (typeName) {
		case 'object': {
			const shape = getObjectShape(schema);
			const keys = Object.keys(shape);
			return keys
				.map((key) => {
					return extractEnumJsonPaths({
						schema: shape[key],
						zodRuntime,
						currentPath: [...currentPath, key],
						zodTypes,
					});
				})
				.flat(1);
		}

		case 'array': {
			return extractEnumJsonPaths({
				schema: getArrayElement(schema),
				zodRuntime,
				currentPath: [...currentPath, '[]'],
				zodTypes,
			});
		}

		case 'union': {
			return getUnionOptions(schema)
				.map((option) => {
					return extractEnumJsonPaths({
						schema: option,
						zodRuntime,
						currentPath,
						zodTypes,
					});
				})
				.flat(1);
		}

		case 'discriminatedUnion': {
			return getUnionOptions(schema)
				.map((op) => {
					return extractEnumJsonPaths({
						schema: op,
						zodRuntime,
						currentPath,
						zodTypes,
					});
				})
				.flat(1);
		}

		case 'literal': {
			return [currentPath];
		}

		case 'effects': {
			return extractEnumJsonPaths({
				schema: getEffectsInner(schema),
				zodRuntime,
				currentPath,
				zodTypes,
			});
		}

		case 'intersection': {
			const {left, right} = getIntersectionSchemas(schema);
			const leftValue = extractEnumJsonPaths({
				schema: left,
				zodRuntime,
				currentPath,
				zodTypes,
			});

			const rightValue = extractEnumJsonPaths({
				schema: right,
				zodRuntime,
				currentPath,
				zodTypes,
			});

			return [...leftValue, ...rightValue];
		}

		case 'tuple': {
			return getTupleItems(schema)
				.map((item, i) =>
					extractEnumJsonPaths({
						schema: item,
						zodRuntime,
						currentPath: [...currentPath, i],
						zodTypes,
					}),
				)
				.flat(1);
		}

		case 'record': {
			const recordPath = [...currentPath, '{}'];
			const keyResults = extractEnumJsonPaths({
				schema: getRecordKeyType(schema),
				zodRuntime,
				currentPath: recordPath,
				zodTypes,
			});
			const valueResults = extractEnumJsonPaths({
				schema: getRecordValueType(schema),
				zodRuntime,
				currentPath: recordPath,
				zodTypes,
			});
			return [...keyResults, ...valueResults];
		}

		case 'function': {
			throw new Error('Cannot create a value for type function');
		}

		case 'enum': {
			return [currentPath];
		}

		case 'nativeEnum': {
			return [];
		}

		case 'optional':
		case 'nullable':
		case 'catch': {
			return extractEnumJsonPaths({
				schema: getInnerType(schema),
				zodRuntime,
				currentPath,
				zodTypes,
			});
		}

		case 'default': {
			return extractEnumJsonPaths({
				schema: getInnerType(schema),
				zodRuntime,
				currentPath,
				zodTypes,
			});
		}

		case 'promise': {
			return [];
		}

		case 'branded': {
			return extractEnumJsonPaths({
				schema: getBrandedInner(schema),
				zodRuntime,
				currentPath,
				zodTypes,
			});
		}

		case 'pipeline':
		case 'pipe': {
			return extractEnumJsonPaths({
				schema: getPipelineOutput(schema),
				zodRuntime,
				currentPath,
				zodTypes,
			});
		}

		case 'string':
		case 'number':
		case 'bigint':
		case 'boolean':
		case 'nan':
		case 'date':
		case 'symbol':
		case 'undefined':
		case 'null':
		case 'any':
		case 'unknown':
		case 'never':
		case 'void':
		case 'map':
		case 'lazy':
		case 'set':
		case 'custom': {
			return [];
		}

		default:
			throw new Error('Not implemented: ' + typeName);
	}
};
