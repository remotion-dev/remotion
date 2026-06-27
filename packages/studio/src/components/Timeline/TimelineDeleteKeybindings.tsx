import {LINEAR_KEYFRAME_EASING} from '@remotion/studio-shared';
import type React from 'react';
import {useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {useKeybinding} from '../../helpers/use-keybinding';
import {
	EditorShowGuidesContext,
	persistGuidesList,
} from '../../state/editor-guides';
import {useConfirmationDialog} from '../ConfirmationDialog';
import {
	deleteSelectedTimelineItems,
	getTimelineSelectionAfterDeletingItems,
} from './delete-selected-timeline-item';
import {duplicateSelectedTimelineItems} from './duplicate-selected-timeline-item';
import {resetSelectedTimelineProps} from './reset-selected-timeline-props';
import {
	shouldHandleTimelineDuplicateShortcut,
	shouldHandleTimelineSplitShortcut,
	splitSelectedTimelineItems,
} from './split-selected-timeline-item';
import {
	useCurrentTimelineSelectionStateAsRef,
	useTimelineSelection,
} from './TimelineSelection';
import {
	getEasingSelections,
	updateSelectedTimelineEasings,
} from './update-selected-easing';

export const TimelineDeleteKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
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
	const {canSelect} = useTimelineSelection();
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const confirm = useConfirmationDialog();
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const timelinePositionRef = useRef(timelinePosition);
	timelinePositionRef.current = timelinePosition;

	useEffect(() => {
		if (!canSelect || previewServerState.type !== 'connected') {
			return;
		}

		const {clientId} = previewServerState;
		const handleDelete = () => {
			const {selectedItems, clearSelection, selectItems} =
				currentSelection.current;
			const sequences = sequencesRef.current;
			const propStatuses = propStatusesRef.current;
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
			});

			if (deletePromise !== null) {
				deletePromise
					.then((deleted) => {
						if (deleted) {
							const nextSelection = getTimelineSelectionAfterDeletingItems({
								selections: selectedItems,
								sequences,
								overrideIdsToNodePaths: overrideIdToNodePathMappings,
								propStatuses,
								timelinePosition: timelinePositionRef.current,
							});
							if (nextSelection.length === 0) {
								clearSelection();
							} else {
								selectItems(nextSelection);
							}
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
		};

		const backspace = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'Backspace',
			callback: handleDelete,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const deleteKey = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'Delete',
			callback: handleDelete,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const duplicate = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'd',
			callback: (event) => {
				if (!shouldHandleTimelineDuplicateShortcut(event)) {
					return;
				}

				const {selectedItems} = currentSelection.current;
				if (selectedItems.length === 0) {
					return;
				}

				const duplicatePromise = duplicateSelectedTimelineItems({
					selections: selectedItems,
					confirm,
				});

				if (duplicatePromise === null) {
					return;
				}

				duplicatePromise.catch(() => undefined);
			},
			commandCtrlKey: true,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const split = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'd',
			callback: (event) => {
				if (!shouldHandleTimelineSplitShortcut(event)) {
					return;
				}

				const {selectedItems} = currentSelection.current;
				if (selectedItems.length === 0) {
					return;
				}

				const splitPromise = splitSelectedTimelineItems({
					selections: selectedItems,
					sequences: sequencesRef.current,
					overrideIdsToNodePaths: overrideIdToNodePathMappings,
					propStatuses: propStatusesRef.current,
					splitFrame: timelinePositionRef.current,
				});

				if (splitPromise === null) {
					return;
				}

				splitPromise.catch(() => undefined);
			},
			commandCtrlKey: true,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			backspace.unregister();
			deleteKey.unregister();
			duplicate.unregister();
			split.unregister();
		};
	}, [
		canSelect,
		confirm,
		currentSelection,
		keybindings,
		overrideIdToNodePathMappings,
		propStatusesRef,
		previewServerState,
		sequencesRef,
		setGuidesList,
		setPropStatuses,
		timelinePositionRef,
	]);

	return null;
};
