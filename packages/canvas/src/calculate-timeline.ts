import type {_InternalTypes, OverrideIdToNodePaths, TSequence} from 'remotion';
import {getConnectedCompositions} from './get-connected-compositions';
import {
	getParentSequencePlaybackRate,
	getCascadedStart,
	getCascadedStartWithTrim,
	getTimelineVisibleDuration,
	getTimelineVisibleStart,
} from './get-sequence-visible-range';
import {getTimelineNestedLevel} from './get-timeline-nestedness';
import type {
	TimelineTrackData,
	TimelineTrackWithOriginalTimings,
	TimelineLoopDisplay,
} from './get-timeline-sequence-sort-key';
import {getTimelineSequenceSortKey} from './get-timeline-sequence-sort-key';
import {sortItemsByCommitOrder} from './sort-by-commit-order';
import {timelineSequenceNodePathToKey} from './timeline-sequence-node-path-to-key';

const getInheritedLoopDisplay = (
	sequence: TSequence,
	sequences: TSequence[],
): TimelineLoopDisplay | undefined => {
	let owner: TSequence | undefined = sequence;
	while (owner && !owner.loopDisplay) {
		const parentId: string | null = owner.parent;
		owner = sequences.find((candidate) => candidate.id === parentId);
	}

	if (!owner?.loopDisplay) return undefined;

	const parentRate = getParentSequencePlaybackRate(owner, sequences);
	const durationInFrames = owner.loopDisplay.durationInFrames / parentRate;
	const iterationStart = getCascadedStart(owner, sequences);
	let mediaIterationStart = iterationStart;
	let descendant = sequence;
	while (descendant.id !== owner.id) {
		mediaIterationStart = Math.max(
			mediaIterationStart,
			getCascadedStart(descendant, sequences),
		);
		const parentId = descendant.parent;
		descendant = sequences.find((candidate) => candidate.id === parentId)!;
	}

	const origin =
		mediaIterationStart + owner.loopDisplay.startOffset / parentRate;
	let start = Math.max(0, origin);
	let end = origin + durationInFrames * owner.loopDisplay.numberOfTimes;
	if (owner.parent) {
		const parent = sequences.find(
			(candidate) => candidate.id === owner.parent,
		)!;
		const parentStart = getTimelineVisibleStart(parent, sequences);
		start = Math.max(start, parentStart);
		end = Math.min(
			end,
			parentStart + getTimelineVisibleDuration(parent, sequences),
		);
	}

	const visibleStart = getTimelineVisibleStart(sequence, sequences);

	return {
		durationInFrames,
		numberOfTimes: Math.max(0, end - start) / durationInFrames,
		startOffset: start - visibleStart,
		phaseOffsetInFrames: (start - origin) % durationInFrames,
		mediaOffsetInFrames: visibleStart - mediaIterationStart,
	};
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
	const sortedSequences = sortItemsByCommitOrder(
		sequences,
		(sequence) => sequence.timelineOrder,
	);
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
		const parentPlaybackRate = getParentSequencePlaybackRate(
			sequence,
			sortedSequences,
		);
		const sequencePlaybackRate =
			parentPlaybackRate * sequence.sequencePlaybackRate;

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
				sequencePlaybackRate,
				premountDisplay:
					sequence.premountDisplay === null
						? null
						: sequence.premountDisplay / parentPlaybackRate,
				postmountDisplay:
					sequence.postmountDisplay === null
						? null
						: sequence.postmountDisplay / parentPlaybackRate,
				duration: visibleDuration,
				loopDisplay:
					sequence.loopDisplay ||
					sequence.type === 'audio' ||
					sequence.type === 'video'
						? getInheritedLoopDisplay(sequence, sortedSequences)
						: undefined,
			},
			depth: getTimelineNestedLevel(sequence, sortedSequences, 0),
			cascadedStart,
			localStart: sequence.from,
			cascadedDuration: sequence.duration,
			keyframeDisplayOffset: hasKeyframeRows
				? cascadedStart - sequence.from / parentPlaybackRate
				: 0,
			sequenceFrameOffset:
				(visibleStart - cascadedStartWithTrim) * sequencePlaybackRate,
			keyframePlaybackRate: parentPlaybackRate,
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

	const sequenceRanks = new Map<string, number>();
	for (let i = 0; i < tracks.length; i++) {
		sequenceRanks.set(tracks[i].sequence.id, i);
	}

	const sortedTracks: TimelineTrackData[] = tracks
		.sort((a, b) => {
			const sortKeyA = getTimelineSequenceSortKey(a, tracks, sequenceRanks);
			const sortKeyB = getTimelineSequenceSortKey(b, tracks, sequenceRanks);
			return sortKeyA.localeCompare(sortKeyB);
		})
		.map((track) => {
			const {cascadedDuration, ...cleanTrack} = track;
			return cleanTrack;
		});

	const nodePathIndexCounters = new Map<string, number>();

	return sortedTracks
		.map((track): TimelineTrackData => {
			if (track.nodePathInfo === null) {
				return track;
			}

			const key = timelineSequenceNodePathToKey(
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

			const key = timelineSequenceNodePathToKey(
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
