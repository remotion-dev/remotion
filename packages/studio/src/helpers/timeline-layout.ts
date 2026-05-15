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
import type {
	GetDragOverrides,
	SequenceSchema as SequenceSchemaShape,
	TSequence,
} from 'remotion';
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

export type TimelineEffectGroupInfo = {
	readonly effectIndex: number;
	readonly effectSchema: SequenceSchemaShape;
};

export type TimelineTreeNode =
	| {
			readonly kind: 'group';
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly label: string;
			readonly children: TimelineTreeNode[];
			// Present when this group represents a single effect (not the outer
			// "Effects" container). Lets the row component render the eye toggle and
			// wire `disabled` saves without re-deriving the effect index.
			readonly effectInfo: TimelineEffectGroupInfo | null;
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
	codeValues,
}: {
	sequence: TSequence;
	nodePathInfo: SequenceNodePathInfo;
	getDragOverrides: GetDragOverrides;
	codeValues: CodeValues;
}): TimelineTreeNode[] => {
	const roots: TimelineTreeNode[] = [];
	const {sequenceSubscriptionKey, index, auxiliaryKeys} = nodePathInfo;

	if (sequence.effects.length > 0) {
		roots.push({
			kind: 'group',
			nodePathInfo: {
				sequenceSubscriptionKey,
				auxiliaryKeys: [...auxiliaryKeys, 'effects'],
				index,
				numberOfSequencesWithThisNodePath: 0,
			},
			label: 'Effects',
			effectInfo: null,
			children: sequence.effects.map((effect, i): TimelineTreeNode => {
				const effectFields = getEffectFieldsToShow(effect, i);
				return {
					kind: 'group',
					nodePathInfo: {
						sequenceSubscriptionKey,
						auxiliaryKeys: [...auxiliaryKeys, 'effects', i.toString()],
						index,
						numberOfSequencesWithThisNodePath: 0,
					},
					label: effect.label,
					effectInfo: effect.schema
						? {effectIndex: i, effectSchema: effect.schema}
						: null,
					children: effectFields.map(
						(f): TimelineTreeNode => ({
							kind: 'field',
							nodePathInfo: {
								sequenceSubscriptionKey,
								auxiliaryKeys: [...auxiliaryKeys, f.key],
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
		codeValues,
		nodePath: sequenceSubscriptionKey,
	});

	if (controlFields && controlFields.length > 0) {
		for (const f of controlFields) {
			roots.push({
				kind: 'field',
				nodePathInfo: {
					sequenceSubscriptionKey,
					auxiliaryKeys: [...auxiliaryKeys, 'controls', f.key],
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
	codeValues,
}: {
	sequence: TSequence;
	nodePathInfo: SequenceNodePathInfo;
	getIsExpanded: GetIsExpanded;
	codeValues: CodeValues;
}): number => {
	const tree = buildTimelineTree({
		sequence,
		nodePathInfo,
		// We assume that no drag overrides can change the timeline layout
		getDragOverrides: () => ({}),
		codeValues,
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
