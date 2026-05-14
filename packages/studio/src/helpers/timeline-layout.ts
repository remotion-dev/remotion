import {
	getEffectFieldsToShow,
	getFieldsToShow,
	type AnySchemaFieldInfo,
	type CodeValues,
	type DragOverrides,
	type EffectSchemaFieldInfo,
	type SchemaFieldInfo,
	type SequenceControls,
	type SequenceSchemaFieldInfo,
} from '@remotion/studio-shared';
import type {GetCodeValues, GetDragOverrides, TSequence} from 'remotion';
import type {GetIsExpanded} from '../components/ExpandedTracksProvider';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';

export type {
	AnySchemaFieldInfo,
	CodeValues,
	DragOverrides,
	EffectSchemaFieldInfo,
	SchemaFieldInfo,
	SequenceControls,
	SequenceSchemaFieldInfo,
};
export {
	SCHEMA_FIELD_ROW_HEIGHT,
	UNSUPPORTED_FIELD_ROW_HEIGHT,
	getEffectFieldsToShow,
	getFieldsToShow,
} from '@remotion/studio-shared';

export const TIMELINE_PADDING = 16;
export const TIMELINE_BORDER = 1;
export const TIMELINE_ITEM_BORDER_BOTTOM = 1;

export const TIMELINE_TRACK_EXPANDED_HEIGHT = 100;

export const TREE_GROUP_ROW_HEIGHT = 22;
export const EXPANDED_SECTION_PADDING_LEFT = 28;
export const EXPANDED_SECTION_PADDING_RIGHT = 10;

export type TimelineFieldOnSave = (value: unknown) => Promise<void>;
export type TimelineFieldOnDragValueChange = (value: unknown) => void;

export type TimelineTreeNode =
	| {
			readonly kind: 'group';
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly label: string;
			readonly children: TimelineTreeNode[];
	  }
	| {
			readonly kind: 'field';
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly label: string;
			readonly field: AnySchemaFieldInfo | null;
	  };

export const buildTimelineTree = ({
	sequence,
	nodePathInfo,
	getDragOverrides,
	getCodeValues,
}: {
	sequence: TSequence;
	nodePathInfo: SequenceNodePathInfo;
	getDragOverrides: GetDragOverrides;
	getCodeValues: GetCodeValues;
}): TimelineTreeNode[] => {
	const roots: TimelineTreeNode[] = [];
	const {nodePath, index} = nodePathInfo;

	if (sequence.effects.length > 0) {
		roots.push({
			kind: 'group',
			nodePathInfo: {
				nodePath: [...nodePath, 'effects'],
				index,
				numberOfSequencesWithThisNodePath: 0,
			},
			label: 'Effects',
			children: sequence.effects.map((effect, i): TimelineTreeNode => {
				const effectNodePath = [...nodePath, 'effects', i];
				const effectFields = getEffectFieldsToShow(effect);
				return {
					kind: 'group',
					nodePathInfo: {
						nodePath: effectNodePath,
						index,
						numberOfSequencesWithThisNodePath: 0,
					},
					label: effect.definition.label,
					children: effectFields.map(
						(f): TimelineTreeNode => ({
							kind: 'field',
							nodePathInfo: {
								nodePath: [...effectNodePath, f.key],
								index,
								numberOfSequencesWithThisNodePath: 0,
							},
							label: f.description ?? f.key,
							field: f,
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
				nodePathInfo: {
					nodePath: [...nodePath, 'controls', f.key],
					index,
					numberOfSequencesWithThisNodePath: 0,
				},
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
		if (node.kind === 'group' && getIsExpanded(node.nodePathInfo)) {
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
	nodePathInfo,
	getIsExpanded,
	getCodeValues,
}: {
	sequence: TSequence;
	nodePathInfo: SequenceNodePathInfo;
	getIsExpanded: GetIsExpanded;
	getCodeValues: GetCodeValues;
}): number => {
	const tree = buildTimelineTree({
		sequence,
		nodePathInfo,
		// We assume that no drag overrides can change the timeline layout
		getDragOverrides: () => ({}),
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
