import type {
	ArrayFieldSchema,
	DragOverrides,
	EffectDefinition,
	GetDragOverrides,
	GetEffectDragOverrides,
	InteractivitySchema,
	PropStatuses,
	SequenceControls,
	SequencePropsSubscriptionKey,
	VisibleFieldSchema,
} from 'remotion';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';

export type {DragOverrides, PropStatuses, SequenceControls};

export type SchemaFieldInfo = {
	key: string;
	description: string | undefined;
	typeName: SupportedSchemaType;
	rowHeight: number;
	fieldSchema: VisibleFieldSchema;
	group: SchemaFieldGroup;
};

export type InteractivitySchemaFieldInfo = SchemaFieldInfo & {
	readonly kind: 'sequence-field';
};

export type EffectSchemaFieldInfo = SchemaFieldInfo & {
	readonly kind: 'effect-field';
	readonly effectIndex: number;
	readonly effectSchema: InteractivitySchema;
};

export type AnySchemaFieldInfo =
	| InteractivitySchemaFieldInfo
	| EffectSchemaFieldInfo;

export const SCHEMA_FIELD_ROW_HEIGHT = 22;

export type SchemaFieldGroup = 'controls' | 'transforms' | 'text';

export type SchemaFieldGroupInfo = {
	readonly id: SchemaFieldGroup;
	readonly label: string;
};

export const SCHEMA_FIELD_GROUPS = [
	{id: 'controls', label: 'Controls'},
	{id: 'transforms', label: 'Transform'},
	{id: 'text', label: 'Text'},
] as const satisfies readonly SchemaFieldGroupInfo[];

const schemaFieldGroupOrder = SCHEMA_FIELD_GROUPS.reduce(
	(acc, group, index) => {
		acc[group.id] = index;
		return acc;
	},
	{} as Record<SchemaFieldGroup, number>,
);

const TRANSFORM_FIELD_KEYS = new Set([
	'style.transformOrigin',
	'style.translate',
	'style.scale',
	'style.rotate',
	'style.opacity',
]);

const TEXT_FIELD_KEYS = new Set([
	'children',
	'style.color',
	'style.fontFamily',
	'style.fontSize',
	'style.lineHeight',
	'style.fontWeight',
	'style.fontStyle',
	'style.letterSpacing',
	'style.textAlign',
]);

export const getSchemaFieldGroup = (key: string): SchemaFieldGroup => {
	if (TRANSFORM_FIELD_KEYS.has(key)) {
		return 'transforms';
	}

	if (TEXT_FIELD_KEYS.has(key)) {
		return 'text';
	}

	return 'controls';
};

const sortSchemaFields = <T extends SchemaFieldInfo>(fields: T[]): T[] => {
	return fields
		.map((field, index) => ({field, index}))
		.sort((a, b) => {
			const groupDiff =
				schemaFieldGroupOrder[a.field.group] -
				schemaFieldGroupOrder[b.field.group];
			return groupDiff === 0 ? a.index - b.index : groupDiff;
		})
		.map(({field}) => field);
};

const SUPPORTED_SCHEMA_TYPES = [
	'number',
	'boolean',
	'rotation-css',
	'rotation-degrees',
	'translate',
	'transform-origin',
	'scale',
	'uv-coordinate',
	'color',
	'text-content',
	'font-family',
	'array',
	'enum',
	'hidden',
] as const;

type SupportedSchemaType = (typeof SUPPORTED_SCHEMA_TYPES)[number];

const getArrayRowCount = ({
	fieldSchema,
	value,
}: {
	fieldSchema: ArrayFieldSchema;
	value: unknown;
}): number => {
	const items = Array.isArray(value)
		? value
		: Array.isArray(fieldSchema.default)
			? fieldSchema.default
			: Array.from({length: fieldSchema.minLength ?? 0});
	const canAdd = items.length < (fieldSchema.maxLength ?? Infinity);

	return Math.max(1, items.length + (canAdd ? 1 : 0));
};

const getSchemaFieldRowHeight = ({
	fieldSchema,
	value,
}: {
	fieldSchema: VisibleFieldSchema;
	value: unknown;
}) => {
	if (fieldSchema.type === 'array') {
		return (
			getArrayRowCount({
				fieldSchema,
				value,
			}) * SCHEMA_FIELD_ROW_HEIGHT
		);
	}

	if (fieldSchema.type === 'text-content') {
		return SCHEMA_FIELD_ROW_HEIGHT * 2;
	}

	return SCHEMA_FIELD_ROW_HEIGHT;
};

const getEffectFieldValue = ({
	key,
	dragOverrides,
	effectStatus,
}: {
	key: string;
	dragOverrides: DragOverrides[string];
	effectStatus: ReturnType<typeof Internals.getEffectPropStatusesCtx> | null;
}): unknown => {
	const dragOverride = Internals.getStaticDragOverrideValue(dragOverrides[key]);
	if (dragOverride !== undefined) {
		return dragOverride;
	}

	if (effectStatus?.type !== 'can-update-effect') {
		return undefined;
	}

	const propStatus = effectStatus.props[key];
	if (propStatus?.status !== 'static') {
		return undefined;
	}

	return propStatus.codeValue;
};

export const getFieldsToShow = ({
	getDragOverrides,
	propStatuses,
	nodePath,
	schema,
	currentRuntimeValueDotNotation,
	includeTextContent,
}: {
	schema: InteractivitySchema;
	currentRuntimeValueDotNotation: Record<string, unknown>;
	getDragOverrides: GetDragOverrides;
	propStatuses: PropStatuses;
	nodePath: SequencePropsSubscriptionKey;
	includeTextContent?: boolean;
}): InteractivitySchemaFieldInfo[] | null => {
	const {merged: valuesDotNotation} =
		Internals.computeEffectiveSchemaValuesDotNotation({
			schema,
			currentValue: currentRuntimeValueDotNotation,
			overrideValues: getDragOverrides(nodePath),
			propStatus: Internals.getPropStatusesCtx(propStatuses, nodePath),
			frame: null,
		});
	const activeSchema = Internals.flattenActiveSchema(
		schema,
		(key) => valuesDotNotation[key],
	);

	const fields = Object.entries(activeSchema)
		.map(([key, fieldSchema]): InteractivitySchemaFieldInfo | null => {
			const typeName = fieldSchema.type;
			if (SUPPORTED_SCHEMA_TYPES.indexOf(typeName) === -1) {
				throw new Error(`Unsupported field type: ${typeName}`);
			}

			if (typeName === 'hidden') {
				return null;
			}

			if (fieldSchema.type === 'number' && fieldSchema.hiddenFromList) {
				return null;
			}

			if (fieldSchema.type === 'text-content' && !includeTextContent) {
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
				rowHeight: getSchemaFieldRowHeight({
					fieldSchema,
					value: valuesDotNotation[key],
				}),
				fieldSchema,
				group: getSchemaFieldGroup(key),
			};
		})
		.filter(NoReactInternals.truthy);

	return sortSchemaFields(fields);
};

export const getEffectFieldsToShow = ({
	effect,
	effectIndex,
	nodePath,
	propStatuses,
	getEffectDragOverrides,
}: {
	effect: EffectDefinition<unknown>;
	effectIndex: number;
	nodePath: SequencePropsSubscriptionKey | null;
	propStatuses: PropStatuses;
	getEffectDragOverrides: GetEffectDragOverrides;
}): EffectSchemaFieldInfo[] => {
	const effectStatus =
		nodePath === null
			? null
			: Internals.getEffectPropStatusesCtx({
					propStatuses,
					nodePath,
					effectIndex,
				});
	const dragOverrides =
		nodePath === null ? {} : getEffectDragOverrides(nodePath, effectIndex);
	const activeSchema = Internals.flattenActiveSchema(effect.schema, (key) => {
		return getEffectFieldValue({key, dragOverrides, effectStatus});
	});

	const fields = Object.entries(activeSchema)
		.map(([key, fieldSchema]): EffectSchemaFieldInfo | null => {
			const typeName = fieldSchema.type;
			if (typeName === 'hidden') {
				return null;
			}

			if (fieldSchema.type === 'number' && fieldSchema.hiddenFromList) {
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
				rowHeight: getSchemaFieldRowHeight({
					fieldSchema,
					value: getEffectFieldValue({key, dragOverrides, effectStatus}),
				}),
				fieldSchema,
				effectSchema: effect.schema,
				effectIndex,
				group: getSchemaFieldGroup(key),
			};
		})
		.filter(NoReactInternals.truthy);

	return sortSchemaFields(fields);
};
