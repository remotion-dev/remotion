import {useCallback, useContext, useMemo} from 'react';
import {Internals, type RuntimeValueStore, type TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {buildTimelineTree} from '../../helpers/timeline-layout';
import {
	useRuntimeValues,
	useRuntimeValueSelector,
	useRuntimeStores,
} from '../../helpers/use-runtime-values';
import {
	ExpandedTracksGetterContext,
	ExpandedTracksSetterContext,
} from '../ExpandedTracksProvider';
import {getNodeHasKeyframes} from './get-node-keyframes';
import {
	filterTimelineExpandedTree,
	getSelectedTimelineExpandedRowKeys,
	isTimelineExpandedNodeSelected,
} from './timeline-expanded-filter';
import {useTimelineSelection} from './TimelineSelection';

const EMPTY_EFFECT_RUNTIME_VALUES: readonly RuntimeValueStore[] = [];

export const useTimelineSequenceHasExpandableContent = ({
	sequence,
	nodePathInfo,
}: {
	readonly sequence: TSequence;
	readonly nodePathInfo: SequenceNodePathInfo;
}) => {
	const {propStatuses: visualModePropStatuses} = useContext(
		Internals.VisualModePropStatusesContext,
	);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {selectedItems} = useTimelineSelection();
	const selectedRowKeys = useMemo(
		() => getSelectedTimelineExpandedRowKeys(selectedItems),
		[selectedItems],
	);
	const selectHasExpandableContent = useCallback(
		(runtimeValues: Readonly<Record<string, unknown>>) => {
			const tree = buildTimelineTree({
				sequence,
				nodePathInfo,
				getDragOverrides,
				getEffectDragOverrides,
				propStatuses: visualModePropStatuses,
				includeTextContent: false,
				includeSourceControls: false,
				runtimeValues,
			});

			return (
				filterTimelineExpandedTree({
					nodes: tree,
					shouldShowNode: (node) =>
						isTimelineExpandedNodeSelected({
							nodePathInfo: node.nodePathInfo,
							selectedRowKeys,
						}) ||
						getNodeHasKeyframes({
							node,
							nodePath: nodePathInfo.sequenceSubscriptionKey,
							propStatuses: visualModePropStatuses,
							getDragOverrides,
							getEffectDragOverrides,
						}),
				}).length > 0
			);
		},
		[
			getDragOverrides,
			getEffectDragOverrides,
			nodePathInfo,
			selectedRowKeys,
			sequence,
			visualModePropStatuses,
		],
	);

	return useRuntimeValueSelector({
		controls: sequence.controls,
		selector: selectHasExpandableContent,
	});
};

export const useTimelineExpandedTree = ({
	sequence,
	nodePathInfo,
	includeTextContent,
	includeSourceControls,
}: {
	readonly sequence: TSequence;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly includeTextContent: boolean;
	readonly includeSourceControls: boolean;
}) => {
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {toggleTrack} = useContext(ExpandedTracksSetterContext);
	const {propStatuses: visualModePropStatuses} = useContext(
		Internals.VisualModePropStatusesContext,
	);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {selectedItems} = useTimelineSelection();
	const runtimeValues = useRuntimeValues(sequence.controls);
	const effectRuntimeValues = useRuntimeStores(
		sequence.effectRuntimeValues ?? EMPTY_EFFECT_RUNTIME_VALUES,
	);

	const tree = useMemo(
		() =>
			buildTimelineTree({
				sequence,
				nodePathInfo,
				getDragOverrides,
				getEffectDragOverrides,
				propStatuses: visualModePropStatuses,
				includeTextContent,
				includeSourceControls,
				runtimeValues,
				effectRuntimeValues,
			}),
		[
			sequence,
			nodePathInfo,
			getDragOverrides,
			getEffectDragOverrides,
			visualModePropStatuses,
			includeTextContent,
			includeSourceControls,
			runtimeValues,
			effectRuntimeValues,
		],
	);
	const selectedRowKeys = useMemo(
		() => getSelectedTimelineExpandedRowKeys(selectedItems),
		[selectedItems],
	);
	const filteredTree = useMemo(
		() =>
			filterTimelineExpandedTree({
				nodes: tree,
				shouldShowNode: (node) =>
					isTimelineExpandedNodeSelected({
						nodePathInfo: node.nodePathInfo,
						selectedRowKeys,
					}) ||
					getNodeHasKeyframes({
						node,
						nodePath: nodePathInfo.sequenceSubscriptionKey,
						propStatuses: visualModePropStatuses,
						getDragOverrides,
						getEffectDragOverrides,
					}),
			}),
		[
			getDragOverrides,
			getEffectDragOverrides,
			nodePathInfo.sequenceSubscriptionKey,
			selectedRowKeys,
			tree,
			visualModePropStatuses,
		],
	);

	return {
		filteredTree,
		getIsExpanded,
		propStatuses: visualModePropStatuses,
		runtimeValues,
		toggleTrack,
		tree,
	};
};
