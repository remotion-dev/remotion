import {LINEAR_KEYFRAME_EASING} from '@remotion/studio-shared';
import {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {useTimelineCalculator} from '../../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	EditorShowGuidesContext,
	persistGuidesList,
} from '../../state/editor-guides';
import {useConfirmationDialog} from '../ConfirmationDialog';
import {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
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
	const calculateTimeline = useTimelineCalculator();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const overrideIdToNodePathMappingsRef = useContext(
		OverrideIdToNodePathMappingsRefContext,
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

			const {tracks} = calculateTimeline({
				sequences: sequencesRef.current,
				overrideIdsToNodePaths: overrideIdToNodePathMappingsRef.current,
			});
			const deletePromise = deleteSelectedTimelineItems({
				selections: selectedItems,
				tracks,
				setPropStatuses,
				clientId,
				confirm,
				propStatuses,
				timelinePosition,
			});

			if (deletePromise !== null) {
				const updateSelectionAfterDeletion = () => {
					const nextSelection = getTimelineSelectionAfterDeletingItems({
						selections: selectedItems,
					});
					if (nextSelection.length === 0) {
						clearSelection();
					} else {
						selectItems(nextSelection);
					}
				};

				if (selectedItems.some((item) => item.type === 'keyframe')) {
					// Keyframes are removed optimistically. Update selection in the same
					// event so easing segments cannot inherit the deleted segments' indices.
					updateSelectionAfterDeletion();
					deletePromise.catch(() => undefined);
				} else {
					deletePromise
						.then((deleted) => {
							if (deleted) {
								updateSelectionAfterDeletion();
							}
						})
						.catch(() => undefined);
				}

				return;
			}

			const easingSelections = getEasingSelections(selectedItems);
			if (easingSelections.length === selectedItems.length) {
				const resetEasingPromise = updateSelectedTimelineEasings({
					selections: easingSelections,
					tracks,
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
				tracks,
				propStatuses,
				setPropStatuses,
				clientId,
			});

			if (resetPromise !== null) {
				resetPromise.catch(() => undefined);
			}
		},
		[
			calculateTimeline,
			confirm,
			currentSelection,
			overrideIdToNodePathMappingsRef,
			previewServerState,
			propStatusesRef,
			sequencesRef,
			setGuidesList,
			setPropStatuses,
		],
	);
};
