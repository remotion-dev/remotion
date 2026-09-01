import type React from 'react';
import {useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {useKeybinding} from '../../helpers/use-keybinding';
import {useConfirmationDialog} from '../ConfirmationDialog';
import {duplicateSelectedTimelineItems} from './duplicate-selected-timeline-item';
import {getCurrentFrame} from './imperative-state';
import {
	shouldHandleTimelineDuplicateShortcut,
	shouldHandleTimelineSplitShortcut,
	splitSelectedTimelineItems,
} from './split-selected-timeline-item';
import {
	useCurrentTimelineSelectionStateAsRef,
	useTimelineSelection,
} from './TimelineSelection';
import {useDeleteTimelineItems} from './use-delete-timeline-items';

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
	const {canSelect} = useTimelineSelection();
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const confirm = useConfirmationDialog();
	const deleteTimelineItems = useDeleteTimelineItems();
	useEffect(() => {
		if (!canSelect || previewServerState.type !== 'connected') {
			return;
		}

		const backspace = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'Backspace',
			callback: () => deleteTimelineItems(null),
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const deleteKey = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'Delete',
			callback: () => deleteTimelineItems(null),
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
					splitFrame: getCurrentFrame(),
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
		deleteTimelineItems,
		keybindings,
		overrideIdToNodePathMappings,
		propStatusesRef,
		previewServerState,
		sequencesRef,
	]);

	return null;
};
