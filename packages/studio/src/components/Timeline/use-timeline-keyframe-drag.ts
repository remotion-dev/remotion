import {
	canMoveKeyframesWithoutCollisions,
	moveKeyframesInPropStatus,
} from '@remotion/studio-shared';
import type React from 'react';
import {useCallback, useContext} from 'react';
import type {
	CanUpdateSequencePropStatusKeyframed,
	DragOverrideValue,
	OverrideIdToNodePaths,
	PropStatuses,
	SequencePropsSubscriptionKey,
	InteractivitySchema,
	TSequence,
} from 'remotion';
import {Internals, useVideoConfig} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {callMoveKeyframes} from './call-move-keyframe';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {getBoundedKeyframeDragDelta} from './get-bounded-keyframe-drag-delta';
import {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';
import {
	getTimelineKeyframeDragKey,
	useTimelineKeyframeDragState,
	type TimelineDraggedKeyframe,
} from './TimelineKeyframeDragState';
import {
	useCurrentTimelineSelectionStateAsRef,
	type TimelineEasingSelection,
	type TimelineSelection,
	type TimelineSelectionInteraction,
} from './TimelineSelection';
import {TimelineWidthContext} from './TimelineWidthProvider';

type TimelineKeyframeDragTargetBase = {
	readonly displayFrame: number;
	readonly fieldKey: string;
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly propStatus: CanUpdateSequencePropStatusKeyframed;
	readonly schema: InteractivitySchema;
	readonly sourceFrame: number;
};

type TimelineKeyframeDragTarget =
	| (TimelineKeyframeDragTargetBase & {
			readonly type: 'sequence';
	  })
	| (TimelineKeyframeDragTargetBase & {
			readonly type: 'effect';
			readonly effectIndex: number;
	  });

type TimelineKeyframeSelection = TimelineSelection & {type: 'keyframe'};

const pointerDragThreshold = 3;

const isKeyframeSelection = (
	selection: TimelineSelection,
): selection is TimelineKeyframeSelection => selection.type === 'keyframe';

const isEasingSelection = (
	selection: TimelineSelection,
): selection is TimelineEasingSelection => selection.type === 'easing';

const keyframesForEasing = (
	easing: TimelineEasingSelection,
): TimelineKeyframeSelection[] => [
	{
		type: 'keyframe',
		nodePathInfo: easing.nodePathInfo,
		frame: easing.fromFrame,
	},
	{
		type: 'keyframe',
		nodePathInfo: easing.nodePathInfo,
		frame: easing.toFrame,
	},
];

const deduplicateKeyframeSelections = (
	keyframes: readonly TimelineKeyframeSelection[],
) => {
	const seen = new Set<string>();
	return keyframes.filter((keyframe) => {
		const key = JSON.stringify({
			nodePathInfo: keyframe.nodePathInfo,
			frame: keyframe.frame,
		});
		if (seen.has(key)) {
			return false;
		}

		seen.add(key);
		return true;
	});
};

export const getKeyframesForTimelineEasingDrag = ({
	currentSelections,
	interaction,
	selectionItem,
	selected,
}: {
	readonly currentSelections: readonly TimelineSelection[];
	readonly interaction: TimelineSelectionInteraction;
	readonly selectionItem: TimelineEasingSelection;
	readonly selected: boolean;
}): TimelineKeyframeSelection[] => {
	if (interaction.shiftKey || interaction.toggleKey) {
		return keyframesForEasing(selectionItem);
	}

	const selectedKeyframes = currentSelections.filter(isKeyframeSelection);
	if (selectedKeyframes.length > 0) {
		return selectedKeyframes;
	}

	if (!selected) {
		return keyframesForEasing(selectionItem);
	}

	const selectedEasings = currentSelections.filter(isEasingSelection);
	return deduplicateKeyframeSelections(
		(selectedEasings.length > 0 ? selectedEasings : [selectionItem]).flatMap(
			keyframesForEasing,
		),
	);
};

export const getTimelineSelectionsAfterEasingKeyframeDrag = ({
	delta,
	selections,
	targets,
}: {
	readonly delta: number;
	readonly selections: readonly TimelineSelection[];
	readonly targets: readonly TimelineDraggedKeyframe[];
}): TimelineSelection[] => {
	const movedFrames = new Map(
		targets.map((target) => [
			getTimelineKeyframeDragKey(target),
			target.frame + delta,
		]),
	);

	return selections.map((selection) => {
		if (selection.type === 'keyframe') {
			const movedFrame = movedFrames.get(
				getTimelineKeyframeDragKey({
					nodePathInfo: selection.nodePathInfo,
					frame: selection.frame,
				}),
			);

			return movedFrame === undefined
				? selection
				: {
						...selection,
						frame: movedFrame,
					};
		}

		if (selection.type === 'easing') {
			const movedFromFrame =
				movedFrames.get(
					getTimelineKeyframeDragKey({
						nodePathInfo: selection.nodePathInfo,
						frame: selection.fromFrame,
					}),
				) ?? selection.fromFrame;
			const movedToFrame =
				movedFrames.get(
					getTimelineKeyframeDragKey({
						nodePathInfo: selection.nodePathInfo,
						frame: selection.toFrame,
					}),
				) ?? selection.toFrame;

			return movedFromFrame === selection.fromFrame &&
				movedToFrame === selection.toFrame
				? selection
				: {
						...selection,
						fromFrame: movedFromFrame,
						toFrame: movedToFrame,
					};
		}

		return selection;
	});
};

const getCodeValueForTarget = ({
	propStatuses,
	nodePath,
}: {
	readonly propStatuses: PropStatuses;
	readonly nodePath: SequencePropsSubscriptionKey;
}) => propStatuses[Internals.makeSequencePropsSubscriptionKey(nodePath)];

const getTimelineKeyframeDragTarget = ({
	propStatuses,
	displayFrame,
	nodePathInfo,
	overrideIdsToNodePaths,
	sequences,
}: {
	readonly propStatuses: PropStatuses;
	readonly displayFrame: number;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly sequences: TSequence[];
}): TimelineKeyframeDragTarget | null => {
	const field = parseKeyframeFieldFromNodePath(nodePathInfo.auxiliaryKeys);
	if (field === null) {
		return null;
	}

	const track = findTrackForNodePathInfo({
		sequences,
		overrideIdsToNodePaths,
		nodePathInfo,
	});
	const sequence = track?.sequence ?? null;
	if (!sequence?.controls) {
		return null;
	}

	const sourceFrame = displayFrame - (track?.keyframeDisplayOffset ?? 0);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const fileName = nodePath.absolutePath;
	const sequenceStatus = getCodeValueForTarget({propStatuses, nodePath});
	if (!sequenceStatus?.canUpdate) {
		return null;
	}

	if (field.type === 'effect') {
		const effect = sequence.effects[field.effectIndex];
		const effectStatus = sequenceStatus.effects.find(
			(candidate) => candidate.effectIndex === field.effectIndex,
		);
		if (!effect || !effectStatus?.canUpdate) {
			return null;
		}

		const effectPropStatus = effectStatus.props[field.fieldKey];
		if (effectPropStatus?.status !== 'keyframed') {
			return null;
		}

		if (
			!effectPropStatus.keyframes.some(
				(keyframe) => keyframe.frame === sourceFrame,
			)
		) {
			return null;
		}

		return {
			type: 'effect',
			displayFrame,
			effectIndex: field.effectIndex,
			fieldKey: field.fieldKey,
			fileName,
			nodePath,
			nodePathInfo,
			propStatus: effectPropStatus,
			schema: effect.schema,
			sourceFrame,
		};
	}

	const sequencePropStatus = sequenceStatus.props[field.fieldKey];
	if (sequencePropStatus?.status !== 'keyframed') {
		return null;
	}

	if (
		!sequencePropStatus.keyframes.some(
			(keyframe) => keyframe.frame === sourceFrame,
		)
	) {
		return null;
	}

	return {
		type: 'sequence',
		displayFrame,
		fieldKey: field.fieldKey,
		fileName,
		nodePath,
		nodePathInfo,
		propStatus: sequencePropStatus,
		schema: sequence.controls.schema,
		sourceFrame,
	};
};

const getTargetGroupKey = (target: TimelineKeyframeDragTarget) => {
	return JSON.stringify({
		type: target.type,
		nodePath: target.nodePath,
		effectIndex: target.type === 'effect' ? target.effectIndex : null,
		fieldKey: target.fieldKey,
	});
};

const groupTargets = (targets: readonly TimelineKeyframeDragTarget[]) => {
	const groups = new Map<string, TimelineKeyframeDragTarget[]>();
	for (const target of targets) {
		const key = getTargetGroupKey(target);
		const group = groups.get(key) ?? [];
		group.push(target);
		groups.set(key, group);
	}

	return [...groups.values()];
};

const getMovesForGroup = ({
	group,
	delta,
}: {
	readonly group: readonly TimelineKeyframeDragTarget[];
	readonly delta: number;
}) =>
	group.map((target) => ({
		fromFrame: target.sourceFrame,
		toFrame: target.sourceFrame + delta,
	}));

const canMoveTimelineKeyframeDragTargets = ({
	targets,
	delta,
}: {
	readonly targets: readonly TimelineKeyframeDragTarget[];
	readonly delta: number;
}) =>
	groupTargets(targets).every((group) => {
		const [first] = group;
		if (!first) {
			return true;
		}

		return canMoveKeyframesWithoutCollisions({
			status: first.propStatus,
			moves: getMovesForGroup({group, delta}),
		});
	});

const makeMovedKeyframedDragOverride = ({
	group,
	delta,
}: {
	readonly group: readonly TimelineKeyframeDragTarget[];
	readonly delta: number;
}): DragOverrideValue => {
	const [first] = group;
	if (!first) {
		throw new Error('Expected a keyframe drag target');
	}

	const movedStatus = moveKeyframesInPropStatus({
		status: first.propStatus,
		moves: getMovesForGroup({group, delta}),
	});
	if (movedStatus.status !== 'keyframed') {
		throw new Error('Expected keyframed status');
	}

	return {
		type: 'keyframed',
		status: movedStatus,
	};
};

const applyDragOverrides = ({
	delta,
	setDragOverrides,
	setEffectDragOverrides,
	targets,
}: {
	readonly delta: number;
	readonly setDragOverrides: React.ContextType<
		typeof Internals.VisualModeSettersContext
	>['setDragOverrides'];
	readonly setEffectDragOverrides: React.ContextType<
		typeof Internals.VisualModeSettersContext
	>['setEffectDragOverrides'];
	readonly targets: readonly TimelineKeyframeDragTarget[];
}) => {
	for (const group of groupTargets(targets)) {
		const [first] = group;
		if (!first) {
			continue;
		}

		const override = makeMovedKeyframedDragOverride({group, delta});
		if (first.type === 'sequence') {
			setDragOverrides(first.nodePath, first.fieldKey, override);
			continue;
		}

		setEffectDragOverrides(
			first.nodePath,
			first.effectIndex,
			first.fieldKey,
			override,
		);
	}
};

const clearDragOverridesForTargets = ({
	clearDragOverrides,
	clearEffectDragOverrides,
	targets,
}: {
	readonly clearDragOverrides: React.ContextType<
		typeof Internals.VisualModeSettersContext
	>['clearDragOverrides'];
	readonly clearEffectDragOverrides: React.ContextType<
		typeof Internals.VisualModeSettersContext
	>['clearEffectDragOverrides'];
	readonly targets: readonly TimelineKeyframeDragTarget[];
}) => {
	const clearedSequences = new Set<string>();
	const clearedEffects = new Set<string>();

	for (const target of targets) {
		if (target.type === 'sequence') {
			const sequenceKey = JSON.stringify(target.nodePath);
			if (clearedSequences.has(sequenceKey)) {
				continue;
			}

			clearedSequences.add(sequenceKey);
			clearDragOverrides(target.nodePath);
			continue;
		}

		const effectKey = JSON.stringify({
			nodePath: target.nodePath,
			effectIndex: target.effectIndex,
		});
		if (clearedEffects.has(effectKey)) {
			continue;
		}

		clearedEffects.add(effectKey);
		clearEffectDragOverrides(target.nodePath, target.effectIndex);
	}
};

const getFrameDelta = ({
	clientXDelta,
	durationInFrames,
	timelineWidth,
}: {
	readonly clientXDelta: number;
	readonly durationInFrames: number;
	readonly timelineWidth: number;
}) => {
	const timelineContentWidth = timelineWidth - TIMELINE_PADDING * 2;
	if (timelineContentWidth <= 0) {
		return 0;
	}

	return Math.round((clientXDelta / timelineContentWidth) * durationInFrames);
};

export const useTimelineKeyframeDrag = ({
	frame,
	nodePathInfo,
	onSelect,
	selectable,
	selected,
}: {
	readonly frame: number;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly onSelect: (interaction?: TimelineSelectionInteraction) => void;
	readonly selectable: boolean;
	readonly selected: boolean;
}) => {
	const videoConfig = useVideoConfig();
	const timelineWidth = useContext(TimelineWidthContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const {
		clearDragOverrides,
		clearEffectDragOverrides,
		setPropStatuses,
		setDragOverrides,
		setEffectDragOverrides,
	} = useContext(Internals.VisualModeSettersContext);
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const {clearDraggedKeyframes, setDraggedKeyframes} =
		useTimelineKeyframeDragState();

	return useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			if (
				e.button !== 0 ||
				!selectable ||
				timelineWidth === null ||
				previewServerState.type !== 'connected'
			) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			const interaction = {
				shiftKey: e.shiftKey,
				toggleKey: e.metaKey || e.ctrlKey,
			};
			const shouldDragExistingSelection =
				selected && !interaction.shiftKey && !interaction.toggleKey;
			const shouldSelectOnPointerUp =
				!selected && !interaction.shiftKey && !interaction.toggleKey;

			if (!shouldDragExistingSelection && !shouldSelectOnPointerUp) {
				onSelect(interaction);
			}

			const clickedSelection: TimelineKeyframeSelection = {
				type: 'keyframe',
				nodePathInfo,
				frame,
			};
			const selectedKeyframes =
				currentSelection.current.selectedItems.filter(isKeyframeSelection);
			const keyframesToDrag =
				shouldDragExistingSelection && selectedKeyframes.length > 0
					? selectedKeyframes
					: [clickedSelection];

			const startClientX = e.clientX;
			let dragTargets: TimelineKeyframeDragTarget[] | null = null;
			let hasDragged = false;
			let lastDelta = 0;
			const propStatuses = propStatusesRef.current;
			const sequences = sequencesRef.current;

			const resolveDragTargets = () => {
				if (dragTargets !== null) {
					return dragTargets;
				}

				dragTargets = keyframesToDrag
					.map((keyframe) =>
						getTimelineKeyframeDragTarget({
							propStatuses,
							displayFrame: keyframe.frame,
							nodePathInfo: keyframe.nodePathInfo,
							overrideIdsToNodePaths: overrideIdToNodePathMappings,
							sequences,
						}),
					)
					.filter(
						(target): target is TimelineKeyframeDragTarget => target !== null,
					);
				return dragTargets;
			};

			const cleanup = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerCancel);
			};

			const clearActiveOverrides = () => {
				const targets = dragTargets;
				if (targets === null) {
					return;
				}

				clearDragOverridesForTargets({
					clearDragOverrides,
					clearEffectDragOverrides,
					targets,
				});
			};

			const onPointerMove = (event: PointerEvent) => {
				const clientXDelta = event.clientX - startClientX;
				if (!hasDragged && Math.abs(clientXDelta) < pointerDragThreshold) {
					return;
				}

				const targets = resolveDragTargets();
				if (targets.length === 0) {
					cleanup();
					clearDraggedKeyframes();
					return;
				}

				const rawDelta = getFrameDelta({
					clientXDelta,
					durationInFrames: videoConfig.durationInFrames,
					timelineWidth,
				});
				const delta = getBoundedKeyframeDragDelta({
					delta: rawDelta,
					durationInFrames: videoConfig.durationInFrames,
					targets,
				});

				if (hasDragged && delta === lastDelta) {
					return;
				}

				hasDragged = true;
				lastDelta = delta;
				if (!canMoveTimelineKeyframeDragTargets({targets, delta})) {
					clearActiveOverrides();
					clearDraggedKeyframes();
					return;
				}

				setDraggedKeyframes(
					shouldDragExistingSelection
						? targets.map((target) => ({
								nodePathInfo: target.nodePathInfo,
								frame: target.displayFrame + delta,
							}))
						: [],
				);
				applyDragOverrides({
					delta,
					setDragOverrides,
					setEffectDragOverrides,
					targets,
				});
			};

			const onPointerUp = () => {
				cleanup();

				const targets = dragTargets;
				if (!hasDragged || lastDelta === 0 || targets === null) {
					if (shouldSelectOnPointerUp) {
						onSelect(interaction);
					}

					clearActiveOverrides();
					clearDraggedKeyframes();
					return;
				}

				if (
					!canMoveTimelineKeyframeDragTargets({
						targets,
						delta: lastDelta,
					})
				) {
					clearActiveOverrides();
					clearDraggedKeyframes();
					return;
				}

				if (shouldDragExistingSelection) {
					currentSelection.current.selectItems(
						targets.map((target) => ({
							type: 'keyframe',
							nodePathInfo: target.nodePathInfo,
							frame: target.displayFrame + lastDelta,
						})),
					);
				}

				clearActiveOverrides();
				clearDraggedKeyframes();

				callMoveKeyframes({
					sequenceKeyframes: targets
						.filter(
							(
								target,
							): target is TimelineKeyframeDragTarget & {
								type: 'sequence';
							} => target.type === 'sequence',
						)
						.map((target) => ({
							fileName: target.fileName,
							nodePath: target.nodePath,
							fieldKey: target.fieldKey,
							fromFrame: target.sourceFrame,
							toFrame: target.sourceFrame + lastDelta,
							schema: target.schema,
						})),
					effectKeyframes: targets
						.filter(
							(
								target,
							): target is TimelineKeyframeDragTarget & {
								type: 'effect';
							} => target.type === 'effect',
						)
						.map((target) => ({
							fileName: target.fileName,
							nodePath: target.nodePath,
							effectIndex: target.effectIndex,
							fieldKey: target.fieldKey,
							fromFrame: target.sourceFrame,
							toFrame: target.sourceFrame + lastDelta,
							schema: target.schema,
						})),
					setPropStatuses,
					clientId: previewServerState.clientId,
				}).catch(() => undefined);
			};

			const onPointerCancel = () => {
				cleanup();
				clearActiveOverrides();
				clearDraggedKeyframes();
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerCancel);
		},
		[
			clearDragOverrides,
			clearEffectDragOverrides,
			clearDraggedKeyframes,
			currentSelection,
			frame,
			nodePathInfo,
			onSelect,
			overrideIdToNodePathMappings,
			propStatusesRef,
			previewServerState,
			selectable,
			selected,
			sequencesRef,
			setPropStatuses,
			setDragOverrides,
			setDraggedKeyframes,
			setEffectDragOverrides,
			timelineWidth,
			videoConfig.durationInFrames,
		],
	);
};

export const useTimelineEasingKeyframeDrag = ({
	onSelect,
	selectable,
	selected,
	selectionItem,
}: {
	readonly onSelect: (interaction?: TimelineSelectionInteraction) => void;
	readonly selectable: boolean;
	readonly selected: boolean;
	readonly selectionItem: TimelineEasingSelection;
}) => {
	const videoConfig = useVideoConfig();
	const timelineWidth = useContext(TimelineWidthContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const {
		clearDragOverrides,
		clearEffectDragOverrides,
		setPropStatuses,
		setDragOverrides,
		setEffectDragOverrides,
	} = useContext(Internals.VisualModeSettersContext);
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const {clearDraggedKeyframes} = useTimelineKeyframeDragState();

	return useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			if (e.button !== 0 || !selectable) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			const interaction = {
				shiftKey: e.shiftKey,
				toggleKey: e.metaKey || e.ctrlKey,
			};
			const shouldSelectOnPointerDown =
				!selected && !interaction.shiftKey && !interaction.toggleKey;

			if (timelineWidth === null || previewServerState.type !== 'connected') {
				onSelect(interaction);
				return;
			}

			const keyframesToDrag = getKeyframesForTimelineEasingDrag({
				currentSelections: currentSelection.current.selectedItems,
				interaction,
				selectionItem,
				selected,
			});

			if (shouldSelectOnPointerDown) {
				onSelect(interaction);
			}

			const startClientX = e.clientX;
			let dragTargets: TimelineKeyframeDragTarget[] | null = null;
			let hasDragged = false;
			let lastDelta = 0;
			const propStatuses = propStatusesRef.current;
			const sequences = sequencesRef.current;

			const resolveDragTargets = () => {
				if (dragTargets !== null) {
					return dragTargets;
				}

				dragTargets = keyframesToDrag
					.map((keyframe) =>
						getTimelineKeyframeDragTarget({
							propStatuses,
							displayFrame: keyframe.frame,
							nodePathInfo: keyframe.nodePathInfo,
							overrideIdsToNodePaths: overrideIdToNodePathMappings,
							sequences,
						}),
					)
					.filter(
						(target): target is TimelineKeyframeDragTarget => target !== null,
					);
				return dragTargets;
			};

			const cleanup = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerCancel);
			};

			const clearActiveOverrides = () => {
				const targets = dragTargets;
				if (targets === null) {
					return;
				}

				clearDragOverridesForTargets({
					clearDragOverrides,
					clearEffectDragOverrides,
					targets,
				});
			};

			const onPointerMove = (event: PointerEvent) => {
				const clientXDelta = event.clientX - startClientX;
				if (!hasDragged && Math.abs(clientXDelta) < pointerDragThreshold) {
					return;
				}

				const targets = resolveDragTargets();
				if (targets.length === 0) {
					cleanup();
					clearDraggedKeyframes();
					return;
				}

				const rawDelta = getFrameDelta({
					clientXDelta,
					durationInFrames: videoConfig.durationInFrames,
					timelineWidth,
				});
				const delta = getBoundedKeyframeDragDelta({
					delta: rawDelta,
					durationInFrames: videoConfig.durationInFrames,
					targets,
				});

				if (hasDragged && delta === lastDelta) {
					return;
				}

				hasDragged = true;
				lastDelta = delta;
				if (!canMoveTimelineKeyframeDragTargets({targets, delta})) {
					clearActiveOverrides();
					clearDraggedKeyframes();
					return;
				}

				applyDragOverrides({
					delta,
					setDragOverrides,
					setEffectDragOverrides,
					targets,
				});
			};

			const onPointerUp = () => {
				cleanup();

				const targets = dragTargets;
				if (!hasDragged) {
					if (!shouldSelectOnPointerDown) {
						onSelect(interaction);
					}

					clearActiveOverrides();
					clearDraggedKeyframes();
					return;
				}

				if (lastDelta === 0 || targets === null) {
					clearActiveOverrides();
					clearDraggedKeyframes();
					return;
				}

				if (
					!canMoveTimelineKeyframeDragTargets({
						targets,
						delta: lastDelta,
					})
				) {
					clearActiveOverrides();
					clearDraggedKeyframes();
					return;
				}

				currentSelection.current.selectItems(
					getTimelineSelectionsAfterEasingKeyframeDrag({
						delta: lastDelta,
						selections: currentSelection.current.selectedItems,
						targets: targets.map((target) => ({
							nodePathInfo: target.nodePathInfo,
							frame: target.displayFrame,
						})),
					}),
				);

				clearActiveOverrides();
				clearDraggedKeyframes();

				callMoveKeyframes({
					sequenceKeyframes: targets
						.filter(
							(
								target,
							): target is TimelineKeyframeDragTarget & {
								type: 'sequence';
							} => target.type === 'sequence',
						)
						.map((target) => ({
							fileName: target.fileName,
							nodePath: target.nodePath,
							fieldKey: target.fieldKey,
							fromFrame: target.sourceFrame,
							toFrame: target.sourceFrame + lastDelta,
							schema: target.schema,
						})),
					effectKeyframes: targets
						.filter(
							(
								target,
							): target is TimelineKeyframeDragTarget & {
								type: 'effect';
							} => target.type === 'effect',
						)
						.map((target) => ({
							fileName: target.fileName,
							nodePath: target.nodePath,
							effectIndex: target.effectIndex,
							fieldKey: target.fieldKey,
							fromFrame: target.sourceFrame,
							toFrame: target.sourceFrame + lastDelta,
							schema: target.schema,
						})),
					setPropStatuses,
					clientId: previewServerState.clientId,
				}).catch(() => undefined);
			};

			const onPointerCancel = () => {
				cleanup();
				clearActiveOverrides();
				clearDraggedKeyframes();
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerCancel);
		},
		[
			clearDragOverrides,
			clearEffectDragOverrides,
			clearDraggedKeyframes,
			currentSelection,
			onSelect,
			overrideIdToNodePathMappings,
			propStatusesRef,
			previewServerState,
			selectable,
			selected,
			selectionItem,
			sequencesRef,
			setPropStatuses,
			setDragOverrides,
			setEffectDragOverrides,
			timelineWidth,
			videoConfig.durationInFrames,
		],
	);
};
