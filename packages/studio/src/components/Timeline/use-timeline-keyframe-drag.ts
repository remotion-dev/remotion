import {CanvasInternals} from '@remotion/sdk';
import type React from 'react';
import {useCallback, useContext} from 'react';
import type {
	CanUpdateSequencePropStatusKeyframed,
	InteractivitySchema,
	PropStatuses,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals, useVideoConfig} from 'remotion';
import {useTimelineCalculator} from '../../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {startEscapeCancelableCapturedPointerSession} from '../../helpers/escape-cancelable-pointer-session';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from '../../helpers/get-timeline-sequence-sort-key';
import {isPointerSessionRelease} from '../../helpers/pointer-session';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import type {createCanvasDragPreview} from '../canvas-drag-preview';
import {showNotification} from '../Notifications/NotificationCenter';
import {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
import {callMoveKeyframes} from './call-move-keyframe';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {finishKeyframePreview} from './finish-keyframe-preview';
import {
	getKeyframeDisplayOffset,
	getKeyframeSourceFrame,
} from './get-timeline-keyframes';
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
import {useSequencePropPreview} from './use-sequence-prop-preview';

const {
	canMoveCanvasKeyframes,
	getBoundedKeyframeDragDelta,
	getCanvasKeyframeMove,
	getMovedCanvasKeyframeOverride,
} = CanvasInternals;

type TimelineKeyframeDragTargetBase = {
	readonly displayFrame: number;
	readonly fieldKey: string;
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly propStatus: CanUpdateSequencePropStatusKeyframed;
	readonly schema: InteractivitySchema;
	readonly sourceFrame: number;
	readonly keyframePlaybackRate: number;
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
	tracks,
}: {
	readonly propStatuses: PropStatuses;
	readonly displayFrame: number;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly tracks: readonly TimelineTrackData[];
}): TimelineKeyframeDragTarget | null => {
	const field = parseKeyframeFieldFromNodePath(nodePathInfo.auxiliaryKeys);
	if (field === null) {
		return null;
	}

	const track = findTrackForNodePathInfo({
		tracks,
		nodePathInfo,
	});
	const sequence = track?.sequence ?? null;
	if (!sequence?.controls) {
		return null;
	}

	const nodePath = {
		...nodePathInfo.sequenceSubscriptionKey,
		videoConfigValues: sequence.controls.videoConfigValues,
	};
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

		const effectPropStatus = Internals.evaluateSourcePropStatuses(
			effectStatus.props,
			nodePath.videoConfigValues,
		)[field.fieldKey];
		if (effectPropStatus?.status !== 'keyframed') {
			return null;
		}

		const effectSourceFrame = getKeyframeSourceFrame({
			displayFrame,
			propStatus: effectPropStatus,
			keyframeDisplayOffset: getKeyframeDisplayOffset({
				propStatus: effectPropStatus,
				keyframeDisplayOffset: track?.keyframeDisplayOffset ?? 0,
				keyframePlaybackRate: track?.keyframePlaybackRate ?? 1,
			}),
			keyframePlaybackRate: track?.keyframePlaybackRate ?? 1,
		});

		if (
			!effectPropStatus.keyframes.some(
				(keyframe) => keyframe.frame === effectSourceFrame,
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
			sourceFrame: effectSourceFrame,
			keyframePlaybackRate: track?.keyframePlaybackRate ?? 1,
		};
	}

	const sequencePropStatus = Internals.evaluateSourcePropStatuses(
		sequenceStatus.props,
		nodePath.videoConfigValues,
	)[field.fieldKey];
	if (sequencePropStatus?.status !== 'keyframed') {
		return null;
	}

	const sourceFrame = getKeyframeSourceFrame({
		displayFrame,
		propStatus: sequencePropStatus,
		keyframeDisplayOffset: getKeyframeDisplayOffset({
			propStatus: sequencePropStatus,
			keyframeDisplayOffset: track?.keyframeDisplayOffset ?? 0,
			keyframePlaybackRate: track?.keyframePlaybackRate ?? 1,
		}),
		keyframePlaybackRate: track?.keyframePlaybackRate ?? 1,
	});

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
		keyframePlaybackRate: track?.keyframePlaybackRate ?? 1,
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

const canMoveTimelineKeyframeDragTargets = ({
	targets,
	delta,
}: {
	readonly targets: readonly TimelineKeyframeDragTarget[];
	readonly delta: number;
}) =>
	groupTargets(targets).every((group) =>
		canMoveCanvasKeyframes({targets: group, delta}),
	);

const applyDragOverrides = ({
	delta,
	preview,
	updateDragOverridesBatch,
	updateEffectDragOverridesBatch,
	targets,
}: {
	readonly delta: number;
	readonly preview: ReturnType<typeof createCanvasDragPreview>;
	readonly updateDragOverridesBatch: React.ContextType<
		typeof Internals.VisualModeSettersContext
	>['updateDragOverridesBatch'];
	readonly updateEffectDragOverridesBatch: React.ContextType<
		typeof Internals.VisualModeSettersContext
	>['updateEffectDragOverridesBatch'];
	readonly targets: readonly TimelineKeyframeDragTarget[];
}) => {
	const sequenceUpdates: Parameters<
		typeof preview.setDragOverridesBatch
	>[0][number][] = [];
	const effectUpdates: Parameters<
		typeof preview.setEffectDragOverridesBatch
	>[0][number][] = [];
	for (const group of groupTargets(targets)) {
		const [first] = group;
		if (!first) continue;
		const value = getMovedCanvasKeyframeOverride({targets: group, delta});
		if (first.type === 'sequence')
			sequenceUpdates.push({
				nodePath: first.nodePath,
				key: first.fieldKey,
				value,
			});
		else
			effectUpdates.push({
				nodePath: first.nodePath,
				effectIndex: first.effectIndex,
				key: first.fieldKey,
				value,
			});
	}

	preview.setDragOverridesBatch(sequenceUpdates, updateDragOverridesBatch);
	preview.setEffectDragOverridesBatch(
		effectUpdates,
		updateEffectDragOverridesBatch,
	);
};

const saveKeyframeDrag = ({
	targets,
	delta,
	preview,
	clientId,
	previousSelections,
	expectedSelections,
	currentSelection,
	getSnapshot,
}: {
	readonly previousSelections: readonly TimelineSelection[];
	readonly expectedSelections: readonly TimelineSelection[];
	readonly currentSelection: ReturnType<
		typeof useCurrentTimelineSelectionStateAsRef
	>;
	readonly getSnapshot: React.ContextType<
		typeof Internals.VisualModePropStatusesSubscriptionContext
	>['getSnapshot'];
	readonly targets: readonly TimelineKeyframeDragTarget[];
	readonly delta: number;
	readonly preview: ReturnType<typeof createCanvasDragPreview>;
	readonly clientId: string;
}) => {
	const changes = targets.map((target) => {
		const nodePath = preview.getNodePath(target.nodePath);
		return nodePath === null
			? null
			: {...target, nodePath, fileName: nodePath.absolutePath};
	});
	if (changes.some((change) => change === null)) {
		preview.cancel();
		return;
	}

	const currentTargets = changes.filter(Internals.truthy);
	callMoveKeyframes({
		sequenceKeyframes: currentTargets
			.filter(
				(target): target is TimelineKeyframeDragTarget & {type: 'sequence'} =>
					target.type === 'sequence',
			)
			.map((target) => ({
				fileName: target.fileName,
				nodePath: target.nodePath,
				fieldKey: target.fieldKey,
				...getCanvasKeyframeMove(target, delta),
				schema: target.schema,
			})),
		effectKeyframes: currentTargets
			.filter(
				(target): target is TimelineKeyframeDragTarget & {type: 'effect'} =>
					target.type === 'effect',
			)
			.map((target) => ({
				fileName: target.fileName,
				nodePath: target.nodePath,
				effectIndex: target.effectIndex,
				fieldKey: target.fieldKey,
				...getCanvasKeyframeMove(target, delta),
				schema: target.schema,
			})),
		setPropStatuses: preview.setPropStatuses,
		setPropStatusesBatch: preview.setPropStatusesBatch,
		clientId,
	})
		.then((response) => preview.acknowledgeKeyframes(response.results))
		.catch((error) => {
			finishKeyframePreview({
				preview,
				reason: 'failure',
				recoverSelection: true,
				targets: targets.map((target) => ({
					...target,
					nodePathInfo: {
						...target.nodePathInfo,
						sequenceSubscriptionKey: target.nodePath,
					},
				})),
				previousSelections,
				expectedSelections,
				currentSelection,
				getSnapshot,
			});
			showNotification(
				`Could not move keyframes: ${error instanceof Error ? error.message : String(error)}`,
				4000,
			);
		});
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
	const calculateTimeline = useTimelineCalculator();
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const overrideIdToNodePathMappingsRef = useContext(
		OverrideIdToNodePathMappingsRefContext,
	);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const {updateDragOverridesBatch, updateEffectDragOverridesBatch} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {getPreview, takePreview, cancelPreview} = useSequencePropPreview();
	const propStatusesSubscription = useContext(
		Internals.VisualModePropStatusesSubscriptionContext,
	);
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

			let previousSelections = currentSelection.current.selectedItems;
			const startClientX = e.clientX;
			let dragTargets: TimelineKeyframeDragTarget[] | null = null;
			let hasDragged = false;
			let lastDelta = 0;
			const propStatuses = propStatusesRef.current;
			const sequences = sequencesRef.current;
			const overrideIdToNodePathMappings =
				overrideIdToNodePathMappingsRef.current;

			const resolveDragTargets = () => {
				if (dragTargets !== null) {
					return dragTargets;
				}

				previousSelections = currentSelection.current.selectedItems;
				const {tracks} = calculateTimeline({
					sequences,
					overrideIdsToNodePaths: overrideIdToNodePathMappings,
				});
				dragTargets = keyframesToDrag
					.map((keyframe) =>
						getTimelineKeyframeDragTarget({
							propStatuses,
							displayFrame: keyframe.frame,
							nodePathInfo: keyframe.nodePathInfo,
							tracks,
						}),
					)
					.filter(
						(target): target is TimelineKeyframeDragTarget => target !== null,
					);
				return dragTargets;
			};

			let stopPointerSession: (() => void) | null = null;
			const cleanup = () => stopPointerSession?.();

			const cancelDrag = () => {
				finishKeyframePreview({
					preview: takePreview(),
					reason: 'cancel',
					recoverSelection: true,
					targets: (dragTargets ?? []).map((target) => ({
						...target,
						nodePathInfo: {
							...target.nodePathInfo,
							sequenceSubscriptionKey: target.nodePath,
						},
					})),
					previousSelections,
					expectedSelections: previousSelections,
					currentSelection,
					getSnapshot: propStatusesSubscription.getSnapshot,
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
					cancelPreview();
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
					preview: getPreview(),
					updateDragOverridesBatch,
					updateEffectDragOverridesBatch,
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

					cancelDrag();
					clearDraggedKeyframes();
					return;
				}

				if (
					!canMoveTimelineKeyframeDragTargets({
						targets,
						delta: lastDelta,
					})
				) {
					cancelDrag();
					clearDraggedKeyframes();
					return;
				}

				const expectedSelections: readonly TimelineSelection[] =
					shouldDragExistingSelection
						? targets.map((target) => ({
								type: 'keyframe',
								nodePathInfo: target.nodePathInfo,
								frame: target.displayFrame + lastDelta,
							}))
						: currentSelection.current.selectedItems;
				if (shouldDragExistingSelection)
					currentSelection.current.selectItems(expectedSelections);

				clearDraggedKeyframes();

				saveKeyframeDrag({
					targets,
					delta: lastDelta,
					preview: takePreview(),
					clientId: previewServerState.clientId,
					previousSelections,
					expectedSelections,
					currentSelection,
					getSnapshot: propStatusesSubscription.getSnapshot,
				});
			};

			const onPointerCancel = () => {
				cleanup();
				cancelDrag();
				clearDraggedKeyframes();
			};

			stopPointerSession = startEscapeCancelableCapturedPointerSession({
				event: e,
				captureTarget: e.currentTarget,
				onMove: onPointerMove,
				onEnd: (reason, endEvent) => {
					if (isPointerSessionRelease(reason, endEvent)) {
						onPointerUp();
					} else {
						onPointerCancel();
					}
				},
			});
		},
		[
			getPreview,
			takePreview,
			cancelPreview,
			clearDraggedKeyframes,
			currentSelection,
			frame,
			nodePathInfo,
			onSelect,
			calculateTimeline,
			overrideIdToNodePathMappingsRef,
			propStatusesRef,
			propStatusesSubscription,
			previewServerState,
			selectable,
			selected,
			sequencesRef,
			updateDragOverridesBatch,
			setDraggedKeyframes,
			updateEffectDragOverridesBatch,
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
	const calculateTimeline = useTimelineCalculator();
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const overrideIdToNodePathMappingsRef = useContext(
		OverrideIdToNodePathMappingsRefContext,
	);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const {updateDragOverridesBatch, updateEffectDragOverridesBatch} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {getPreview, takePreview, cancelPreview} = useSequencePropPreview();
	const propStatusesSubscription = useContext(
		Internals.VisualModePropStatusesSubscriptionContext,
	);
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

			let previousSelections = currentSelection.current.selectedItems;
			const startClientX = e.clientX;
			let dragTargets: TimelineKeyframeDragTarget[] | null = null;
			let hasDragged = false;
			let lastDelta = 0;
			const propStatuses = propStatusesRef.current;
			const sequences = sequencesRef.current;
			const overrideIdToNodePathMappings =
				overrideIdToNodePathMappingsRef.current;

			const resolveDragTargets = () => {
				if (dragTargets !== null) {
					return dragTargets;
				}

				previousSelections = currentSelection.current.selectedItems;
				const {tracks} = calculateTimeline({
					sequences,
					overrideIdsToNodePaths: overrideIdToNodePathMappings,
				});
				dragTargets = keyframesToDrag
					.map((keyframe) =>
						getTimelineKeyframeDragTarget({
							propStatuses,
							displayFrame: keyframe.frame,
							nodePathInfo: keyframe.nodePathInfo,
							tracks,
						}),
					)
					.filter(
						(target): target is TimelineKeyframeDragTarget => target !== null,
					);
				return dragTargets;
			};

			let stopPointerSession: (() => void) | null = null;
			const cleanup = () => stopPointerSession?.();

			const cancelDrag = () => {
				finishKeyframePreview({
					preview: takePreview(),
					reason: 'cancel',
					recoverSelection: true,
					targets: (dragTargets ?? []).map((target) => ({
						...target,
						nodePathInfo: {
							...target.nodePathInfo,
							sequenceSubscriptionKey: target.nodePath,
						},
					})),
					previousSelections,
					expectedSelections: previousSelections,
					currentSelection,
					getSnapshot: propStatusesSubscription.getSnapshot,
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
					cancelPreview();
					clearDraggedKeyframes();
					return;
				}

				applyDragOverrides({
					delta,
					preview: getPreview(),
					updateDragOverridesBatch,
					updateEffectDragOverridesBatch,
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

					cancelDrag();
					clearDraggedKeyframes();
					return;
				}

				if (lastDelta === 0 || targets === null) {
					cancelDrag();
					clearDraggedKeyframes();
					return;
				}

				if (
					!canMoveTimelineKeyframeDragTargets({
						targets,
						delta: lastDelta,
					})
				) {
					cancelDrag();
					clearDraggedKeyframes();
					return;
				}

				const expectedSelections = getTimelineSelectionsAfterEasingKeyframeDrag(
					{
						delta: lastDelta,
						selections: currentSelection.current.selectedItems,
						targets: targets.map((target) => ({
							nodePathInfo: target.nodePathInfo,
							frame: target.displayFrame,
						})),
					},
				);
				currentSelection.current.selectItems(expectedSelections);

				clearDraggedKeyframes();

				saveKeyframeDrag({
					targets,
					delta: lastDelta,
					preview: takePreview(),
					clientId: previewServerState.clientId,
					previousSelections,
					expectedSelections,
					currentSelection,
					getSnapshot: propStatusesSubscription.getSnapshot,
				});
			};

			const onPointerCancel = () => {
				cleanup();
				cancelDrag();
				clearDraggedKeyframes();
			};

			stopPointerSession = startEscapeCancelableCapturedPointerSession({
				event: e,
				captureTarget: e.currentTarget,
				onMove: onPointerMove,
				onEnd: (reason, endEvent) => {
					if (isPointerSessionRelease(reason, endEvent)) {
						onPointerUp();
					} else {
						onPointerCancel();
					}
				},
			});
		},
		[
			getPreview,
			takePreview,
			cancelPreview,
			clearDraggedKeyframes,
			currentSelection,
			onSelect,
			calculateTimeline,
			overrideIdToNodePathMappingsRef,
			propStatusesRef,
			propStatusesSubscription,
			previewServerState,
			selectable,
			selected,
			selectionItem,
			sequencesRef,
			updateDragOverridesBatch,
			updateEffectDragOverridesBatch,
			timelineWidth,
			videoConfig.durationInFrames,
		],
	);
};
