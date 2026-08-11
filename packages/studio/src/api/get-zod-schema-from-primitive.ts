import type {ZodType} from 'zod';
import type {ZodType as ZodNamespace} from '../components/get-zod-if-possible';

export function getZodSchemaFromPrimitive(
	value: unknown,
	z: ZodNamespace,
): ZodType {
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
}
