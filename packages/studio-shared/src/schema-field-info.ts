import type {
	CodeValues,
	DragOverrides,
	EffectDefinition,
	GetDragOverrides,
	GetEffectDragOverrides,
	SequenceControls,
	SequencePropsSubscriptionKey,
	SequenceSchema,
	VisibleFieldSchema,
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
	'uv-coordinate',
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

export const getEffectFieldsToShow = ({
	effect,
	effectIndex,
	nodePath,
	codeValues,
	getEffectDragOverrides,
}: {
	effect: EffectDefinition<unknown>;
	effectIndex: number;
	nodePath: SequencePropsSubscriptionKey | null;
	codeValues: CodeValues;
	getEffectDragOverrides: GetEffectDragOverrides;
}): EffectSchemaFieldInfo[] => {
	const effectStatus =
		nodePath === null
			? null
			: Internals.getEffectCodeValuesCtx({
					codeValues,
					nodePath,
					effectIndex,
				});
	const dragOverrides =
		nodePath === null ? {} : getEffectDragOverrides(nodePath, effectIndex);
	const activeSchema = Internals.flattenActiveSchema(effect.schema, (key) => {
		const dragOverride = dragOverrides[key];
		if (dragOverride !== undefined) {
			return dragOverride;
		}

		if (effectStatus?.type !== 'can-update-effect') {
			return undefined;
		}

		const propStatus = effectStatus.props[key];
		if (!propStatus || !propStatus.canUpdate) {
			return undefined;
		}

		return propStatus.codeValue;
	});

	return Object.entries(activeSchema)
		.map(([key, fieldSchema]): EffectSchemaFieldInfo | null => {
			const typeName = fieldSchema.type;
			if (typeName === 'hidden') {
				return null;
			}

			// `disabled` is represented as the eye icon on the effect timeline row,
			// so we don't render it as a regular field in the expanded section.
			if (key === 'disabled') {
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
				effectSchema: effect.schema,
				effectIndex,
			};
		})
		.filter(NoReactInternals.truthy);
};
