import type {ContextType} from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import {Internals} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';
import type {createCanvasDragPreview} from '../canvas-drag-preview';
import {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';
import {getTimelineKeyframeDragKey} from './TimelineKeyframeDragState';
import {
	getTimelineSelectionFromNodePathInfo,
	getTimelineSelectionKey,
	type TimelineSelection,
	type useCurrentTimelineSelectionStateAsRef,
} from './TimelineSelection';

export const finishKeyframePreview = ({
	preview,
	reason,
	recoverSelection,
	targets,
	previousSelections,
	expectedSelections,
	currentSelection,
	getSnapshot,
}: {
	readonly preview: ReturnType<typeof createCanvasDragPreview>;
	readonly reason: 'cancel' | 'failure';
	readonly recoverSelection: boolean;
	readonly targets: readonly {
		nodePathInfo: SequenceNodePathInfo;
		displayFrame: number;
		sourceFrame: number;
	}[];
	readonly previousSelections: readonly TimelineSelection[];
	readonly expectedSelections: readonly TimelineSelection[];
	readonly currentSelection: ReturnType<
		typeof useCurrentTimelineSelectionStateAsRef
	>;
	readonly getSnapshot: ContextType<
		typeof Internals.VisualModePropStatusesSubscriptionContext
	>['getSnapshot'];
}) =>
	unstable_batchedUpdates(() => {
		const canRecover = recoverSelection && preview.isLatest();
		const mapInfo = (
			info: SequenceNodePathInfo,
		): SequenceNodePathInfo | null => {
			const nodePath = preview.getNodePath(info.sequenceSubscriptionKey);
			return nodePath === null
				? null
				: {...info, sequenceSubscriptionKey: nodePath};
		};

		const mapSelections = (selections: readonly TimelineSelection[]) =>
			selections.map((selection) => {
				if (!('nodePathInfo' in selection)) return selection;
				const nodePathInfo = mapInfo(selection.nodePathInfo);
				return nodePathInfo === null ? null : {...selection, nodePathInfo};
			});
		const previous = canRecover ? mapSelections(previousSelections) : [];
		const expected = canRecover ? mapSelections(expectedSelections) : [];
		const mappedTargets = canRecover
			? targets.map((target) => {
					const nodePathInfo = mapInfo(target.nodePathInfo);
					return nodePathInfo === null ? null : {...target, nodePathInfo};
				})
			: [];
		if (reason === 'failure') preview.fail();
		else preview.cancel();
		if (
			!canRecover ||
			previous.some((item) => item === null) ||
			expected.some((item) => item === null) ||
			mappedTargets.some((item) => item === null)
		)
			return;
		const current = currentSelection.current.selectedItems;
		const getRecoverySelectionKey = (selection: TimelineSelection) => {
			const key = getTimelineSelectionKey(selection);
			// Easing selection identity follows the segment as it moves, but recovery
			// must distinguish its optimistic endpoints from a newer selection.
			return selection.type === 'easing'
				? JSON.stringify([key, selection.fromFrame, selection.toFrame])
				: key;
		};

		const expectedKeys = new Set(
			expected.filter(Internals.truthy).map(getRecoverySelectionKey),
		);
		if (
			current.length !== expectedKeys.size ||
			current.some((item) => !expectedKeys.has(getRecoverySelectionKey(item)))
		)
			return;
		const framesByField = new Map<string, ReadonlySet<number>>();
		const missing = new Set<string>();
		for (const target of mappedTargets.filter(Internals.truthy)) {
			const rowKey = timelineNodePathInfoToKey(target.nodePathInfo);
			let frames = framesByField.get(rowKey);
			if (!frames) {
				const path = target.nodePathInfo.sequenceSubscriptionKey;
				const status = getSnapshot(
					Internals.makeSequencePropsSubscriptionKey(path),
				);
				const field = parseKeyframeFieldFromNodePath(
					target.nodePathInfo.auxiliaryKeys,
				);
				let source = null;
				if (status?.canUpdate && field !== null) {
					if (field.type === 'sequence')
						source = status.props[field.fieldKey] ?? null;
					else {
						const effect = status.effects[field.effectIndex];
						if (effect?.canUpdate)
							source = effect.props[field.fieldKey] ?? null;
					}
				}

				const evaluated =
					source === null
						? null
						: Internals.evaluateSourcePropStatuses(
								{value: source},
								path.videoConfigValues,
							).value;
				frames = new Set(
					evaluated?.status === 'keyframed'
						? evaluated.keyframes.map((keyframe) => keyframe.frame)
						: [],
				);
				framesByField.set(rowKey, frames);
			}

			if (!frames.has(target.sourceFrame))
				missing.add(
					getTimelineKeyframeDragKey({
						nodePathInfo: target.nodePathInfo,
						frame: target.displayFrame,
					}),
				);
		}

		const originals = previous.filter(Internals.truthy);
		const hasMissingSelection = originals.some((selection) => {
			if (selection.type === 'keyframe')
				return missing.has(getTimelineKeyframeDragKey(selection));
			if (selection.type === 'easing')
				return [selection.fromFrame, selection.toFrame].some((frame) =>
					missing.has(
						getTimelineKeyframeDragKey({
							nodePathInfo: selection.nodePathInfo,
							frame,
						}),
					),
				);
			return false;
		});
		// A prior pending move may also have failed. Select its field rather than
		// guessing which remaining keyframe corresponds to an unsaved position.
		const restored = hasMissingSelection
			? originals
					.map((selection) =>
						selection.type === 'keyframe' || selection.type === 'easing'
							? getTimelineSelectionFromNodePathInfo(selection.nodePathInfo)
							: selection,
					)
					.filter(Internals.truthy)
			: originals;
		const unique = new Map(
			restored.map((selection) => [
				getRecoverySelectionKey(selection),
				selection,
			]),
		);
		if (
			current.length === unique.size &&
			current.every((item) => unique.has(getRecoverySelectionKey(item)))
		)
			return;
		currentSelection.current.selectItems([...unique.values()], {reveal: true});
	});
