import {getEffectiveVisualModeValue} from './get-effective-visual-mode-value.js';
import type {
	SequenceFieldSchema,
	SequenceSchema,
} from './sequence-field-schema.js';

export type CanUpdateSequencePropStatus =
	| {canUpdate: true; codeValue: unknown}
	| {canUpdate: false; reason: 'computed'};

export type DragOverrides = Record<string, Record<string, unknown>>;
export type CodeValues = Record<
	string,
	Record<string, CanUpdateSequencePropStatus>
>;

export type GetCodeValues = (
	overrideId: string,
) => CodeValues[string] | undefined;

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

export const computeEffectiveSchemaValuesDotNotation = ({
	schema,
	currentValue,
	overrideValues,
	propStatus,
}: {
	schema: SequenceSchema;
	currentValue: Record<string, unknown>;
	overrideValues: Record<string, unknown>;
	propStatus: Record<string, CanUpdateSequencePropStatus> | undefined;
}): Record<string, unknown> => {
	const merged: Record<string, unknown> = {};
	for (const key of Object.keys(currentValue)) {
		const codeValueStatus = propStatus?.[key] ?? null;
		merged[key] = getEffectiveVisualModeValue({
			codeValue: codeValueStatus,
			runtimeValue: currentValue[key],
			dragOverrideValue: overrideValues[key],
			defaultValue: findFieldInSchema(schema, key)?.default,
			shouldResortToDefaultValueIfUndefined: false,
		});
	}

	return merged;
};
