import {
	parseEffectClipboardData,
	type EffectClipboardData,
	type EffectClipboardPasteType,
	type EffectClipboardSnapshot,
} from '@remotion/studio-shared';
import type React from 'react';
import {useContext, useEffect} from 'react';
import {Internals, type SequencePropsSubscriptionKey} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
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
	});
};

export type PasteEffectsTarget =
	| {
			readonly type: 'valid';
			readonly nodePathInfo: SequenceNodePathInfo;
	  }
	| {
			readonly type: 'none';
	  }
	| {
			readonly type: 'multiple';
	  }
	| {
			readonly type: 'unsupported';
	  };

const getTargetSequenceNodePathInfo = (
	selection: TimelineSelection,
): SequenceNodePathInfo | null => {
	if (
		selection.type === 'sequence' ||
		selection.type === 'sequence-effect' ||
		selection.type === 'sequence-all-effects'
	) {
		return selection.nodePathInfo;
	}

	return null;
};

const getCopyType = (
	selection: TimelineSelection,
): EffectClipboardPasteType | null => {
	if (selection.type === 'sequence-effect') {
		return 'effects-additive';
	}

	if (selection.type === 'sequence-all-effects') {
		return 'effects-replacing';
	}

	return null;
};

export const getPasteEffectsTarget = (
	selectedItems: readonly TimelineSelection[],
): PasteEffectsTarget => {
	const targetNodePathInfos = selectedItems
		.map(getTargetSequenceNodePathInfo)
		.filter(
			(targetNodePathInfo): targetNodePathInfo is SequenceNodePathInfo =>
				targetNodePathInfo !== null,
		);
	const uniqueTargetKeys = new Set(
		targetNodePathInfos.map((targetNodePathInfo) =>
			makeTargetKey(targetNodePathInfo.sequenceSubscriptionKey),
		),
	);

	if (uniqueTargetKeys.size === 0) {
		return {type: 'none'};
	}

	if (uniqueTargetKeys.size !== 1) {
		return {type: 'multiple'};
	}

	const [nodePathInfo] = targetNodePathInfos;
	if (!nodePathInfo) {
		return {type: 'none'};
	}

	if (!nodePathInfo.supportsEffects) {
		return {type: 'unsupported'};
	}

	return {
		type: 'valid',
		nodePathInfo,
	};
};

type CopyableEffectStatus = {
	readonly canUpdate: true;
	readonly callee: string;
	readonly importPath: string | null;
	readonly props: Record<
		string,
		| {
				readonly canUpdate: true;
				readonly codeValue?: unknown;
		  }
		| {
				readonly canUpdate: false;
		  }
	>;
};

const effectStatusToSnapshot = (
	effect: CopyableEffectStatus,
): EffectClipboardSnapshot | null => {
	if (effect.importPath === null) {
		return null;
	}

	const params: Record<string, unknown> = {};
	for (const [key, prop] of Object.entries(effect.props)) {
		if (!prop.canUpdate) {
			return null;
		}

		if (prop.codeValue !== undefined) {
			params[key] = prop.codeValue;
		}
	}

	return {
		callee: effect.callee,
		importPath: effect.importPath,
		params,
	};
};

const getSnapshotsFromSelection = ({
	selection,
	codeValues,
}: {
	selection: TimelineSelection;
	codeValues: React.ContextType<
		typeof Internals.VisualModeCodeValuesContext
	>['codeValues'];
}): EffectClipboardSnapshot[] | null => {
	if (
		selection.type !== 'sequence-effect' &&
		selection.type !== 'sequence-all-effects'
	) {
		return null;
	}

	const {sequenceSubscriptionKey} = selection.nodePathInfo;
	const sequenceStatus =
		codeValues[
			Internals.makeSequencePropsSubscriptionKey(sequenceSubscriptionKey)
		];
	if (!sequenceStatus || !sequenceStatus.canUpdate) {
		return null;
	}

	const effects =
		selection.type === 'sequence-effect'
			? sequenceStatus.effects.filter(
					(effect) => effect.effectIndex === selection.i,
				)
			: sequenceStatus.effects;

	if (selection.type === 'sequence-effect' && effects.length !== 1) {
		return null;
	}

	const snapshots: EffectClipboardSnapshot[] = [];
	for (const effect of effects) {
		if (!effect.canUpdate) {
			return null;
		}

		const snapshot = effectStatusToSnapshot(effect);
		if (snapshot === null) {
			return null;
		}

		snapshots.push(snapshot);
	}

	return snapshots;
};

export const TimelineClipboardKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {canSelect} = useTimelineSelection();
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);

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

				const firstSelection = selectedItems[0];
				const type = firstSelection ? getCopyType(firstSelection) : null;

				if (type === null) {
					return;
				}

				if (
					selectedItems.some((selection) => getCopyType(selection) !== type)
				) {
					e.preventDefault();
					showNotification(
						'Cannot copy individual effects together with all effects',
						3000,
					);
					return;
				}

				const snapshots = selectedItems.flatMap((selection) => {
					const itemSnapshots = getSnapshotsFromSelection({
						selection,
						codeValues,
					});
					return itemSnapshots ?? [null];
				});
				if (snapshots.some((snapshot) => snapshot === null)) {
					e.preventDefault();
					showNotification(
						'Cannot copy effects because one of them contains values that cannot be copied',
						3000,
					);
					return;
				}

				e.preventDefault();
				navigator.clipboard
					.writeText(
						makeClipboardText({
							type,
							version: 2,
							remotionClipboard: 'effects',
							effects: snapshots as EffectClipboardSnapshot[],
						}),
					)
					.then(() => {
						showNotification(
							snapshots.length === 1
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

						const target = getPasteEffectsTarget(selectedItems);
						if (target.type === 'multiple') {
							showNotification(
								'Select one target sequence to paste effects',
								3000,
							);
							return;
						}

						if (target.type === 'none') {
							showNotification('Select a sequence to paste effects onto', 3000);
							return;
						}

						if (target.type === 'unsupported') {
							showNotification('This sequence does not support effects', 3000);
							return;
						}

						const {sequenceSubscriptionKey: targetSequenceNodePath} =
							target.nodePathInfo;
						return callApi('/api/paste-effects', {
							targetFileName: targetSequenceNodePath.absolutePath,
							targetSequenceNodePath,
							type: payload.type,
							effects: payload.effects,
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
	}, [
		canSelect,
		codeValues,
		currentSelection,
		keybindings,
		previewServerState,
	]);

	return null;
};
