import type React from 'react';
import {useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {useKeybinding} from '../../helpers/use-keybinding';
import {useConfirmationDialog} from '../ConfirmationDialog';
import {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
import {duplicateSelectedTimelineItems} from './duplicate-selected-timeline-item';
import {getCurrentFrame} from './imperative-state';
import {splitSelectedTimelineItems} from './split-selected-timeline-item';
import {
	useCurrentTimelineSelectionStateAsRef,
	useTimelineSelection,
} from './TimelineSelection';
import {useDeleteTimelineItems} from './use-delete-timeline-items';

export const TimelineDeleteKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const overrideIdToNodePathMappingsRef = useContext(
		OverrideIdToNodePathMappingsRefContext,
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

		const deleteKey = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'deleteSelection',
			callback: () => deleteTimelineItems(null),
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const duplicate = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'duplicateSequences',
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
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const split = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'splitSequences',
			callback: () => {
				const {selectedItems} = currentSelection.current;
				if (selectedItems.length === 0) {
					return;
				}

				const splitPromise = splitSelectedTimelineItems({
					selections: selectedItems,
					sequences: sequencesRef.current,
					overrideIdsToNodePaths: overrideIdToNodePathMappingsRef.current,
					propStatuses: propStatusesRef.current,
					splitFrame: getCurrentFrame(),
				});

				if (splitPromise === null) {
					return;
				}

				splitPromise.catch(() => undefined);
			},
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
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
		overrideIdToNodePathMappingsRef,
		propStatusesRef,
		previewServerState,
		sequencesRef,
	]);

	return null;
};
