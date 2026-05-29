import type React from 'react';
import {useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {useKeybinding} from '../../helpers/use-keybinding';
import {deleteSelectedTimelineItem} from './delete-selected-timeline-item';
import {useTimelineSelection} from './TimelineSelection';

export const TimelineDeleteKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {sequences} = useContext(Internals.SequenceManager);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {setCodeValues} = useContext(Internals.VisualModeSettersContext);
	const {canSelect, selectedItem, clearSelection} = useTimelineSelection();

	useEffect(() => {
		if (
			!canSelect ||
			previewServerState.type !== 'connected' ||
			!selectedItem
		) {
			return;
		}

		const {clientId} = previewServerState;
		const currentSelection = selectedItem;
		const backspace = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'Backspace',
			callback: () => {
				const deletePromise = deleteSelectedTimelineItem({
					selection: currentSelection,
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

		return () => {
			backspace.unregister();
		};
	}, [
		canSelect,
		clearSelection,
		keybindings,
		overrideIdToNodePathMappings,
		previewServerState,
		selectedItem,
		sequences,
		setCodeValues,
	]);

	return null;
};
