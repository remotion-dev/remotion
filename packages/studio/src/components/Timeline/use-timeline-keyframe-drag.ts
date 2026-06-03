import {
	optimisticMoveEffectKeyframes,
	optimisticMoveSequenceKeyframes,
} from '@remotion/studio-shared';
import type {ContextType, PointerEvent as ReactPointerEvent} from 'react';
import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {Internals, type SequencePropsSubscriptionKey} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from '../ForceSpecificCursor';
import {callMoveKeyframes} from './call-move-keyframe';
import {
	getTimelineKeyframeMoveChanges,
	getTimelineKeyframeMovePreviewChanges,
	getTimelineKeyframeMoveTargets,
	sortTimelineKeyframeMoveChangesForApplication,
	type TimelineKeyframeMoveTarget,
} from './move-selected-keyframe';
import {useTimelineSelection} from './TimelineSelection';

const groupByNodePath = <T extends {nodePath: SequencePropsSubscriptionKey}>(
	keyframes: T[],
): T[][] => {
	const groups = new Map<string, T[]>();
	for (const keyframe of keyframes) {
		const key = JSON.stringify(keyframe.nodePath);
		const group = groups.get(key) ?? [];
		group.push(keyframe);
		groups.set(key, group);
	}

	return [...groups.values()];
};

const applyPreviewChanges = ({
	changes,
	setCodeValues,
}: {
	changes: NonNullable<
		ReturnType<typeof getTimelineKeyframeMovePreviewChanges>
	>;
	setCodeValues: ContextType<
		typeof Internals.VisualModeSettersContext
	>['setCodeValues'];
}) => {
	for (const keyframes of groupByNodePath(changes.sequenceKeyframes)) {
		const sortedKeyframes =
			sortTimelineKeyframeMoveChangesForApplication(keyframes);
		const [firstKeyframe] = keyframes;
		if (!firstKeyframe) {
			continue;
		}

		setCodeValues(firstKeyframe.nodePath, (prev) =>
			optimisticMoveSequenceKeyframes({
				previous: prev,
				keyframes: sortedKeyframes.map((keyframe) => ({
					fieldKey: keyframe.fieldKey,
					fromFrame: keyframe.fromFrame,
					toFrame: keyframe.toFrame,
				})),
			}),
		);
	}

	for (const keyframes of groupByNodePath(changes.effectKeyframes)) {
		const sortedKeyframes =
			sortTimelineKeyframeMoveChangesForApplication(keyframes);
		const [firstKeyframe] = keyframes;
		if (!firstKeyframe) {
			continue;
		}

		setCodeValues(firstKeyframe.nodePath, (prev) =>
			optimisticMoveEffectKeyframes({
				previous: prev,
				keyframes: sortedKeyframes.map((keyframe) => ({
					effectIndex: keyframe.effectIndex,
					fieldKey: keyframe.fieldKey,
					fromFrame: keyframe.fromFrame,
					toFrame: keyframe.toFrame,
				})),
			}),
		);
	}
};

export const useTimelineKeyframeDrag = ({
	nodePathInfo,
	frame,
	timelineWidth,
	timelineDurationInFrames,
}: {
	nodePathInfo: SequenceNodePathInfo;
	frame: number;
	timelineWidth: number | null;
	timelineDurationInFrames: number;
}) => {
	const {setCodeValues} = useContext(Internals.VisualModeSettersContext);
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);
	const {sequences} = useContext(Internals.SequenceManager);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {selectedItems, selectItems} = useTimelineSelection();
	const [dragging, setDragging] = useState(false);
	const dragStateRef = useRef<{
		initialClientX: number;
		latestDeltaFrames: number;
		pointerId: number;
		pxPerFrame: number;
		targets: readonly TimelineKeyframeMoveTarget[];
	} | null>(null);
	const latestRef = useRef({
		nodePathInfo,
		frame,
		setCodeValues,
		previewServerState,
		codeValues,
		sequences,
		overrideIdToNodePathMappings,
		selectedItems,
		selectItems,
		timelineDurationInFrames,
	});
	latestRef.current = {
		nodePathInfo,
		frame,
		setCodeValues,
		previewServerState,
		codeValues,
		sequences,
		overrideIdToNodePathMappings,
		selectedItems,
		selectItems,
		timelineDurationInFrames,
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
			previewServerState: latestServerState,
			selectItems: latestSelectItems,
			timelineDurationInFrames: latestDuration,
		} = latestRef.current;

		if (!commit || latestServerState.type !== 'connected') {
			const revertChanges = getTimelineKeyframeMovePreviewChanges({
				targets: dragState.targets,
				fromDeltaFrames: dragState.latestDeltaFrames,
				toDeltaFrames: 0,
				durationInFrames: latestDuration,
			});
			if (revertChanges) {
				applyPreviewChanges({
					changes: revertChanges,
					setCodeValues: latestSetCodeValues,
				});
			}

			return;
		}

		const changes = getTimelineKeyframeMoveChanges({
			targets: dragState.targets,
			deltaFrames: dragState.latestDeltaFrames,
			durationInFrames: latestDuration,
		});
		if (
			changes === null ||
			(changes.sequenceKeyframes.length === 0 &&
				changes.effectKeyframes.length === 0)
		) {
			return;
		}

		latestSelectItems(
			dragState.targets.map((target) => ({
				type: 'keyframe',
				nodePathInfo: target.nodePathInfo,
				frame: target.initialDisplayFrame + changes.appliedDeltaFrames,
			})),
		);

		callMoveKeyframes({
			sequenceKeyframes: changes.sequenceKeyframes,
			effectKeyframes: changes.effectKeyframes,
			setCodeValues: latestSetCodeValues,
			clientId: latestServerState.clientId,
		}).catch((err) => {
			Internals.Log.error(
				{logLevel: 'error', tag: null},
				'Could not move keyframes',
				err,
			);
		});
	}, []);

	const onPointerDown = useCallback(
		(e: ReactPointerEvent<HTMLButtonElement>) => {
			if (e.button !== 0 || timelineWidth === null) {
				return;
			}

			const pxPerFrame =
				timelineDurationInFrames > 0
					? (timelineWidth - TIMELINE_PADDING * 2) / timelineDurationInFrames
					: 0;
			if (pxPerFrame <= 0) {
				return;
			}

			const {
				nodePathInfo: latestNodePathInfo,
				frame: latestFrame,
				selectedItems: latestSelectedItems,
				sequences: latestSequences,
				overrideIdToNodePathMappings: latestOverrideIdsToNodePaths,
				codeValues: latestCodeValues,
			} = latestRef.current;
			const targets = getTimelineKeyframeMoveTargets({
				draggedNodePathInfo: latestNodePathInfo,
				draggedFrame: latestFrame,
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
				pointerId: e.pointerId,
				pxPerFrame,
				targets,
			};
			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';
			forceSpecificCursor('ew-resize');
			setDragging(true);
		},
		[timelineDurationInFrames, timelineWidth],
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
			const nextDeltaFrames = Math.round(dx / dragState.pxPerFrame);
			const changes = getTimelineKeyframeMovePreviewChanges({
				targets: dragState.targets,
				fromDeltaFrames: dragState.latestDeltaFrames,
				toDeltaFrames: nextDeltaFrames,
				durationInFrames: latestRef.current.timelineDurationInFrames,
			});
			if (changes === null) {
				return;
			}

			dragState.latestDeltaFrames = changes.appliedDeltaFrames;
			applyPreviewChanges({
				changes,
				setCodeValues: latestRef.current.setCodeValues,
			});
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

	return {dragging, onPointerDown};
};
