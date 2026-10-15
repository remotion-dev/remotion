import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from '../../helpers/get-timeline-sequence-sort-key';

export const findTrackForNodePathInfo = ({
	tracks,
	nodePathInfo,
}: {
	readonly tracks: readonly TimelineTrackData[];
	readonly nodePathInfo: SequenceNodePathInfo;
}) => {
	const key = stringifySequenceExpandedRowKey(
		nodePathInfo.sequenceSubscriptionKey,
	);
	return tracks.find(
		(candidate) =>
			candidate.nodePathInfo !== null &&
			stringifySequenceExpandedRowKey(
				candidate.nodePathInfo.sequenceSubscriptionKey,
			) === key &&
			candidate.nodePathInfo.index === nodePathInfo.index,
	);
};
