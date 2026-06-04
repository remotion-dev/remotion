import type React from 'react';
import {useCallback, useContext} from 'react';
import type {
	CanUpdateSequencePropStatusKeyframed,
	CodeValues,
	DragOverrideValue,
	OverrideIdToNodePaths,
	SequencePropsSubscriptionKey,
	SequenceSchema,
	TSequence,
} from 'remotion';
import {Internals, useVideoConfig} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {callMoveKeyframes} from './call-move-keyframe';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';
import {useTimelineKeyframeDragState} from './TimelineKeyframeDragState';
import {
	useCurrentTimelineSelectionStateAsRef,
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
	readonly schema: SequenceSchema;
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

const getCodeValueForTarget = ({
	codeValues,
	nodePath,
}: {
	readonly codeValues: CodeValues;
	readonly nodePath: SequencePropsSubscriptionKey;
}) => codeValues[Internals.makeSequencePropsSubscriptionKey(nodePath)];

const getTimelineKeyframeDragTarget = ({
	codeValues,
	displayFrame,
	nodePathInfo,
	overrideIdsToNodePaths,
	sequences,
}: {
	readonly codeValues: CodeValues;
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
	const sequenceStatus = getCodeValueForTarget({codeValues, nodePath});
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

	const moves = new Map(
		group.map(
			(target) => [target.sourceFrame, target.sourceFrame + delta] as const,
		),
	);

	return {
		type: 'keyframed',
		status: {
			...first.propStatus,
			keyframes: first.propStatus.keyframes
				.map((keyframe) => ({
					...keyframe,
					frame: moves.get(keyframe.frame) ?? keyframe.frame,
				}))
				.sort((a, b) => a.frame - b.frame),
		},
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
	const {sequences} = useContext(Internals.SequenceManager);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);
	const {
		clearDragOverrides,
		clearEffectDragOverrides,
		setCodeValues,
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

			if (!shouldDragExistingSelection) {
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

			const resolveDragTargets = () => {
				if (dragTargets !== null) {
					return dragTargets;
				}

				dragTargets = keyframesToDrag
					.map((keyframe) =>
						getTimelineKeyframeDragTarget({
							codeValues,
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
				const delta = rawDelta;

				if (hasDragged && delta === lastDelta) {
					return;
				}

				hasDragged = true;
				lastDelta = delta;
				setDraggedKeyframes(
					targets.map((target) => ({
						nodePathInfo: target.nodePathInfo,
						frame: target.displayFrame + delta,
					})),
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
					clearActiveOverrides();
					clearDraggedKeyframes();
					return;
				}

				currentSelection.current.selectItems(
					targets.map((target) => ({
						type: 'keyframe',
						nodePathInfo: target.nodePathInfo,
						frame: target.displayFrame + lastDelta,
					})),
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
					setCodeValues,
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
			codeValues,
			currentSelection,
			frame,
			nodePathInfo,
			onSelect,
			overrideIdToNodePathMappings,
			previewServerState,
			selectable,
			selected,
			sequences,
			setCodeValues,
			setDragOverrides,
			setDraggedKeyframes,
			setEffectDragOverrides,
			timelineWidth,
			videoConfig.durationInFrames,
		],
	);
};
