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
	const {canSelect, selectedItems, clearSelection} = useTimelineSelection();

	useEffect(() => {
		if (
			!canSelect ||
			previewServerState.type !== 'connected' ||
			selectedItems.length === 0
		) {
			return;
		}

		const {clientId} = previewServerState;
		const currentSelection = selectedItems;
		const backspace = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'Backspace',
			callback: () => {
				const deletePromises = currentSelection
					.map((selection) =>
						deleteSelectedTimelineItem({
							selection,
							sequences,
							overrideIdsToNodePaths: overrideIdToNodePathMappings,
							setCodeValues,
							clientId,
						}),
					)
					.filter((promise): promise is Promise<void> => promise !== null);

				if (deletePromises.length === 0) {
					return;
				}

				clearSelection();
				Promise.all(deletePromises).catch(() => undefined);
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
		selectedItems,
		sequences,
		setCodeValues,
	]);

	return null;
};
