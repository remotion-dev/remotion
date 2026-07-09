import {
	getEffectFieldsToShow,
	getFieldsToShow,
	type AnySchemaFieldInfo,
	type DragOverrides,
	type EffectSchemaFieldInfo,
	type InteractivitySchemaFieldInfo,
	type SchemaFieldGroup,
	type SchemaFieldGroupInfo,
	type PropStatuses,
	type SchemaFieldInfo,
	type SequenceControls,
	type SaveSequencePropSourceEdit,
} from '@remotion/studio-shared';
import type {
	GetDragOverrides,
	GetEffectDragOverrides,
	InteractivitySchema as InteractivitySchemaShape,
	TSequence,
} from 'remotion';
import type {GetIsExpanded} from '../components/ExpandedTracksProvider';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';

export {
	SCHEMA_FIELD_GROUPS,
	getEffectFieldsToShow,
	getFieldsToShow,
	getSchemaFieldGroup,
	SCHEMA_FIELD_ROW_HEIGHT,
} from '@remotion/studio-shared';
export type {
	AnySchemaFieldInfo,
	DragOverrides,
	EffectSchemaFieldInfo,
	InteractivitySchemaFieldInfo,
	PropStatuses,
	SchemaFieldGroup,
	SchemaFieldGroupInfo,
	SchemaFieldInfo,
	SequenceControls,
};

export const TIMELINE_PADDING = 16;
export const TIMELINE_BORDER = 1;
export const TIMELINE_ITEM_BORDER_BOTTOM = 1;

export const TIMELINE_TRACK_EXPANDED_HEIGHT = 100;

export const TREE_GROUP_ROW_HEIGHT = 22;
export const EXPANDED_SECTION_PADDING_RIGHT = 10;

export type TimelineFieldOnSave = (
	value: unknown,
	options?: {
		// Extra source-code transformation applied atomically with this value save.
		// Used by Google Font selection to insert @remotion/google-fonts imports/loadFont().
		sourceEdit?: SaveSequencePropSourceEdit;
	},
) => Promise<void>;
export type TimelineFieldOnDragValueChange = (value: unknown) => void;

export type TimelineEffectGroupInfo = {
	readonly effectIndex: number;
	readonly effectSchema: InteractivitySchemaShape;
	readonly documentationLink: string | null;
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
	getEffectDragOverrides,
	propStatuses,
	includeTextContent,
}: {
	sequence: TSequence;
	nodePathInfo: SequenceNodePathInfo;
	getDragOverrides: GetDragOverrides;
	getEffectDragOverrides: GetEffectDragOverrides;
	propStatuses: PropStatuses;
	includeTextContent: boolean;
}): TimelineTreeNode[] => {
	const roots: TimelineTreeNode[] = [];
	const {sequenceSubscriptionKey, index, auxiliaryKeys, supportsEffects} =
		nodePathInfo;

	const controlFields = getFieldsToShow({
		schema: sequence.controls!.schema,
		currentRuntimeValueDotNotation:
			sequence.controls!.currentRuntimeValueDotNotation,
		getDragOverrides,
		propStatuses,
		nodePath: sequenceSubscriptionKey,
		includeTextContent,
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
					supportsEffects,
				},
				label: f.description ?? f.key,
				field: f,
			});
		}
	}

	if (sequence.effects.length > 0) {
		roots.push({
			kind: 'group',
			nodePathInfo: {
				sequenceSubscriptionKey,
				auxiliaryKeys: [...auxiliaryKeys, 'effects'],
				index,
				numberOfSequencesWithThisNodePath: 0,
				supportsEffects,
			},
			label: 'Effects',
			effectInfo: null,
			children: sequence.effects.map((effect, i): TimelineTreeNode => {
				const effectFields = getEffectFieldsToShow({
					effect,
					effectIndex: i,
					nodePath: sequenceSubscriptionKey,
					propStatuses,
					getEffectDragOverrides,
				});
				return {
					kind: 'group',
					nodePathInfo: {
						sequenceSubscriptionKey,
						auxiliaryKeys: [...auxiliaryKeys, 'effects', i.toString()],
						index,
						numberOfSequencesWithThisNodePath: 0,
						supportsEffects,
					},
					label: effect.label,
					effectInfo: {
						effectIndex: i,
						effectSchema: effect.schema,
						documentationLink: effect.documentationLink ?? null,
					},
					children: effectFields.map(
						(f): TimelineTreeNode => ({
							kind: 'field',
							nodePathInfo: {
								sequenceSubscriptionKey,
								auxiliaryKeys: [
									...auxiliaryKeys,
									'effects',
									i.toString(),
									f.key,
								],
								index,
								numberOfSequencesWithThisNodePath: 0,
								supportsEffects,
							},
							label: f.description ?? f.key,
							field: f,
						}),
					),
				};
			}),
		});
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
	propStatuses,
}: {
	sequence: TSequence;
	nodePathInfo: SequenceNodePathInfo;
	getIsExpanded: GetIsExpanded;
	propStatuses: PropStatuses;
}): number => {
	const tree = buildTimelineTree({
		sequence,
		nodePathInfo,
		// We assume that no drag overrides can change the timeline layout
		getDragOverrides: () => ({}),
		getEffectDragOverrides: () => ({}),
		propStatuses,
		includeTextContent: false,
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

export const TIMELINE_LAYER_FILMSTRIP_HEIGHT = 26;
// The waveform stripe rendered underneath the filmstrip in TimelineVideoInfo.
export const TIMELINE_VIDEO_INFO_WAVEFORM_HEIGHT = 17;
export const TIMELINE_LAYER_HEIGHT_VIDEO =
	2 + TIMELINE_LAYER_FILMSTRIP_HEIGHT + TIMELINE_VIDEO_INFO_WAVEFORM_HEIGHT;

export const TIMELINE_LAYER_HEIGHT_IMAGE = 26;
export const TIMELINE_LAYER_HEIGHT_AUDIO = 34;
export const TIMELINE_LAYER_HEIGHT_DEFAULT = 21;
// The horizontal row inside a timeline list item (eye + arrow + label).
export const TIMELINE_LIST_ITEM_ROW_HEIGHT = 21;

export const getTimelineLayerHeight = (
	type: 'video' | 'image' | 'audio' | 'sequence' | 'other',
) => {
	if (type === 'video') {
		return TIMELINE_LAYER_HEIGHT_VIDEO;
	}

	if (type === 'image') {
		return TIMELINE_LAYER_HEIGHT_IMAGE;
	}

	if (type === 'audio') {
		return TIMELINE_LAYER_HEIGHT_AUDIO;
	}

	return TIMELINE_LAYER_HEIGHT_DEFAULT;
};
