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
import type {
	SequenceNodePathInfo,
	TrackWithHash,
} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from '../ForceSpecificCursor';
import {
	saveSequenceProps,
	type SaveSequencePropChange,
} from './save-sequence-prop';
import {
	getTimelineSequenceSelectionKey,
	useCurrentTimelineSelectionStateAsRef,
	type TimelineSelection,
} from './TimelineSelection';

const HANDLE_WIDTH = 14;
const HANDLE_GRIP_WIDTH = 3;

const baseStyle: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	bottom: 0,
	width: HANDLE_WIDTH,
	cursor: 'ew-resize',
	zIndex: 1,
	touchAction: 'none',
};

const gripBaseStyle: React.CSSProperties = {
	position: 'absolute',
	top: 2,
	bottom: 2,
	width: HANDLE_GRIP_WIDTH,
	borderRadius: 999,
	backgroundColor: 'rgba(255, 255, 255, 0.9)',
	boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.12)',
	opacity: 0.85,
};

export type TimelineSequenceDurationDragTarget = {
	readonly fileName: string;
	readonly initialDuration: number;
	readonly nodePath: SequencePropsSubscriptionKey;
};

export type TimelineSequenceMediaRightEdgeDragTarget = {
	readonly fileName: string;
	readonly initialDuration: number;
	readonly initialTrimAfter: number;
	readonly initialTrimBefore: number;
	readonly maxMediaDuration: number | null;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly playbackRate: number;
	readonly schema: InteractivitySchema;
	readonly parentNodePath?: SequencePropsSubscriptionKey;
	readonly parentInitialDuration?: number;
};

export type TimelineSequenceLeftEdgeDragTarget = {
	readonly fileName: string;
	readonly initialDuration: number;
	readonly initialFrom: number;
	readonly initialTrimBefore: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: InteractivitySchema;
};

export type TimelineSequenceFromDragTarget = {
	readonly fileName: string;
	readonly initialFrom: number;
	readonly nodePath: SequencePropsSubscriptionKey;
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
	const ctx = Internals.getPropStatusesCtx(propStatuses, nodePath);
	if (!ctx) {
		return false;
	}

	const status = ctx.trimBefore?.status;
	return status === 'static' || status === undefined;
};

const canUpdateTrimAfter = ({
	propStatuses,
	nodePath,
}: {
	readonly propStatuses: PropStatuses;
	readonly nodePath: SequencePropsSubscriptionKey;
}) => {
	const ctx = Internals.getPropStatusesCtx(propStatuses, nodePath);
	if (!ctx) {
		return false;
	}

	const status = ctx.trimAfter?.status;
	return status === 'static' || status === undefined;
};

const isDurationDraggableSequence = (sequence: TSequence) => {
	return (
		(sequence.type === 'sequence' || sequence.type === 'image') &&
		!sequence.loopDisplay &&
		!sequence.isInsideSeries &&
		Boolean(sequence.controls)
	);
};

const isLeftEdgeDraggableSequence = (sequence: TSequence) => {
	return (
		!sequence.isInsideSeries &&
		Boolean(sequence.controls) &&
		(sequence.type === 'sequence' ||
			sequence.type === 'image' ||
			sequence.type === 'audio' ||
			sequence.type === 'video')
	);
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
}: {
	readonly initialDuration: number;
	readonly deltaFrames: number;
}) => Math.max(1, initialDuration + deltaFrames);

export const getTimelineSequenceMediaRightEdgeDragValues = ({
	initialDuration,
	initialTrimBefore,
	deltaFrames,
	playbackRate,
	maxMediaDuration,
}: {
	readonly initialDuration: number;
	readonly initialTrimBefore: number;
	readonly deltaFrames: number;
	readonly playbackRate: number;
	readonly maxMediaDuration: number | null;
}) => {
	const unclampedDuration = Math.max(1, initialDuration + deltaFrames);
	const maxDuration =
		maxMediaDuration === null
			? Number.POSITIVE_INFINITY
			: Math.max(
					1,
					Math.floor((maxMediaDuration - initialTrimBefore) / playbackRate),
				);
	const durationInFrames = Math.min(unclampedDuration, maxDuration);

	return {
		durationInFrames,
		trimAfter: initialTrimBefore + durationInFrames * playbackRate,
	};
};

export const getTimelineSequenceLeftEdgeDragDelta = ({
	initialDuration,
	initialTrimBefore,
	deltaFrames,
}: {
	readonly initialDuration: number;
	readonly initialTrimBefore: number;
	readonly deltaFrames: number;
}) => {
	const minDeltaFrames = 0 - initialTrimBefore;
	const maxDeltaFrames = initialDuration - 1;

	return Math.max(minDeltaFrames, Math.min(deltaFrames, maxDeltaFrames));
};

export const getTimelineSequenceLeftEdgeDragValues = ({
	initialDuration,
	initialFrom,
	initialTrimBefore,
	deltaFrames,
}: {
	readonly initialDuration: number;
	readonly initialFrom: number;
	readonly initialTrimBefore: number;
	readonly deltaFrames: number;
}) => {
	const clampedDeltaFrames = getTimelineSequenceLeftEdgeDragDelta({
		initialDuration,
		initialTrimBefore,
		deltaFrames,
	});

	return {
		durationInFrames: initialDuration - clampedDeltaFrames,
		from: initialFrom + clampedDeltaFrames,
		trimBefore: initialTrimBefore + clampedDeltaFrames,
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
		});
		const changes: SaveSequencePropChange[] = [];

		if (nextValues.from !== target.initialFrom) {
			changes.push({
				fileName: target.fileName,
				nodePath: target.nodePath,
				fieldKey: 'from',
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
				schema: NoReactInternals.sequenceSchema,
			},
		];
	});
};

export const getTimelineSequenceMediaRightEdgeDragChanges = ({
	targets,
	deltaFrames,
}: {
	readonly targets: readonly TimelineSequenceMediaRightEdgeDragTarget[];
	readonly deltaFrames: number;
}): SaveSequencePropChange[] => {
	return targets.flatMap((target) => {
		const nextValues = getTimelineSequenceMediaRightEdgeDragValues({
			initialDuration: target.initialDuration,
			initialTrimBefore: target.initialTrimBefore,
			deltaFrames,
			playbackRate: target.playbackRate,
			maxMediaDuration: target.maxMediaDuration,
		});

		const result: SaveSequencePropChange[] = [];

		if (nextValues.trimAfter !== target.initialTrimAfter) {
			result.push({
				fileName: target.fileName,
				nodePath: target.nodePath,
				fieldKey: 'trimAfter',
				value: nextValues.trimAfter,
				defaultValue: null,
				schema: target.schema,
			});
		}

		// For merged rows, also sync the parent's durationInFrames
		if (target.parentNodePath && target.parentInitialDuration !== undefined) {
			const parentDuration = Math.max(
				1,
				target.parentInitialDuration + deltaFrames,
			);
			if (parentDuration !== target.parentInitialDuration) {
				result.push({
					fileName: target.fileName,
					nodePath: target.parentNodePath,
					fieldKey: 'durationInFrames',
					value: parentDuration,
					defaultValue: null,
					schema: NoReactInternals.sequenceSchema,
				});
			}
		}

		return result;
	});
};

export const getTimelineSequenceFromDragValue = ({
	initialFrom,
	deltaFrames,
}: {
	readonly initialFrom: number;
	readonly deltaFrames: number;
}) => initialFrom + deltaFrames;

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

const findSequenceTrack = ({
	tracks,
	nodePathInfo,
}: {
	readonly tracks: readonly TrackWithHash[];
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
	const {tracks} = calculateTimeline({sequences, overrideIdsToNodePaths});
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
			!isDurationDraggableSequence(originalSequence)
		) {
			return null;
		}

		const nodePath = track.nodePathInfo.sequenceSubscriptionKey;
		if (!canUpdateDurationInFrames({propStatuses, nodePath})) {
			return null;
		}

		const key = stringifySequenceSubscriptionKey(nodePath);
		if (!targets.has(key)) {
			targets.set(key, {
				fileName: nodePath.absolutePath,
				initialDuration: originalSequence.duration,
				nodePath,
			});
		}
	}

	return [...targets.values()];
};

export const getTimelineSequenceMediaRightEdgeDragTargets = ({
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
}): TimelineSequenceMediaRightEdgeDragTarget[] | null => {
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
	const {tracks} = calculateTimeline({sequences, overrideIdsToNodePaths});
	const targets = new Map<string, TimelineSequenceMediaRightEdgeDragTarget>();

	for (const nodePathInfo of targetNodePathInfos) {
		const track = findSequenceTrack({tracks, nodePathInfo});
		const originalSequence = track
			? sequences.find((sequence) => sequence.id === track.sequence.id)
			: null;
		if (
			!track ||
			!track.nodePathInfo ||
			!originalSequence ||
			(originalSequence.type !== 'audio' && originalSequence.type !== 'video')
		) {
			return null;
		}

		const nodePath = track.nodePathInfo.sequenceSubscriptionKey;
		if (!canUpdateTrimAfter({propStatuses, nodePath})) {
			return null;
		}

		const {controls} = originalSequence;
		if (!controls) {
			return null;
		}

		// For merged rows, only sync parent's durationInFrames if it can be updated.
		// If it's computed or keyframed, we still allow the media trim — just without
		// the container sync, like trimming a clip in CapCut without resizing the track.
		const parentInfo = track.mergedParentInfo
			? (() => {
					const parentNodePath =
						track.mergedParentInfo!.nodePathInfo.sequenceSubscriptionKey;
					if (
						canUpdateDurationInFrames({propStatuses, nodePath: parentNodePath})
					) {
						return {
							parentNodePath,
							parentInitialDuration: track.mergedParentInfo!.sequence.duration,
						};
					}

					return {};
				})()
			: {};

		const initialTrimBefore =
			originalSequence.trimBefore ??
			Math.max(0, originalSequence.startMediaFrom);
		const key = stringifySequenceSubscriptionKey(nodePath);

		if (!targets.has(key)) {
			targets.set(key, {
				fileName: nodePath.absolutePath,
				initialDuration: originalSequence.duration,
				initialTrimAfter:
					initialTrimBefore +
					originalSequence.duration * originalSequence.playbackRate,
				initialTrimBefore,
				maxMediaDuration: null,
				nodePath,
				playbackRate: originalSequence.playbackRate,
				schema: controls.schema,
				...parentInfo,
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
	const {tracks} = calculateTimeline({sequences, overrideIdsToNodePaths});
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
			!isLeftEdgeDraggableSequence(originalSequence)
		) {
			return null;
		}

		const nodePath = track.nodePathInfo.sequenceSubscriptionKey;
		const trimsMedia =
			originalSequence.type === 'audio' || originalSequence.type === 'video';
		if (
			!canUpdateFrom({propStatuses, nodePath}) ||
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
				initialFrom: originalSequence.from,
				initialTrimBefore: trimsMedia
					? (originalSequence.trimBefore ??
						Math.max(0, originalSequence.startMediaFrom))
					: (originalSequence.trimBefore ?? 0),
				nodePath,
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
	const {tracks} = calculateTimeline({sequences, overrideIdsToNodePaths});
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
			targets.set(key, {
				fileName: nodePath.absolutePath,
				initialFrom: originalSequence.from,
				nodePath,
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

const clearMediaRightEdgeDragOverrides = ({
	clearDragOverrides,
	targets,
}: {
	readonly clearDragOverrides: (nodePath: SequencePropsSubscriptionKey) => void;
	readonly targets: readonly TimelineSequenceMediaRightEdgeDragTarget[];
}) => {
	for (const target of targets) {
		clearDragOverrides(target.nodePath);
		if (target.parentNodePath) {
			clearDragOverrides(target.parentNodePath);
		}
	}
};

const clearFromDragOverrides = ({
	clearDragOverrides,
	targets,
}: {
	readonly clearDragOverrides: (nodePath: SequencePropsSubscriptionKey) => void;
	readonly targets: readonly TimelineSequenceFromDragTarget[];
}) => {
	for (const target of targets) {
		clearDragOverrides(target.nodePath);
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
	const [hovered, setHovered] = useState(false);
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
				});
				latestRef.current.setDragOverrides(
					target.nodePath,
					'from',
					Internals.makeStaticDragOverride(nextValues.from),
				);
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
		background:
			hovered || dragging ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
	};

	return (
		<div
			role="separator"
			aria-orientation="vertical"
			title="Drag to trim start"
			style={style}
			onPointerDown={onPointerDown}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
		>
			<div
				style={{
					...gripBaseStyle,
					left: 2,
				}}
			/>
		</div>
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
		targets: readonly TimelineSequenceFromDragTarget[];
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
		setDragging(false);

		if (!dragState) {
			return;
		}

		const {
			setPropStatuses: latestSetPropStatuses,
			clearDragOverrides: latestClear,
			previewServerState: latestServerState,
		} = latestRef.current;

		const changes = getTimelineSequenceFromDragChanges({
			targets: dragState.targets,
			deltaFrames: dragState.latestDeltaFrames,
		});

		if (
			!commit ||
			latestServerState.type !== 'connected' ||
			changes.length === 0
		) {
			clearFromDragOverrides({
				clearDragOverrides: latestClear,
				targets: dragState.targets,
			});
			return;
		}

		const savePromise = saveSequenceProps({
			changes,
			setPropStatuses: latestSetPropStatuses,
			clientId: latestServerState.clientId,
			undoLabel:
				changes.length > 1 ? 'Move selected sequences' : 'Move sequence',
			redoLabel:
				changes.length > 1
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
			const deltaFrames = Math.round(dx / dragState.pxPerFrame);
			dragState.latestDeltaFrames = deltaFrames;
			for (const target of dragState.targets) {
				latestRef.current.setDragOverrides(
					target.nodePath,
					'from',
					Internals.makeStaticDragOverride(
						getTimelineSequenceFromDragValue({
							initialFrom: target.initialFrom,
							deltaFrames,
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
	readonly type: TSequence['type'];
}> = ({nodePathInfo, windowWidth, timelineDurationInFrames, type}) => {
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
	const [hovered, setHovered] = useState(false);
	const dragStateRef = useRef<{
		initialClientX: number;
		latestDeltaFrames: number;
		pxPerFrame: number;
		pointerId: number;
		targets:
			| readonly TimelineSequenceDurationDragTarget[]
			| readonly TimelineSequenceMediaRightEdgeDragTarget[];
		mode: 'duration' | 'trimAfter';
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

		const changes =
			dragState.mode === 'trimAfter'
				? getTimelineSequenceMediaRightEdgeDragChanges({
						targets:
							dragState.targets as readonly TimelineSequenceMediaRightEdgeDragTarget[],
						deltaFrames: dragState.latestDeltaFrames,
					})
				: getTimelineSequenceDurationDragChanges({
						targets:
							dragState.targets as readonly TimelineSequenceDurationDragTarget[],
						deltaFrames: dragState.latestDeltaFrames,
					});

		if (
			!commit ||
			latestServerState.type !== 'connected' ||
			changes.length === 0
		) {
			if (dragState.mode === 'trimAfter') {
				clearMediaRightEdgeDragOverrides({
					clearDragOverrides: latestClear,
					targets:
						dragState.targets as readonly TimelineSequenceMediaRightEdgeDragTarget[],
				});
			} else {
				clearDurationDragOverrides({
					clearDragOverrides: latestClear,
					targets:
						dragState.targets as readonly TimelineSequenceDurationDragTarget[],
				});
			}

			return;
		}

		const savePromise = saveSequenceProps({
			changes,
			setPropStatuses: latestSetPropStatuses,
			clientId: latestServerState.clientId,
			undoLabel:
				dragState.mode === 'trimAfter'
					? changes.length > 1
						? 'Trim selected clips'
						: 'Trim clip'
					: changes.length > 1
						? 'Resize selected sequences'
						: 'Resize sequence',
			redoLabel:
				dragState.mode === 'trimAfter'
					? changes.length > 1
						? 'Trim selected clips back'
						: 'Trim clip back'
					: changes.length > 1
						? 'Resize selected sequences back'
						: 'Resize sequence back',
		});

		savePromise
			.catch((err) => {
				Internals.Log.error(
					{logLevel: 'error', tag: null},
					dragState.mode === 'trimAfter'
						? 'Could not save trimAfter'
						: 'Could not save durationInFrames',
					err,
				);
			})
			.finally(() => {
				if (dragState.mode === 'trimAfter') {
					clearMediaRightEdgeDragOverrides({
						clearDragOverrides: latestClear,
						targets:
							dragState.targets as readonly TimelineSequenceMediaRightEdgeDragTarget[],
					});
				} else {
					clearDurationDragOverrides({
						clearDragOverrides: latestClear,
						targets:
							dragState.targets as readonly TimelineSequenceDurationDragTarget[],
					});
				}
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
			const isMediaTrimMode = type === 'audio' || type === 'video';
			const targets = isMediaTrimMode
				? getTimelineSequenceMediaRightEdgeDragTargets({
						draggedNodePathInfo: latestNodePathInfo,
						selectedItems: latestSelectedItems,
						sequences: sequencesRef.current,
						overrideIdsToNodePaths: latestOverrideIdsToNodePaths,
						propStatuses: propStatusesRef.current,
					})
				: getTimelineSequenceDurationDragTargets({
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
				mode: isMediaTrimMode ? 'trimAfter' : 'duration',
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
			type,
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
			if (dragState.mode === 'trimAfter') {
				for (const target of dragState.targets as readonly TimelineSequenceMediaRightEdgeDragTarget[]) {
					const nextValues = getTimelineSequenceMediaRightEdgeDragValues({
						initialDuration: target.initialDuration,
						initialTrimBefore: target.initialTrimBefore,
						deltaFrames,
						playbackRate: target.playbackRate,
						maxMediaDuration: target.maxMediaDuration,
					});
					latestRef.current.setDragOverrides(
						target.nodePath,
						'trimAfter',
						Internals.makeStaticDragOverride(nextValues.trimAfter),
					);

					// For merged rows, also sync the parent's durationInFrames
					if (
						target.parentNodePath &&
						target.parentInitialDuration !== undefined
					) {
						const parentDuration = Math.max(
							1,
							target.parentInitialDuration + deltaFrames,
						);
						latestRef.current.setDragOverrides(
							target.parentNodePath,
							'durationInFrames',
							Internals.makeStaticDragOverride(parentDuration),
						);
					}
				}

				return;
			}

			for (const target of dragState.targets as readonly TimelineSequenceDurationDragTarget[]) {
				latestRef.current.setDragOverrides(
					target.nodePath,
					'durationInFrames',
					Internals.makeStaticDragOverride(
						getTimelineSequenceDurationDragValue({
							initialDuration: target.initialDuration,
							deltaFrames,
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
		background:
			hovered || dragging ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
	};

	return (
		<div
			role="separator"
			aria-orientation="vertical"
			title={
				type === 'audio' || type === 'video'
					? 'Drag to trim end'
					: 'Drag to change duration'
			}
			style={style}
			onPointerDown={onPointerDown}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
		>
			<div
				style={{
					...gripBaseStyle,
					right: 2,
				}}
			/>
		</div>
	);
};
