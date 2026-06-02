import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import type {
	CodeValues,
	GetDragOverrides,
	LoopDisplay,
	OverrideIdToNodePaths,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {
	getCascadedStart,
	getTimelineVisibleDuration,
	getTimelineVisibleStart,
} from './get-sequence-visible-range';
import {getTimelineNestedLevel} from './get-timeline-nestedness';
import {getTimelineSequenceHash} from './get-timeline-sequence-hash';
import type {
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

const getEffectiveDurationInFrames = ({
	sequence,
	codeValues,
	getDragOverrides,
	overrideIdsToNodePaths,
}: {
	sequence: TSequence;
	codeValues: CodeValues;
	getDragOverrides: GetDragOverrides;
	overrideIdsToNodePaths: OverrideIdToNodePaths;
}): number => {
	if (sequence.type !== 'sequence') {
		return sequence.duration;
	}

	const overrideId = sequence.controls?.overrideId ?? null;
	if (!overrideId) {
		return sequence.duration;
	}

	const nodePath = overrideIdsToNodePaths[overrideId];
	if (!nodePath) {
		return sequence.duration;
	}

	const dragValue = getDragOverrides(nodePath)?.durationInFrames;
	if (typeof dragValue === 'number' && Number.isFinite(dragValue)) {
		return Math.max(1, dragValue);
	}

	const codeValuesForOverride = Internals.getCodeValuesCtx(
		codeValues,
		nodePath,
	);
	const codeValue = codeValuesForOverride?.durationInFrames;
	if (codeValue && codeValue.canUpdate) {
		const value = codeValue.codeValue;
		if (typeof value === 'number' && Number.isFinite(value)) {
			return Math.max(1, value);
		}
	}

	return sequence.duration;
};

export const calculateTimeline = ({
	sequences,
	overrideIdsToNodePaths,
	codeValues = {},
	getDragOverrides = () => ({}),
}: {
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	codeValues?: CodeValues;
	getDragOverrides?: GetDragOverrides;
}): TrackWithHash[] => {
	const sortedSequences = sortItemsByNonceHistory(sequences).map(
		(sequence): TSequence => {
			const effectiveDuration = getEffectiveDurationInFrames({
				sequence,
				codeValues,
				getDragOverrides,
				overrideIdsToNodePaths,
			});
			if (effectiveDuration === sequence.duration) {
				return sequence;
			}

			return {...sequence, duration: effectiveDuration};
		},
	);
	const tracks: TrackWithHashAndOriginalTimings[] = [];

	if (sortedSequences.length === 0) {
		return [];
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
			depth: getTimelineNestedLevel(sequence, sortedSequences, 0),
			hash: actualHash,
			cascadedStart,
			cascadedDuration: sequence.duration,
			keyframeDisplayOffset: hasKeyframeRows
				? cascadedStart - sequence.from
				: 0,
			nodePathInfo: nodePath
				? {
						sequenceSubscriptionKey: nodePath,
						auxiliaryKeys: [],
						index: 0,
						numberOfSequencesWithThisNodePath: 0,
					}
				: null,
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

	return sortedTracks
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
				},
			};
		});
};
