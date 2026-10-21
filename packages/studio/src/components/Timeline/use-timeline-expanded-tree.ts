import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import {useCallback, useContext, useMemo} from 'react';
import {Internals, type TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {buildTimelineTree} from '../../helpers/timeline-layout';
import {
	useRuntimeValues,
	useRuntimeValueSelector,
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
import {
	type TimelineSelection,
	useTimelineSelection,
} from './TimelineSelection';

export const useTimelineSequenceHasExpandableContent = ({
	sequence,
	nodePathInfo,
	selectedItems,
}: {
	readonly sequence: TSequence;
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly selectedItems: readonly TimelineSelection[];
}) => {
	const {propStatuses: visualModePropStatuses} = useContext(
		Internals.VisualModePropStatusesContext,
	);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const selectedRowKeys = useMemo(
		() => getSelectedTimelineExpandedRowKeys(selectedItems),
		[selectedItems],
	);
	const canHaveExpandableContent = useMemo(() => {
		if (nodePathInfo === null) {
			return false;
		}

		const nodePath = nodePathInfo.sequenceSubscriptionKey;
		const sourceKey = stringifySequenceExpandedRowKey(nodePath);
		if (
			selectedItems.some(
				(item) =>
					item.type !== 'guide' &&
					stringifySequenceExpandedRowKey(
						item.nodePathInfo.sequenceSubscriptionKey,
					) === sourceKey,
			)
		) {
			return true;
		}

		if (
			Object.values(
				Internals.getPropStatusesCtx(visualModePropStatuses, nodePath) ?? {},
			).some((status) => status.status === 'keyframed') ||
			Object.values(getDragOverrides(nodePath)).some(
				(override) => override.type === 'keyframed',
			)
		) {
			return true;
		}

		return sequence.effects.some((_, effectIndex) => {
			const status = Internals.getEffectPropStatusesCtx({
				propStatuses: visualModePropStatuses,
				nodePath,
				effectIndex,
			});
			return (
				(status.type === 'can-update-effect' &&
					Object.values(status.props).some(
						(prop) => prop.status === 'keyframed',
					)) ||
				Object.values(getEffectDragOverrides(nodePath, effectIndex)).some(
					(override) => override.type === 'keyframed',
				)
			);
		});
	}, [
		getDragOverrides,
		getEffectDragOverrides,
		nodePathInfo,
		selectedItems,
		sequence.effects,
		visualModePropStatuses,
	]);
	const selectHasExpandableContent = useCallback(
		(runtimeValues: Readonly<Record<string, unknown>>) => {
			if (!canHaveExpandableContent || nodePathInfo === null) {
				return false;
			}

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
			canHaveExpandableContent,
			getDragOverrides,
			getEffectDragOverrides,
			nodePathInfo,
			selectedRowKeys,
			sequence,
			visualModePropStatuses,
		],
	);

	return useRuntimeValueSelector({
		// Runtime values can change active enum fields, but cannot introduce a
		// selection or keyframes. Most code-animated tracks need no subscription.
		controls: canHaveExpandableContent ? sequence.controls : null,
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
