import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import type {LoopDisplay, OverrideIdToNodePaths, TSequence} from 'remotion';
import {
	getCascadedStart,
	getCascadedStartWithTrim,
	getTimelineVisibleDuration,
	getTimelineVisibleStart,
} from './get-sequence-visible-range';
import {getTimelineNestedLevel} from './get-timeline-nestedness';
import {getTimelineSequenceHash} from './get-timeline-sequence-hash';
import type {
	SequenceNodePathInfo,
	TrackWithHash,
	TrackWithHashAndOriginalTimings,
} from './get-timeline-sequence-sort-key';
import {getTimelineSequenceSequenceSortKey} from './get-timeline-sequence-sort-key';
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
}: {
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
}): {tracks: TrackWithHash[]; mergedParentIds: Set<string>} => {
	const sortedSequences = sortItemsByNonceHistory(sequences);
	const tracks: TrackWithHashAndOriginalTimings[] = [];

	if (sortedSequences.length === 0) {
		return {tracks: [], mergedParentIds: new Set()};
	}

	// Build parent→children map and detect merge candidates.
	// A merge happens when a user-authored <Sequence> (has controls)
	// wraps exactly one <Video> or <Audio> child.
	const childrenOf = new Map<string, TSequence[]>();
	for (const seq of sortedSequences) {
		if (seq.parent) {
			const list = childrenOf.get(seq.parent) ?? [];
			list.push(seq);
			childrenOf.set(seq.parent, list);
		}
	}

	const mergedParentIds = new Set<string>();
	const mergedChildParentInfo = new Map<
		string,
		{readonly sequence: TSequence; readonly nodePathInfo: SequenceNodePathInfo}
	>();

	for (const seq of sortedSequences) {
		if ((seq.type === 'video' || seq.type === 'audio') && seq.parent !== null) {
			const parent = sortedSequences.find((s) => s.id === seq.parent);
			if (
				parent &&
				parent.type === 'sequence' &&
				parent.controls !== null &&
				parent.controls.overrideId
			) {
				const siblings = childrenOf.get(parent.id);
				if (siblings && siblings.length === 1) {
					// Innermost-only: skip if the parent is itself a merged child
					const parentParent = parent.parent
						? sortedSequences.find((s) => s.id === parent.parent)
						: null;
					const isParentMerged =
						parentParent &&
						parentParent.type === 'sequence' &&
						parentParent.controls !== null &&
						parentParent.controls.overrideId &&
						childrenOf.get(parentParent.id)?.length === 1;

					if (!isParentMerged) {
						mergedParentIds.add(parent.id);
						const parentNodePath = parent.controls.overrideId
							? overrideIdsToNodePaths[parent.controls.overrideId]
							: undefined;
						if (parentNodePath) {
							mergedChildParentInfo.set(seq.id, {
								sequence: parent,
								nodePathInfo: {
									sequenceSubscriptionKey: parentNodePath,
									auxiliaryKeys: [],
									index: 0,
									numberOfSequencesWithThisNodePath: 0,
									supportsEffects: false,
								},
							});
						}
					}
				}
			}
		}
	}

	const sameHashes: {[hash: string]: string[]} = {};

	const hashesUsedInRoot: {[rootId: string]: string[]} = {};
	const cache: {[sequenceId: string]: string} = {};

	for (let i = 0; i < sortedSequences.length; i++) {
		const sequence = sortedSequences[i];
		if (!hashesUsedInRoot[sequence.rootId]) {
			hashesUsedInRoot[sequence.rootId] = [];
		}

		const actualHash = getTimelineSequenceHash(
			sequence,
			sortedSequences,
			hashesUsedInRoot,
			cache,
		);

		if (!sameHashes[actualHash]) {
			sameHashes[actualHash] = [];
		}

		sameHashes[actualHash].push(sequence.id);

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

		tracks.push({
			sequence: {
				...sequence,
				from: visibleStart,
				duration: visibleDuration,
				loopDisplay:
					sequence.type === 'audio' || sequence.type === 'video'
						? getInheritedLoopDisplay(sequence, sortedSequences)
						: sequence.loopDisplay,
			},
			depth: getTimelineNestedLevel(
				sequence,
				sortedSequences,
				0,
				mergedParentIds,
			),
			hash: actualHash,
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
			...(mergedChildParentInfo.has(sequence.id)
				? {mergedParentInfo: mergedChildParentInfo.get(sequence.id)}
				: {}),
		});
	}

	const uniqueTracks: TrackWithHash[] = [];
	for (const track of tracks) {
		if (!uniqueTracks.find((t) => t.hash === track.hash)) {
			const {cascadedDuration, cascadedStart, ...cleanTrack} = track;
			uniqueTracks.push(cleanTrack);
		}
	}

	const nonceRanks = new Map<string, number>();
	for (let i = 0; i < tracks.length; i++) {
		nonceRanks.set(tracks[i].sequence.id, i);
	}

	const sortedTracks = uniqueTracks.sort((a, b) => {
		const sortKeyA = getTimelineSequenceSequenceSortKey(
			a,
			tracks,
			sameHashes,
			nonceRanks,
		);
		const sortKeyB = getTimelineSequenceSequenceSortKey(
			b,
			tracks,
			sameHashes,
			nonceRanks,
		);
		return sortKeyA.localeCompare(sortKeyB);
	});

	const nodePathIndexCounters = new Map<string, number>();

	const result = sortedTracks
		.map((track): TrackWithHash => {
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

	return {tracks: result, mergedParentIds};
};
