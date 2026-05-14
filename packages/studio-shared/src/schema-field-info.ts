import type {
	CodeValues,
	DragOverrides,
	EffectDefinitionAndStack,
	SequenceControls,
	VisibleFieldSchema,
	SequenceSchema,
	GetDragOverrides,
	GetCodeValues,
	SequenceNodePath,
} from 'remotion';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';

export type {CodeValues, DragOverrides, SequenceControls};

export type SchemaFieldInfo = {
	key: string;
	description: string | undefined;
	typeName: string;
	supported: boolean;
	rowHeight: number;
	currentRuntimeValue: unknown;
	fieldSchema: VisibleFieldSchema;
};

export type SequenceSchemaFieldInfo = SchemaFieldInfo & {
	readonly kind: 'sequence-field';
};

export type EffectSchemaFieldInfo = SchemaFieldInfo & {
	readonly kind: 'effect-field';
	readonly effectIndex: number;
	readonly effectSchema: SequenceSchema;
};

export type AnySchemaFieldInfo =
	| SequenceSchemaFieldInfo
	| EffectSchemaFieldInfo;

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
}): SequenceSchemaFieldInfo[] | null => {
	const {merged: valuesDotNotation} =
		Internals.computeEffectiveSchemaValuesDotNotation({
			schema,
			currentValue: currentRuntimeValueDotNotation,
			overrideValues: getDragOverrides(nodePath),
			propStatus: getCodeValues(nodePath),
		});

	const activeSchema = Internals.flattenActiveSchema(
		schema,
		(key) => valuesDotNotation[key],
	);

	return Object.entries(activeSchema)
		.map(([key, fieldSchema]): SequenceSchemaFieldInfo | null => {
			const typeName = fieldSchema.type;
			const supported = SUPPORTED_SCHEMA_TYPES.has(typeName);
			if (typeName === 'hidden') {
				return null;
			}

			return {
				kind: 'sequence-field',
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
		})
		.filter(NoReactInternals.truthy);
};

export const getEffectFieldsToShow = (
	effect: EffectDefinitionAndStack<unknown>,
): EffectSchemaFieldInfo[] => {
	const effectSchema = effect.definition.schema;
	if (!effectSchema) {
		return [];
	}

	const params = (effect.params ?? {}) as Record<string, unknown>;

	return Object.entries(effectSchema)
		.map(([key, fieldSchema], index): EffectSchemaFieldInfo | null => {
			const typeName = fieldSchema.type;
			if (typeName === 'hidden') {
				return null;
			}

			const supported = SUPPORTED_SCHEMA_TYPES.has(typeName);

			return {
				kind: 'effect-field',
				key,
				description: fieldSchema.description,
				typeName,
				supported,
				rowHeight: supported
					? SCHEMA_FIELD_ROW_HEIGHT
					: UNSUPPORTED_FIELD_ROW_HEIGHT,
				currentRuntimeValue: params[key],
				fieldSchema,
				effectSchema,
				effectIndex: index,
			};
		})
		.filter(NoReactInternals.truthy);
};
