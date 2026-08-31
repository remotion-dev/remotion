import {LINEAR_KEYFRAME_EASING} from '@remotion/studio-shared';
import {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	EditorShowGuidesContext,
	persistGuidesList,
} from '../../state/editor-guides';
import {useConfirmationDialog} from '../ConfirmationDialog';
import {
	deleteSelectedTimelineItems,
	getTimelineSelectionAfterDeletingItems,
} from './delete-selected-timeline-item';
import {getCurrentFrame} from './imperative-state';
import {resetSelectedTimelineProps} from './reset-selected-timeline-props';
import {
	type TimelineSelection,
	useCurrentTimelineSelectionStateAsRef,
} from './TimelineSelection';
import {
	getEasingSelections,
	updateSelectedTimelineEasings,
} from './update-selected-easing';

export const useDeleteTimelineItems = () => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {setGuidesList} = useContext(EditorShowGuidesContext);
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const confirm = useConfirmationDialog();

	return useCallback(
		(selectedItemsOverride: readonly TimelineSelection[] | null) => {
			if (previewServerState.type !== 'connected') {
				return;
			}

			const {clientId} = previewServerState;
			const {
				selectedItems: currentSelectedItems,
				clearSelection,
				selectItems,
			} = currentSelection.current;
			const selectedItems = selectedItemsOverride ?? currentSelectedItems;
			const sequences = sequencesRef.current;
			const propStatuses = propStatusesRef.current;
			const timelinePosition = getCurrentFrame();
			if (selectedItems.length === 0) {
				return;
			}

			const selectedGuide = selectedItems.find((item) => item.type === 'guide');
			if (selectedGuide) {
				setGuidesList((prevGuides) => {
					const newGuides = prevGuides.filter(
						(guide) => guide.id !== selectedGuide.guideId,
					);
					persistGuidesList(newGuides);
					return newGuides;
				});
				clearSelection();
				return;
			}

			const deletePromise = deleteSelectedTimelineItems({
				selections: selectedItems,
				sequences,
				overrideIdsToNodePaths: overrideIdToNodePathMappings,
				setPropStatuses,
				clientId,
				confirm,
				propStatuses,
				timelinePosition,
			});

			if (deletePromise !== null) {
				deletePromise
					.then((deleted) => {
						if (!deleted) {
							return;
						}

						const nextSelection = getTimelineSelectionAfterDeletingItems({
							selections: selectedItems,
							sequences,
							overrideIdsToNodePaths: overrideIdToNodePathMappings,
							propStatuses,
							timelinePosition,
						});
						if (nextSelection.length === 0) {
							clearSelection();
						} else {
							selectItems(nextSelection);
						}
					})
					.catch(() => undefined);
				return;
			}

			const easingSelections = getEasingSelections(selectedItems);
			if (easingSelections.length === selectedItems.length) {
				const resetEasingPromise = updateSelectedTimelineEasings({
					selections: easingSelections,
					sequences,
					overrideIdsToNodePaths: overrideIdToNodePathMappings,
					propStatuses,
					setPropStatuses,
					clientId,
					easing: LINEAR_KEYFRAME_EASING,
				});

				if (resetEasingPromise !== null) {
					resetEasingPromise.catch(() => undefined);
					return;
				}
			}

			const resetPromise = resetSelectedTimelineProps({
				selections: selectedItems,
				sequences,
				overrideIdsToNodePaths: overrideIdToNodePathMappings,
				propStatuses,
				setPropStatuses,
				clientId,
			});

			if (resetPromise !== null) {
				resetPromise.catch(() => undefined);
			}
		},
		[
			confirm,
			currentSelection,
			overrideIdToNodePathMappings,
			previewServerState,
			propStatusesRef,
			sequencesRef,
			setGuidesList,
			setPropStatuses,
		],
	);
};
