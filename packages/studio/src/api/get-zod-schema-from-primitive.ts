import type {ZodType} from '../components/get-zod-if-possible';

export const getZodSchemaFromPrimitive = (value: unknown, z: ZodType) => {
	if (typeof value === 'string') {
		return z.string();
	}

	if (typeof value === 'number') {
		return z.number();
	}

	let stringified;
	try {
		stringified = JSON.stringify(value);
	} catch {}

	throw new Error(
		`visualControl(): Specify a schema for this value: ${stringified ?? '[non-serializable value]'}. See https://remotion.dev/docs/studio/visual-control`,
	);
};
