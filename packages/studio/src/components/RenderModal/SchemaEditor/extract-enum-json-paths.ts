import type {z} from 'zod';
import type {ZodType, ZodTypesType} from '../../get-zod-if-possible';

export const extractEnumJsonPaths = ({
	schema,
	zodRuntime,
	currentPath,
	zodTypes,
}: {
	schema: Zod.ZodTypeAny;
	zodRuntime: ZodType;
	zodTypes: ZodTypesType | null;
	currentPath: (string | number)[];
}): (string | number)[][] => {
	const def = schema._def;
	const typeName = def.typeName as z.ZodFirstPartyTypeKind;

	switch (typeName) {
		case zodRuntime.ZodFirstPartyTypeKind.ZodObject: {
			const shape = (def as z.ZodObjectDef).shape();
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

		case zodRuntime.ZodFirstPartyTypeKind.ZodArray: {
			return extractEnumJsonPaths({
				schema: (def as z.ZodArrayDef).type,
				zodRuntime,
				currentPath: [...currentPath, '[]'],
				zodTypes,
			});
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodUnion: {
			return (def as z.ZodUnionDef).options
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

		case zodRuntime.ZodFirstPartyTypeKind.ZodDiscriminatedUnion: {
			return (def as z.ZodDiscriminatedUnionDef<string>).options
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

		case zodRuntime.ZodFirstPartyTypeKind.ZodLiteral: {
			return [currentPath];
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodEffects: {
			if (
				zodTypes &&
				schema._def.description ===
					zodTypes.ZodZypesInternals.REMOTION_MATRIX_BRAND
			) {
				return [currentPath];
			}

			return extractEnumJsonPaths({
				schema: (def as z.ZodEffectsDef).schema,
				zodRuntime,
				currentPath,
				zodTypes,
			});
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodIntersection: {
			const {left, right} = def as z.ZodIntersectionDef;
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

		case zodRuntime.ZodFirstPartyTypeKind.ZodTuple: {
			return (def as z.ZodTupleDef).items
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

		case zodRuntime.ZodFirstPartyTypeKind.ZodRecord: {
			const values = extractEnumJsonPaths({
				schema: (def as z.ZodRecordDef).valueType,
				zodRuntime,
				currentPath: [...currentPath, '{}'],
				zodTypes,
			});
			return values;
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodFunction: {
			throw new Error('Cannot create a value for type function');
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodEnum: {
			return [currentPath];
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodNativeEnum: {
			return [];
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodOptional: {
			const defType = def as z.ZodOptionalDef;
			const value = extractEnumJsonPaths({
				schema: defType.innerType,
				zodRuntime,
				currentPath,
				zodTypes,
			});
			return value;
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodNullable: {
			const defType = def as z.ZodNullableDef;
			const value = extractEnumJsonPaths({
				schema: defType.innerType,
				zodRuntime,
				currentPath,
				zodTypes,
			});
			return value;
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodDefault: {
			const defType = def as z.ZodDefaultDef;
			return extractEnumJsonPaths({
				schema: defType.innerType,
				zodRuntime,
				currentPath,
				zodTypes,
			});
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodCatch: {
			const defType = def as z.ZodCatchDef;
			return extractEnumJsonPaths({
				schema: defType.innerType,
				zodRuntime,
				currentPath,
				zodTypes,
			});
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodPromise: {
			return [];
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodBranded: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const defType = def as z.ZodBrandedDef<any>;
			const value = extractEnumJsonPaths({
				schema: defType.type,
				zodRuntime,
				currentPath,
				zodTypes,
			});
			return value;
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodPipeline: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const defType = def as z.ZodPipelineDef<any, any>;
			const value = extractEnumJsonPaths({
				schema: defType.out,
				zodRuntime,
				currentPath,
				zodTypes,
			});
			return value;
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodString:
		case zodRuntime.ZodFirstPartyTypeKind.ZodNumber:
		case zodRuntime.ZodFirstPartyTypeKind.ZodBigInt:
		case zodRuntime.ZodFirstPartyTypeKind.ZodBoolean:
		case zodRuntime.ZodFirstPartyTypeKind.ZodNaN:
		case zodRuntime.ZodFirstPartyTypeKind.ZodDate:
		case zodRuntime.ZodFirstPartyTypeKind.ZodSymbol:
		case zodRuntime.ZodFirstPartyTypeKind.ZodUndefined:
		case zodRuntime.ZodFirstPartyTypeKind.ZodNull:
		case zodRuntime.ZodFirstPartyTypeKind.ZodAny:
		case zodRuntime.ZodFirstPartyTypeKind.ZodUnknown:
		case zodRuntime.ZodFirstPartyTypeKind.ZodNever:
		case zodRuntime.ZodFirstPartyTypeKind.ZodVoid:
		case zodRuntime.ZodFirstPartyTypeKind.ZodMap: // Maps are not serializable
		case zodRuntime.ZodFirstPartyTypeKind.ZodLazy:
		case zodRuntime.ZodFirstPartyTypeKind.ZodSet: {
			// Sets are not serializable

			return [];
		}

		default:
			throw new Error('Not implemented: ' + typeName);
	}
};
