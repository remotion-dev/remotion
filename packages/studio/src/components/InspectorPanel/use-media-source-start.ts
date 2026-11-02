import {useCallback, useContext, useLayoutEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {useTimelineCalculator} from '../../helpers/calculate-timeline';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {getPreviewServerConnectionState} from '../../helpers/preview-server-events';
import {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
import {commitTimelineTimingEdit} from '../Timeline/commit-timeline-timing-edit';
import {getKeyframeTrimConstraints} from '../Timeline/get-keyframe-trim-constraints';
import {
	getTimelineSequenceLeftEdgeDragChanges,
	getTimelineSequenceLeftEdgeDragTargets,
	type TimelineSequenceLeftEdgeDragTarget,
} from '../Timeline/TimelineSequenceRightEdgeDragHandle';
import {useSequencePropPreview} from '../Timeline/use-sequence-prop-preview';

export const useMediaSourceStart = ({
	nodePathInfo,
	sourceStart,
	disabled,
}: {
	nodePathInfo: SequenceNodePathInfo;
	sourceStart: number;
	disabled: boolean;
}) => {
	const video = Internals.useVideo();
	const calculateTimeline = useTimelineCalculator();
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const mappingsRef = useContext(OverrideIdToNodePathMappingsRefContext);
	const statusesRef = useContext(Internals.VisualModePropStatusesRefContext);
	const {updateDragOverridesBatch} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {getPreview, takePreview, cancelPreview} = useSequencePropPreview();
	const draft = useRef<{
		target: TimelineSequenceLeftEdgeDragTarget;
		sourceStart: number;
		fields: string[];
	} | null>(null);
	const enabled = useRef(false);

	const cancel = useCallback(() => {
		draft.current = null;
		cancelPreview();
	}, [cancelPreview]);

	const nodeKey = Internals.makeSequencePropsSubscriptionKey(
		nodePathInfo.sequenceSubscriptionKey,
	);
	useLayoutEffect(() => {
		enabled.current = !disabled;
		return () => {
			enabled.current = false;
			cancel();
		};
	}, [cancel, disabled, nodeKey, nodePathInfo.index, video?.id]);

	const apply = useCallback(
		(value: number, shouldCommit: boolean) => {
			const connection = getPreviewServerConnectionState();
			if (
				!enabled.current ||
				!video ||
				connection.type !== 'connected' ||
				!Number.isFinite(value) ||
				value < 0
			) {
				cancel();
				return;
			}

			if (!draft.current) {
				const sequences = sequencesRef.current;
				const overrideIdsToNodePaths = mappingsRef.current;
				const {tracks} = calculateTimeline({sequences, overrideIdsToNodePaths});
				const propStatuses = getKeyframeTrimConstraints({
					propStatuses: statusesRef.current,
					overrideIdsToNodePaths,
					sequences,
					affectedNodePaths: [nodePathInfo.sequenceSubscriptionKey],
				});
				const initialTarget = getTimelineSequenceLeftEdgeDragTargets({
					draggedNodePathInfo: nodePathInfo,
					selectedItems: [],
					sequences,
					tracks,
					propStatuses,
					timelineDurationInFrames: video.durationInFrames,
					trimBeforeOnly: true,
				})?.[0];
				if (!initialTarget?.sourceOnlyLimits || !Number.isFinite(sourceStart))
					return;
				draft.current = {target: initialTarget, sourceStart, fields: []};
			}

			const edit = draft.current;
			const {target} = edit;
			const changes = getTimelineSequenceLeftEdgeDragChanges({
				target,
				sourceOffset:
					value === edit.sourceStart
						? target.initialTrimBefore
						: value - (edit.sourceStart - target.initialTrimBefore),
			});
			const statuses = Internals.getPropStatusesCtx(
				statusesRef.current,
				target.nodePath,
			);
			if (
				statuses?.trimBefore?.status !== 'static' ||
				changes.some(({fieldKey}) => statuses[fieldKey]?.status !== 'static')
			) {
				cancel();
				return;
			}

			const fields = changes.map(({fieldKey}) => fieldKey);
			if (edit.fields.some((key) => !fields.includes(key))) cancelPreview();
			edit.fields = fields;
			if (changes.length > 0) {
				getPreview().setDragOverridesBatch(
					changes.map((change) => ({
						nodePath: target.nodePath,
						key: change.fieldKey,
						value: {type: 'static', value: change.value},
					})),
					updateDragOverridesBatch,
				);
			}

			if (!shouldCommit) return;
			draft.current = null;
			if (changes.length === 0) {
				cancelPreview();
				return;
			}

			commitTimelineTimingEdit({
				preview: takePreview(),
				changes,
				clientId: connection.clientId,
				operation: 'slip-source',
				undoLabel: 'Adjust source start',
				redoLabel: 'Adjust source start back',
				movedKeyframes: null,
			});
		},
		[
			calculateTimeline,
			cancel,
			cancelPreview,
			getPreview,
			mappingsRef,
			nodePathInfo,
			sequencesRef,
			sourceStart,
			statusesRef,
			takePreview,
			updateDragOverridesBatch,
			video,
		],
	);
	const preview = useCallback((value: number) => apply(value, false), [apply]);
	const commit = useCallback((value: number) => apply(value, true), [apply]);
	return {preview, commit, cancel};
};
