import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import type {OverrideIdToNodePaths, TSequence} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import type {SequenceSectionSelection} from './inspector-selection';

export const findTrackForInspectorSelection = ({
	sequences,
	overrideIdsToNodePaths,
	selection,
}: {
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly selection: SequenceSectionSelection;
}): TrackWithHash | undefined => {
	const tracks = calculateTimeline({sequences, overrideIdsToNodePaths});
	const selectionKey = stringifySequenceExpandedRowKey(
		selection.nodePathInfo.sequenceSubscriptionKey,
	);

	return tracks.find((candidate) => {
		if (candidate.nodePathInfo === null) {
			return false;
		}

		const candidateKey = stringifySequenceExpandedRowKey(
			candidate.nodePathInfo.sequenceSubscriptionKey,
		);

		return (
			candidateKey === selectionKey &&
			candidate.nodePathInfo.index === selection.nodePathInfo.index
		);
	});
};
