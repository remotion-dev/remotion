import type {
	CanUpdateSequencePropStatusKeyframed,
	SequenceFieldSchema,
	SequenceSchema,
} from 'remotion';

const findFieldInSchema = (
	schema: SequenceSchema,
	key: string,
): SequenceFieldSchema | undefined => {
	if (key in schema) {
		return schema[key];
	}

	for (const field of Object.values(schema)) {
		if (field.type !== 'enum') {
			continue;
		}

		for (const variant of Object.values(field.variants)) {
			const found = findFieldInSchema(variant, key);
			if (found) {
				return found;
			}
		}
	}

	return undefined;
};

const finiteNumberOrNull = (value: unknown): number | null => {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

const scalarScaleOrNull = (value: unknown): number | null => {
	const finiteNumber = finiteNumberOrNull(value);
	if (finiteNumber !== null) {
		return finiteNumber;
	}

	if (typeof value !== 'string') {
		return null;
	}

	const parts = value.trim().split(/\s+/);
	if (parts.length !== 1) {
		return null;
	}

	const parsed = Number(parts[0]);
	return Number.isFinite(parsed) ? parsed : null;
};

const descendingNumbers = (fromValue: unknown, toValue: unknown) => {
	const fromNumber = finiteNumberOrNull(fromValue);
	const toNumber = finiteNumberOrNull(toValue);

	return fromNumber !== null && toNumber !== null && fromNumber > toNumber;
};

const descendingScalarScale = (fromValue: unknown, toValue: unknown) => {
	const fromNumber = scalarScaleOrNull(fromValue);
	const toNumber = scalarScaleOrNull(toValue);

	return fromNumber !== null && toNumber !== null && fromNumber > toNumber;
};

const shouldFlipEasingGraphForField = ({
	field,
	fromValue,
	toValue,
}: {
	readonly field: SequenceFieldSchema | undefined;
	readonly fromValue: unknown;
	readonly toValue: unknown;
}) => {
	if (!field) {
		return false;
	}

	switch (field.type) {
		case 'number':
		case 'rotation-degrees':
			return descendingNumbers(fromValue, toValue);
		case 'scale':
			return descendingScalarScale(fromValue, toValue);
		case 'array':
		case 'boolean':
		case 'color':
		case 'enum':
		case 'hidden':
		case 'rotation-css':
		case 'transform-origin':
		case 'translate':
		case 'uv-coordinate':
			return false;
		default:
			throw new Error(`Unsupported field type: ${field satisfies never}`);
	}
};

export const shouldFlipEasingGraph = ({
	schema,
	fieldKey,
	propStatus,
	segmentIndex,
}: {
	readonly schema: SequenceSchema;
	readonly fieldKey: string;
	readonly propStatus: CanUpdateSequencePropStatusKeyframed;
	readonly segmentIndex: number;
}) => {
	const fromKeyframe = propStatus.keyframes[segmentIndex];
	const toKeyframe = propStatus.keyframes[segmentIndex + 1];

	if (!fromKeyframe || !toKeyframe) {
		return false;
	}

	return shouldFlipEasingGraphForField({
		field: findFieldInSchema(schema, fieldKey),
		fromValue: fromKeyframe.value,
		toValue: toKeyframe.value,
	});
};
