import type {ZodType} from '../components/get-zod-if-possible';

export const getZodSchemaFromPrimitive = (value: unknown, z: ZodType) => {
	if (typeof value === 'string') {
		return z.string();
	}

	if (typeof value === 'number') {
		return z.number();
	}

	throw new Error('Unknown primitive type');
};
