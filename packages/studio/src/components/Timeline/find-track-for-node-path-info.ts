import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import type {OverrideIdToNodePaths, TSequence} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from '../../helpers/get-timeline-sequence-sort-key';

export const findTrackForNodePathInfoInTimeline = ({
	tracks,
	nodePathInfo,
}: {
	tracks: readonly TimelineTrackData[];
	nodePathInfo: SequenceNodePathInfo;
}) => {
	return tracks.find(
		(candidate) =>
			candidate.nodePathInfo !== null &&
			stringifySequenceExpandedRowKey(
				candidate.nodePathInfo.sequenceSubscriptionKey,
			) ===
				stringifySequenceExpandedRowKey(nodePathInfo.sequenceSubscriptionKey) &&
			candidate.nodePathInfo.index === nodePathInfo.index,
	);
};

export const findTrackForNodePathInfo = ({
	sequences,
	overrideIdsToNodePaths,
	nodePathInfo,
}: {
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	nodePathInfo: SequenceNodePathInfo;
}) => {
	const tracks = calculateTimeline({sequences, overrideIdsToNodePaths});
	return findTrackForNodePathInfoInTimeline({tracks, nodePathInfo});
};
