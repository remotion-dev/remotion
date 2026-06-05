import type React from 'react';
import {useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {useKeybinding} from '../../helpers/use-keybinding';
import {useConfirmationDialog} from '../ConfirmationDialog';
import {deleteSelectedTimelineItems} from './delete-selected-timeline-item';
import {duplicateSelectedTimelineItems} from './duplicate-selected-timeline-item';
import {resetSelectedTimelineProps} from './reset-selected-timeline-props';
import {
	useCurrentTimelineSelectionStateAsRef,
	useTimelineSelection,
} from './TimelineSelection';

export const TimelineDeleteKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {sequences} = useContext(Internals.SequenceManager);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {canSelect} = useTimelineSelection();
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const confirm = useConfirmationDialog();

	useEffect(() => {
		if (!canSelect || previewServerState.type !== 'connected') {
			return;
		}

		const {clientId} = previewServerState;
		const backspace = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'Backspace',
			callback: () => {
				const {selectedItems, clearSelection} = currentSelection.current;
				if (selectedItems.length === 0) {
					return;
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

				if (deletePromise === null) {
					return;
				}

				deletePromise
					.then((deleted) => {
						if (deleted) {
							clearSelection();
						}
					})
					.catch(() => undefined);
			},
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const duplicate = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'd',
			callback: () => {
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

		return () => {
			backspace.unregister();
			duplicate.unregister();
		};
	}, [
		canSelect,
		propStatuses,
		confirm,
		currentSelection,
		keybindings,
		overrideIdToNodePathMappings,
		previewServerState,
		sequences,
		setPropStatuses,
	]);

	return null;
};
