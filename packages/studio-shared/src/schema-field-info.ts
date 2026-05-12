import type {
	CodeValues,
	DragOverrides,
	SequenceControls,
	SequenceFieldSchema,
	SequenceSchema,
	GetDragOverrides,
	GetCodeValues,
	SequenceNodePath,
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
	getDragOverrides,
	getCodeValues,
	nodePath,
	schema,
	currentRuntimeValueDotNotation,
}: {
	schema: SequenceSchema;
	currentRuntimeValueDotNotation: Record<string, unknown>;
	getDragOverrides: GetDragOverrides;
	getCodeValues: GetCodeValues;
	nodePath: SequenceNodePath;
}): SchemaFieldInfo[] | null => {
	const valuesDotNotation = Internals.computeEffectiveSchemaValuesDotNotation({
		schema,
		currentValue: currentRuntimeValueDotNotation,
		overrideValues: getDragOverrides(nodePath),
		propStatus: getCodeValues(nodePath),
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
