import type {z} from 'zod';
import type {ZodType} from '../../get-zod-if-possible';

export const extractEnumJsonPaths = (
	schema: Zod.ZodTypeAny,
	zodRuntime: ZodType,
	currentPath: (string | number)[],
): (string | number)[][] => {
	const def = schema._def;
	const typeName = def.typeName as z.ZodFirstPartyTypeKind;

	switch (typeName) {
		case zodRuntime.ZodFirstPartyTypeKind.ZodObject: {
			const shape = (def as z.ZodObjectDef).shape();
			const keys = Object.keys(shape);
			return keys
				.map((key) => {
					return extractEnumJsonPaths(shape[key], zodRuntime, [
						...currentPath,
						key,
					]);
				})
				.flat(1);
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodArray: {
			return extractEnumJsonPaths((def as z.ZodArrayDef).type, zodRuntime, [
				...currentPath,
				'[]',
			]);
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodUnion: {
			return (def as z.ZodUnionDef).options
				.map((option) => {
					return extractEnumJsonPaths(option, zodRuntime, currentPath);
				})
				.flat(1);
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodDiscriminatedUnion: {
			return (def as z.ZodDiscriminatedUnionDef<string>).options
				.map((op) => {
					return extractEnumJsonPaths(op, zodRuntime, currentPath);
				})
				.flat(1);
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodLiteral: {
			return [currentPath];
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodEffects: {
			return extractEnumJsonPaths(
				(def as z.ZodEffectsDef).schema,
				zodRuntime,
				currentPath,
			);
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodIntersection: {
			const {left, right} = def as z.ZodIntersectionDef;
			const leftValue = extractEnumJsonPaths(left, zodRuntime, currentPath);

			const rightValue = extractEnumJsonPaths(right, zodRuntime, currentPath);

			return [...leftValue, ...rightValue];
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodTuple: {
			return (def as z.ZodTupleDef).items
				.map((item, i) =>
					extractEnumJsonPaths(item, zodRuntime, [...currentPath, i]),
				)
				.flat(1);
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodRecord: {
			const values = extractEnumJsonPaths(
				(def as z.ZodRecordDef).valueType,
				zodRuntime,
				[...currentPath, '{}'],
			);
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
			const value = extractEnumJsonPaths(
				defType.innerType,
				zodRuntime,
				currentPath,
			);
			return value;
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodNullable: {
			const defType = def as z.ZodNullableDef;
			const value = extractEnumJsonPaths(
				defType.innerType,
				zodRuntime,
				currentPath,
			);
			return value;
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodDefault: {
			const defType = def as z.ZodDefaultDef;
			return extractEnumJsonPaths(defType.innerType, zodRuntime, currentPath);
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodCatch: {
			const defType = def as z.ZodCatchDef;
			return extractEnumJsonPaths(defType.innerType, zodRuntime, currentPath);
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodPromise: {
			return [];
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodBranded: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const defType = def as z.ZodBrandedDef<any>;
			const value = extractEnumJsonPaths(defType.type, zodRuntime, currentPath);
			return value;
		}

		case zodRuntime.ZodFirstPartyTypeKind.ZodPipeline: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const defType = def as z.ZodPipelineDef<any, any>;
			const value = extractEnumJsonPaths(defType.out, zodRuntime, currentPath);
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
