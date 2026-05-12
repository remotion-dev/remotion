import {
	getFieldsToShow,
	type CodeValues,
	type DragOverrides,
	type SchemaFieldInfo,
	type SequenceControls,
} from '@remotion/studio-shared';
import type {
	EffectDefinitionAndStack,
	GetCodeValues,
	GetDragOverrides,
	SequenceNodePath,
	TSequence,
} from 'remotion';
import type {GetIsExpanded} from '../components/ExpandedTracksProvider';

export type {CodeValues, DragOverrides, SchemaFieldInfo, SequenceControls};
export {
	SCHEMA_FIELD_ROW_HEIGHT,
	UNSUPPORTED_FIELD_ROW_HEIGHT,
	getFieldsToShow,
} from '@remotion/studio-shared';

export const TIMELINE_PADDING = 16;
export const TIMELINE_BORDER = 1;
export const TIMELINE_ITEM_BORDER_BOTTOM = 1;

export const TIMELINE_TRACK_EXPANDED_HEIGHT = 100;

export const TREE_GROUP_ROW_HEIGHT = 22;
export const EXPANDED_SECTION_PADDING_LEFT = 28;
export const EXPANDED_SECTION_PADDING_RIGHT = 10;

export type EffectSchemaFieldLabel = {
	key: string;
	description: string | undefined;
};

export const getEffectSchemaLabels = (
	effect: EffectDefinitionAndStack<unknown>,
): EffectSchemaFieldLabel[] => {
	if (!effect.definition.schema) {
		return [];
	}

	return Object.entries(effect.definition.schema).map(([key, fieldSchema]) => ({
		key,
		description: fieldSchema.description,
	}));
};

export type TimelineTreeNode =
	| {
			readonly kind: 'group';
			readonly nodePath: SequenceNodePath;
			readonly label: string;
			readonly children: TimelineTreeNode[];
	  }
	| {
			readonly kind: 'field';
			readonly nodePath: SequenceNodePath;
			readonly label: string;
			readonly field: SchemaFieldInfo | null;
	  };

export const buildTimelineTree = ({
	sequence,
	nodePath,
	getDragOverrides,
	getCodeValues,
}: {
	sequence: TSequence;
	nodePath: SequenceNodePath;
	getDragOverrides: GetDragOverrides;
	getCodeValues: GetCodeValues;
}): TimelineTreeNode[] => {
	const roots: TimelineTreeNode[] = [];

	if (sequence.effects.length > 0) {
		roots.push({
			kind: 'group',
			nodePath: [...nodePath, 'effects'],
			label: 'Effects',
			children: sequence.effects.map((effect, i): TimelineTreeNode => {
				const effectNodePath: SequenceNodePath = [...nodePath, 'effects', i];
				return {
					kind: 'group',
					nodePath: effectNodePath,
					label: effect.definition.label,
					children: getEffectSchemaLabels(effect).map(
						(label): TimelineTreeNode => ({
							kind: 'field',
							nodePath: [...effectNodePath, label.key],
							label: label.description ?? label.key,
							field: null,
						}),
					),
				};
			}),
		});
	}

	const controlFields = getFieldsToShow({
		schema: sequence.controls!.schema,
		currentRuntimeValueDotNotation:
			sequence.controls!.currentRuntimeValueDotNotation,
		getDragOverrides,
		getCodeValues,
		nodePath,
	});

	if (controlFields && controlFields.length > 0) {
		for (const f of controlFields) {
			roots.push({
				kind: 'field',
				nodePath: [...nodePath, 'controls', f.key],
				label: f.description ?? f.key,
				field: f,
			});
		}
	}

	return roots;
};

export type FlatTreeRow = {
	readonly node: TimelineTreeNode;
	readonly depth: number;
};

export const flattenVisibleTreeNodes = ({
	nodes,
	getIsExpanded,
	depth = 0,
}: {
	nodes: TimelineTreeNode[];
	getIsExpanded: GetIsExpanded;
	depth?: number;
}): FlatTreeRow[] => {
	const out: FlatTreeRow[] = [];
	for (const node of nodes) {
		out.push({node, depth});
		if (node.kind === 'group' && getIsExpanded(node.nodePath)) {
			out.push(
				...flattenVisibleTreeNodes({
					nodes: node.children,
					getIsExpanded,
					depth: depth + 1,
				}),
			);
		}
	}

	return out;
};

export const getTreeRowHeight = (node: TimelineTreeNode): number => {
	if (node.kind === 'field' && node.field) {
		return node.field.rowHeight;
	}

	return TREE_GROUP_ROW_HEIGHT;
};

export const getExpandedTrackHeight = ({
	sequence,
	nodePath,
	getIsExpanded,
	getDragOverrides,
	getCodeValues,
}: {
	sequence: TSequence;
	nodePath: SequenceNodePath;
	getIsExpanded: GetIsExpanded;
	getDragOverrides: GetDragOverrides;
	getCodeValues: GetCodeValues;
}): number => {
	const tree = buildTimelineTree({
		sequence,
		nodePath,
		getDragOverrides,
		getCodeValues,
	});
	const flat = flattenVisibleTreeNodes({nodes: tree, getIsExpanded});

	if (flat.length === 0) {
		return TIMELINE_TRACK_EXPANDED_HEIGHT;
	}

	const totalRowsHeight = flat.reduce(
		(sum, {node}) => sum + getTreeRowHeight(node),
		0,
	);
	const separators = Math.max(0, flat.length - 1);
	return totalRowsHeight + separators;
};

export const TIMELINE_LAYER_HEIGHT_VIDEO = 75;
export const TIMELINE_LAYER_HEIGHT_IMAGE = 50;
export const TIMELINE_LAYER_HEIGHT_AUDIO = 25;

export const getTimelineLayerHeight = (
	type: 'video' | 'image' | 'audio' | 'sequence' | 'other',
) => {
	if (type === 'video') {
		return TIMELINE_LAYER_HEIGHT_VIDEO;
	}

	if (type === 'image') {
		return TIMELINE_LAYER_HEIGHT_IMAGE;
	}

	return TIMELINE_LAYER_HEIGHT_AUDIO;
};
