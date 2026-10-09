import {CanvasInternals} from '@remotion/sdk';
import {
	stringifySequenceExpandedRowKey,
	stringifySequenceSubscriptionKey,
} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusKeyframed,
	DragOverrideValue,
	InteractivitySchema,
	OverrideIdToNodePaths,
	PropStatuses,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {TRANSPARENT} from '../../helpers/colors';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	isPointerSessionRelease,
	startCapturedPointerSession,
	startDeferredCapturedPointerSession,
} from '../../helpers/pointer-session';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {EditorSnappingContext} from '../../state/editor-snapping';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from '../ForceSpecificCursor';
import type {
	MoveEffectKeyframeChange,
	MoveSequenceKeyframeChange,
} from './call-move-keyframe';
import {
	getKeyframedSequenceDragTargets,
	type TimelineSequenceEffectKeyframeDragTarget,
	type TimelineSequenceKeyframeDragTarget,
} from './get-keyframed-sequence-drag-targets';
import {getTimelineSequenceNaturalDuration} from './get-timeline-sequence-natural-duration';
import {
	getMinimumSequenceDuration,
	getTrimPlaybackRate,
	getTimelineSequenceTimingLimits,
} from './get-timeline-sequence-timing-limits';
import {
	saveSequenceProps,
	type SaveSequencePropChange,
} from './save-sequence-prop';
import {
	getTimelineSequenceSelectionKey,
	shouldSelectTimelineRowOnPointerDown,
	useCurrentTimelineSelectionStateAsRef,
	type TimelineSelection,
	type TimelineSelectionInteraction,
} from './TimelineSelection';
import {TimelineSnapIndicatorContext} from './TimelineSnapIndicator';
import {
	TimelineTrimTooltip,
	type TimelineTrimTooltipState,
} from './TimelineTrimTooltip';

const {getParentSequencePlaybackRate, sortItemsByCommitOrder} = CanvasInternals;

const HANDLE_INSET = 6;
const HANDLE_OUTSET = 8;
const LEFT_EDGE_HANDLE_INSET = 4;
const LEFT_EDGE_HANDLE_OUTSET = 4;
const timelineSequenceEdgeDragThresholdPx = 4;
export const timelineSequenceFromDragSnapThresholdPx = 10;

export type TimelineSequenceMediaDurationDragLimits = {
	readonly initialDuration: number;
	readonly maximumDuration: number;
};

export const TimelineSequenceMediaDurationDragLimitsContext =
	React.createContext<React.RefObject<
		Map<string, TimelineSequenceMediaDurationDragLimits | null>
	> | null>(null);

export const TimelineSequenceMediaDurationDragLimitsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const limits = useRef(
		new Map<string, TimelineSequenceMediaDurationDragLimits | null>(),
	);

	return (
		<TimelineSequenceMediaDurationDragLimitsContext.Provider value={limits}>
			{children}
		</TimelineSequenceMediaDurationDragLimitsContext.Provider>
	);
};

export const getTimelineSequenceMediaDurationDragLimits = ({
	cascadedStart,
	displayDurationInFrames,
	displayStart,
	effectiveMaxMediaDuration,
	explicitDurationInFrames,
	hasImplicitDuration,
	naturalMediaDuration,
	timelineDurationInFrames,
}: {
	readonly cascadedStart: number;
	readonly displayDurationInFrames: number;
	readonly displayStart: number;
	readonly effectiveMaxMediaDuration: number | null;
	readonly explicitDurationInFrames: number | null;
	readonly hasImplicitDuration: boolean;
	readonly naturalMediaDuration: number | null;
	readonly timelineDurationInFrames: number;
}): TimelineSequenceMediaDurationDragLimits | null => {
	if (
		naturalMediaDuration === null ||
		!Number.isFinite(naturalMediaDuration) ||
		naturalMediaDuration <= 0
	) {
		return null;
	}

	const containerEdgeDuration = Math.ceil(
		displayStart +
			Math.max(
				0,
				Math.min(
					displayDurationInFrames,
					timelineDurationInFrames - displayStart,
				),
			) -
			cascadedStart,
	);
	const displayedMediaEdgeDuration = Math.ceil(
		displayStart +
			Math.max(
				0,
				Math.min(
					displayDurationInFrames,
					timelineDurationInFrames - displayStart,
					effectiveMaxMediaDuration ?? Infinity,
				),
			) -
			cascadedStart,
	);
	const hasInvisibleExplicitTail =
		explicitDurationInFrames !== null &&
		explicitDurationInFrames > containerEdgeDuration;
	const initialDuration = hasInvisibleExplicitTail
		? containerEdgeDuration
		: (explicitDurationInFrames ?? displayedMediaEdgeDuration);
	const naturalMaximumDuration =
		// Keeping duration omitted represents the media's natural end. An
		// explicit duration is only useful once its edge is before that end.
		Math.ceil(displayStart + naturalMediaDuration - cascadedStart) -
		(hasImplicitDuration ? 1 : 0);
	const maximumDuration = hasInvisibleExplicitTail
		? Math.min(naturalMaximumDuration, containerEdgeDuration)
		: naturalMaximumDuration;

	if (hasImplicitDuration && initialDuration > maximumDuration) {
		return null;
	}

	return {initialDuration, maximumDuration};
};

const getTimelineSequenceEdgeSelectionInteraction = ({
	button,
	selected,
	shiftKey,
	metaKey,
	ctrlKey,
}: {
	readonly button: number;
	readonly selected: boolean;
	readonly shiftKey: boolean;
	readonly metaKey: boolean;
	readonly ctrlKey: boolean;
}): TimelineSelectionInteraction | null => {
	if (
		button !== 0 ||
		!shouldSelectTimelineRowOnPointerDown({
			selected,
			shiftKey,
			metaKey,
			ctrlKey,
		})
	) {
		return null;
	}

	return {shiftKey, toggleKey: metaKey || ctrlKey};
};

const baseStyle: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	bottom: 0,
	// Keep the middle half of narrow layers available for moving.
	width: `calc(${HANDLE_OUTSET}px + min(${HANDLE_INSET}px, 25%))`,
	zIndex: 1,
	touchAction: 'none',
};

// `durationInFrames` is measured in the child clock, so parent-frame drags are
// converted through `playbackRate`.
export type TimelineSequenceEndField = {
	readonly fieldKey: 'durationInFrames';
	readonly trimBefore: number;
	readonly playbackRate: number;
};

type TimelineSequenceDurationDragTargetBase = {
	readonly parentPlaybackRate: number;
	readonly fileName: string;
	readonly initialDuration: number;
	readonly maximumDuration: number;
	readonly minimumDuration: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: InteractivitySchema;
	readonly endField: TimelineSequenceEndField;
};

export type TimelineSequenceDurationDragTarget =
	| TimelineSequenceDurationDragTargetBase
	| (TimelineSequenceDurationDragTargetBase & {
			readonly naturalDuration: number;
			readonly initiallyExplicit: boolean;
	  });

export type TimelineSequenceLeftEdgeDragTarget = {
	readonly parentPlaybackRate: number;
	readonly fileName: string;
	readonly initialDuration: number;
	readonly initialFrom: number;
	readonly initialTrimBefore: number;
	readonly minimumDuration: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly playbackRate: number;
	readonly positionField: 'from' | null;
	readonly ripplePrevious: TimelineSequenceDurationDragTarget | null;
	readonly timingLimits: ReturnType<
		typeof getTimelineSequenceTimingLimits
	> | null;
	readonly schema: InteractivitySchema;
};

export type TimelineSequenceFromDragTarget = {
	readonly parentPlaybackRate: number;
	readonly canSnapToTimelineStart: boolean;
	readonly minimumDeltaFrames: number;
	readonly maximumDeltaFrames: number;
	readonly initialTimelineStart: number;
	readonly effectKeyframes: TimelineSequenceEffectKeyframeDragTarget[];
	readonly fileName: string;
	readonly initialFrom: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly sequenceKeyframes: TimelineSequenceKeyframeDragTarget[];
};

type DragOverrideUpdate = {
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly key: string;
	readonly value: DragOverrideValue;
};

type EffectDragOverrideUpdate = DragOverrideUpdate & {
	readonly effectIndex: number;
};

const queueStaticDragOverrideIfChanged = ({
	updates,
	previousValues,
	nodePath,
	key,
	value,
	initialValue,
}: {
	readonly updates: DragOverrideUpdate[];
	readonly previousValues: Map<string, Map<string, number>>;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly key: string;
	readonly value: number;
	readonly initialValue: number;
}) => {
	const nodeKey = stringifySequenceSubscriptionKey(nodePath);
	const previousForNode = previousValues.get(nodeKey);
	const previousValue = previousForNode?.get(key);
	if (
		previousValue === value ||
		(previousValue === undefined && value === initialValue)
	) {
		return;
	}

	if (previousForNode) {
		previousForNode.set(key, value);
	} else {
		previousValues.set(nodeKey, new Map([[key, value]]));
	}

	updates.push({nodePath, key, value: Internals.makeStaticDragOverride(value)});
};

const shiftKeyframedStatus = ({
	status,
	deltaFrames,
	isDescendant,
}: {
	readonly status: CanUpdateSequencePropStatusKeyframed;
	readonly deltaFrames: number;
	readonly isDescendant: boolean;
}): CanUpdateSequencePropStatusKeyframed => {
	if (isDescendant) {
		const adjustment = status.keyframeDisplayOffsetAdjustment;
		if (adjustment === null) {
			throw new Error(
				'Expected descendant keyframes to use an outer frame clock',
			);
		}

		return {
			...status,
			keyframeDisplayOffsetAdjustment: null,
			keyframes: status.keyframes.map((keyframe) => ({
				...keyframe,
				frame: keyframe.frame + adjustment,
			})),
		};
	}

	return {
		...status,
		keyframes: status.keyframes.map((keyframe) => ({
			...keyframe,
			frame: keyframe.frame + deltaFrames,
		})),
	};
};

const canUpdateDurationInFrames = ({
	propStatuses,
	nodePath,
}: {
	readonly propStatuses: PropStatuses;
	readonly nodePath: SequencePropsSubscriptionKey;
}) => {
	const status = Internals.getPropStatusesCtx(propStatuses, nodePath)
		?.durationInFrames?.status;

	return status === 'static';
};

const canUpdateFrom = ({
	propStatuses,
	nodePath,
}: {
	readonly propStatuses: PropStatuses;
	readonly nodePath: SequencePropsSubscriptionKey;
}) => {
	const status = Internals.getPropStatusesCtx(propStatuses, nodePath)?.from
		?.status;

	return status === 'static';
};

const canUpdateTrimBefore = ({
	propStatuses,
	nodePath,
}: {
	readonly propStatuses: PropStatuses;
	readonly nodePath: SequencePropsSubscriptionKey;
}) => {
	const status = Internals.getPropStatusesCtx(propStatuses, nodePath)
		?.trimBefore?.status;

	return status === 'static';
};

export const isTransitionSeriesSequence = (sequence: TSequence) =>
	sequence.controls?.componentIdentity ===
	'dev.remotion.transitions.TransitionSeries.Sequence';

const isSeriesSequence = (sequence: TSequence) =>
	sequence.controls?.componentIdentity ===
	'dev.remotion.remotion.Series.Sequence';

export const isCascadingSequence = (sequence: TSequence) =>
	isSeriesSequence(sequence) || isTransitionSeriesSequence(sequence);

export const isTimelineSequenceDurationDraggable = (sequence: TSequence) => {
	const isInteractiveCascadingSequence = isCascadingSequence(sequence);
	if (sequence.loopDisplay || sequence.timelineTrack?.role === 'track') {
		return false;
	}

	return (
		(sequence.type === 'sequence' ||
			sequence.type === 'image' ||
			sequence.type === 'audio' ||
			sequence.type === 'video') &&
		(!sequence.isInsideSeries || isInteractiveCascadingSequence) &&
		Boolean(sequence.controls)
	);
};

export const canResizeTimelineSequenceDuration = ({
	status,
}: {
	readonly status: CanUpdateSequencePropStatus | undefined;
}) => {
	return status?.status === 'static';
};

export const isTimelineSequenceLeftEdgeDraggable = (sequence: TSequence) => {
	return (
		sequence.timelineTrack?.role !== 'track' &&
		(!sequence.isInsideSeries || isCascadingSequence(sequence)) &&
		Boolean(sequence.controls) &&
		(sequence.type === 'sequence' ||
			sequence.type === 'image' ||
			sequence.type === 'audio' ||
			sequence.type === 'video')
	);
};

export const getTimelineSequenceEndField = ({
	sequence,
	runtimeValues,
}: {
	readonly sequence: TSequence;
	readonly runtimeValues: Readonly<Record<string, unknown>>;
}): TimelineSequenceEndField => {
	const playbackRate = getTrimPlaybackRate({sequence, runtimeValues});
	const trimBefore =
		typeof runtimeValues.trimBefore === 'number' ? runtimeValues.trimBefore : 0;
	return {fieldKey: 'durationInFrames', trimBefore, playbackRate};
};

export const getTimelineSequenceEndFieldValue = ({
	endField,
	durationInFrames,
}: {
	readonly endField: TimelineSequenceEndField;
	readonly durationInFrames: number;
}) => {
	return durationInFrames * endField.playbackRate;
};

const isFromDraggableSequence = (sequence: TSequence) => {
	return (
		!sequence.isInsideSeries &&
		sequence.timelineTrack?.role !== 'track' &&
		Boolean(sequence.controls)
	);
};

export const getTimelineSequenceDurationDragValue = ({
	initialDuration,
	deltaFrames,
	maximumDuration,
	minimumDuration = 1,
}: {
	readonly initialDuration: number;
	readonly deltaFrames: number;
	readonly maximumDuration: number;
	readonly minimumDuration?: number;
}) =>
	Math.min(
		maximumDuration,
		Math.max(minimumDuration, initialDuration + deltaFrames),
	);

export const getTimelineSequenceLeftEdgeDragDelta = ({
	initialDuration,
	initialTrimBefore,
	deltaFrames,
	playbackRate,
	minimumDuration = 1,
}: {
	readonly initialDuration: number;
	readonly initialTrimBefore: number;
	readonly deltaFrames: number;
	readonly playbackRate: number;
	readonly minimumDuration?: number;
}) => {
	const minDeltaFrames = -initialTrimBefore / playbackRate;
	const maxDeltaFrames = initialDuration - minimumDuration;

	return Math.max(minDeltaFrames, Math.min(deltaFrames, maxDeltaFrames));
};

export const getTimelineSequenceLeftEdgeDragValues = ({
	initialDuration,
	initialFrom,
	initialTrimBefore,
	deltaFrames,
	playbackRate,
	minimumDuration = 1,
	trimBeforeOnly = false,
}: {
	readonly initialDuration: number;
	readonly initialFrom: number;
	readonly initialTrimBefore: number;
	readonly deltaFrames: number;
	readonly playbackRate: number;
	readonly minimumDuration?: number;
	readonly trimBeforeOnly?: boolean;
}) => {
	const clampedDeltaFrames = trimBeforeOnly
		? Math.max(-initialTrimBefore / playbackRate, -deltaFrames)
		: getTimelineSequenceLeftEdgeDragDelta({
				initialDuration,
				initialTrimBefore,
				deltaFrames,
				playbackRate,
				minimumDuration,
			});

	return {
		durationInFrames: trimBeforeOnly
			? initialDuration
			: initialDuration - clampedDeltaFrames,
		from: trimBeforeOnly ? initialFrom : initialFrom + clampedDeltaFrames,
		// Division and multiplication by playbackRate may not cancel exactly.
		trimBefore:
			clampedDeltaFrames === -initialTrimBefore / playbackRate
				? 0
				: initialTrimBefore + clampedDeltaFrames * playbackRate,
	};
};

const getTimelineSequenceLeftEdgeDragValuesForTarget = ({
	target,
	deltaFrames,
	trimBeforeOnly,
}: {
	readonly target: TimelineSequenceLeftEdgeDragTarget;
	readonly deltaFrames: number;
	readonly trimBeforeOnly: boolean;
}) => {
	const localDeltaFrames = deltaFrames * target.parentPlaybackRate;
	// Only trims that started inside the parent are constrained to its start.
	// Source-only and cascading trims do not change `from`.
	let clampedDeltaFrames =
		!trimBeforeOnly && target.positionField !== null && target.initialFrom >= 0
			? Math.max(-target.initialFrom, localDeltaFrames)
			: localDeltaFrames;

	if (target.timingLimits) {
		clampedDeltaFrames = trimBeforeOnly
			? Math.min(
					(target.initialTrimBefore - target.timingLimits.minimumTrimBefore) /
						target.playbackRate,
					Math.max(
						(target.initialTrimBefore - target.timingLimits.maximumTrimBefore) /
							target.playbackRate,
						clampedDeltaFrames,
					),
				)
			: Math.max(
					target.positionField === null
						? -Infinity
						: target.timingLimits.minimumFrom - target.initialFrom,
					clampedDeltaFrames,
				);
	}

	return getTimelineSequenceLeftEdgeDragValues({
		initialDuration: target.initialDuration,
		initialFrom: target.initialFrom,
		initialTrimBefore: target.initialTrimBefore,
		deltaFrames: clampedDeltaFrames,
		playbackRate: target.playbackRate,
		minimumDuration: target.minimumDuration,
		trimBeforeOnly,
	});
};

export const getTimelineSequenceLeftEdgeDragChanges = ({
	targets,
	deltaFrames,
	trimBeforeOnly = false,
}: {
	readonly targets: readonly TimelineSequenceLeftEdgeDragTarget[];
	readonly deltaFrames: number;
	readonly trimBeforeOnly?: boolean;
}): SaveSequencePropChange[] => {
	return targets.flatMap((target) => {
		if (target.ripplePrevious && !trimBeforeOnly) {
			const previous = target.ripplePrevious;
			const nextDuration = getTimelineSequenceDurationDragValue({
				initialDuration: previous.initialDuration,
				deltaFrames: deltaFrames * previous.parentPlaybackRate,
				maximumDuration: previous.maximumDuration,
				minimumDuration: previous.minimumDuration,
			});
			return nextDuration === previous.initialDuration
				? []
				: [
						{
							fileName: previous.fileName,
							nodePath: previous.nodePath,
							fieldKey: previous.endField.fieldKey,
							value: getTimelineSequenceEndFieldValue({
								endField: previous.endField,
								durationInFrames: nextDuration,
							}),
							defaultValue: null,
							schema: previous.schema,
						},
					];
		}

		const nextValues = getTimelineSequenceLeftEdgeDragValuesForTarget({
			target,
			deltaFrames,
			trimBeforeOnly,
		});
		const changes: SaveSequencePropChange[] = [];

		if (
			target.positionField !== null &&
			nextValues.from !== target.initialFrom
		) {
			changes.push({
				fileName: target.fileName,
				nodePath: target.nodePath,
				fieldKey: target.positionField,
				value: nextValues.from,
				defaultValue: '0',
				schema: target.schema,
			});
		}

		if (nextValues.durationInFrames !== target.initialDuration) {
			changes.push({
				fileName: target.fileName,
				nodePath: target.nodePath,
				fieldKey: 'durationInFrames',
				value: nextValues.durationInFrames * target.playbackRate,
				defaultValue: null,
				schema: target.schema,
			});
		}

		if (nextValues.trimBefore !== target.initialTrimBefore) {
			changes.push({
				fileName: target.fileName,
				nodePath: target.nodePath,
				fieldKey: 'trimBefore',
				value: nextValues.trimBefore,
				defaultValue: '0',
				schema: target.schema,
			});
		}

		return changes;
	});
};

export const getTimelineSequenceDurationDragChanges = ({
	targets,
	deltaFrames,
}: {
	readonly targets: readonly TimelineSequenceDurationDragTarget[];
	readonly deltaFrames: number;
}): SaveSequencePropChange[] => {
	return targets.flatMap((target) => {
		const nextValue = getTimelineSequenceDurationDragValue({
			initialDuration: target.initialDuration,
			deltaFrames: deltaFrames * target.parentPlaybackRate,
			maximumDuration: target.maximumDuration,
			minimumDuration: target.minimumDuration,
		});

		const restoreInferredDuration =
			'naturalDuration' in target && nextValue === target.naturalDuration;
		if (
			deltaFrames === 0 ||
			(restoreInferredDuration && !target.initiallyExplicit) ||
			(!restoreInferredDuration && nextValue === target.initialDuration)
		) {
			return [];
		}

		return [
			{
				fileName: target.fileName,
				nodePath: target.nodePath,
				fieldKey: target.endField.fieldKey,
				value: restoreInferredDuration
					? undefined
					: getTimelineSequenceEndFieldValue({
							endField: target.endField,
							durationInFrames: nextValue,
						}),
				defaultValue: null,
				schema: target.schema,
			},
		];
	});
};

export const getTimelineSequenceFromDragValue = ({
	initialFrom,
	deltaFrames,
}: {
	readonly initialFrom: number;
	readonly deltaFrames: number;
}) => initialFrom + deltaFrames;

const getTimelineSequenceFromDragResult = ({
	deltaFrames,
	timelineDurationInFrames,
	pxPerFrame,
	snappingEnabled,
	targets,
}: {
	readonly deltaFrames: number;
	readonly timelineDurationInFrames: number;
	readonly pxPerFrame: number;
	readonly snappingEnabled: boolean;
	readonly targets: readonly TimelineSequenceFromDragTarget[];
}) => {
	let closestSnap:
		| {
				readonly deltaFrames: number;
				readonly distancePx: number;
		  }
		| undefined;
	for (const target of targets) {
		if (!snappingEnabled || !target.canSnapToTimelineStart) {
			continue;
		}

		const nextTimelineStart = target.initialTimelineStart + deltaFrames;
		const distancePx = Math.abs(nextTimelineStart * pxPerFrame);
		if (
			distancePx > timelineSequenceFromDragSnapThresholdPx ||
			(closestSnap && closestSnap.distancePx <= distancePx)
		) {
			continue;
		}

		closestSnap = {
			deltaFrames: -target.initialTimelineStart,
			distancePx,
		};
	}

	const minimumDelta = Math.max(
		...targets.map((target) =>
			Math.max(
				target.minimumDeltaFrames,
				target.initialFrom >= 0
					? -target.initialFrom / target.parentPlaybackRate
					: -Infinity,
			),
		),
	);
	const maximumDelta = Math.min(
		...targets.map((target) =>
			Math.min(
				target.maximumDeltaFrames,
				timelineDurationInFrames - 1 - target.initialTimelineStart,
			),
		),
	);
	// Keep selected clips inside their parents unless they started before them,
	// while retaining a visible frame and preserving their relative positions.
	const clampedDelta = Math.max(
		minimumDelta,
		Math.min(maximumDelta, closestSnap?.deltaFrames ?? deltaFrames),
	);
	return {
		deltaFrames: clampedDelta,
		snapFrame:
			snappingEnabled &&
			targets.some(
				(target) =>
					target.canSnapToTimelineStart &&
					target.initialTimelineStart + clampedDelta === 0,
			)
				? 0
				: null,
	};
};

export const getTimelineSequenceFromDragDelta = (
	params: Parameters<typeof getTimelineSequenceFromDragResult>[0],
) => getTimelineSequenceFromDragResult(params).deltaFrames;

export const getTimelineSequenceFromDragChanges = ({
	targets,
	deltaFrames,
}: {
	readonly targets: readonly TimelineSequenceFromDragTarget[];
	readonly deltaFrames: number;
}): SaveSequencePropChange[] => {
	return targets.flatMap((target) => {
		const nextValue = getTimelineSequenceFromDragValue({
			initialFrom: target.initialFrom,
			deltaFrames: deltaFrames * target.parentPlaybackRate,
		});

		if (nextValue === target.initialFrom) {
			return [];
		}

		return [
			{
				fileName: target.fileName,
				nodePath: target.nodePath,
				fieldKey: 'from',
				value: nextValue,
				defaultValue: '0',
				schema: NoReactInternals.sequenceSchema,
			},
		];
	});
};

export const getTimelineSequenceFromDragKeyframeMoves = ({
	targets,
	deltaFrames,
}: {
	readonly targets: readonly TimelineSequenceFromDragTarget[];
	readonly deltaFrames: number;
}): {
	readonly effectKeyframes: MoveEffectKeyframeChange[];
	readonly sequenceKeyframes: MoveSequenceKeyframeChange[];
} => {
	if (deltaFrames === 0) {
		return {effectKeyframes: [], sequenceKeyframes: []};
	}

	return {
		sequenceKeyframes: targets.flatMap((target) =>
			target.sequenceKeyframes.flatMap((keyframeTarget) =>
				keyframeTarget.status.keyframes.map((keyframe) => ({
					fileName: keyframeTarget.fileName,
					nodePath: keyframeTarget.nodePath,
					fieldKey: keyframeTarget.fieldKey,
					fromFrame: keyframe.frame,
					toFrame:
						keyframe.frame + deltaFrames * keyframeTarget.parentPlaybackRate,
					schema: keyframeTarget.schema,
					keyframeDisplayOffsetAdjustmentDelta: keyframeTarget.isDescendant
						? -deltaFrames * keyframeTarget.parentPlaybackRate
						: undefined,
				})),
			),
		),
		effectKeyframes: targets.flatMap((target) =>
			target.effectKeyframes.flatMap((keyframeTarget) =>
				keyframeTarget.status.keyframes.map((keyframe) => ({
					fileName: keyframeTarget.fileName,
					nodePath: keyframeTarget.nodePath,
					effectIndex: keyframeTarget.effectIndex,
					fieldKey: keyframeTarget.fieldKey,
					fromFrame: keyframe.frame,
					toFrame:
						keyframe.frame + deltaFrames * keyframeTarget.parentPlaybackRate,
					schema: keyframeTarget.schema,
					keyframeDisplayOffsetAdjustmentDelta: keyframeTarget.isDescendant
						? -deltaFrames * keyframeTarget.parentPlaybackRate
						: undefined,
				})),
			),
		),
	};
};

const findSequenceTrack = ({
	tracks,
	nodePathInfo,
}: {
	readonly tracks: ReturnType<typeof calculateTimeline>;
	readonly nodePathInfo: SequenceNodePathInfo;
}) => {
	const key = stringifySequenceExpandedRowKey(
		nodePathInfo.sequenceSubscriptionKey,
	);

	return tracks.find((candidate) => {
		if (candidate.nodePathInfo === null) {
			return false;
		}

		return (
			stringifySequenceExpandedRowKey(
				candidate.nodePathInfo.sequenceSubscriptionKey,
			) === key && candidate.nodePathInfo.index === nodePathInfo.index
		);
	});
};

export const getTimelineSequenceDurationDragTargets = ({
	draggedNodePathInfo,
	draggedSequenceMediaDurationDragLimits,
	selectedSequenceMediaDurationDragLimits,
	selectedItems,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
	timelineDurationInFrames,
}: {
	readonly draggedNodePathInfo: SequenceNodePathInfo;
	readonly draggedSequenceMediaDurationDragLimits: TimelineSequenceMediaDurationDragLimits | null;
	readonly selectedSequenceMediaDurationDragLimits: ReadonlyMap<
		string,
		TimelineSequenceMediaDurationDragLimits | null
	> | null;
	readonly selectedItems: readonly TimelineSelection[];
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly propStatuses: PropStatuses;
	readonly timelineDurationInFrames: number;
}): TimelineSequenceDurationDragTarget[] | null => {
	const draggedSelectionKey =
		getTimelineSequenceSelectionKey(draggedNodePathInfo);
	const selectedSequenceItems = selectedItems.filter(
		(item): item is TimelineSelection & {type: 'sequence'} =>
			item.type === 'sequence',
	);
	const draggedItemIsSelected = selectedSequenceItems.some(
		(item) =>
			getTimelineSequenceSelectionKey(item.nodePathInfo) ===
			draggedSelectionKey,
	);

	if (
		draggedItemIsSelected &&
		selectedSequenceItems.length !== selectedItems.length
	) {
		return null;
	}

	const targetNodePathInfos =
		draggedItemIsSelected && selectedSequenceItems.length > 1
			? selectedSequenceItems.map((item) => item.nodePathInfo)
			: [draggedNodePathInfo];
	const tracks = calculateTimeline({sequences, overrideIdsToNodePaths});
	const targets = new Map<string, TimelineSequenceDurationDragTarget>();

	for (const nodePathInfo of targetNodePathInfos) {
		const track = findSequenceTrack({tracks, nodePathInfo});
		const originalSequence = track
			? sequences.find((sequence) => sequence.id === track.sequence.id)
			: null;
		if (
			!track ||
			!track.nodePathInfo ||
			!originalSequence ||
			!isTimelineSequenceDurationDraggable(originalSequence)
		) {
			return null;
		}

		const nodePath = track.nodePathInfo.sequenceSubscriptionKey;
		const {controls} = originalSequence;
		if (!controls) {
			return null;
		}

		const endField = getTimelineSequenceEndField({
			sequence: originalSequence,
			runtimeValues: controls.runtimeValues.getSnapshot(),
		});
		const durationStatus = Internals.getPropStatusesCtx(
			propStatuses,
			nodePath,
		)?.[endField.fieldKey];
		if (
			!canResizeTimelineSequenceDuration({
				status: durationStatus,
			})
		) {
			return null;
		}

		const key = stringifySequenceSubscriptionKey(nodePath);
		if (!targets.has(key)) {
			const selectionKey = getTimelineSequenceSelectionKey(nodePathInfo);
			// A looped media item repeats its source, so its natural length does
			// not cap the duration.
			const isMedia =
				(originalSequence.type === 'audio' ||
					originalSequence.type === 'video') &&
				!originalSequence.loopDisplay;
			const isDraggedSequence = selectionKey === draggedSelectionKey;
			const mediaDurationDragLimits = isMedia
				? isDraggedSequence
					? draggedSequenceMediaDurationDragLimits
					: (selectedSequenceMediaDurationDragLimits?.get(selectionKey) ?? null)
				: null;
			if (isMedia && mediaDurationDragLimits === null) {
				return null;
			}

			const minimumDuration = Math.max(
				(track.sequence.from + 1 - track.cascadedStart) *
					track.keyframePlaybackRate,
				getMinimumSequenceDuration({sequence: originalSequence, sequences}),
			);
			const initialDuration = mediaDurationDragLimits
				? mediaDurationDragLimits.initialDuration * track.keyframePlaybackRate
				: originalSequence.autoDuration
					? (track.sequence.from +
							track.sequence.duration -
							track.cascadedStart) *
						track.keyframePlaybackRate
					: originalSequence.duration;
			const naturalDuration = getTimelineSequenceNaturalDuration({
				sequence: originalSequence,
				sequences,
			});
			let parentDurationLimit = Infinity;
			if (naturalDuration !== null) {
				let ancestor: TSequence | undefined = originalSequence;
				while (ancestor) {
					const parentId: string | null = ancestor.parent;
					ancestor = sequences.find((candidate) => candidate.id === parentId);
					if (ancestor) {
						const parentTrack = tracks.find(
							(candidate) => candidate.sequence.id === parentId,
						);
						if (parentTrack) {
							parentDurationLimit = Math.min(
								parentDurationLimit,
								(parentTrack.cascadedStart +
									ancestor.duration / parentTrack.keyframePlaybackRate -
									track.cascadedStart) *
									track.keyframePlaybackRate,
							);
						}
					}
				}
			}

			const timingLimits = getTimelineSequenceTimingLimits({
				movingSequenceIds: null,
				track,
				tracks,
				sequences,
				timelineDurationInFrames,
			});
			const constrainedMaximumDuration = Math.min(
				timingLimits.maximumDuration,
				mediaDurationDragLimits
					? Math.max(
							initialDuration,
							mediaDurationDragLimits.maximumDuration *
								track.keyframePlaybackRate,
						)
					: Infinity,
				(timelineDurationInFrames - track.cascadedStart) *
					track.keyframePlaybackRate,
				naturalDuration !== null && naturalDuration >= minimumDuration
					? naturalDuration
					: Infinity,
				parentDurationLimit,
			);
			const maximumDuration = Math.max(
				minimumDuration,
				constrainedMaximumDuration,
			);

			targets.set(key, {
				parentPlaybackRate: getParentSequencePlaybackRate(
					originalSequence,
					sequences,
				),
				fileName: nodePath.absolutePath,
				initialDuration,
				maximumDuration,
				...(naturalDuration !== null && maximumDuration === naturalDuration
					? {naturalDuration, initiallyExplicit: !originalSequence.autoDuration}
					: {}),
				// Include frames hidden by ancestors and retain one visible timeline frame.
				minimumDuration,
				nodePath,
				schema: controls.schema,
				endField,
			});
		}
	}

	return [...targets.values()];
};

export const getTimelineSequenceLeftEdgeDragTargets = ({
	draggedNodePathInfo,
	selectedItems,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
	timelineDurationInFrames = Infinity,
	trimBeforeOnly = false,
	rippleEdit = true,
}: {
	readonly draggedNodePathInfo: SequenceNodePathInfo;
	readonly selectedItems: readonly TimelineSelection[];
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly propStatuses: PropStatuses;
	readonly timelineDurationInFrames?: number;
	readonly trimBeforeOnly?: boolean;
	readonly rippleEdit?: boolean;
}): TimelineSequenceLeftEdgeDragTarget[] | null => {
	const draggedSelectionKey =
		getTimelineSequenceSelectionKey(draggedNodePathInfo);
	const selectedSequenceItems = selectedItems.filter(
		(item): item is TimelineSelection & {type: 'sequence'} =>
			item.type === 'sequence',
	);
	const draggedItemIsSelected = selectedSequenceItems.some(
		(item) =>
			getTimelineSequenceSelectionKey(item.nodePathInfo) ===
			draggedSelectionKey,
	);

	if (
		draggedItemIsSelected &&
		selectedSequenceItems.length !== selectedItems.length
	) {
		return null;
	}

	const tracks = calculateTimeline({sequences, overrideIdsToNodePaths});
	const draggedTrack = findSequenceTrack({
		tracks,
		nodePathInfo: draggedNodePathInfo,
	});
	const targetNodePathInfos =
		!trimBeforeOnly &&
		draggedTrack &&
		isCascadingSequence(draggedTrack.sequence)
			? [draggedNodePathInfo]
			: draggedItemIsSelected && selectedSequenceItems.length > 1
				? selectedSequenceItems.map((item) => item.nodePathInfo)
				: [draggedNodePathInfo];
	const targets = new Map<string, TimelineSequenceLeftEdgeDragTarget>();

	for (const nodePathInfo of targetNodePathInfos) {
		const track = findSequenceTrack({tracks, nodePathInfo});
		const originalSequence = track
			? sequences.find((sequence) => sequence.id === track.sequence.id)
			: null;
		if (
			!track ||
			!track.nodePathInfo ||
			!originalSequence ||
			!isTimelineSequenceLeftEdgeDraggable(originalSequence)
		) {
			return null;
		}

		const nodePath = track.nodePathInfo.sequenceSubscriptionKey;
		const trimsMedia =
			originalSequence.type === 'audio' || originalSequence.type === 'video';
		if (
			trimBeforeOnly &&
			!trimsMedia &&
			!isCascadingSequence(originalSequence)
		) {
			return null;
		}

		let ripplePrevious: TimelineSequenceLeftEdgeDragTarget['ripplePrevious'] =
			null;
		if (
			rippleEdit &&
			!trimBeforeOnly &&
			targetNodePathInfos.length === 1 &&
			isCascadingSequence(originalSequence)
		) {
			const componentIdentity = originalSequence.controls?.componentIdentity;
			const siblings = sortItemsByCommitOrder(
				sequences.filter(
					(candidate) =>
						candidate.parent === originalSequence.parent &&
						candidate.controls?.componentIdentity === componentIdentity,
				),
				(candidate) => candidate.timelineOrder,
			);
			const previous =
				siblings[
					siblings.findIndex(
						(candidate) => candidate.id === originalSequence.id,
					) - 1
				];
			if (previous) {
				const previousTrack = tracks.find(
					(candidate) => candidate.sequence.id === previous.id,
				);
				if (!previousTrack?.nodePathInfo) {
					return null;
				}

				ripplePrevious =
					getTimelineSequenceDurationDragTargets({
						draggedNodePathInfo: previousTrack.nodePathInfo,
						draggedSequenceMediaDurationDragLimits: null,
						selectedSequenceMediaDurationDragLimits: null,
						selectedItems: [],
						sequences,
						overrideIdsToNodePaths,
						propStatuses,
						timelineDurationInFrames,
					})?.[0] ?? null;
				if (!ripplePrevious) {
					return null;
				}
			}
		}

		const positionField = isCascadingSequence(originalSequence) ? null : 'from';
		if (
			(!ripplePrevious &&
				!trimBeforeOnly &&
				positionField === 'from' &&
				!canUpdateFrom({propStatuses, nodePath})) ||
			(!ripplePrevious &&
				!trimBeforeOnly &&
				!canUpdateDurationInFrames({propStatuses, nodePath})) ||
			(!ripplePrevious && !canUpdateTrimBefore({propStatuses, nodePath}))
		) {
			return null;
		}

		const {controls} = originalSequence;
		if (!controls) {
			return null;
		}

		const key = stringifySequenceSubscriptionKey(nodePath);
		if (!targets.has(key)) {
			const runtimeValues = controls.runtimeValues.getSnapshot();
			const sequencePropStatuses = Internals.getPropStatusesCtx(
				propStatuses,
				nodePath,
			);
			const trimBeforeStatus = sequencePropStatuses?.trimBefore;
			const ownTrimBefore =
				trimBeforeStatus?.status === 'static' &&
				typeof trimBeforeStatus.codeValue === 'number'
					? trimBeforeStatus.codeValue
					: typeof runtimeValues.trimBefore === 'number'
						? runtimeValues.trimBefore
						: 0;
			const playbackRate = getTrimPlaybackRate({
				sequence: originalSequence,
				runtimeValues,
			});
			const durationStatus = sequencePropStatuses?.durationInFrames;
			const runtimeDuration =
				durationStatus?.status === 'static' &&
				typeof durationStatus.codeValue === 'number'
					? durationStatus.codeValue
					: runtimeValues.durationInFrames;
			// The handle is at the visible start, which can be later than the
			// child's own start when an ancestor clips it. Include those hidden
			// frames in the trim so the visible edge follows the pointer.
			const hiddenStartInParentFrames =
				!trimBeforeOnly && positionField === 'from'
					? (track.sequence.from - track.cascadedStart) *
						track.keyframePlaybackRate
					: 0;
			targets.set(key, {
				parentPlaybackRate: getParentSequencePlaybackRate(
					originalSequence,
					sequences,
				),
				fileName: nodePath.absolutePath,
				initialDuration:
					(originalSequence.autoDuration
						? (track.sequence.from +
								track.sequence.duration -
								track.cascadedStart) *
							track.keyframePlaybackRate
						: isSeriesSequence(originalSequence) ||
							  typeof runtimeDuration !== 'number' ||
							  !Number.isFinite(runtimeDuration)
							? originalSequence.duration
							: runtimeDuration / playbackRate) - hiddenStartInParentFrames,
				initialFrom:
					positionField === 'from'
						? originalSequence.from + hiddenStartInParentFrames
						: 0,
				initialTrimBefore:
					(trimBeforeOnly
						? ownTrimBefore
						: trimsMedia
							? (originalSequence.trimBefore ??
								Math.max(0, originalSequence.startMediaFrom))
							: (originalSequence.trimBefore ?? 0)) +
					hiddenStartInParentFrames * playbackRate,
				minimumDuration: getMinimumSequenceDuration({
					sequence: originalSequence,
					sequences,
				}),
				nodePath,
				playbackRate,
				positionField,
				ripplePrevious,
				timingLimits: getTimelineSequenceTimingLimits({
					movingSequenceIds: null,
					track,
					tracks,
					sequences,
					timelineDurationInFrames,
				}),
				schema: controls.schema,
			});
		}
	}

	return [...targets.values()];
};

export const getTimelineSequenceFromDragTargets = ({
	draggedNodePathInfo,
	selectedItems,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
}: {
	readonly draggedNodePathInfo: SequenceNodePathInfo;
	readonly selectedItems: readonly TimelineSelection[];
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly propStatuses: PropStatuses;
}): TimelineSequenceFromDragTarget[] | null => {
	const draggedSelectionKey =
		getTimelineSequenceSelectionKey(draggedNodePathInfo);
	const selectedSequenceItems = selectedItems.filter(
		(item): item is TimelineSelection & {type: 'sequence'} =>
			item.type === 'sequence',
	);
	const draggedItemIsSelected = selectedSequenceItems.some(
		(item) =>
			getTimelineSequenceSelectionKey(item.nodePathInfo) ===
			draggedSelectionKey,
	);

	if (
		draggedItemIsSelected &&
		selectedSequenceItems.length !== selectedItems.length
	) {
		return null;
	}

	const targetNodePathInfos =
		draggedItemIsSelected && selectedSequenceItems.length > 1
			? selectedSequenceItems.map((item) => item.nodePathInfo)
			: [draggedNodePathInfo];
	const tracks = calculateTimeline({sequences, overrideIdsToNodePaths});
	const sequencesById = new Map(
		sequences.map((sequence) => [sequence.id, sequence]),
	);
	const selectedSequences = targetNodePathInfos.flatMap((nodePathInfo) => {
		const track = findSequenceTrack({tracks, nodePathInfo});
		const originalSequence = track
			? sequencesById.get(track.sequence.id)
			: undefined;
		if (!track?.nodePathInfo || !originalSequence) {
			return [];
		}

		return [
			{
				nodePath: track.nodePathInfo.sequenceSubscriptionKey,
				originalSequence,
				initialTimelineStart: track.cascadedStart,
			},
		];
	});
	if (selectedSequences.length !== targetNodePathInfos.length) {
		return null;
	}

	const selectedSequenceIds = new Set(
		selectedSequences.map(({originalSequence}) => originalSequence.id),
	);
	const sequencesWithoutSelectedAncestors = selectedSequences.filter(
		({originalSequence}) => {
			let parentId = originalSequence.parent;
			while (parentId !== null) {
				if (selectedSequenceIds.has(parentId)) {
					return false;
				}

				parentId = sequencesById.get(parentId)?.parent ?? null;
			}

			return true;
		},
	);
	const targets = new Map<string, TimelineSequenceFromDragTarget>();
	const includedKeyframeNodePaths = new Set<string>();

	for (const {
		nodePath,
		originalSequence,
		initialTimelineStart,
	} of sequencesWithoutSelectedAncestors) {
		if (!isFromDraggableSequence(originalSequence)) {
			return null;
		}

		if (!canUpdateFrom({propStatuses, nodePath})) {
			return null;
		}

		const key = stringifySequenceSubscriptionKey(nodePath);
		if (!targets.has(key)) {
			const descendants = sequences.filter((candidate) => {
				let parentId: string | null = candidate.id;
				while (parentId !== null) {
					if (parentId === originalSequence.id) {
						return true;
					}

					parentId = sequencesById.get(parentId)?.parent ?? null;
				}

				return false;
			});
			const descendantKeyframes = descendants.flatMap((sequence) => {
				const overrideId = sequence.controls?.overrideId;
				const descendantNodePath = overrideId
					? overrideIdsToNodePaths[overrideId]
					: undefined;
				if (descendantNodePath === undefined) {
					return [];
				}

				const descendantNodePathKey =
					stringifySequenceSubscriptionKey(descendantNodePath);
				if (includedKeyframeNodePaths.has(descendantNodePathKey)) {
					return [];
				}

				includedKeyframeNodePaths.add(descendantNodePathKey);
				return [
					getKeyframedSequenceDragTargets({
						nodePath: descendantNodePath,
						sequence,
						sequences,
						propStatuses,
						isDescendant: sequence.id !== originalSequence.id,
					}),
				];
			});
			const effectKeyframes = descendantKeyframes.flatMap(
				(descendant) => descendant.effectKeyframes,
			);
			const sequenceKeyframes = descendantKeyframes.flatMap(
				(descendant) => descendant.sequenceKeyframes,
			);
			const parentPlaybackRate = getParentSequencePlaybackRate(
				originalSequence,
				sequences,
			);
			const track = tracks.find(
				(candidate) => candidate.sequence.id === originalSequence.id,
			)!;
			const timingLimits = getTimelineSequenceTimingLimits({
				track,
				tracks,
				sequences,
				timelineDurationInFrames: Infinity,
				movingSequenceIds: selectedSequenceIds,
			});
			// All selected clips share a composition-frame delta. Ignore moving neighbours
			// and intersect each clip's bounds so the selection keeps its spacing.
			targets.set(key, {
				parentPlaybackRate,
				canSnapToTimelineStart: true,
				minimumDeltaFrames: Math.max(
					(1 - originalSequence.duration - originalSequence.from) /
						parentPlaybackRate,
					Math.min(
						0,
						(timingLimits.minimumFrom - originalSequence.from) /
							parentPlaybackRate,
					),
				),
				maximumDeltaFrames: Math.max(
					0,
					(timingLimits.maximumFrom - originalSequence.from) /
						parentPlaybackRate,
				),
				initialTimelineStart,
				effectKeyframes,
				fileName: nodePath.absolutePath,
				initialFrom: originalSequence.from,
				nodePath,
				sequenceKeyframes,
			});
		}
	}

	return [...targets.values()];
};

const clearLeftEdgeDragOverrides = ({
	clearDragOverrides,
	targets,
}: {
	readonly clearDragOverrides: (nodePath: SequencePropsSubscriptionKey) => void;
	readonly targets: readonly TimelineSequenceLeftEdgeDragTarget[];
}) => {
	for (const target of targets) {
		clearDragOverrides(target.nodePath);
		if (target.ripplePrevious) {
			clearDragOverrides(target.ripplePrevious.nodePath);
		}
	}
};

const clearDurationDragOverrides = ({
	clearDragOverrides,
	targets,
}: {
	readonly clearDragOverrides: (nodePath: SequencePropsSubscriptionKey) => void;
	readonly targets: readonly TimelineSequenceDurationDragTarget[];
}) => {
	for (const target of targets) {
		clearDragOverrides(target.nodePath);
	}
};

const clearFromDragOverrides = ({
	clearDragOverrides,
	clearEffectDragOverrides,
	targets,
}: {
	readonly clearDragOverrides: (nodePath: SequencePropsSubscriptionKey) => void;
	readonly clearEffectDragOverrides: (
		nodePath: SequencePropsSubscriptionKey,
		effectIndex: number,
	) => void;
	readonly targets: readonly TimelineSequenceFromDragTarget[];
}) => {
	for (const target of targets) {
		clearDragOverrides(target.nodePath);
		for (const keyframeTarget of target.sequenceKeyframes) {
			clearDragOverrides(keyframeTarget.nodePath);
		}

		const clearedEffects = new Set<string>();
		for (const keyframeTarget of target.effectKeyframes) {
			const key = `${stringifySequenceSubscriptionKey(keyframeTarget.nodePath)}:${keyframeTarget.effectIndex}`;
			if (clearedEffects.has(key)) {
				continue;
			}

			clearedEffects.add(key);
			clearEffectDragOverrides(
				keyframeTarget.nodePath,
				keyframeTarget.effectIndex,
			);
		}
	}
};

const TimelineSequenceLeftEdgeDragHandleInner: React.FC<{
	readonly cursor: string;
	readonly trimBeforeCursor: string;
	readonly edgeEnabled: boolean;
	readonly edgeMode: 'ripple' | 'source-only';
	readonly secondaryAction: 'source-only' | 'self-trim' | null;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly windowWidth: number;
	readonly timelineDurationInFrames: number;
	readonly initialEdgeFrame: number;
	readonly fps: number;
	readonly onDragStart: (
		mode: 'ripple' | 'source-only' | 'self-trim',
		targetNodePaths: readonly SequencePropsSubscriptionKey[],
	) => void;
	readonly onDragEnd: (wasDragged: boolean) => void;
	readonly onSelect: (interaction?: TimelineSelectionInteraction) => void;
	readonly selected: boolean;
}> = ({
	cursor,
	trimBeforeCursor,
	edgeEnabled,
	edgeMode,
	secondaryAction,
	nodePathInfo,
	windowWidth,
	timelineDurationInFrames,
	initialEdgeFrame,
	fps,
	onDragStart,
	onDragEnd,
	onSelect,
	selected,
}) => {
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const batchSetters = useContext(Internals.VisualModeBatchSettersContext);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const [trimTooltip, setTrimTooltip] =
		useState<TimelineTrimTooltipState | null>(null);

	const stopPointerSessionRef = useRef<(() => void) | null>(null);
	const dragStateRef = useRef<{
		initialClientX: number;
		latestDeltaFrames: number;
		lastPreviewDeltaFrames: number;
		previousPreviewValues: Map<string, Map<string, number>>;
		lastTooltipDelta: number | null;
		didMove: boolean;
		pxPerFrame: number;
		pointerId: number;
		selectionInteraction: TimelineSelectionInteraction | null;
		targets: readonly TimelineSequenceLeftEdgeDragTarget[];
		mode: 'ripple' | 'source-only' | 'self-trim';
	} | null>(null);

	const latestRef = useRef({
		nodePathInfo,
		initialEdgeFrame,
		setPropStatuses,
		setDragOverrides,
		batchSetters,
		clearDragOverrides,
		previewServerState,
		overrideIdToNodePathMappings,
		onDragEnd,
		onSelect,
	});
	latestRef.current = {
		nodePathInfo,
		initialEdgeFrame,
		setPropStatuses,
		setDragOverrides,
		batchSetters,
		clearDragOverrides,
		previewServerState,
		overrideIdToNodePathMappings,
		onDragEnd,
		onSelect,
	};

	const finishDrag = useCallback((commit: boolean) => {
		const dragState = dragStateRef.current;
		if (!dragState) {
			return;
		}

		dragStateRef.current = null;
		setTrimTooltip(null);
		latestRef.current.onDragEnd(dragState.didMove);
		document.body.style.userSelect = '';
		document.body.style.webkitUserSelect = '';
		stopForcingSpecificCursor();
		if (
			commit &&
			!dragState.didMove &&
			dragState.selectionInteraction !== null
		) {
			latestRef.current.onSelect(dragState.selectionInteraction);
		}

		const {
			setPropStatuses: latestSetPropStatuses,
			clearDragOverrides: latestClear,
			previewServerState: latestServerState,
		} = latestRef.current;

		const changes = getTimelineSequenceLeftEdgeDragChanges({
			targets: dragState.targets,
			deltaFrames: dragState.latestDeltaFrames,
			trimBeforeOnly: dragState.mode === 'source-only',
		});

		if (
			!commit ||
			latestServerState.type !== 'connected' ||
			changes.length === 0
		) {
			clearLeftEdgeDragOverrides({
				clearDragOverrides: latestClear,
				targets: dragState.targets,
			});
			return;
		}

		const savePromise = saveSequenceProps({
			addedKeyframes: null,
			movedKeyframes: null,
			changes,
			setPropStatuses: latestSetPropStatuses,
			clientId: latestServerState.clientId,
			undoLabel:
				dragState.mode === 'source-only'
					? dragState.targets.length > 1
						? 'Adjust source start of selected sequences'
						: 'Adjust source start'
					: dragState.targets.length > 1
						? 'Resize selected sequences'
						: 'Resize sequence',
			redoLabel:
				dragState.mode === 'source-only'
					? dragState.targets.length > 1
						? 'Adjust source start of selected sequences back'
						: 'Adjust source start back'
					: dragState.targets.length > 1
						? 'Resize selected sequences back'
						: 'Resize sequence back',
		});

		savePromise
			.catch((err) => {
				Internals.Log.error(
					{logLevel: 'error', tag: null},
					'Could not save left edge drag',
					err,
				);
			})
			.finally(() => {
				clearLeftEdgeDragOverrides({
					clearDragOverrides: latestClear,
					targets: dragState.targets,
				});
			});
	}, []);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button !== 0) {
				return;
			}

			const mode =
				e.currentTarget.dataset.trimMode === 'source-only'
					? 'source-only'
					: e.currentTarget.dataset.trimMode === 'self-trim'
						? 'self-trim'
						: 'ripple';
			const trimBeforeOnly = mode === 'source-only';
			const activeCursor = mode === 'ripple' ? cursor : trimBeforeCursor;

			e.stopPropagation();
			e.preventDefault();

			const selectionInteraction = getTimelineSequenceEdgeSelectionInteraction({
				button: e.button,
				selected,
				shiftKey: e.shiftKey,
				metaKey: e.metaKey,
				ctrlKey: e.ctrlKey,
			});
			const pxPerFrame =
				timelineDurationInFrames > 0
					? (windowWidth - TIMELINE_PADDING * 2) / timelineDurationInFrames
					: 0;
			const canCalculateDelta = Number.isFinite(pxPerFrame) && pxPerFrame > 0;

			const {
				nodePathInfo: latestNodePathInfo,
				overrideIdToNodePathMappings: latestOverrideIdsToNodePaths,
			} = latestRef.current;
			const {selectedItems: latestSelectedItems} = currentSelection.current;
			const targets = canCalculateDelta
				? (getTimelineSequenceLeftEdgeDragTargets({
						draggedNodePathInfo: latestNodePathInfo,
						selectedItems: latestSelectedItems,
						sequences: sequencesRef.current,
						overrideIdsToNodePaths: latestOverrideIdsToNodePaths,
						propStatuses: propStatusesRef.current,
						timelineDurationInFrames,
						trimBeforeOnly,
						rippleEdit: mode === 'ripple',
					}) ?? [])
				: [];
			const draggedKey = stringifySequenceSubscriptionKey(
				latestNodePathInfo.sequenceSubscriptionKey,
			);
			const draggedTarget = targets.find(
				(target) =>
					stringifySequenceSubscriptionKey(target.nodePath) === draggedKey,
			);
			const handleRect = e.currentTarget.getBoundingClientRect();
			const initialEdgeClientX = handleRect.left + HANDLE_OUTSET;
			const initialEdgeClientY = handleRect.top;
			const initialTimelineEdge = latestRef.current.initialEdgeFrame;

			stopPointerSessionRef.current?.();
			onDragStart(
				mode,
				targets.map((target) => target.nodePath),
			);
			dragStateRef.current = {
				initialClientX: e.clientX,
				latestDeltaFrames: 0,
				lastPreviewDeltaFrames: 0,
				previousPreviewValues: new Map(),
				lastTooltipDelta: null,
				didMove: false,
				pxPerFrame: canCalculateDelta ? pxPerFrame : 1,
				pointerId: e.pointerId,
				selectionInteraction,
				targets,
				mode,
			};
			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';
			forceSpecificCursor(activeCursor);

			const onMove = (pointerEvent: PointerEvent) => {
				const dragState = dragStateRef.current;
				if (!dragState || pointerEvent.pointerId !== dragState.pointerId) {
					return;
				}

				const dx = pointerEvent.clientX - dragState.initialClientX;
				const pointerDeltaFrames = Math.round(dx / dragState.pxPerFrame);
				const deltaFrames =
					dragState.mode === 'self-trim'
						? -pointerDeltaFrames
						: pointerDeltaFrames;
				dragState.latestDeltaFrames = deltaFrames;
				if (
					Math.abs(dx) >= timelineSequenceEdgeDragThresholdPx ||
					getTimelineSequenceLeftEdgeDragChanges({
						targets: dragState.targets,
						deltaFrames,
						trimBeforeOnly: dragState.mode === 'source-only',
					}).length > 0
				) {
					dragState.didMove = true;
				}

				if (
					deltaFrames === dragState.lastPreviewDeltaFrames &&
					(!dragState.didMove ||
						draggedTarget === undefined ||
						dragState.lastTooltipDelta !== null)
				) {
					return;
				}

				dragState.lastPreviewDeltaFrames = deltaFrames;

				const updates: DragOverrideUpdate[] = [];
				for (const target of dragState.targets) {
					if (target.ripplePrevious) {
						const previous = target.ripplePrevious;
						const nextDuration = getTimelineSequenceDurationDragValue({
							initialDuration: previous.initialDuration,
							deltaFrames: deltaFrames * previous.parentPlaybackRate,
							maximumDuration: previous.maximumDuration,
							minimumDuration: previous.minimumDuration,
						});
						queueStaticDragOverrideIfChanged({
							updates,
							previousValues: dragState.previousPreviewValues,
							nodePath: previous.nodePath,
							key: previous.endField.fieldKey,
							value: getTimelineSequenceEndFieldValue({
								endField: previous.endField,
								durationInFrames: nextDuration,
							}),
							initialValue: getTimelineSequenceEndFieldValue({
								endField: previous.endField,
								durationInFrames: previous.initialDuration,
							}),
						});
						continue;
					}

					const nextValues = getTimelineSequenceLeftEdgeDragValuesForTarget({
						target,
						deltaFrames,
						trimBeforeOnly: dragState.mode === 'source-only',
					});

					if (
						dragState.mode !== 'source-only' &&
						target.positionField !== null
					) {
						queueStaticDragOverrideIfChanged({
							updates,
							previousValues: dragState.previousPreviewValues,
							nodePath: target.nodePath,
							key: target.positionField,
							value: nextValues.from,
							initialValue: target.initialFrom,
						});
					}

					if (dragState.mode !== 'source-only') {
						queueStaticDragOverrideIfChanged({
							updates,
							previousValues: dragState.previousPreviewValues,
							nodePath: target.nodePath,
							key: 'durationInFrames',
							value: nextValues.durationInFrames * target.playbackRate,
							initialValue: target.initialDuration * target.playbackRate,
						});
					}

					queueStaticDragOverrideIfChanged({
						updates,
						previousValues: dragState.previousPreviewValues,
						nodePath: target.nodePath,
						key: 'trimBefore',
						value: nextValues.trimBefore,
						initialValue: target.initialTrimBefore,
					});
				}

				if (updates.length > 0) {
					if (latestRef.current.batchSetters) {
						latestRef.current.batchSetters.setDragOverridesBatch(updates);
					} else {
						for (const update of updates) {
							latestRef.current.setDragOverrides(
								update.nodePath,
								update.key,
								update.value,
							);
						}
					}
				}

				if (dragState.didMove && draggedTarget) {
					const {ripplePrevious} = draggedTarget;
					let appliedDelta: number;
					if (ripplePrevious) {
						const nextDuration = getTimelineSequenceDurationDragValue({
							initialDuration: ripplePrevious.initialDuration,
							deltaFrames: deltaFrames * ripplePrevious.parentPlaybackRate,
							maximumDuration: ripplePrevious.maximumDuration,
							minimumDuration: ripplePrevious.minimumDuration,
						});
						appliedDelta =
							(nextDuration - ripplePrevious.initialDuration) /
							ripplePrevious.parentPlaybackRate;
					} else {
						const values = getTimelineSequenceLeftEdgeDragValuesForTarget({
							target: draggedTarget,
							deltaFrames,
							trimBeforeOnly: dragState.mode === 'source-only',
						});
						appliedDelta =
							dragState.mode === 'source-only'
								? (values.trimBefore - draggedTarget.initialTrimBefore) /
									draggedTarget.playbackRate
								: values.from - draggedTarget.initialFrom;
					}

					const edgeDelta =
						dragState.mode === 'source-only' ||
						(draggedTarget.positionField === null && ripplePrevious === null)
							? 0
							: appliedDelta;
					if (dragState.lastTooltipDelta !== appliedDelta) {
						dragState.lastTooltipDelta = appliedDelta;
						setTrimTooltip({
							deltaFrames: appliedDelta,
							edgeFrame: initialTimelineEdge + edgeDelta,
							x:
								initialEdgeClientX +
								(edgeDelta / draggedTarget.parentPlaybackRate) *
									dragState.pxPerFrame,
							y: initialEdgeClientY,
						});
					}
				}
			};

			const onUp = (pointerEvent: PointerEvent) => {
				const dragState = dragStateRef.current;
				if (!dragState || pointerEvent.pointerId !== dragState.pointerId) {
					return;
				}

				// Include the release position even if the final pointermove was skipped.
				onMove(pointerEvent);
				finishDrag(true);
			};

			const onCancel = (pointerEvent: PointerEvent) => {
				const dragState = dragStateRef.current;
				if (!dragState || pointerEvent.pointerId !== dragState.pointerId) {
					return;
				}

				finishDrag(false);
			};

			stopPointerSessionRef.current = startCapturedPointerSession({
				event: e.nativeEvent,
				captureTarget: e.currentTarget,
				onMove,
				onEnd: (reason, endEvent) => {
					stopPointerSessionRef.current = null;
					if (isPointerSessionRelease(reason, endEvent)) {
						onUp(endEvent);
					} else if (endEvent) {
						onCancel(endEvent);
					} else {
						finishDrag(false);
					}
				},
			});
		},
		[
			currentSelection,
			cursor,
			finishDrag,
			onDragStart,
			propStatusesRef,
			selected,
			sequencesRef,
			timelineDurationInFrames,
			trimBeforeCursor,
			windowWidth,
		],
	);

	useEffect(() => {
		return () => {
			stopPointerSessionRef.current?.();
			stopPointerSessionRef.current = null;
		};
	}, []);

	const edgeStyle: React.CSSProperties = {
		...baseStyle,
		left: -LEFT_EDGE_HANDLE_OUTSET,
		width: `calc(${LEFT_EDGE_HANDLE_OUTSET}px + min(${LEFT_EDGE_HANDLE_INSET}px, 12.5%))`,
		cursor: edgeMode === 'source-only' ? trimBeforeCursor : cursor,
		background: TRANSPARENT,
		pointerEvents: 'auto',
	};
	const trimBeforeStyle: React.CSSProperties = {
		...baseStyle,
		left: edgeEnabled ? 'min(4px, 12.5%)' : 0,
		width: edgeEnabled ? 'min(10px, 12.5%)' : 'min(14px, 25%)',
		cursor: trimBeforeCursor,
		background: TRANSPARENT,
		pointerEvents: 'auto',
	};

	return (
		<>
			{edgeEnabled ? (
				<div
					role="separator"
					aria-orientation="vertical"
					aria-label={
						edgeMode === 'source-only'
							? 'Drag to adjust source start'
							: 'Drag to trim start'
					}
					data-trim-mode={edgeMode}
					style={edgeStyle}
					onPointerDown={onPointerDown}
					onClick={(e) => e.stopPropagation()}
				/>
			) : null}
			{secondaryAction ? (
				<div
					role="separator"
					aria-orientation="vertical"
					aria-label={
						secondaryAction === 'source-only'
							? 'Drag to adjust source start'
							: 'Drag to trim start without ripple'
					}
					data-trim-mode={secondaryAction}
					style={trimBeforeStyle}
					onPointerDown={onPointerDown}
					onClick={(e) => e.stopPropagation()}
				/>
			) : null}
			{trimTooltip === null ? null : (
				<TimelineTrimTooltip state={trimTooltip} fps={fps} />
			)}
		</>
	);
};

export const TimelineSequenceLeftEdgeDragHandle = React.memo(
	TimelineSequenceLeftEdgeDragHandleInner,
);

export const useTimelineSequenceFromDrag = ({
	nodePathInfo,
	windowWidth,
	timelineDurationInFrames,
	onDragEnd,
}: {
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly windowWidth: number;
	readonly timelineDurationInFrames: number;
	readonly onDragEnd: (wasDragged: boolean) => void;
}) => {
	const {
		setPropStatuses,
		setDragOverrides,
		clearDragOverrides,
		setEffectDragOverrides,
		clearEffectDragOverrides,
	} = useContext(Internals.VisualModeSettersContext);
	const batchSetters = useContext(Internals.VisualModeBatchSettersContext);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const {editorSnapping} = useContext(EditorSnappingContext);
	const updateSnapFrameRef = useContext(TimelineSnapIndicatorContext);

	const stopPointerSessionRef = useRef<(() => void) | null>(null);
	const dragStateRef = useRef<{
		initialClientX: number;
		latestDeltaFrames: number;
		lastPreviewDeltaFrames: number;
		didMove: boolean;
		pxPerFrame: number;
		targets: readonly TimelineSequenceFromDragTarget[];
	} | null>(null);

	const latestRef = useRef({
		nodePathInfo,
		setPropStatuses,
		setDragOverrides,
		batchSetters,
		clearDragOverrides,
		setEffectDragOverrides,
		clearEffectDragOverrides,
		previewServerState,
		overrideIdToNodePathMappings,
		editorSnapping,
		onDragEnd,
	});
	latestRef.current = {
		nodePathInfo,
		setPropStatuses,
		setDragOverrides,
		batchSetters,
		clearDragOverrides,
		setEffectDragOverrides,
		clearEffectDragOverrides,
		previewServerState,
		overrideIdToNodePathMappings,
		editorSnapping,
		onDragEnd,
	};

	const finishDrag = useCallback(
		(commit: boolean) => {
			const dragState = dragStateRef.current;
			if (!dragState) {
				return;
			}

			updateSnapFrameRef?.current(null);
			dragStateRef.current = null;
			latestRef.current.onDragEnd(dragState.didMove);
			document.body.style.userSelect = '';
			document.body.style.webkitUserSelect = '';
			const {
				setPropStatuses: latestSetPropStatuses,
				clearDragOverrides: latestClear,
				clearEffectDragOverrides: latestClearEffect,
				previewServerState: latestServerState,
			} = latestRef.current;

			const changes = getTimelineSequenceFromDragChanges({
				targets: dragState.targets,
				deltaFrames: dragState.latestDeltaFrames,
			});
			const keyframeMoves = getTimelineSequenceFromDragKeyframeMoves({
				targets: dragState.targets,
				deltaFrames: dragState.latestDeltaFrames,
			});

			if (
				!commit ||
				latestServerState.type !== 'connected' ||
				(changes.length === 0 &&
					keyframeMoves.sequenceKeyframes.length === 0 &&
					keyframeMoves.effectKeyframes.length === 0)
			) {
				clearFromDragOverrides({
					clearDragOverrides: latestClear,
					clearEffectDragOverrides: latestClearEffect,
					targets: dragState.targets,
				});
				return;
			}

			const savePromise = saveSequenceProps({
				addedKeyframes: null,
				changes,
				movedKeyframes: {
					sequenceKeyframes: keyframeMoves.sequenceKeyframes,
					effectKeyframes: keyframeMoves.effectKeyframes,
				},
				setPropStatuses: latestSetPropStatuses,
				clientId: latestServerState.clientId,
				undoLabel:
					dragState.targets.length > 1
						? 'Move selected sequences'
						: 'Move sequence',
				redoLabel:
					dragState.targets.length > 1
						? 'Move selected sequences back'
						: 'Move sequence back',
			});

			savePromise
				.catch((err) => {
					Internals.Log.error(
						{logLevel: 'error', tag: null},
						'Could not save from',
						err,
					);
				})
				.finally(() => {
					clearFromDragOverrides({
						clearDragOverrides: latestClear,
						clearEffectDragOverrides: latestClearEffect,
						targets: dragState.targets,
					});
				});
		},
		[updateSnapFrameRef],
	);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button !== 0) {
				return;
			}

			const pxPerFrame =
				timelineDurationInFrames > 0
					? (windowWidth - TIMELINE_PADDING * 2) / timelineDurationInFrames
					: 0;
			if (pxPerFrame <= 0) {
				return;
			}

			const {
				nodePathInfo: latestNodePathInfo,
				overrideIdToNodePathMappings: latestOverrideIdsToNodePaths,
			} = latestRef.current;
			const {selectedItems: latestSelectedItems} = currentSelection.current;
			if (latestNodePathInfo === null) {
				return;
			}

			const targets = getTimelineSequenceFromDragTargets({
				draggedNodePathInfo: latestNodePathInfo,
				selectedItems: latestSelectedItems,
				sequences: sequencesRef.current,
				overrideIdsToNodePaths: latestOverrideIdsToNodePaths,
				propStatuses: propStatusesRef.current,
			});
			if (targets === null || targets.length === 0) {
				return;
			}

			stopPointerSessionRef.current?.();
			e.preventDefault();
			dragStateRef.current = {
				initialClientX: e.clientX,
				latestDeltaFrames: 0,
				lastPreviewDeltaFrames: 0,
				didMove: false,
				pxPerFrame,
				targets,
			};
			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';
			// Register before React commits so no pointer move can arrive before
			// the global session listeners exist.
			stopPointerSessionRef.current = startDeferredCapturedPointerSession({
				event: e.nativeEvent,
				captureTarget: e.currentTarget.ownerDocument.body,
				onMove: (moveEvent, capturePointer) => {
					const dragState = dragStateRef.current;
					if (!dragState) {
						return;
					}

					const dx = moveEvent.clientX - dragState.initialClientX;
					const pointerDeltaFrames = Math.round(dx / dragState.pxPerFrame);
					const {deltaFrames, snapFrame} = getTimelineSequenceFromDragResult({
						timelineDurationInFrames,
						deltaFrames: pointerDeltaFrames,
						pxPerFrame: dragState.pxPerFrame,
						snappingEnabled: latestRef.current.editorSnapping,
						targets: dragState.targets,
					});
					dragState.latestDeltaFrames = deltaFrames;
					if (
						!dragState.didMove &&
						(deltaFrames !== 0 ||
							(snapFrame !== null && pointerDeltaFrames !== 0))
					) {
						// The bar can be removed when it leaves the visible timeline.
						// Capture only after a real drag starts so clicks and double-clicks
						// remain targeted at the bar.
						capturePointer();
						dragState.didMove = true;
					}

					updateSnapFrameRef?.current(dragState.didMove ? snapFrame : null);

					if (deltaFrames === dragState.lastPreviewDeltaFrames) {
						return;
					}

					dragState.lastPreviewDeltaFrames = deltaFrames;
					const updates: DragOverrideUpdate[] = [];
					const effectUpdates: EffectDragOverrideUpdate[] = [];

					for (const target of dragState.targets) {
						const nextFrom = getTimelineSequenceFromDragValue({
							initialFrom: target.initialFrom,
							deltaFrames: deltaFrames * target.parentPlaybackRate,
						});
						updates.push({
							nodePath: target.nodePath,
							key: 'from',
							value: Internals.makeStaticDragOverride(nextFrom),
						});
						for (const keyframeTarget of target.sequenceKeyframes) {
							updates.push({
								nodePath: keyframeTarget.nodePath,
								key: keyframeTarget.fieldKey,
								value: {
									type: 'keyframed',
									status: shiftKeyframedStatus({
										status: keyframeTarget.status,
										deltaFrames:
											deltaFrames * keyframeTarget.parentPlaybackRate,
										isDescendant: keyframeTarget.isDescendant,
									}),
								},
							});
						}

						for (const keyframeTarget of target.effectKeyframes) {
							effectUpdates.push({
								nodePath: keyframeTarget.nodePath,
								effectIndex: keyframeTarget.effectIndex,
								key: keyframeTarget.fieldKey,
								value: {
									type: 'keyframed',
									status: shiftKeyframedStatus({
										status: keyframeTarget.status,
										deltaFrames:
											deltaFrames * keyframeTarget.parentPlaybackRate,
										isDescendant: keyframeTarget.isDescendant,
									}),
								},
							});
						}
					}

					if (latestRef.current.batchSetters) {
						latestRef.current.batchSetters.setDragOverridesBatch(updates);
					} else {
						for (const update of updates) {
							latestRef.current.setDragOverrides(
								update.nodePath,
								update.key,
								update.value,
							);
						}
					}

					if (effectUpdates.length > 0) {
						if (latestRef.current.batchSetters) {
							latestRef.current.batchSetters.setEffectDragOverridesBatch(
								effectUpdates,
							);
						} else {
							for (const update of effectUpdates) {
								latestRef.current.setEffectDragOverrides(
									update.nodePath,
									update.effectIndex,
									update.key,
									update.value,
								);
							}
						}
					}
				},
				onEnd: (reason, endEvent) => {
					stopPointerSessionRef.current = null;
					finishDrag(isPointerSessionRelease(reason, endEvent));
				},
			});
		},
		[
			currentSelection,
			finishDrag,
			propStatusesRef,
			sequencesRef,
			timelineDurationInFrames,
			updateSnapFrameRef,
			windowWidth,
		],
	);

	useEffect(() => {
		return () => {
			stopPointerSessionRef.current?.();
			stopPointerSessionRef.current = null;
		};
	}, []);

	return {
		onPointerDown,
	};
};

const TimelineSequenceRightEdgeDragHandleInner: React.FC<{
	readonly cursor: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly mediaDurationDragLimits: TimelineSequenceMediaDurationDragLimits | null;
	readonly windowWidth: number;
	readonly timelineDurationInFrames: number;
	readonly initialEdgeFrame: number;
	readonly fps: number;
	readonly onDragStart: (
		targetNodePaths: readonly SequencePropsSubscriptionKey[],
	) => void;
	readonly onDragEnd: (wasDragged: boolean) => void;
	readonly onSelect: (interaction?: TimelineSelectionInteraction) => void;
	readonly selected: boolean;
}> = ({
	cursor,
	nodePathInfo,
	mediaDurationDragLimits,
	windowWidth,
	timelineDurationInFrames,
	initialEdgeFrame,
	fps,
	onDragStart,
	onDragEnd,
	onSelect,
	selected,
}) => {
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const batchSetters = useContext(Internals.VisualModeBatchSettersContext);
	const updateSnapFrameRef = useContext(TimelineSnapIndicatorContext);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const mediaDurationDragLimitsRegistry = useContext(
		TimelineSequenceMediaDurationDragLimitsContext,
	);
	const [trimTooltip, setTrimTooltip] =
		useState<TimelineTrimTooltipState | null>(null);

	const stopPointerSessionRef = useRef<(() => void) | null>(null);
	const dragStateRef = useRef<{
		initialClientX: number;
		latestDeltaFrames: number;
		lastPreviewDeltaFrames: number;
		previousPreviewValues: Map<string, Map<string, number>>;
		lastTooltipDelta: number | null;
		didMove: boolean;
		pxPerFrame: number;
		pointerId: number;
		selectionInteraction: TimelineSelectionInteraction | null;
		targets: readonly TimelineSequenceDurationDragTarget[];
	} | null>(null);

	// Keep latest props/setters available to window listeners installed once at pointerdown.
	const latestRef = useRef({
		nodePathInfo,
		mediaDurationDragLimits,
		initialEdgeFrame,
		setPropStatuses,
		setDragOverrides,
		batchSetters,
		clearDragOverrides,
		previewServerState,
		overrideIdToNodePathMappings,
		onDragEnd,
		onSelect,
		updateSnapFrameRef,
	});
	latestRef.current = {
		nodePathInfo,
		mediaDurationDragLimits,
		initialEdgeFrame,
		setPropStatuses,
		setDragOverrides,
		batchSetters,
		clearDragOverrides,
		previewServerState,
		overrideIdToNodePathMappings,
		onDragEnd,
		onSelect,
		updateSnapFrameRef,
	};

	const finishDrag = useCallback((commit: boolean) => {
		const dragState = dragStateRef.current;
		if (!dragState) {
			return;
		}

		dragStateRef.current = null;
		setTrimTooltip(null);
		latestRef.current.updateSnapFrameRef?.current(null);
		latestRef.current.onDragEnd(dragState.didMove);
		document.body.style.userSelect = '';
		document.body.style.webkitUserSelect = '';
		stopForcingSpecificCursor();
		if (
			commit &&
			!dragState.didMove &&
			dragState.selectionInteraction !== null
		) {
			latestRef.current.onSelect(dragState.selectionInteraction);
		}

		const {
			setPropStatuses: latestSetPropStatuses,
			clearDragOverrides: latestClear,
			previewServerState: latestServerState,
		} = latestRef.current;

		const changes = getTimelineSequenceDurationDragChanges({
			targets: dragState.targets,
			deltaFrames: dragState.latestDeltaFrames,
		});

		if (
			!commit ||
			latestServerState.type !== 'connected' ||
			changes.length === 0
		) {
			clearDurationDragOverrides({
				clearDragOverrides: latestClear,
				targets: dragState.targets,
			});
			return;
		}

		const savePromise = saveSequenceProps({
			addedKeyframes: null,
			movedKeyframes: null,
			changes,
			setPropStatuses: latestSetPropStatuses,
			clientId: latestServerState.clientId,
			undoLabel:
				changes.length > 1 ? 'Resize selected sequences' : 'Resize sequence',
			redoLabel:
				changes.length > 1
					? 'Resize selected sequences back'
					: 'Resize sequence back',
		});

		savePromise
			.catch((err) => {
				Internals.Log.error(
					{logLevel: 'error', tag: null},
					'Could not save durationInFrames',
					err,
				);
			})
			.finally(() => {
				clearDurationDragOverrides({
					clearDragOverrides: latestClear,
					targets: dragState.targets,
				});
			});
	}, []);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button !== 0) {
				return;
			}

			e.stopPropagation();
			e.preventDefault();

			const selectionInteraction = getTimelineSequenceEdgeSelectionInteraction({
				button: e.button,
				selected,
				shiftKey: e.shiftKey,
				metaKey: e.metaKey,
				ctrlKey: e.ctrlKey,
			});
			const pxPerFrame =
				timelineDurationInFrames > 0
					? (windowWidth - TIMELINE_PADDING * 2) / timelineDurationInFrames
					: 0;
			const canCalculateDelta = Number.isFinite(pxPerFrame) && pxPerFrame > 0;

			const {
				nodePathInfo: latestNodePathInfo,
				mediaDurationDragLimits: latestMediaDurationDragLimits,
				overrideIdToNodePathMappings: latestOverrideIdsToNodePaths,
			} = latestRef.current;
			const {selectedItems: latestSelectedItems} = currentSelection.current;
			const targets = canCalculateDelta
				? (getTimelineSequenceDurationDragTargets({
						draggedNodePathInfo: latestNodePathInfo,
						draggedSequenceMediaDurationDragLimits:
							latestMediaDurationDragLimits,
						selectedSequenceMediaDurationDragLimits:
							mediaDurationDragLimitsRegistry?.current ?? null,
						selectedItems: latestSelectedItems,
						sequences: sequencesRef.current,
						overrideIdsToNodePaths: latestOverrideIdsToNodePaths,
						propStatuses: propStatusesRef.current,
						timelineDurationInFrames,
					}) ?? [])
				: [];
			const draggedKey = stringifySequenceSubscriptionKey(
				latestNodePathInfo.sequenceSubscriptionKey,
			);
			const draggedTarget = targets.find(
				(target) =>
					stringifySequenceSubscriptionKey(target.nodePath) === draggedKey,
			);
			const handleRect = e.currentTarget.getBoundingClientRect();
			const initialEdgeClientX = handleRect.right - HANDLE_OUTSET;
			const initialEdgeClientY = handleRect.top;
			const initialTimelineEdge = latestRef.current.initialEdgeFrame;

			stopPointerSessionRef.current?.();
			onDragStart(targets.map((target) => target.nodePath));
			dragStateRef.current = {
				initialClientX: e.clientX,
				latestDeltaFrames: 0,
				lastPreviewDeltaFrames: 0,
				previousPreviewValues: new Map(),
				lastTooltipDelta: null,
				didMove: false,
				pxPerFrame: canCalculateDelta ? pxPerFrame : 1,
				pointerId: e.pointerId,
				selectionInteraction,
				targets,
			};
			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';
			forceSpecificCursor(cursor);

			const onMove = (pointerEvent: PointerEvent) => {
				const dragState = dragStateRef.current;
				if (!dragState || pointerEvent.pointerId !== dragState.pointerId) {
					return;
				}

				const dx = pointerEvent.clientX - dragState.initialClientX;
				const deltaFrames = Math.round(dx / dragState.pxPerFrame);
				dragState.latestDeltaFrames = deltaFrames;
				if (
					Math.abs(dx) >= timelineSequenceEdgeDragThresholdPx ||
					getTimelineSequenceDurationDragChanges({
						targets: dragState.targets,
						deltaFrames,
					}).length > 0
				) {
					dragState.didMove = true;
				}

				if (
					deltaFrames === dragState.lastPreviewDeltaFrames &&
					(!dragState.didMove ||
						draggedTarget === undefined ||
						dragState.lastTooltipDelta !== null)
				) {
					return;
				}

				dragState.lastPreviewDeltaFrames = deltaFrames;

				const updates: DragOverrideUpdate[] = [];
				for (const target of dragState.targets) {
					const previewValue = getTimelineSequenceDurationDragValue({
						initialDuration: target.initialDuration,
						deltaFrames: deltaFrames * target.parentPlaybackRate,
						maximumDuration: target.maximumDuration,
						minimumDuration: target.minimumDuration,
					});

					queueStaticDragOverrideIfChanged({
						updates,
						previousValues: dragState.previousPreviewValues,
						nodePath: target.nodePath,
						key: target.endField.fieldKey,
						value: getTimelineSequenceEndFieldValue({
							endField: target.endField,
							durationInFrames: previewValue,
						}),
						initialValue: getTimelineSequenceEndFieldValue({
							endField: target.endField,
							durationInFrames: target.initialDuration,
						}),
					});
				}

				if (updates.length > 0) {
					if (latestRef.current.batchSetters) {
						latestRef.current.batchSetters.setDragOverridesBatch(updates);
					} else {
						for (const update of updates) {
							latestRef.current.setDragOverrides(
								update.nodePath,
								update.key,
								update.value,
							);
						}
					}
				}

				if (dragState.didMove && draggedTarget) {
					const previewValue = getTimelineSequenceDurationDragValue({
						initialDuration: draggedTarget.initialDuration,
						deltaFrames: deltaFrames * draggedTarget.parentPlaybackRate,
						maximumDuration: draggedTarget.maximumDuration,
						minimumDuration: draggedTarget.minimumDuration,
					});
					const appliedDelta =
						(previewValue - draggedTarget.initialDuration) /
						draggedTarget.parentPlaybackRate;
					updateSnapFrameRef?.current(
						'naturalDuration' in draggedTarget &&
							previewValue === draggedTarget.naturalDuration
							? initialTimelineEdge + appliedDelta
							: null,
					);
					if (dragState.lastTooltipDelta !== appliedDelta) {
						dragState.lastTooltipDelta = appliedDelta;
						setTrimTooltip({
							deltaFrames: appliedDelta,
							edgeFrame: initialTimelineEdge + appliedDelta,
							x:
								initialEdgeClientX +
								(appliedDelta / draggedTarget.parentPlaybackRate) *
									dragState.pxPerFrame,
							y: initialEdgeClientY,
						});
					}
				}
			};

			const onUp = (pointerEvent: PointerEvent) => {
				const dragState = dragStateRef.current;
				if (!dragState || pointerEvent.pointerId !== dragState.pointerId) {
					return;
				}

				// Include the release position even if the final pointermove was skipped.
				onMove(pointerEvent);
				finishDrag(true);
			};

			const onCancel = (pointerEvent: PointerEvent) => {
				const dragState = dragStateRef.current;
				if (!dragState || pointerEvent.pointerId !== dragState.pointerId) {
					return;
				}

				finishDrag(false);
			};

			stopPointerSessionRef.current = startCapturedPointerSession({
				event: e.nativeEvent,
				captureTarget: e.currentTarget,
				onMove,
				onEnd: (reason, endEvent) => {
					stopPointerSessionRef.current = null;
					if (isPointerSessionRelease(reason, endEvent)) {
						onUp(endEvent);
					} else if (endEvent) {
						onCancel(endEvent);
					} else {
						finishDrag(false);
					}
				},
			});
		},
		[
			currentSelection,
			cursor,
			finishDrag,
			mediaDurationDragLimitsRegistry,
			onDragStart,
			propStatusesRef,
			selected,
			sequencesRef,
			timelineDurationInFrames,
			windowWidth,
			updateSnapFrameRef,
		],
	);

	useEffect(() => {
		return () => {
			stopPointerSessionRef.current?.();
			stopPointerSessionRef.current = null;
		};
	}, []);

	const style: React.CSSProperties = {
		...baseStyle,
		right: -HANDLE_OUTSET,
		cursor,
		background: TRANSPARENT,
	};

	return (
		<>
			<div
				role="separator"
				aria-orientation="vertical"
				aria-label="Drag to change duration"
				style={style}
				onPointerDown={onPointerDown}
				onClick={(e) => e.stopPropagation()}
			/>
			{trimTooltip === null ? null : (
				<TimelineTrimTooltip state={trimTooltip} fps={fps} />
			)}
		</>
	);
};

export const TimelineSequenceRightEdgeDragHandle = React.memo(
	TimelineSequenceRightEdgeDragHandleInner,
);
