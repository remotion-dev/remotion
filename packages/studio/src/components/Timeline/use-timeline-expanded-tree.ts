import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import {useCallback, useContext, useMemo} from 'react';
import {Internals, type InteractivitySchema, type TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {buildTimelineTree} from '../../helpers/timeline-layout';
import {useRuntimeValueSelector} from '../../helpers/use-runtime-values';
import {
	ExpandedTracksGetterContext,
	ExpandedTracksSetterContext,
} from '../ExpandedTracksProvider';
import {getNodeHasKeyframes} from './get-node-keyframes';
import {
	filterTimelineExpandedTree,
	getSelectedTimelineExpandedKeys,
	getSelectedTimelineExpandedRowKeys,
	isTimelineExpandedNodeSelected,
} from './timeline-expanded-filter';
import {
	type TimelineSelection,
	useTimelineSelection,
} from './TimelineSelection';
import {useTimelineStructureSelector} from './use-timeline-structure-selector';

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
	const {rowKeys: selectedRowKeys, sourceKeys: selectedSourceKeys} = useMemo(
		() => getSelectedTimelineExpandedKeys(selectedItems),
		[selectedItems],
	);
	const canHaveExpandableContent = useMemo(() => {
		if (nodePathInfo === null) {
			return false;
		}

		const nodePath = nodePathInfo.sequenceSubscriptionKey;
		const sourceKey = stringifySequenceExpandedRowKey(nodePath);
		if (selectedSourceKeys.has(sourceKey)) {
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
		selectedSourceKeys,
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
				includeInspectorOnlyFields: false,
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

	return useTimelineStructureSelector({
		// Runtime values can change active enum fields, but cannot introduce a
		// selection or keyframes. Most code-animated tracks need no subscription.
		controls: canHaveExpandableContent ? sequence.controls : null,
		selector: selectHasExpandableContent,
		isEqual: null,
	});
};

export const useTimelineExpandedTree = ({
	sequence,
	nodePathInfo,
	includeTextContent,
	includeSourceControls,
	includeInspectorOnlyFields,
}: {
	readonly sequence: TSequence;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly includeTextContent: boolean;
	readonly includeSourceControls: boolean;
	readonly includeInspectorOnlyFields: boolean;
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
	// Runtime values only affect the tree through enum variants and array row
	// heights. Animated field values subscribe in their editors instead.
	const structureKeys = useMemo(() => {
		const keys = new Set<string>();
		const schemas: InteractivitySchema[] = sequence.controls
			? [sequence.controls.schema]
			: [];
		for (const schema of schemas) {
			for (const [key, field] of Object.entries(schema)) {
				if (field.type === 'enum') {
					keys.add(key);
					schemas.push(...Object.values(field.variants));
				} else if (field.type === 'array') {
					keys.add(key);
				}
			}
		}

		return [...keys];
	}, [sequence.controls]);
	const selectStructureValues = useCallback(
		(values: Readonly<Record<string, unknown>>) =>
			Object.fromEntries(structureKeys.map((key) => [key, values[key]])),
		[structureKeys],
	);
	const structureValuesEqual = useCallback(
		(
			previous: Readonly<Record<string, unknown>>,
			next: Readonly<Record<string, unknown>>,
		) =>
			structureKeys.every((key) => {
				const previousValue = previous[key];
				const nextValue = next[key];
				return Array.isArray(previousValue) && Array.isArray(nextValue)
					? previousValue.length === nextValue.length
					: Object.is(previousValue, nextValue);
			}),
		[structureKeys],
	);
	const runtimeValues = useRuntimeValueSelector({
		controls: structureKeys.length > 0 ? sequence.controls : null,
		selector: selectStructureValues,
		isEqual: structureValuesEqual,
	});

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
				includeInspectorOnlyFields,
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
			includeInspectorOnlyFields,
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
		toggleTrack,
		tree,
	};
};
