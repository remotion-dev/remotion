import type {
	CodeValues,
	DragOverrides,
	GetCodeValues,
	SequenceControls,
	SequenceFieldSchema,
	SequenceSchema,
} from 'remotion';
import {Internals} from 'remotion';

export type {CodeValues, DragOverrides, SequenceControls};

export type SchemaFieldInfo = {
	key: string;
	description: string | undefined;
	typeName: string;
	supported: boolean;
	rowHeight: number;
	currentRuntimeValue: unknown;
	fieldSchema: SequenceFieldSchema;
};

export const SCHEMA_FIELD_ROW_HEIGHT = 22;
export const UNSUPPORTED_FIELD_ROW_HEIGHT = 22;

const SUPPORTED_SCHEMA_TYPES = new Set([
	'number',
	'boolean',
	'rotation',
	'translate',
	'enum',
]);

export const getFieldsToShow = ({
	dragOverrides,
	getCodeValues,
	overrideId,
	schema,
	currentRuntimeValueDotNotation,
}: {
	schema: SequenceSchema;
	currentRuntimeValueDotNotation: Record<string, unknown>;
	dragOverrides: DragOverrides;
	getCodeValues: GetCodeValues;
	overrideId: string;
}): SchemaFieldInfo[] | null => {
	const valuesDotNotation = Internals.computeEffectiveSchemaValuesDotNotation({
		schema,
		currentValue: currentRuntimeValueDotNotation,
		overrideValues: dragOverrides[overrideId] ?? {},
		propStatus: getCodeValues(overrideId),
	});

	const activeSchema = Internals.flattenActiveSchema(
		schema,
		(key) => valuesDotNotation[key],
	);

	return Object.entries(activeSchema).map(([key, fieldSchema]) => {
		const typeName = fieldSchema.type;
		const supported = SUPPORTED_SCHEMA_TYPES.has(typeName);
		return {
			key,
			description: fieldSchema.description,
			typeName,
			supported,
			rowHeight: supported
				? SCHEMA_FIELD_ROW_HEIGHT
				: UNSUPPORTED_FIELD_ROW_HEIGHT,
			currentRuntimeValue: currentRuntimeValueDotNotation[key],
			fieldSchema,
		};
	});
};
