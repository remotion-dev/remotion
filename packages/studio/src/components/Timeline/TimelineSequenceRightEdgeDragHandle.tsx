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
	CanUpdateSequencePropStatusKeyframed,
	OverrideIdToNodePaths,
	PropStatuses,
	SequencePropsSubscriptionKey,
	TSequence,
	InteractivitySchema,
} from 'remotion';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {TRANSPARENT} from '../../helpers/colors';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {sortItemsByNonceHistory} from '../../helpers/sort-by-nonce-history';
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
	saveSequenceProps,
	type SaveSequencePropChange,
} from './save-sequence-prop';
import {
	getTimelineSequenceSelectionKey,
	useCurrentTimelineSelectionStateAsRef,
	type TimelineSelection,
} from './TimelineSelection';

const HANDLE_WIDTH = 6;
export const timelineSequenceFromDragSnapThresholdPx = 10;

const baseStyle: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	bottom: 0,
	width: HANDLE_WIDTH,
	cursor: 'ew-resize',
	zIndex: 1,
	touchAction: 'none',
};

export type TimelineSequenceDurationDragTarget = {
	readonly fileName: string;
	readonly initialDuration: number;
	readonly minimumDuration: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: InteractivitySchema;
};

export type TimelineSequenceLeftEdgeDragTarget = {
	readonly fileName: string;
	readonly initialDuration: number;
	readonly initialFrom: number;
	readonly initialTrimBefore: number;
	readonly minimumDuration: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly playbackRate: number;
	readonly positionField: 'from' | null;
	readonly schema: InteractivitySchema;
};

export type TimelineSequenceFromDragTarget = {
	readonly canSnapToTimelineStart: boolean;
	readonly effectKeyframes: TimelineSequenceEffectKeyframeDragTarget[];
	readonly fileName: string;
	readonly initialFrom: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly sequenceKeyframes: TimelineSequenceKeyframeDragTarget[];
};

type TimelineSequenceKeyframeDragTarget = {
	readonly fieldKey: string;
	readonly schema: InteractivitySchema;
	readonly status: CanUpdateSequencePropStatusKeyframed;
};

type TimelineSequenceEffectKeyframeDragTarget =
	TimelineSequenceKeyframeDragTarget & {
		readonly effectIndex: number;
	};

const getKeyframedSequenceDragTargets = ({
	nodePath,
	sequence,
	propStatuses,
}: {
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly sequence: TSequence;
	readonly propStatuses: PropStatuses;
}): {
	readonly effectKeyframes: TimelineSequenceEffectKeyframeDragTarget[];
	readonly sequenceKeyframes: TimelineSequenceKeyframeDragTarget[];
} => {
	const status =
		propStatuses[Internals.makeSequencePropsSubscriptionKey(nodePath)];
	if (status === null || status === undefined || !status.canUpdate) {
		return {effectKeyframes: [], sequenceKeyframes: []};
	}

	const sequenceSchema = sequence.controls?.schema;
	const sequenceKeyframes =
		sequenceSchema === undefined
			? []
			: Object.entries(status.props).flatMap(([fieldKey, propStatus]) =>
					propStatus.status === 'keyframed'
						? [{fieldKey, schema: sequenceSchema, status: propStatus}]
						: [],
				);

	const effectKeyframes = status.effects.flatMap((effectStatus) => {
		if (!effectStatus.canUpdate) {
			return [];
		}

		const effectSchema = sequence.effects[effectStatus.effectIndex]?.schema;
		if (effectSchema === undefined) {
			return [];
		}

		return Object.entries(effectStatus.props).flatMap(
			([fieldKey, propStatus]) =>
				propStatus.status === 'keyframed'
					? [
							{
								effectIndex: effectStatus.effectIndex,
								fieldKey,
								schema: effectSchema,
								status: propStatus,
							},
						]
					: [],
		);
	});

	return {effectKeyframes, sequenceKeyframes};
};

const shiftKeyframedStatus = ({
	status,
	deltaFrames,
}: {
	readonly status: CanUpdateSequencePropStatusKeyframed;
	readonly deltaFrames: number;
}): CanUpdateSequencePropStatusKeyframed => {
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

const isTransitionSeriesTransition = (sequence: TSequence | undefined) =>
	sequence?.controls?.componentIdentity ===
	'dev.remotion.transitions.TransitionSeries.Transition';

const getMinimumSequenceDuration = ({
	sequence,
	sequences,
}: {
	readonly sequence: TSequence;
	readonly sequences: TSequence[];
}) => {
	if (!isTransitionSeriesSequence(sequence)) {
		return 1;
	}

	const siblings = sortItemsByNonceHistory(
		sequences.filter(
			(candidate) =>
				candidate.parent === sequence.parent &&
				candidate.rootId === sequence.rootId &&
				(isTransitionSeriesSequence(candidate) ||
					isTransitionSeriesTransition(candidate)),
		),
	);
	const sequenceIndex = siblings.findIndex(
		(candidate) => candidate.id === sequence.id,
	);
	if (sequenceIndex === -1) {
		return 1;
	}

	const previous = siblings[sequenceIndex - 1];
	const next = siblings[sequenceIndex + 1];

	return Math.max(
		1,
		isTransitionSeriesTransition(previous) ? previous.duration : 1,
		isTransitionSeriesTransition(next) ? next.duration : 1,
	);
};

export const isTimelineSequenceDurationDraggable = (sequence: TSequence) => {
	const isInteractiveCascadingSequence = isCascadingSequence(sequence);

	return (
		(sequence.type === 'sequence' ||
			sequence.type === 'image' ||
			sequence.type === 'audio' ||
			sequence.type === 'video') &&
		!sequence.loopDisplay &&
		(!sequence.isInsideSeries || isInteractiveCascadingSequence) &&
		Boolean(sequence.controls)
	);
};

export const isTimelineSequenceLeftEdgeDraggable = (sequence: TSequence) => {
	return (
		(!sequence.isInsideSeries || isCascadingSequence(sequence)) &&
		Boolean(sequence.controls) &&
		(sequence.type === 'sequence' ||
			sequence.type === 'image' ||
			sequence.type === 'audio' ||
			sequence.type === 'video')
	);
};

const playbackRateComponentIdentities = new Set([
	'dev.remotion.gif.Gif',
	'dev.remotion.media.Audio',
	'dev.remotion.media.Video',
	'dev.remotion.remotion.AnimatedImage',
]);

const getTrimBeforePlaybackRate = (sequence: TSequence) => {
	const componentIdentity = sequence.controls?.componentIdentity;
	if (
		componentIdentity === null ||
		componentIdentity === undefined ||
		!playbackRateComponentIdentities.has(componentIdentity)
	) {
		return 1;
	}

	const runtimePlaybackRate =
		sequence.controls?.currentRuntimeValueDotNotation.playbackRate;
	return typeof runtimePlaybackRate === 'number' ? runtimePlaybackRate : 1;
};

const isFromDraggableSequence = (sequence: TSequence) => {
	return (
		!sequence.loopDisplay &&
		!sequence.isInsideSeries &&
		Boolean(sequence.controls)
	);
};

export const getTimelineSequenceDurationDragValue = ({
	initialDuration,
	deltaFrames,
	minimumDuration = 1,
}: {
	readonly initialDuration: number;
	readonly deltaFrames: number;
	readonly minimumDuration?: number;
}) => Math.max(minimumDuration, initialDuration + deltaFrames);

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
	const minDeltaFrames = 0 - initialTrimBefore / playbackRate;
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
}: {
	readonly initialDuration: number;
	readonly initialFrom: number;
	readonly initialTrimBefore: number;
	readonly deltaFrames: number;
	readonly playbackRate: number;
	readonly minimumDuration?: number;
}) => {
	const clampedDeltaFrames = getTimelineSequenceLeftEdgeDragDelta({
		initialDuration,
		initialTrimBefore,
		deltaFrames,
		playbackRate,
		minimumDuration,
	});

	return {
		durationInFrames: initialDuration - clampedDeltaFrames,
		from: initialFrom + clampedDeltaFrames,
		trimBefore: initialTrimBefore + clampedDeltaFrames * playbackRate,
	};
};

export const getTimelineSequenceLeftEdgeDragChanges = ({
	targets,
	deltaFrames,
}: {
	readonly targets: readonly TimelineSequenceLeftEdgeDragTarget[];
	readonly deltaFrames: number;
}): SaveSequencePropChange[] => {
	return targets.flatMap((target) => {
		const nextValues = getTimelineSequenceLeftEdgeDragValues({
			initialDuration: target.initialDuration,
			initialFrom: target.initialFrom,
			initialTrimBefore: target.initialTrimBefore,
			deltaFrames,
			playbackRate: target.playbackRate,
			minimumDuration: target.minimumDuration,
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
				value: nextValues.durationInFrames,
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
			deltaFrames,
			minimumDuration: target.minimumDuration,
		});

		if (nextValue === target.initialDuration) {
			return [];
		}

		return [
			{
				fileName: target.fileName,
				nodePath: target.nodePath,
				fieldKey: 'durationInFrames',
				value: nextValue,
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

export const getTimelineSequenceFromDragDelta = ({
	deltaFrames,
	pxPerFrame,
	snappingEnabled,
	targets,
}: {
	readonly deltaFrames: number;
	readonly pxPerFrame: number;
	readonly snappingEnabled: boolean;
	readonly targets: readonly TimelineSequenceFromDragTarget[];
}) => {
	if (!snappingEnabled) {
		return deltaFrames;
	}

	let closestSnap:
		| {
				readonly deltaFrames: number;
				readonly distancePx: number;
		  }
		| undefined;
	for (const target of targets) {
		if (!target.canSnapToTimelineStart) {
			continue;
		}

		const nextFrom = getTimelineSequenceFromDragValue({
			initialFrom: target.initialFrom,
			deltaFrames,
		});
		const distancePx = Math.abs(nextFrom * pxPerFrame);
		if (
			distancePx > timelineSequenceFromDragSnapThresholdPx ||
			(closestSnap && closestSnap.distancePx <= distancePx)
		) {
			continue;
		}

		closestSnap = {
			deltaFrames: -target.initialFrom,
			distancePx,
		};
	}

	return closestSnap?.deltaFrames ?? deltaFrames;
};

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
			deltaFrames,
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
					fileName: target.fileName,
					nodePath: target.nodePath,
					fieldKey: keyframeTarget.fieldKey,
					fromFrame: keyframe.frame,
					toFrame: keyframe.frame + deltaFrames,
					schema: keyframeTarget.schema,
				})),
			),
		),
		effectKeyframes: targets.flatMap((target) =>
			target.effectKeyframes.flatMap((keyframeTarget) =>
				keyframeTarget.status.keyframes.map((keyframe) => ({
					fileName: target.fileName,
					nodePath: target.nodePath,
					effectIndex: keyframeTarget.effectIndex,
					fieldKey: keyframeTarget.fieldKey,
					fromFrame: keyframe.frame,
					toFrame: keyframe.frame + deltaFrames,
					schema: keyframeTarget.schema,
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
		if (!canUpdateDurationInFrames({propStatuses, nodePath})) {
			return null;
		}

		const {controls} = originalSequence;
		if (!controls) {
			return null;
		}

		const key = stringifySequenceSubscriptionKey(nodePath);
		if (!targets.has(key)) {
			targets.set(key, {
				fileName: nodePath.absolutePath,
				initialDuration: originalSequence.duration,
				minimumDuration: getMinimumSequenceDuration({
					sequence: originalSequence,
					sequences,
				}),
				nodePath,
				schema: controls.schema,
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
}: {
	readonly draggedNodePathInfo: SequenceNodePathInfo;
	readonly selectedItems: readonly TimelineSelection[];
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly propStatuses: PropStatuses;
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

	const targetNodePathInfos =
		draggedItemIsSelected && selectedSequenceItems.length > 1
			? selectedSequenceItems.map((item) => item.nodePathInfo)
			: [draggedNodePathInfo];
	const tracks = calculateTimeline({sequences, overrideIdsToNodePaths});
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
		const positionField = isCascadingSequence(originalSequence) ? null : 'from';
		if (
			(positionField === 'from' && !canUpdateFrom({propStatuses, nodePath})) ||
			!canUpdateDurationInFrames({propStatuses, nodePath}) ||
			!canUpdateTrimBefore({propStatuses, nodePath})
		) {
			return null;
		}

		const {controls} = originalSequence;
		if (!controls) {
			return null;
		}

		const key = stringifySequenceSubscriptionKey(nodePath);
		if (!targets.has(key)) {
			targets.set(key, {
				fileName: nodePath.absolutePath,
				initialDuration: originalSequence.duration,
				initialFrom: positionField === 'from' ? originalSequence.from : 0,
				initialTrimBefore: trimsMedia
					? (originalSequence.trimBefore ??
						Math.max(0, originalSequence.startMediaFrom))
					: (originalSequence.trimBefore ?? 0),
				minimumDuration: getMinimumSequenceDuration({
					sequence: originalSequence,
					sequences,
				}),
				nodePath,
				playbackRate: getTrimBeforePlaybackRate(originalSequence),
				positionField,
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
	const targets = new Map<string, TimelineSequenceFromDragTarget>();

	for (const nodePathInfo of targetNodePathInfos) {
		const track = findSequenceTrack({tracks, nodePathInfo});
		const originalSequence = track
			? sequences.find((sequence) => sequence.id === track.sequence.id)
			: null;
		if (
			!track ||
			!track.nodePathInfo ||
			!originalSequence ||
			!isFromDraggableSequence(originalSequence)
		) {
			return null;
		}

		const nodePath = track.nodePathInfo.sequenceSubscriptionKey;
		if (!canUpdateFrom({propStatuses, nodePath})) {
			return null;
		}

		const key = stringifySequenceSubscriptionKey(nodePath);
		if (!targets.has(key)) {
			const {effectKeyframes, sequenceKeyframes} =
				getKeyframedSequenceDragTargets({
					nodePath,
					sequence: originalSequence,
					propStatuses,
				});
			targets.set(key, {
				canSnapToTimelineStart: originalSequence.parent === null,
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
		const effectIndexes = new Set(
			target.effectKeyframes.map((keyframe) => keyframe.effectIndex),
		);
		for (const effectIndex of effectIndexes) {
			clearEffectDragOverrides(target.nodePath, effectIndex);
		}
	}
};

export const TimelineSequenceLeftEdgeDragHandle: React.FC<{
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly windowWidth: number;
	readonly timelineDurationInFrames: number;
}> = ({nodePathInfo, windowWidth, timelineDurationInFrames}) => {
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const currentSelection = useCurrentTimelineSelectionStateAsRef();

	const [dragging, setDragging] = useState(false);
	const dragStateRef = useRef<{
		initialClientX: number;
		latestDeltaFrames: number;
		pxPerFrame: number;
		pointerId: number;
		targets: readonly TimelineSequenceLeftEdgeDragTarget[];
	} | null>(null);

	const latestRef = useRef({
		nodePathInfo,
		setPropStatuses,
		setDragOverrides,
		clearDragOverrides,
		previewServerState,
		overrideIdToNodePathMappings,
	});
	latestRef.current = {
		nodePathInfo,
		setPropStatuses,
		setDragOverrides,
		clearDragOverrides,
		previewServerState,
		overrideIdToNodePathMappings,
	};

	const finishDrag = useCallback((commit: boolean) => {
		const dragState = dragStateRef.current;
		dragStateRef.current = null;
		document.body.style.userSelect = '';
		document.body.style.webkitUserSelect = '';
		stopForcingSpecificCursor();
		setDragging(false);

		if (!dragState) {
			return;
		}

		const {
			setPropStatuses: latestSetPropStatuses,
			clearDragOverrides: latestClear,
			previewServerState: latestServerState,
		} = latestRef.current;

		const changes = getTimelineSequenceLeftEdgeDragChanges({
			targets: dragState.targets,
			deltaFrames: dragState.latestDeltaFrames,
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
				dragState.targets.length > 1
					? 'Resize selected sequences'
					: 'Resize sequence',
			redoLabel:
				dragState.targets.length > 1
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
			const targets = getTimelineSequenceLeftEdgeDragTargets({
				draggedNodePathInfo: latestNodePathInfo,
				selectedItems: latestSelectedItems,
				sequences: sequencesRef.current,
				overrideIdsToNodePaths: latestOverrideIdsToNodePaths,
				propStatuses: propStatusesRef.current,
			});
			if (targets === null || targets.length === 0) {
				return;
			}

			e.stopPropagation();
			e.preventDefault();
			dragStateRef.current = {
				initialClientX: e.clientX,
				latestDeltaFrames: 0,
				pxPerFrame,
				pointerId: e.pointerId,
				targets,
			};
			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';
			forceSpecificCursor('ew-resize');
			setDragging(true);
		},
		[
			currentSelection,
			propStatusesRef,
			sequencesRef,
			timelineDurationInFrames,
			windowWidth,
		],
	);

	useEffect(() => {
		if (!dragging) {
			return;
		}

		const onMove = (e: PointerEvent) => {
			const dragState = dragStateRef.current;
			if (!dragState || e.pointerId !== dragState.pointerId) {
				return;
			}

			const dx = e.clientX - dragState.initialClientX;
			const deltaFrames = Math.round(dx / dragState.pxPerFrame);
			dragState.latestDeltaFrames = deltaFrames;
			for (const target of dragState.targets) {
				const nextValues = getTimelineSequenceLeftEdgeDragValues({
					initialDuration: target.initialDuration,
					initialFrom: target.initialFrom,
					initialTrimBefore: target.initialTrimBefore,
					deltaFrames,
					playbackRate: target.playbackRate,
					minimumDuration: target.minimumDuration,
				});
				if (target.positionField !== null) {
					latestRef.current.setDragOverrides(
						target.nodePath,
						target.positionField,
						Internals.makeStaticDragOverride(nextValues.from),
					);
				}

				latestRef.current.setDragOverrides(
					target.nodePath,
					'durationInFrames',
					Internals.makeStaticDragOverride(nextValues.durationInFrames),
				);
				latestRef.current.setDragOverrides(
					target.nodePath,
					'trimBefore',
					Internals.makeStaticDragOverride(nextValues.trimBefore),
				);
			}
		};

		const onUp = (e: PointerEvent) => {
			const dragState = dragStateRef.current;
			if (!dragState || e.pointerId !== dragState.pointerId) {
				return;
			}

			finishDrag(true);
		};

		const onCancel = (e: PointerEvent) => {
			const dragState = dragStateRef.current;
			if (!dragState || e.pointerId !== dragState.pointerId) {
				return;
			}

			finishDrag(false);
		};

		const onWindowBlur = () => {
			finishDrag(false);
		};

		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onCancel);
		window.addEventListener('blur', onWindowBlur);

		return () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onCancel);
			window.removeEventListener('blur', onWindowBlur);
		};
	}, [dragging, finishDrag]);

	const style: React.CSSProperties = {
		...baseStyle,
		left: 0,
		background: TRANSPARENT,
	};

	return (
		<div
			role="separator"
			aria-orientation="vertical"
			title="Drag to trim start"
			style={style}
			onPointerDown={onPointerDown}
		/>
	);
};

export const useTimelineSequenceFromDrag = ({
	nodePathInfo,
	windowWidth,
	timelineDurationInFrames,
}: {
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly windowWidth: number;
	readonly timelineDurationInFrames: number;
}) => {
	const {
		setPropStatuses,
		setDragOverrides,
		clearDragOverrides,
		setEffectDragOverrides,
		clearEffectDragOverrides,
	} = useContext(Internals.VisualModeSettersContext);
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

	const [dragging, setDragging] = useState(false);
	const dragStateRef = useRef<{
		initialClientX: number;
		latestDeltaFrames: number;
		pxPerFrame: number;
		pointerId: number;
		targets: readonly TimelineSequenceFromDragTarget[];
	} | null>(null);

	const latestRef = useRef({
		nodePathInfo,
		setPropStatuses,
		setDragOverrides,
		clearDragOverrides,
		setEffectDragOverrides,
		clearEffectDragOverrides,
		previewServerState,
		overrideIdToNodePathMappings,
		editorSnapping,
	});
	latestRef.current = {
		nodePathInfo,
		setPropStatuses,
		setDragOverrides,
		clearDragOverrides,
		setEffectDragOverrides,
		clearEffectDragOverrides,
		previewServerState,
		overrideIdToNodePathMappings,
		editorSnapping,
	};

	const finishDrag = useCallback((commit: boolean) => {
		const dragState = dragStateRef.current;
		dragStateRef.current = null;
		document.body.style.userSelect = '';
		document.body.style.webkitUserSelect = '';
		setDragging(false);

		if (!dragState) {
			return;
		}

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
	}, []);

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

			e.preventDefault();
			dragStateRef.current = {
				initialClientX: e.clientX,
				latestDeltaFrames: 0,
				pxPerFrame,
				pointerId: e.pointerId,
				targets,
			};
			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';
			setDragging(true);
		},
		[
			currentSelection,
			propStatusesRef,
			sequencesRef,
			timelineDurationInFrames,
			windowWidth,
		],
	);

	useEffect(() => {
		if (!dragging) {
			return;
		}

		const onMove = (e: PointerEvent) => {
			const dragState = dragStateRef.current;
			if (!dragState || e.pointerId !== dragState.pointerId) {
				return;
			}

			const dx = e.clientX - dragState.initialClientX;
			const deltaFrames = getTimelineSequenceFromDragDelta({
				deltaFrames: Math.round(dx / dragState.pxPerFrame),
				pxPerFrame: dragState.pxPerFrame,
				snappingEnabled: latestRef.current.editorSnapping,
				targets: dragState.targets,
			});
			dragState.latestDeltaFrames = deltaFrames;
			for (const target of dragState.targets) {
				const nextFrom = getTimelineSequenceFromDragValue({
					initialFrom: target.initialFrom,
					deltaFrames,
				});
				latestRef.current.setDragOverrides(
					target.nodePath,
					'from',
					Internals.makeStaticDragOverride(nextFrom),
				);
				for (const keyframeTarget of target.sequenceKeyframes) {
					latestRef.current.setDragOverrides(
						target.nodePath,
						keyframeTarget.fieldKey,
						{
							type: 'keyframed',
							status: shiftKeyframedStatus({
								status: keyframeTarget.status,
								deltaFrames,
							}),
						},
					);
				}

				for (const keyframeTarget of target.effectKeyframes) {
					latestRef.current.setEffectDragOverrides(
						target.nodePath,
						keyframeTarget.effectIndex,
						keyframeTarget.fieldKey,
						{
							type: 'keyframed',
							status: shiftKeyframedStatus({
								status: keyframeTarget.status,
								deltaFrames,
							}),
						},
					);
				}
			}
		};

		const onUp = (e: PointerEvent) => {
			const dragState = dragStateRef.current;
			if (!dragState || e.pointerId !== dragState.pointerId) {
				return;
			}

			finishDrag(true);
		};

		const onCancel = (e: PointerEvent) => {
			const dragState = dragStateRef.current;
			if (!dragState || e.pointerId !== dragState.pointerId) {
				return;
			}

			finishDrag(false);
		};

		const onWindowBlur = () => {
			finishDrag(false);
		};

		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onCancel);
		window.addEventListener('blur', onWindowBlur);

		return () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onCancel);
			window.removeEventListener('blur', onWindowBlur);
		};
	}, [dragging, finishDrag]);

	return {
		dragging,
		onPointerDown,
	};
};

export const TimelineSequenceRightEdgeDragHandle: React.FC<{
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly windowWidth: number;
	readonly timelineDurationInFrames: number;
}> = ({nodePathInfo, windowWidth, timelineDurationInFrames}) => {
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const currentSelection = useCurrentTimelineSelectionStateAsRef();

	const [dragging, setDragging] = useState(false);
	const dragStateRef = useRef<{
		initialClientX: number;
		latestDeltaFrames: number;
		pxPerFrame: number;
		pointerId: number;
		targets: readonly TimelineSequenceDurationDragTarget[];
	} | null>(null);

	// Keep latest props/setters available to window listeners installed once at pointerdown.
	const latestRef = useRef({
		nodePathInfo,
		setPropStatuses,
		setDragOverrides,
		clearDragOverrides,
		previewServerState,
		overrideIdToNodePathMappings,
	});
	latestRef.current = {
		nodePathInfo,
		setPropStatuses,
		setDragOverrides,
		clearDragOverrides,
		previewServerState,
		overrideIdToNodePathMappings,
	};

	const finishDrag = useCallback((commit: boolean) => {
		const dragState = dragStateRef.current;
		dragStateRef.current = null;
		document.body.style.userSelect = '';
		document.body.style.webkitUserSelect = '';
		stopForcingSpecificCursor();
		setDragging(false);

		if (!dragState) {
			return;
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
			const targets = getTimelineSequenceDurationDragTargets({
				draggedNodePathInfo: latestNodePathInfo,
				selectedItems: latestSelectedItems,
				sequences: sequencesRef.current,
				overrideIdsToNodePaths: latestOverrideIdsToNodePaths,
				propStatuses: propStatusesRef.current,
			});
			if (targets === null || targets.length === 0) {
				return;
			}

			e.stopPropagation();
			e.preventDefault();
			dragStateRef.current = {
				initialClientX: e.clientX,
				latestDeltaFrames: 0,
				pxPerFrame,
				pointerId: e.pointerId,
				targets,
			};
			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';
			forceSpecificCursor('ew-resize');
			setDragging(true);
		},
		[
			currentSelection,
			propStatusesRef,
			sequencesRef,
			timelineDurationInFrames,
			windowWidth,
		],
	);

	// Install global pointer listeners while dragging. They survive parent re-renders
	// and element remounts that would otherwise drop React's synthetic handlers or
	// pointer capture.
	useEffect(() => {
		if (!dragging) {
			return;
		}

		const onMove = (e: PointerEvent) => {
			const dragState = dragStateRef.current;
			if (!dragState || e.pointerId !== dragState.pointerId) {
				return;
			}

			const dx = e.clientX - dragState.initialClientX;
			const deltaFrames = Math.round(dx / dragState.pxPerFrame);
			dragState.latestDeltaFrames = deltaFrames;
			for (const target of dragState.targets) {
				latestRef.current.setDragOverrides(
					target.nodePath,
					'durationInFrames',
					Internals.makeStaticDragOverride(
						getTimelineSequenceDurationDragValue({
							initialDuration: target.initialDuration,
							deltaFrames,
							minimumDuration: target.minimumDuration,
						}),
					),
				);
			}
		};

		const onUp = (e: PointerEvent) => {
			const dragState = dragStateRef.current;
			if (!dragState || e.pointerId !== dragState.pointerId) {
				return;
			}

			finishDrag(true);
		};

		const onCancel = (e: PointerEvent) => {
			const dragState = dragStateRef.current;
			if (!dragState || e.pointerId !== dragState.pointerId) {
				return;
			}

			finishDrag(false);
		};

		// Bail if the page loses focus mid-drag.
		const onWindowBlur = () => {
			finishDrag(false);
		};

		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onCancel);
		window.addEventListener('blur', onWindowBlur);

		return () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onCancel);
			window.removeEventListener('blur', onWindowBlur);
		};
	}, [dragging, finishDrag]);

	const style: React.CSSProperties = {
		...baseStyle,
		right: 0,
		background: TRANSPARENT,
	};

	return (
		<div
			role="separator"
			aria-orientation="vertical"
			title="Drag to change duration"
			style={style}
			onPointerDown={onPointerDown}
		/>
	);
};
