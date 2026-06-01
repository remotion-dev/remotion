import type React from 'react';
import {useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {useKeybinding} from '../../helpers/use-keybinding';
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
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);
	const {setCodeValues} = useContext(Internals.VisualModeSettersContext);
	const {canSelect} = useTimelineSelection();
	const currentSelection = useCurrentTimelineSelectionStateAsRef();

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
					codeValues,
					setCodeValues,
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
					setCodeValues,
					clientId,
				});

				if (deletePromise === null) {
					return;
				}

				clearSelection();
				deletePromise.catch(() => undefined);
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
		codeValues,
		currentSelection,
		keybindings,
		overrideIdToNodePathMappings,
		previewServerState,
		sequences,
		setCodeValues,
	]);

	return null;
};
