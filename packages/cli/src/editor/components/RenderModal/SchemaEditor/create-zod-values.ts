import {Internals, z} from 'remotion';

export const createZodValues = (schema: z.ZodTypeAny): unknown => {
	if (!schema) {
		throw new Error('Invalid zod schema');
	}

	const def = schema._def;
	const typeName = def.typeName as z.ZodFirstPartyTypeKind;

	switch (typeName) {
		case z.ZodFirstPartyTypeKind.ZodString:
			return '';
		case z.ZodFirstPartyTypeKind.ZodNumber:
			return 0;
		case z.ZodFirstPartyTypeKind.ZodBigInt:
			return BigInt(0);
		case z.ZodFirstPartyTypeKind.ZodBoolean:
			return false;
		case z.ZodFirstPartyTypeKind.ZodNaN:
			return NaN;
		case z.ZodFirstPartyTypeKind.ZodDate:
			return new Date();
		case z.ZodFirstPartyTypeKind.ZodSymbol:
			return Symbol('remotion');
		case z.ZodFirstPartyTypeKind.ZodUndefined:
			return undefined;
		case z.ZodFirstPartyTypeKind.ZodNull:
			return null;
		case z.ZodFirstPartyTypeKind.ZodAny:
			throw new Error('Cannot create a value for type z.any()');
		case z.ZodFirstPartyTypeKind.ZodUnknown:
			throw new Error('Cannot create a value for type z.unknown()');
		case z.ZodFirstPartyTypeKind.ZodNever:
			throw new Error('Cannot create a value for type z.never()');
		case z.ZodFirstPartyTypeKind.ZodVoid:
			return undefined;
		case z.ZodFirstPartyTypeKind.ZodObject: {
			const shape = (def as z.ZodObjectDef).shape();
			const keys = Object.keys(shape);
			const returnValue = keys.reduce((existing, key) => {
				existing[key] = createZodValues(shape[key]);
				return existing;
			}, {} as Record<string, unknown>);
			return returnValue;
		}

		case z.ZodFirstPartyTypeKind.ZodArray: {
			return [createZodValues((def as z.ZodArrayDef).type)];
		}

		case z.ZodFirstPartyTypeKind.ZodUnion: {
			const firstOptions = (def as z.ZodUnionDef).options[0];
			return firstOptions ? createZodValues(firstOptions) : undefined;
		}

		case z.ZodFirstPartyTypeKind.ZodDiscriminatedUnion: {
			const options = (def as z.ZodDiscriminatedUnionDef<string>).options[0];
			return createZodValues(options);
		}

		case z.ZodFirstPartyTypeKind.ZodLiteral: {
			return (def as z.ZodLiteralDef).value;
		}

		case z.ZodFirstPartyTypeKind.ZodEffects: {
			if (schema._def.description === Internals.REMOTION_COLOR_BRAND) {
				return '#ffffff';
			}

			return createZodValues((def as z.ZodEffectsDef).schema);
		}

		case z.ZodFirstPartyTypeKind.ZodIntersection: {
			const {left, right} = def as z.ZodIntersectionDef;
			const leftValue = createZodValues(left);
			if (typeof leftValue !== 'object') {
				throw new Error(
					'Cannot create value for type z.intersection: Left side is not an object'
				);
			}

			const rightValue = createZodValues(right);

			if (typeof rightValue !== 'object') {
				throw new Error(
					'Cannot create value for type z.intersection: Right side is not an object'
				);
			}

			return {...leftValue, ...rightValue};
		}

		case z.ZodFirstPartyTypeKind.ZodTuple: {
			const items = (def as z.ZodTupleDef).items.map((item) =>
				createZodValues(item)
			);
			return items;
		}

		case z.ZodFirstPartyTypeKind.ZodRecord: {
			const values = createZodValues((def as z.ZodRecordDef).valueType);
			return {key: values};
		}

		case z.ZodFirstPartyTypeKind.ZodMap: {
			const defType = def as z.ZodMapDef;
			const values = createZodValues(defType.valueType);
			const key = createZodValues(defType.keyType);
			return new Map([[key, values]]);
		}

		case z.ZodFirstPartyTypeKind.ZodLazy: {
			const defType = def as z.ZodLazyDef;
			const type = defType.getter();
			return createZodValues(type);
		}

		case z.ZodFirstPartyTypeKind.ZodSet: {
			const defType = def as z.ZodSetDef;
			const values = createZodValues(defType.valueType);
			return new Set([values]);
		}

		case z.ZodFirstPartyTypeKind.ZodFunction: {
			throw new Error('Cannot create a value for type function');
		}

		case z.ZodFirstPartyTypeKind.ZodEnum: {
			const {values} = def as z.ZodEnumDef;
			return values[0];
		}

		case z.ZodFirstPartyTypeKind.ZodNativeEnum: {
			return 0;
		}

		case z.ZodFirstPartyTypeKind.ZodOptional: {
			const defType = def as z.ZodOptionalDef;
			const value = createZodValues(defType.innerType);
			return value;
		}

		case z.ZodFirstPartyTypeKind.ZodNullable: {
			const defType = def as z.ZodNullableDef;
			const value = createZodValues(defType.innerType);
			return value;
		}

		case z.ZodFirstPartyTypeKind.ZodDefault: {
			const defType = def as z.ZodDefaultDef;
			return defType.defaultValue();
		}

		case z.ZodFirstPartyTypeKind.ZodCatch: {
			const defType = def as z.ZodCatchDef;
			const value = createZodValues(defType.innerType);
			return value;
		}

		case z.ZodFirstPartyTypeKind.ZodPromise: {
			const defType = def as z.ZodPromiseDef;
			const value = createZodValues(defType.type);
			return Promise.resolve(value);
		}

		case z.ZodFirstPartyTypeKind.ZodBranded: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const defType = def as z.ZodBrandedDef<any>;
			const value = createZodValues(defType.type);
			return value;
		}

		case z.ZodFirstPartyTypeKind.ZodPipeline: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const defType = def as z.ZodPipelineDef<any, any>;
			const value = createZodValues(defType.out);
			return value;
		}

		default:
			throw new Error('Not implemented: ' + typeName);
	}
};
