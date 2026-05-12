import {getEffectiveVisualModeValue} from './get-effective-visual-mode-value.js';
import type {
	SequenceFieldSchema,
	SequenceSchema,
} from './sequence-field-schema.js';
import type {
	CanUpdateSequencePropsResponse,
	SequenceNodePath,
} from './SequenceManager.js';

export type CanUpdateSequencePropStatus =
	| {canUpdate: true; codeValue: unknown}
	| {canUpdate: false; reason: 'computed'};

export type DragOverrides = Record<string, Record<string, unknown>>;
export type CodeValues = Record<string, CanUpdateSequencePropsResponse>;

export type GetCodeValues = (
	nodePath: SequenceNodePath,
) => Record<string, CanUpdateSequencePropStatus> | undefined;

export type GetIsJsxInMapCallback = (nodePath: SequenceNodePath) => boolean;

export type GetDragOverrides = (
	nodePath: SequenceNodePath,
) => DragOverrides[string];

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
		const field = findFieldInSchema(schema, key);
		if (field?.type === 'hidden') {
			continue;
		}

		merged[key] = getEffectiveVisualModeValue({
			codeValue: codeValueStatus,
			runtimeValue: currentValue[key],
			dragOverrideValue: overrideValues[key],
			defaultValue: field?.default,
			shouldResortToDefaultValueIfUndefined: false,
		});
	}

	return merged;
};
