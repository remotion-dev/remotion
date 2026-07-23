import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import type {OverrideIdToNodePaths, TSequence} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';

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
