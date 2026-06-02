import {
	parseEffectClipboardData,
	type EffectClipboardData,
	type EffectClipboardSource,
} from '@remotion/studio-shared';
import type React from 'react';
import {useContext, useEffect} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {useKeybinding} from '../../helpers/use-keybinding';
import {callApi} from '../call-api';
import {showNotification} from '../Notifications/NotificationCenter';
import {
	useCurrentTimelineSelectionStateAsRef,
	useTimelineSelection,
	type TimelineSelection,
} from './TimelineSelection';

const makeClipboardText = (payload: EffectClipboardData) =>
	JSON.stringify(payload);

const makeTargetKey = (nodePath: SequencePropsSubscriptionKey): string => {
	return JSON.stringify({
		absolutePath: nodePath.absolutePath,
		nodePath: nodePath.nodePath,
		sequenceKeys: nodePath.sequenceKeys,
		effectKeys: nodePath.effectKeys,
	});
};

const sourceFromSelection = (
	selection: TimelineSelection,
): EffectClipboardSource | null => {
	if (selection.type === 'sequence-effect') {
		const {sequenceSubscriptionKey} = selection.nodePathInfo;
		return {
			type: 'single-effect',
			fileName: sequenceSubscriptionKey.absolutePath,
			sequenceNodePath: sequenceSubscriptionKey,
			effectIndex: selection.i,
		};
	}

	if (selection.type === 'sequence-all-effects') {
		const {sequenceSubscriptionKey} = selection.nodePathInfo;
		return {
			type: 'all-effects',
			fileName: sequenceSubscriptionKey.absolutePath,
			sequenceNodePath: sequenceSubscriptionKey,
		};
	}

	return null;
};

const getTargetSequenceNodePath = (
	selection: TimelineSelection,
): SequencePropsSubscriptionKey | null => {
	if (
		selection.type === 'sequence' ||
		selection.type === 'sequence-effect' ||
		selection.type === 'sequence-all-effects'
	) {
		return selection.nodePathInfo.sequenceSubscriptionKey;
	}

	return null;
};

export const TimelineClipboardKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {canSelect} = useTimelineSelection();
	const currentSelection = useCurrentTimelineSelectionStateAsRef();

	useEffect(() => {
		if (!canSelect || previewServerState.type !== 'connected') {
			return;
		}

		const {clientId} = previewServerState;

		const copy = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'c',
			callback: (e) => {
				const {selectedItems} = currentSelection.current;
				if (selectedItems.length === 0) {
					return;
				}

				const sources = selectedItems.map(sourceFromSelection);
				if (sources.some((source) => source === null)) {
					return;
				}

				const firstSelection = selectedItems[0];
				const type =
					firstSelection?.type === 'sequence-effect'
						? 'effects-additive'
						: firstSelection?.type === 'sequence-all-effects'
							? 'effects-replacing'
							: null;

				if (type === null) {
					return;
				}

				e.preventDefault();
				navigator.clipboard
					.writeText(
						makeClipboardText({
							type,
							version: 1,
							remotionClipboard: 'effects',
							sources: sources as EffectClipboardSource[],
						}),
					)
					.then(() => {
						showNotification(
							sources.length === 1
								? 'Copied effect to clipboard'
								: 'Copied effects to clipboard',
							1000,
						);
					})
					.catch((err) => {
						showNotification(
							`Could not copy effects: ${(err as Error).message}`,
							2000,
						);
					});
			},
			commandCtrlKey: true,
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const paste = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'v',
			callback: (e) => {
				const {selectedItems} = currentSelection.current;
				if (selectedItems.length === 0) {
					return;
				}

				navigator.clipboard
					.readText()
					.then((text) => {
						const payload = parseEffectClipboardData(text);
						if (payload === null) {
							return;
						}

						e.preventDefault();

						const targetNodePaths = selectedItems
							.map(getTargetSequenceNodePath)
							.filter(
								(nodePath): nodePath is SequencePropsSubscriptionKey =>
									nodePath !== null,
							);
						const uniqueTargetKeys = new Set(
							targetNodePaths.map(makeTargetKey),
						);

						if (uniqueTargetKeys.size !== 1) {
							showNotification(
								'Select one target sequence to paste effects',
								3000,
							);
							return;
						}

						const [targetSequenceNodePath] = targetNodePaths;
						if (!targetSequenceNodePath) {
							showNotification('Select a sequence to paste effects onto', 3000);
							return;
						}

						return callApi('/api/paste-effects', {
							targetFileName: targetSequenceNodePath.absolutePath,
							targetSequenceNodePath,
							type: payload.type,
							sources: payload.sources,
							clientId,
						}).then((result) => {
							if (result.success) {
								showNotification('Pasted effects', 2000);
							} else {
								showNotification(result.reason, 4000);
							}
						});
					})
					.catch((err) => {
						showNotification(
							`Could not paste effects: ${(err as Error).message}`,
							3000,
						);
					});
			},
			commandCtrlKey: true,
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			copy.unregister();
			paste.unregister();
		};
	}, [canSelect, currentSelection, keybindings, previewServerState]);

	return null;
};
