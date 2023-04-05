import {z} from 'remotion';

export const createZodValues = (schema: z.ZodTypeAny) => {
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
			throw new Error('Cannot create a value for any');
		case z.ZodFirstPartyTypeKind.ZodUnknown:
			throw new Error('Cannot create a value for unknown');
		case z.ZodFirstPartyTypeKind.ZodNever:
			throw new Error('Cannot create a value for never');
		case z.ZodFirstPartyTypeKind.ZodVoid:
			return undefined;
		case z.ZodFirstPartyTypeKind.ZodObject: {
			const shape = def.shape() as Record<string, z.ZodTypeAny>;
			const keys = Object.keys(shape);
			const returnValue = keys.reduce((existing, key) => {
				existing[key] = createZodValues(shape[key]);
				return existing;
			}, {} as Record<string, unknown>);
			return returnValue;
		}

		case z.ZodFirstPartyTypeKind.ZodArray: {
			return [createZodValues(def.type)];
		}

		case z.ZodFirstPartyTypeKind.ZodUnion:
		case z.ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
		case z.ZodFirstPartyTypeKind.ZodIntersection:
		case z.ZodFirstPartyTypeKind.ZodTuple:
		case z.ZodFirstPartyTypeKind.ZodRecord:
		case z.ZodFirstPartyTypeKind.ZodMap:
		case z.ZodFirstPartyTypeKind.ZodSet:
		case z.ZodFirstPartyTypeKind.ZodFunction:
		case z.ZodFirstPartyTypeKind.ZodLazy:
		case z.ZodFirstPartyTypeKind.ZodLiteral:
		case z.ZodFirstPartyTypeKind.ZodEnum:
		case z.ZodFirstPartyTypeKind.ZodEffects:
		case z.ZodFirstPartyTypeKind.ZodNativeEnum:
		case z.ZodFirstPartyTypeKind.ZodOptional:
		case z.ZodFirstPartyTypeKind.ZodNullable:
		case z.ZodFirstPartyTypeKind.ZodDefault:
		case z.ZodFirstPartyTypeKind.ZodCatch:
		case z.ZodFirstPartyTypeKind.ZodPromise:
		case z.ZodFirstPartyTypeKind.ZodBranded:
		case z.ZodFirstPartyTypeKind.ZodPipeline:
		default:
			throw new Error('Not implemented');
	}
};
