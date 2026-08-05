import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import type {
	_InternalTypes,
	LoopDisplay,
	OverrideIdToNodePaths,
	TSequence,
} from 'remotion';
import {getConnectedCompositions} from './get-connected-compositions';
import {
	getCascadedStart,
	getCascadedStartWithTrim,
	getTimelineVisibleDuration,
	getTimelineVisibleStart,
} from './get-sequence-visible-range';
import {getTimelineNestedLevel} from './get-timeline-nestedness';
import type {
	TimelineTrackData,
	TimelineTrackWithOriginalTimings,
} from './get-timeline-sequence-sort-key';
import {getTimelineSequenceSortKey} from './get-timeline-sequence-sort-key';
import {sortItemsByNonceHistory} from './sort-by-nonce-history';

const getInheritedLoopDisplay = (
	sequence: TSequence,
	sequences: TSequence[],
): LoopDisplay | undefined => {
	if (sequence.loopDisplay) {
		return sequence.loopDisplay;
	}

	if (!sequence.parent) {
		return undefined;
	}

	const parent = sequences.find((s) => s.id === sequence.parent);
	if (!parent) {
		return undefined;
	}

	return getInheritedLoopDisplay(parent, sequences);
};

export const calculateTimeline = ({
	sequences,
	overrideIdsToNodePaths,
	compositions = [],
}: {
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	compositions?: readonly _InternalTypes['AnyComposition'][];
}): TimelineTrackData[] => {
	const sortedSequences = sortItemsByNonceHistory(sequences);
	const tracks: TimelineTrackWithOriginalTimings[] = [];

	if (sortedSequences.length === 0) {
		return [];
	}

	const connectedCompositionsBySequenceId = new Map<
		string,
		readonly _InternalTypes['AnyComposition'][]
	>();
	for (const sequence of sortedSequences) {
		const connectedCompositions = getConnectedCompositions({
			compositions,
			singleChildComponent: sequence.singleChildComponent,
		});
		if (connectedCompositions.length > 0) {
			connectedCompositionsBySequenceId.set(sequence.id, connectedCompositions);
		}
	}

	const sequencesById = new Map(
		sortedSequences.map((sequence) => [sequence.id, sequence]),
	);
	const timelineSequences = sortedSequences.filter((sequence) => {
		let parentId = sequence.parent;
		while (parentId !== null) {
			if (connectedCompositionsBySequenceId.has(parentId)) {
				return false;
			}

			parentId = sequencesById.get(parentId)?.parent ?? null;
		}

		return true;
	});

	for (let i = 0; i < timelineSequences.length; i++) {
		const sequence = timelineSequences[i];
		const cascadedStart = getCascadedStart(sequence, sortedSequences);
		const cascadedStartWithTrim = getCascadedStartWithTrim(
			sequence,
			sortedSequences,
		);
		const effectiveFrom =
			sequence.trimBefore === null
				? sequence.from
				: sequence.from - sequence.trimBefore;

		const visibleStart = getTimelineVisibleStart(sequence, sortedSequences);
		const visibleDuration = getTimelineVisibleDuration(
			sequence,
			sortedSequences,
		);

		const overrideId = sequence.controls?.overrideId ?? null;
		const nodePath = overrideId ? overrideIdsToNodePaths[overrideId] : null;
		const hasKeyframeRows =
			sequence.controls !== null || sequence.effects.length > 0;
		const connectedCompositions =
			connectedCompositionsBySequenceId.get(sequence.id) ?? [];

		tracks.push({
			...(connectedCompositions.length > 0 ? {connectedCompositions} : {}),
			sequence: {
				...sequence,
				from: visibleStart,
				duration: visibleDuration,
				loopDisplay:
					sequence.type === 'audio' || sequence.type === 'video'
						? getInheritedLoopDisplay(sequence, sortedSequences)
						: sequence.loopDisplay,
			},
			depth: getTimelineNestedLevel(sequence, sortedSequences, 0),
			cascadedStart,
			cascadedDuration: sequence.duration,
			keyframeDisplayOffset: hasKeyframeRows
				? cascadedStartWithTrim - effectiveFrom
				: 0,
			sequenceFrameOffset: visibleStart - cascadedStartWithTrim,
			nodePathInfo: nodePath
				? {
						sequenceSubscriptionKey: nodePath,
						auxiliaryKeys: [],
						index: 0,
						numberOfSequencesWithThisNodePath: 0,
						supportsEffects: sequence.controls?.supportsEffects === true,
					}
				: null,
		});
	}

	const nonceRanks = new Map<string, number>();
	for (let i = 0; i < tracks.length; i++) {
		nonceRanks.set(tracks[i].sequence.id, i);
	}

	const sortedTracks: TimelineTrackData[] = tracks
		.sort((a, b) => {
			const sortKeyA = getTimelineSequenceSortKey(a, tracks, nonceRanks);
			const sortKeyB = getTimelineSequenceSortKey(b, tracks, nonceRanks);
			return sortKeyA.localeCompare(sortKeyB);
		})
		.map((track) => {
			const {cascadedDuration, cascadedStart, ...cleanTrack} = track;
			return cleanTrack;
		});

	const nodePathIndexCounters = new Map<string, number>();

	return sortedTracks
		.map((track): TimelineTrackData => {
			if (track.nodePathInfo === null) {
				return track;
			}

			const key = stringifySequenceSubscriptionKey(
				track.nodePathInfo.sequenceSubscriptionKey,
			);
			const index = nodePathIndexCounters.get(key) ?? 0;
			nodePathIndexCounters.set(key, index + 1);
			return {
				...track,
				nodePathInfo: {
					sequenceSubscriptionKey: track.nodePathInfo.sequenceSubscriptionKey,
					auxiliaryKeys: track.nodePathInfo.auxiliaryKeys,
					index,
					numberOfSequencesWithThisNodePath: 0,
					supportsEffects: track.nodePathInfo.supportsEffects,
				},
			};
		})
		.map((track) => {
			if (track.nodePathInfo === null) {
				return track;
			}

			const key = stringifySequenceSubscriptionKey(
				track.nodePathInfo.sequenceSubscriptionKey,
			);

			return {
				...track,
				nodePathInfo: {
					sequenceSubscriptionKey: track.nodePathInfo.sequenceSubscriptionKey,
					auxiliaryKeys: track.nodePathInfo.auxiliaryKeys,
					index: track.nodePathInfo.index,
					numberOfSequencesWithThisNodePath:
						nodePathIndexCounters.get(key) ?? 0,
					supportsEffects: track.nodePathInfo.supportsEffects,
				},
			};
		});
};
