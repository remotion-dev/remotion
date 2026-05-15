import type {
	CodeValues,
	DragOverrides,
	SequenceControls,
	VisibleFieldSchema,
	SequenceSchema,
	GetDragOverrides,
	SequencePropsSubscriptionKey,
	EffectDefinition,
} from 'remotion';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';

export type {CodeValues, DragOverrides, SequenceControls};

export type SchemaFieldInfo = {
	key: string;
	description: string | undefined;
	typeName: SupportedSchemaType;
	rowHeight: number;
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

const SUPPORTED_SCHEMA_TYPES = [
	'number',
	'boolean',
	'rotation',
	'translate',
	'color',
	'enum',
	'hidden',
] as const;

type SupportedSchemaType = (typeof SUPPORTED_SCHEMA_TYPES)[number];

export const getFieldsToShow = ({
	getDragOverrides,
	codeValues,
	nodePath,
	schema,
	currentRuntimeValueDotNotation,
}: {
	schema: SequenceSchema;
	currentRuntimeValueDotNotation: Record<string, unknown>;
	getDragOverrides: GetDragOverrides;
	codeValues: CodeValues;
	nodePath: SequencePropsSubscriptionKey;
}): SequenceSchemaFieldInfo[] | null => {
	const {merged: valuesDotNotation} =
		Internals.computeEffectiveSchemaValuesDotNotation({
			schema,
			currentValue: currentRuntimeValueDotNotation,
			overrideValues: getDragOverrides(nodePath),
			propStatus: Internals.getCodeValuesCtx(codeValues, nodePath),
		});

	const activeSchema = Internals.flattenActiveSchema(
		schema,
		(key) => valuesDotNotation[key],
	);

	return Object.entries(activeSchema)
		.map(([key, fieldSchema]): SequenceSchemaFieldInfo | null => {
			const typeName = fieldSchema.type;
			if (SUPPORTED_SCHEMA_TYPES.indexOf(typeName) === -1) {
				throw new Error(`Unsupported field type: ${typeName}`);
			}

			if (typeName === 'hidden') {
				return null;
			}

			// `hidden` is represented as the eye/speaker icon on the timeline track,
			// so we don't render it as a regular field in the expanded section.
			if (key === 'hidden') {
				return null;
			}

			return {
				kind: 'sequence-field',
				key,
				description: fieldSchema.description,
				typeName,
				rowHeight: SCHEMA_FIELD_ROW_HEIGHT,
				fieldSchema,
			};
		})
		.filter(NoReactInternals.truthy);
};

export const getEffectFieldsToShow = (
	effect: EffectDefinition<unknown>,
	effectIndex: number,
): EffectSchemaFieldInfo[] => {
	const effectSchema = effect.schema;
	if (!effectSchema) {
		return [];
	}

	return Object.entries(effectSchema)
		.map(([key, fieldSchema]): EffectSchemaFieldInfo | null => {
			const typeName = fieldSchema.type;
			if (typeName === 'hidden') {
				return null;
			}

			if (SUPPORTED_SCHEMA_TYPES.indexOf(typeName) === -1) {
				throw new Error(`Unsupported field type: ${typeName}`);
			}

			return {
				kind: 'effect-field',
				key,
				description: fieldSchema.description,
				typeName,
				rowHeight: SCHEMA_FIELD_ROW_HEIGHT,
				fieldSchema,
				effectSchema,
				effectIndex,
			};
		})
		.filter(NoReactInternals.truthy);
};
