import {
	isKeyframeInterpolationFunction,
	parseKeyframeClipboardDataResult,
	parseEasingClipboardDataResult,
	parseEffectClipboardDataResult,
	parseEffectPropClipboardDataResult,
	type EasingClipboardData,
	type EffectClipboardData,
	type EffectClipboardInterpolationFunction,
	type EffectClipboardParam,
	type EffectClipboardPasteType,
	type EffectClipboardSnapshot,
	type EffectPropClipboardData,
	type KeyframeClipboardData,
} from '@remotion/studio-shared';
import type React from 'react';
import {useContext, useEffect, useRef} from 'react';
import {
	Internals,
	type OverrideIdToNodePaths,
	type PropStatuses,
	type InteractivitySchemaField,
	type SequencePropsSubscriptionKey,
	type InteractivitySchema,
	type TSequence,
} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	areKeyboardShortcutsDisabled,
	useKeybinding,
} from '../../helpers/use-keybinding';
import {callApi} from '../call-api';
import {useConfirmationDialog} from '../ConfirmationDialog';
import {showNotification} from '../Notifications/NotificationCenter';
import {callAddKeyframes} from './call-add-keyframe';
import {callDeleteKeyframes} from './call-delete-keyframe';
import {
	callUpdateEffectKeyframeSettings,
	callUpdateSequenceKeyframeSettings,
} from './call-update-keyframe-settings';
import {
	deleteSelectedTimelineItems,
	getTimelineSelectionAfterDeletingItems,
} from './delete-selected-timeline-item';
import {
	readClipboardTextAndEffectsEnvelope,
	writeEffectsClipboardEnvelope,
	type EffectsClipboardEnvelope,
} from './effects-clipboard';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {
	getKeyframeClipboardDataFromSelections,
	getPasteKeyframeTarget,
} from './keyframe-clipboard';
import {saveEffectProp} from './save-effect-prop';
import {
	useCurrentTimelineSelectionStateAsRef,
	useTimelineSelection,
	type TimelineSelection,
} from './TimelineSelection';
import {
	getEasingSelections,
	getTimelineEasingValueForSelection,
	updateSelectedTimelineEasings,
	type EasingSelection,
} from './update-selected-easing';

const makeClipboardText = (
	payload:
		| EffectClipboardData
		| EffectPropClipboardData
		| EasingClipboardData
		| KeyframeClipboardData,
) => JSON.stringify(payload);

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

export type PasteEffectPropTarget =
	| {
			readonly type: 'valid';
			readonly fileName: string;
			readonly nodePath: SequencePropsSubscriptionKey;
			readonly effectIndex: number;
			readonly fieldKey: string;
			readonly defaultValue: string | null;
			readonly schema: InteractivitySchema;
	  }
	| {
			readonly type:
				| 'none'
				| 'multiple'
				| 'unsupported'
				| 'effect-type-mismatch'
				| 'prop-mismatch'
				| 'uncopyable';
	  };

const isVisibleFieldSchema = (
	fieldSchema: InteractivitySchemaField | undefined,
): fieldSchema is Exclude<InteractivitySchemaField, {type: 'hidden'}> =>
	fieldSchema !== undefined && fieldSchema.type !== 'hidden';

const getDefaultValue = (
	fieldSchema: Exclude<InteractivitySchemaField, {type: 'hidden'}>,
) =>
	fieldSchema.default !== undefined
		? JSON.stringify(fieldSchema.default)
		: null;

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

type CopyableEffectStatus = React.ContextType<
	typeof Internals.VisualModePropStatusesContext
>['propStatuses'][string] extends infer TCodeValue
	? TCodeValue extends {canUpdate: true; effects: readonly unknown[]}
		? Extract<TCodeValue['effects'][number], {canUpdate: true}>
		: never
	: never;

const isClipboardInterpolationFunction = (
	value: string,
): value is EffectClipboardInterpolationFunction => {
	return isKeyframeInterpolationFunction(value);
};

const effectPropStatusToClipboardParam = (
	prop: CopyableEffectStatus['props'][string],
): EffectClipboardParam | null => {
	if (prop.status === 'computed') {
		return null;
	}

	if (prop.status === 'static') {
		if (prop.codeValue === undefined) {
			return null;
		}

		return {
			type: 'static',
			value: prop.codeValue,
		};
	}

	if (!isClipboardInterpolationFunction(prop.interpolationFunction)) {
		return null;
	}

	return {
		type: 'keyframed',
		interpolationFunction: prop.interpolationFunction,
		keyframes: prop.keyframes,
		easing: prop.easing,
		clamping: prop.clamping,
		...(prop.output === undefined || prop.output === 'linear'
			? {}
			: {output: prop.output}),
		...(prop.posterize === undefined ? {} : {posterize: prop.posterize}),
	};
};

const effectStatusToSnapshot = (
	effect: CopyableEffectStatus,
): EffectClipboardSnapshot | null => {
	if (effect.importPath === null) {
		return null;
	}

	const params: Record<string, EffectClipboardParam> = {};
	for (const [key, prop] of Object.entries(effect.props)) {
		if (prop.status === 'static' && prop.codeValue === undefined) {
			continue;
		}

		const param = effectPropStatusToClipboardParam(prop);
		if (param === null) {
			return null;
		}

		params[key] = param;
	}

	return {
		callee: effect.callee,
		importPath: effect.importPath,
		params,
	};
};

export const getSnapshotsFromSelection = ({
	selection,
	propStatuses,
}: {
	selection: TimelineSelection;
	propStatuses: React.ContextType<
		typeof Internals.VisualModePropStatusesContext
	>['propStatuses'];
}): EffectClipboardSnapshot[] | null => {
	if (
		selection.type !== 'sequence-effect' &&
		selection.type !== 'sequence-all-effects'
	) {
		return null;
	}

	const {sequenceSubscriptionKey} = selection.nodePathInfo;
	const sequenceStatus =
		propStatuses[
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

export type EffectClipboardDataFromSelections =
	| {
			readonly type: 'valid';
			readonly payload: EffectClipboardData;
	  }
	| {
			readonly type: 'none';
	  }
	| {
			readonly type: 'mixed';
	  }
	| {
			readonly type: 'uncopyable';
	  };

export const getEffectClipboardDataFromSelections = ({
	selectedItems,
	propStatuses,
}: {
	selectedItems: readonly TimelineSelection[];
	propStatuses: PropStatuses;
}): EffectClipboardDataFromSelections => {
	const firstSelection = selectedItems[0];
	const type = firstSelection ? getCopyType(firstSelection) : null;
	if (type === null) {
		return {type: 'none'};
	}

	if (selectedItems.some((selection) => getCopyType(selection) !== type)) {
		return {type: 'mixed'};
	}

	const snapshots = selectedItems.flatMap((selection) => {
		const itemSnapshots = getSnapshotsFromSelection({
			selection,
			propStatuses,
		});
		return itemSnapshots ?? [null];
	});
	if (snapshots.some((snapshot) => snapshot === null)) {
		return {type: 'uncopyable'};
	}

	return {
		type: 'valid',
		payload: {
			type,
			version: 3,
			remotionClipboard: 'effects',
			effects: snapshots as EffectClipboardSnapshot[],
		},
	};
};

export const getEffectsClipboardEnvelopeFromSelections = ({
	selectedItems,
	payload,
}: {
	selectedItems: readonly TimelineSelection[];
	payload: EffectClipboardData;
}): EffectsClipboardEnvelope => {
	if (
		payload.type !== 'effects-additive' ||
		selectedItems.some((selection) => selection.type !== 'sequence-effect')
	) {
		return {
			envelopeVersion: 1,
			payload,
			sourceIdentity: null,
			originalEffectIndices: [],
		};
	}

	const effectSelections = selectedItems as readonly Extract<
		TimelineSelection,
		{type: 'sequence-effect'}
	>[];
	const firstSelection = effectSelections[0];
	if (!firstSelection || effectSelections.length !== payload.effects.length) {
		return {
			envelopeVersion: 1,
			payload,
			sourceIdentity: null,
			originalEffectIndices: [],
		};
	}

	const sourceIdentity = makeTargetKey(
		firstSelection.nodePathInfo.sequenceSubscriptionKey,
	);
	if (
		effectSelections.some(
			(selection) =>
				makeTargetKey(selection.nodePathInfo.sequenceSubscriptionKey) !==
				sourceIdentity,
		)
	) {
		return {
			envelopeVersion: 1,
			payload,
			sourceIdentity: null,
			originalEffectIndices: [],
		};
	}

	const indexedEffects = effectSelections
		.map((selection, index) => ({
			effectIndex: selection.i,
			effect: payload.effects[index] as EffectClipboardSnapshot,
		}))
		.sort((a, b) => a.effectIndex - b.effectIndex);

	return {
		envelopeVersion: 1,
		payload: {
			...payload,
			effects: indexedEffects.map(({effect}) => effect),
		},
		sourceIdentity,
		originalEffectIndices: indexedEffects.map(({effectIndex}) => effectIndex),
	};
};

export const getEffectPropClipboardDataFromSelection = ({
	selection,
	propStatuses,
}: {
	selection: TimelineSelection;
	propStatuses: PropStatuses;
}): EffectPropClipboardData | null => {
	if (selection.type !== 'sequence-effect-prop') {
		return null;
	}

	const sequenceStatus =
		propStatuses[
			Internals.makeSequencePropsSubscriptionKey(
				selection.nodePathInfo.sequenceSubscriptionKey,
			)
		];
	if (!sequenceStatus || !sequenceStatus.canUpdate) {
		return null;
	}

	const effect = sequenceStatus.effects.find(
		(item) => item.effectIndex === selection.i,
	);
	if (!effect?.canUpdate || effect.importPath === null) {
		return null;
	}

	const prop = effect.props[selection.key];
	if (!prop) {
		return null;
	}

	const param = effectPropStatusToClipboardParam(prop);
	if (param === null) {
		return null;
	}

	return {
		type: 'effect-prop',
		version: 1,
		remotionClipboard: 'effect-prop',
		effect: {
			callee: effect.callee,
			importPath: effect.importPath,
		},
		key: selection.key,
		param,
	};
};

export const getEasingClipboardDataFromSelection = ({
	selection,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
}: {
	selection: EasingSelection;
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	propStatuses: PropStatuses;
}): EasingClipboardData | null => {
	const easing = getTimelineEasingValueForSelection({
		selection,
		sequences,
		overrideIdsToNodePaths,
		propStatuses,
	});
	if (easing === null) {
		return null;
	}

	return {
		type: 'easing',
		version: 1,
		remotionClipboard: 'easing',
		easing,
	};
};

export const getPasteEffectPropTarget = ({
	selectedItems,
	payload,
	propStatuses,
	sequences,
	overrideIdsToNodePaths,
}: {
	readonly selectedItems: readonly TimelineSelection[];
	readonly payload: EffectPropClipboardData;
	readonly propStatuses: PropStatuses;
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
}): PasteEffectPropTarget => {
	if (selectedItems.length === 0) {
		return {type: 'none'};
	}

	if (selectedItems.length !== 1) {
		return {type: 'multiple'};
	}

	const [selection] = selectedItems;
	if (!selection) {
		return {type: 'none'};
	}

	if (
		selection.type !== 'sequence-effect-prop' &&
		selection.type !== 'sequence-effect'
	) {
		return {type: 'none'};
	}

	const target =
		selection.type === 'sequence-effect-prop'
			? {
					effectIndex: selection.i,
					fieldKey: selection.key,
				}
			: {
					effectIndex: selection.i,
					fieldKey: payload.key,
				};

	if (!selection.nodePathInfo.supportsEffects) {
		return {type: 'unsupported'};
	}

	if (
		selection.type === 'sequence-effect-prop' &&
		selection.key !== payload.key
	) {
		return {type: 'prop-mismatch'};
	}

	const track = findTrackForNodePathInfo({
		sequences,
		overrideIdsToNodePaths,
		nodePathInfo: selection.nodePathInfo,
	});
	const sequence = track?.sequence ?? null;
	if (!sequence) {
		return {type: 'none'};
	}

	const effect = sequence.effects[target.effectIndex];
	const fieldSchema = effect?.schema[target.fieldKey];
	if (!effect || !isVisibleFieldSchema(fieldSchema)) {
		return {type: 'prop-mismatch'};
	}

	const sequenceStatus =
		propStatuses[
			Internals.makeSequencePropsSubscriptionKey(
				selection.nodePathInfo.sequenceSubscriptionKey,
			)
		];
	if (!sequenceStatus?.canUpdate) {
		return {type: 'uncopyable'};
	}

	const effectStatus = sequenceStatus.effects.find(
		(item) => item.effectIndex === target.effectIndex,
	);
	if (!effectStatus?.canUpdate) {
		return {type: 'uncopyable'};
	}

	if (effectStatus.importPath !== payload.effect.importPath) {
		return {type: 'effect-type-mismatch'};
	}

	const propStatus = effectStatus.props[target.fieldKey];
	if (!propStatus || propStatus.status === 'computed') {
		return {type: 'uncopyable'};
	}

	return {
		type: 'valid',
		fileName: selection.nodePathInfo.sequenceSubscriptionKey.absolutePath,
		nodePath: selection.nodePathInfo.sequenceSubscriptionKey,
		effectIndex: target.effectIndex,
		fieldKey: target.fieldKey,
		defaultValue: getDefaultValue(fieldSchema),
		schema: effect.schema,
	};
};

export const TimelineClipboardKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const timelinePositionRef = useRef(timelinePosition);
	timelinePositionRef.current = timelinePosition;
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {canSelect} = useTimelineSelection();
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const confirm = useConfirmationDialog();

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
				const propStatuses = propStatusesRef.current;
				const sequences = sequencesRef.current;
				if (selectedItems.length === 0) {
					return;
				}

				const keyframeSelections = selectedItems.filter(
					(selection) => selection.type === 'keyframe',
				);
				if (keyframeSelections.length > 0) {
					e.preventDefault();
					if (
						selectedItems.some(
							(selection) =>
								selection.type !== 'keyframe' && selection.type !== 'easing',
						)
					) {
						showNotification('Select only keyframes and easings to copy', 3000);
						return;
					}

					const payload = getKeyframeClipboardDataFromSelections({
						selections: selectedItems,
						sequences,
						overrideIdsToNodePaths: overrideIdToNodePathMappings,
						propStatuses,
					});
					if (payload === null) {
						showNotification(
							'Select a continuous keyframe range from one property to copy',
							3000,
						);
						return;
					}

					navigator.clipboard
						.writeText(makeClipboardText(payload))
						.catch((err) => {
							showNotification(
								`Could not copy keyframe: ${(err as Error).message}`,
								2000,
							);
						});
					return;
				}

				const easingSelections = getEasingSelections(selectedItems);
				if (easingSelections.length > 0) {
					e.preventDefault();
					if (
						easingSelections.length !== 1 ||
						easingSelections.length !== selectedItems.length
					) {
						showNotification('Select one easing to copy', 3000);
						return;
					}

					const payload = getEasingClipboardDataFromSelection({
						selection: easingSelections[0],
						sequences,
						overrideIdsToNodePaths: overrideIdToNodePathMappings,
						propStatuses,
					});
					if (payload === null) {
						showNotification(
							'Cannot copy easing because it cannot be read',
							3000,
						);
						return;
					}

					navigator.clipboard
						.writeText(makeClipboardText(payload))
						.then(() => {
							showNotification('Copied easing to clipboard', 1000);
						})
						.catch((err) => {
							showNotification(
								`Could not copy easing: ${(err as Error).message}`,
								2000,
							);
						});
					return;
				}

				if (
					selectedItems.some(
						(selection) => selection.type === 'sequence-effect-prop',
					)
				) {
					e.preventDefault();
					if (
						selectedItems.length !== 1 ||
						selectedItems[0]?.type !== 'sequence-effect-prop'
					) {
						showNotification('Select one effect prop to copy its value', 3000);
						return;
					}

					const payload = getEffectPropClipboardDataFromSelection({
						selection: selectedItems[0],
						propStatuses,
					});
					if (payload === null) {
						showNotification(
							'Cannot copy effect prop because its value cannot be copied',
							3000,
						);
						return;
					}

					navigator.clipboard
						.writeText(makeClipboardText(payload))
						.then(() => {
							showNotification('Copied effect prop to clipboard', 1000);
						})
						.catch((err) => {
							showNotification(
								`Could not copy effect prop: ${(err as Error).message}`,
								2000,
							);
						});
					return;
				}

				const effectClipboardData = getEffectClipboardDataFromSelections({
					selectedItems,
					propStatuses,
				});
				if (effectClipboardData.type === 'none') {
					return;
				}

				if (effectClipboardData.type === 'mixed') {
					e.preventDefault();
					showNotification(
						'Cannot copy individual effects together with all effects',
						3000,
					);
					return;
				}

				if (effectClipboardData.type === 'uncopyable') {
					e.preventDefault();
					showNotification(
						'Cannot copy effects because one of them contains values that cannot be copied',
						3000,
					);
					return;
				}

				e.preventDefault();
				navigator.clipboard
					.writeText(makeClipboardText(effectClipboardData.payload))
					.then(() => {
						showNotification(
							effectClipboardData.payload.effects.length === 1
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

		const cut = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'x',
			callback: (e) => {
				const {selectedItems, clearSelection, selectItems} =
					currentSelection.current;
				if (selectedItems.length === 0) {
					return;
				}

				const effectClipboardData = getEffectClipboardDataFromSelections({
					selectedItems,
					propStatuses: propStatusesRef.current,
				});
				if (effectClipboardData.type === 'none') {
					return;
				}

				e.preventDefault();
				if (effectClipboardData.type === 'mixed') {
					showNotification(
						'Cannot cut individual effects together with all effects',
						3000,
					);
					return;
				}

				if (effectClipboardData.type === 'uncopyable') {
					showNotification(
						'Cannot cut effects because one of them contains values that cannot be copied',
						3000,
					);
					return;
				}

				const envelope = getEffectsClipboardEnvelopeFromSelections({
					selectedItems,
					payload: effectClipboardData.payload,
				});
				const propStatuses = propStatusesRef.current;
				writeEffectsClipboardEnvelope(envelope)
					.then(() => {
						const deletePromise = deleteSelectedTimelineItems({
							selections: selectedItems,
							sequences: sequencesRef.current,
							overrideIdsToNodePaths: overrideIdToNodePathMappings,
							setPropStatuses,
							clientId,
							confirm,
							propStatuses,
							timelinePosition: timelinePositionRef.current,
						});
						return deletePromise?.then((deleted) => {
							if (!deleted) {
								return;
							}

							const nextSelection = getTimelineSelectionAfterDeletingItems({
								selections: selectedItems,
								propStatuses,
							});
							if (nextSelection.length === 0) {
								clearSelection();
							} else {
								selectItems(nextSelection);
							}
						});
					})
					.catch((err) => {
						showNotification(
							`Could not cut effects: ${(err as Error).message}`,
							2000,
						);
					});
			},
			commandCtrlKey: true,
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const handlePaste = (e: ClipboardEvent) => {
			const {activeElement} = document;
			if (
				activeElement instanceof HTMLInputElement ||
				activeElement instanceof HTMLTextAreaElement
			) {
				return;
			}

			const {selectedItems} = currentSelection.current;
			if (selectedItems.length === 0 || e.clipboardData === null) {
				return;
			}

			e.preventDefault();
			const {text, envelope} = readClipboardTextAndEffectsEnvelope(
				e.clipboardData,
			);
			Promise.resolve()
				.then(() => {
					const propStatuses = propStatusesRef.current;
					const sequences = sequencesRef.current;
					const keyframeResult = parseKeyframeClipboardDataResult(text);
					if (keyframeResult.status !== 'invalid') {
						if (keyframeResult.status === 'unsupported-version') {
							showNotification(
								'Cannot paste keyframe copied from a different Remotion Studio version',
								4000,
							);
							return;
						}

						const keyframeTarget = getPasteKeyframeTarget({
							selectedItems,
							payload: keyframeResult.data,
							timelinePosition: timelinePositionRef.current,
							sequences,
							overrideIdsToNodePaths: overrideIdToNodePathMappings,
							propStatuses,
						});
						if (keyframeTarget.type !== 'valid') {
							switch (keyframeTarget.type) {
								case 'none':
									showNotification(
										'Select a property or keyframe to paste onto',
										3000,
									);
									return;
								case 'multiple':
									showNotification(
										'Select one property or keyframe to paste onto',
										3000,
									);
									return;
								case 'uncopyable':
									showNotification(
										'Cannot paste onto a property that cannot be updated',
										3000,
									);
									return;
								case 'incompatible':
									showNotification(
										'The copied keyframe is not compatible with this property',
										3000,
									);
									return;
								default:
									throw new Error(
										`Unexpected paste target: ${keyframeTarget satisfies never}`,
									);
							}
						}

						const changes = keyframeTarget.keyframes.map((keyframe) => ({
							fileName: keyframeTarget.fileName,
							nodePath: keyframeTarget.nodePath,
							fieldKey: keyframeTarget.fieldKey,
							sourceFrame: keyframe.sourceFrame,
							value: keyframe.value,
							schema: keyframeTarget.schema,
						}));
						const {effectIndex} = keyframeTarget;

						const deletions = keyframeTarget.keyframesToDelete.map(
							(sourceFrame) => ({
								fileName: keyframeTarget.fileName,
								nodePath: keyframeTarget.nodePath,
								fieldKey: keyframeTarget.fieldKey,
								sourceFrame,
								schema: keyframeTarget.schema,
							}),
						);

						return callDeleteKeyframes({
							sequenceKeyframes: effectIndex === null ? deletions : [],
							effectKeyframes:
								effectIndex === null
									? []
									: deletions.map((deletion) => ({
											...deletion,
											effectIndex,
										})),
							setPropStatuses,
							clientId,
						})
							.then(() =>
								callAddKeyframes({
									sequenceKeyframes: effectIndex === null ? changes : [],
									effectKeyframes:
										effectIndex === null
											? []
											: changes.map((change) => ({...change, effectIndex})),
									setPropStatuses,
									clientId,
								}),
							)
							.then(async () => {
								for (const [index, easing] of keyframeTarget.easing.entries()) {
									const settings = {
										type: 'easing' as const,
										segmentIndex:
											keyframeTarget.firstEasingSegmentIndex + index,
										easing,
									};
									if (effectIndex === null) {
										await callUpdateSequenceKeyframeSettings({
											fileName: keyframeTarget.fileName,
											nodePath: keyframeTarget.nodePath,
											fieldKey: keyframeTarget.fieldKey,
											settings,
											schema: keyframeTarget.schema,
											setPropStatuses,
											clientId,
										});
									} else {
										await callUpdateEffectKeyframeSettings({
											fileName: keyframeTarget.fileName,
											nodePath: keyframeTarget.nodePath,
											effectIndex,
											fieldKey: keyframeTarget.fieldKey,
											settings,
											schema: keyframeTarget.schema,
											setPropStatuses,
											clientId,
										});
									}
								}
							});
					}

					const easingResult = parseEasingClipboardDataResult(text);
					if (easingResult.status !== 'invalid') {
						e.preventDefault();
						if (easingResult.status === 'unsupported-version') {
							showNotification(
								'Cannot paste easing copied from a different Remotion Studio version',
								4000,
							);
							return;
						}

						const easingSelections = getEasingSelections(selectedItems);
						if (
							easingSelections.length === 0 ||
							easingSelections.length !== selectedItems.length
						) {
							showNotification('Select an easing to paste onto', 3000);
							return;
						}

						const updatePromise = updateSelectedTimelineEasings({
							selections: easingSelections,
							sequences,
							overrideIdsToNodePaths: overrideIdToNodePathMappings,
							propStatuses,
							setPropStatuses,
							clientId,
							easing: easingResult.data.easing,
						});

						if (updatePromise === null) {
							showNotification(
								'Cannot paste onto an easing that cannot be updated',
								3000,
							);
							return;
						}

						return updatePromise
							.then(() => {
								showNotification(
									easingSelections.length === 1
										? 'Pasted easing'
										: 'Pasted easing to selected segments',
									2000,
								);
							})
							.catch((err) => {
								showNotification(
									`Could not paste easing: ${(err as Error).message}`,
									3000,
								);
							});
					}

					const effectPropResult = parseEffectPropClipboardDataResult(text);
					if (effectPropResult.status !== 'invalid') {
						e.preventDefault();
						if (effectPropResult.status === 'unsupported-version') {
							showNotification(
								'Cannot paste effect prop copied from a different Remotion Studio version',
								4000,
							);
							return;
						}

						const effectPropTarget = getPasteEffectPropTarget({
							selectedItems,
							payload: effectPropResult.data,
							propStatuses,
							sequences,
							overrideIdsToNodePaths: overrideIdToNodePathMappings,
						});

						if (effectPropTarget.type !== 'valid') {
							switch (effectPropTarget.type) {
								case 'multiple':
									showNotification(
										'Select one target effect prop or effect to paste onto',
										3000,
									);
									return;
								case 'none':
									showNotification(
										'Select a matching effect prop or effect to paste onto',
										3000,
									);
									return;
								case 'unsupported':
									showNotification(
										'This sequence does not support effects',
										3000,
									);
									return;
								case 'effect-type-mismatch':
									showNotification(
										'Select an effect of the same type to paste this prop',
										3000,
									);
									return;
								case 'prop-mismatch':
									showNotification(
										'Select the same effect prop, or an effect with that prop',
										3000,
									);
									return;
								case 'uncopyable':
									showNotification(
										'Cannot paste onto an effect prop that cannot be updated',
										3000,
									);
									return;
								default:
									throw new Error(
										`Unexpected paste target: ${effectPropTarget satisfies never}`,
									);
							}
						}

						return saveEffectProp({
							fileName: effectPropTarget.fileName,
							nodePath: effectPropTarget.nodePath,
							effectIndex: effectPropTarget.effectIndex,
							fieldKey: effectPropTarget.fieldKey,
							...(effectPropResult.data.param.type === 'static'
								? {
										type: 'value' as const,
										value: effectPropResult.data.param.value,
									}
								: {
										type: 'effect-param' as const,
										effectParam: effectPropResult.data.param,
									}),
							defaultValue: effectPropTarget.defaultValue,
							schema: effectPropTarget.schema,
							setPropStatuses,
							clientId,
						}).then(() => {
							showNotification('Pasted effect prop', 2000);
						});
					}

					const result =
						envelope === null
							? parseEffectClipboardDataResult(text)
							: {status: 'valid' as const, data: envelope.payload};
					if (result.status === 'invalid') {
						return;
					}

					e.preventDefault();

					if (result.status === 'unsupported-version') {
						showNotification(
							'Cannot paste effects copied from a different Remotion Studio version',
							4000,
						);
						return;
					}

					const {data: payload} = result;
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
					const insertAtIndices =
						envelope?.sourceIdentity === makeTargetKey(targetSequenceNodePath)
							? envelope.originalEffectIndices
							: null;
					return callApi('/api/paste-effects', {
						targetFileName: targetSequenceNodePath.absolutePath,
						targetSequenceNodePath,
						type: payload.type,
						effects: payload.effects,
						clientId,
						insertAtIndices,
					}).then((pasteResult) => {
						if (pasteResult.success) {
							showNotification('Pasted effects', 2000);
						} else {
							showNotification(pasteResult.reason, 4000);
						}
					});
				})
				.catch((err) => {
					showNotification(`Could not paste: ${(err as Error).message}`, 3000);
				});
		};

		// Reading ClipboardEvent data avoids the permission prompt caused by
		// navigator.clipboard.read().
		if (keybindings.isHighestContext && !areKeyboardShortcutsDisabled()) {
			document.addEventListener('paste', handlePaste);
		}

		return () => {
			copy.unregister();
			cut.unregister();
			document.removeEventListener('paste', handlePaste);
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
		setPropStatuses,
		timelinePositionRef,
	]);

	return null;
};
