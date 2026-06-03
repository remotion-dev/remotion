import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import type {
	CodeValues,
	OverrideIdToNodePaths,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from '../ForceSpecificCursor';
import {
	saveSequenceProp,
	saveSequenceProps,
	type SaveSequencePropChange,
} from './save-sequence-prop';
import {
	getTimelineSequenceSelectionKey,
	type TimelineSelection,
	useTimelineSelection,
} from './TimelineSelection';

const HANDLE_WIDTH = 6;

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
	readonly nodePath: SequencePropsSubscriptionKey;
};

export type TimelineSequenceFromDragTarget = {
	readonly fileName: string;
	readonly initialFrom: number;
	readonly nodePath: SequencePropsSubscriptionKey;
};

const canUpdateDurationInFrames = ({
	codeValues,
	nodePath,
}: {
	readonly codeValues: CodeValues;
	readonly nodePath: SequencePropsSubscriptionKey;
}) => {
	const status = Internals.getCodeValuesCtx(codeValues, nodePath)
		?.durationInFrames?.status;

	return status === 'static';
};

const canUpdateFrom = ({
	codeValues,
	nodePath,
}: {
	readonly codeValues: CodeValues;
	readonly nodePath: SequencePropsSubscriptionKey;
}) => {
	const status = Internals.getCodeValuesCtx(codeValues, nodePath)?.from?.status;

	return status === 'static';
};

const isDurationDraggableSequence = (sequence: TSequence) => {
	return (
		(sequence.type === 'sequence' || sequence.type === 'image') &&
		!sequence.loopDisplay &&
		!sequence.isInsideSeries &&
		Boolean(sequence.controls)
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
	readonly tracks: ReturnType<typeof calculateTimeline>;
	readonly nodePathInfo: SequenceNodePathInfo;
}) => {
	const key = stringifySequenceSubscriptionKey(
		nodePathInfo.sequenceSubscriptionKey,
	);

	return tracks.find((candidate) => {
		if (candidate.nodePathInfo === null) {
			return false;
		}

		return (
			stringifySequenceSubscriptionKey(
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
	codeValues,
}: {
	readonly draggedNodePathInfo: SequenceNodePathInfo;
	readonly selectedItems: readonly TimelineSelection[];
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly codeValues: CodeValues;
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
		if (!track || !isDurationDraggableSequence(track.sequence)) {
			return null;
		}

		const nodePath = nodePathInfo.sequenceSubscriptionKey;
		if (!canUpdateDurationInFrames({codeValues, nodePath})) {
			return null;
		}

		const key = stringifySequenceSubscriptionKey(nodePath);
		if (!targets.has(key)) {
			targets.set(key, {
				fileName: nodePath.absolutePath,
				initialDuration: track.sequence.duration,
				nodePath,
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
	codeValues,
}: {
	readonly draggedNodePathInfo: SequenceNodePathInfo;
	readonly selectedItems: readonly TimelineSelection[];
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly codeValues: CodeValues;
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
			!originalSequence ||
			!isFromDraggableSequence(originalSequence)
		) {
			return null;
		}

		const nodePath = nodePathInfo.sequenceSubscriptionKey;
		if (!canUpdateFrom({codeValues, nodePath})) {
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
	targets,
}: {
	readonly clearDragOverrides: (nodePath: SequencePropsSubscriptionKey) => void;
	readonly targets: readonly TimelineSequenceFromDragTarget[];
}) => {
	for (const target of targets) {
		clearDragOverrides(target.nodePath);
	}
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
	const {setCodeValues, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);
	const {sequences} = useContext(Internals.SequenceManager);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {selectedItems} = useTimelineSelection();

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
		setCodeValues,
		setDragOverrides,
		clearDragOverrides,
		previewServerState,
		codeValues,
		sequences,
		overrideIdToNodePathMappings,
		selectedItems,
	});
	latestRef.current = {
		nodePathInfo,
		setCodeValues,
		setDragOverrides,
		clearDragOverrides,
		previewServerState,
		codeValues,
		sequences,
		overrideIdToNodePathMappings,
		selectedItems,
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
			setCodeValues: latestSetCodeValues,
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

		const savePromise =
			changes.length === 1
				? saveSequenceProp({
						...changes[0],
						setCodeValues: latestSetCodeValues,
						clientId: latestServerState.clientId,
					})
				: saveSequenceProps({
						changes,
						setCodeValues: latestSetCodeValues,
						clientId: latestServerState.clientId,
						undoLabel: 'Move selected sequences',
						redoLabel: 'Move selected sequences back',
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
				selectedItems: latestSelectedItems,
				sequences: latestSequences,
				overrideIdToNodePathMappings: latestOverrideIdsToNodePaths,
				codeValues: latestCodeValues,
			} = latestRef.current;
			if (latestNodePathInfo === null) {
				return;
			}

			const targets = getTimelineSequenceFromDragTargets({
				draggedNodePathInfo: latestNodePathInfo,
				selectedItems: latestSelectedItems,
				sequences: latestSequences,
				overrideIdsToNodePaths: latestOverrideIdsToNodePaths,
				codeValues: latestCodeValues,
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
		[timelineDurationInFrames, windowWidth],
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
					getTimelineSequenceFromDragValue({
						initialFrom: target.initialFrom,
						deltaFrames,
					}),
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
}> = ({nodePathInfo, windowWidth, timelineDurationInFrames}) => {
	const {setCodeValues, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);
	const {sequences} = useContext(Internals.SequenceManager);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {selectedItems} = useTimelineSelection();

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
		setCodeValues,
		setDragOverrides,
		clearDragOverrides,
		previewServerState,
		codeValues,
		sequences,
		overrideIdToNodePathMappings,
		selectedItems,
	});
	latestRef.current = {
		nodePathInfo,
		setCodeValues,
		setDragOverrides,
		clearDragOverrides,
		previewServerState,
		codeValues,
		sequences,
		overrideIdToNodePathMappings,
		selectedItems,
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
			setCodeValues: latestSetCodeValues,
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

		const savePromise =
			changes.length === 1
				? saveSequenceProp({
						...changes[0],
						setCodeValues: latestSetCodeValues,
						clientId: latestServerState.clientId,
					})
				: saveSequenceProps({
						changes,
						setCodeValues: latestSetCodeValues,
						clientId: latestServerState.clientId,
						undoLabel: 'Resize selected sequences',
						redoLabel: 'Resize selected sequences back',
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
				selectedItems: latestSelectedItems,
				sequences: latestSequences,
				overrideIdToNodePathMappings: latestOverrideIdsToNodePaths,
				codeValues: latestCodeValues,
			} = latestRef.current;
			const targets = getTimelineSequenceDurationDragTargets({
				draggedNodePathInfo: latestNodePathInfo,
				selectedItems: latestSelectedItems,
				sequences: latestSequences,
				overrideIdsToNodePaths: latestOverrideIdsToNodePaths,
				codeValues: latestCodeValues,
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
		[timelineDurationInFrames, windowWidth],
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
					getTimelineSequenceDurationDragValue({
						initialDuration: target.initialDuration,
						deltaFrames,
					}),
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
		background: 'transparent',
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
