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

export const createTrackLookupForNodePathInfo = (
	tracks: readonly TimelineTrackData[],
) => {
	const tracksBySource = new Map<string, Map<number, TimelineTrackData>>();
	let nextTrackIndex = 0;
	return (
		nodePathInfo: SequenceNodePathInfo,
	): TimelineTrackData | undefined => {
		// The original strict instance-index comparison never matches NaN.
		if (Number.isNaN(nodePathInfo.index)) {
			return undefined;
		}

		const key = stringifySequenceExpandedRowKey(
			nodePathInfo.sequenceSubscriptionKey,
		);
		const cached = tracksBySource.get(key)?.get(nodePathInfo.index);
		if (cached !== undefined) {
			return cached;
		}

		// Stop at the requested track so small selections only index their prefix.
		while (nextTrackIndex < tracks.length) {
			const track = tracks[nextTrackIndex++];
			const info = track.nodePathInfo;
			if (info === null || Number.isNaN(info.index)) {
				continue;
			}

			const sourceKey = stringifySequenceExpandedRowKey(
				info.sequenceSubscriptionKey,
			);
			const instances =
				tracksBySource.get(sourceKey) ?? new Map<number, TimelineTrackData>();
			// Preserve the first match for each source and rendered instance.
			if (!instances.has(info.index)) {
				instances.set(info.index, track);
			}

			tracksBySource.set(sourceKey, instances);
			if (sourceKey === key && info.index === nodePathInfo.index) {
				return track;
			}
		}

		return undefined;
	};
};
