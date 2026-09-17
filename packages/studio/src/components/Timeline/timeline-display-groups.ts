import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {timelineSequenceNodePathToKey} from '../../helpers/timeline-node-path-key';

export type TimelineDisplayGroup = {
	readonly key: string;
	readonly numberOfSequences: number;
};

export type TimelineTrackWithDisplayGroup = TimelineTrackData & {
	readonly displayGroup: TimelineDisplayGroup | null;
};

export const addTimelineDisplayGroups = (
	tracks: readonly TimelineTrackData[],
): TimelineTrackWithDisplayGroup[] => {
	const stacksBySequenceId = new Map<string, string | null>();
	const resolvedNodePathKeysByStack = new Map<string, Set<string>>();

	for (const track of tracks) {
		// Only controlled sequences can eventually resolve to a source node.
		const stack =
			track.sequence.controls === null ? null : track.sequence.getStack();
		stacksBySequenceId.set(track.sequence.id, stack);

		if (stack === null || track.nodePathInfo === null) {
			continue;
		}

		const nodePathKey = `node-path:${timelineSequenceNodePathToKey(
			track.nodePathInfo.sequenceSubscriptionKey,
		)}`;
		const nodePathKeys =
			resolvedNodePathKeysByStack.get(stack) ?? new Set<string>();
		nodePathKeys.add(nodePathKey);
		resolvedNodePathKeysByStack.set(stack, nodePathKeys);
	}

	const displayKeys = tracks.map((track): string | null => {
		if (track.nodePathInfo !== null) {
			return `node-path:${timelineSequenceNodePathToKey(
				track.nodePathInfo.sequenceSubscriptionKey,
			)}`;
		}

		const stack = stacksBySequenceId.get(track.sequence.id) ?? null;
		if (stack === null) {
			return null;
		}

		const resolvedNodePathKeys = resolvedNodePathKeysByStack.get(stack);
		if (resolvedNodePathKeys?.size === 1) {
			const resolvedNodePathKey = resolvedNodePathKeys.values().next().value;
			if (resolvedNodePathKey === undefined) {
				throw new Error('Expected a resolved timeline node path key');
			}

			return resolvedNodePathKey;
		}

		// This identity is display-only. Source operations continue to require
		// track.nodePathInfo.
		return `stack:${stack}`;
	});
	const counts = new Map<string, number>();
	for (const key of displayKeys) {
		if (key !== null) {
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
	}

	return tracks.map((track, index) => {
		const key = displayKeys[index];
		if (key === null) {
			return {...track, displayGroup: null};
		}

		const numberOfSequences = counts.get(key);
		if (numberOfSequences === undefined) {
			throw new Error('Expected a timeline display group count');
		}

		return {
			...track,
			displayGroup: {
				key,
				numberOfSequences,
			},
		};
	});
};
