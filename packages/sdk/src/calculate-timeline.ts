import type {_InternalTypes, OverrideIdToNodePaths, TSequence} from 'remotion';
import type {
	TimelineTrackData,
	TimelineTrackWithOriginalTimings,
	TimelineLoopDisplay,
} from './get-timeline-sequence-sort-key';
import {sortItemsByCommitOrder} from './sort-by-commit-order';
import {timelineSequenceNodePathToKey} from './timeline-sequence-node-path-to-key';

type SequenceTiming = {
	parentPlaybackRate: number;
	sequencePlaybackRate: number;
	cascadedStart: number;
	visibleStart: number;
	visibleDuration: number;
	depth: number;
	loopOwner: TSequence | null;
	mediaIterationStart: number;
	hasConnectedCompositionAncestor: boolean;
	isFrozen: boolean;
};

export const calculateTimeline = ({
	sequences,
	overrideIdsToNodePaths,
	compositions = [],
	showConnectedCompositionChildren = false,
}: {
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	compositions?: readonly _InternalTypes['AnyComposition'][];
	showConnectedCompositionChildren?: boolean;
}): TimelineTrackData[] => {
	const registeredSequencesById = new Map(
		sequences.map((sequence) => [sequence.id, sequence]),
	);
	// Nested renderers can unregister a child after its parent during navigation.
	const completenessById = new Map<string, boolean>();
	const hasCompleteAncestors = (sequence: TSequence): boolean => {
		if (sequence.parent === null) {
			return true;
		}

		const cached = completenessById.get(sequence.id);
		if (cached !== undefined) {
			return cached;
		}

		const parent = registeredSequencesById.get(sequence.parent);
		const complete = parent !== undefined && hasCompleteAncestors(parent);
		completenessById.set(sequence.id, complete);
		return complete;
	};

	const completeSequences = sequences.filter(hasCompleteAncestors);
	const sortedSequences = sortItemsByCommitOrder(
		completeSequences,
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
	const compositionsByComponent = new Map<
		unknown,
		_InternalTypes['AnyComposition'][]
	>();
	for (const composition of compositions) {
		const component = composition.componentFromProps;
		if (
			component === null ||
			component === undefined ||
			(typeof component === 'number' && Number.isNaN(component))
		) {
			continue;
		}

		const connectedCompositions = compositionsByComponent.get(component);
		if (connectedCompositions) {
			connectedCompositions.push(composition);
		} else {
			compositionsByComponent.set(component, [composition]);
		}
	}

	for (const sequence of sortedSequences) {
		const connectedCompositions = compositionsByComponent.get(
			sequence.singleChildComponent,
		);
		if (connectedCompositions) {
			connectedCompositionsBySequenceId.set(
				sequence.id,
				connectedCompositions.slice(),
			);
		}
	}

	const sequencesById = new Map(
		sortedSequences.map((sequence) => [sequence.id, sequence]),
	);
	const childrenByParentId = new Map<string, TSequence[]>();
	for (const sequence of sortedSequences) {
		if (sequence.parent === null) {
			continue;
		}

		const siblings = childrenByParentId.get(sequence.parent);
		if (siblings) {
			siblings.push(sequence);
		} else {
			childrenByParentId.set(sequence.parent, [sequence]);
		}
	}

	const timingsById = new Map<string, SequenceTiming>();
	const getTiming = (sequence: TSequence): SequenceTiming => {
		const cached = timingsById.get(sequence.id);
		if (cached) {
			return cached;
		}

		const parent =
			sequence.parent === null ? null : sequencesById.get(sequence.parent);
		if (sequence.parent !== null && !parent) {
			throw new TypeError('Parent not found for sequence ' + sequence.id);
		}

		const parentTiming = parent ? getTiming(parent) : null;
		// Timing and nesting helpers historically treat an empty parent ID as a
		// root, while playback rate and inherited loop lookup still resolve it.
		const timingParent = sequence.parent ? parentTiming! : null;
		const parentPlaybackRate = parent
			? parent.sequencePlaybackRate * parentTiming!.parentPlaybackRate
			: 1;
		const sequencePlaybackRate =
			parentPlaybackRate * sequence.sequencePlaybackRate;
		const cascadedStart = timingParent
			? timingParent.cascadedStart +
				(sequence.from - (parent!.trimBefore ?? 0)) / parentPlaybackRate
			: sequence.from;
		const visibleStart = timingParent
			? Math.max(timingParent.visibleStart, Math.max(0, cascadedStart))
			: Math.max(0, cascadedStart);
		const end = cascadedStart + sequence.duration / parentPlaybackRate;
		const visibleDuration = Math.max(
			0,
			(timingParent
				? Math.min(
						end,
						timingParent.visibleStart + timingParent.visibleDuration,
					)
				: end) - visibleStart,
		);
		const loopOwner = sequence.loopDisplay
			? sequence
			: (parentTiming?.loopOwner ?? null);
		const mediaIterationStart = sequence.loopDisplay
			? cascadedStart
			: parentTiming?.loopOwner
				? Math.max(parentTiming.mediaIterationStart, cascadedStart)
				: cascadedStart;
		const timing: SequenceTiming = {
			parentPlaybackRate,
			sequencePlaybackRate,
			cascadedStart,
			visibleStart,
			visibleDuration,
			depth: timingParent
				? timingParent.depth + (parent!.showInTimeline ? 1 : 0)
				: 0,
			loopOwner,
			mediaIterationStart,
			hasConnectedCompositionAncestor: parent
				? connectedCompositionsBySequenceId.has(parent.id) ||
					parentTiming!.hasConnectedCompositionAncestor
				: false,
			isFrozen:
				sequence.frozenFrame !== null || (parentTiming?.isFrozen ?? false),
		};
		timingsById.set(sequence.id, timing);
		return timing;
	};

	const timelineSequences = sortedSequences.filter(
		(sequence) =>
			showConnectedCompositionChildren ||
			!getTiming(sequence).hasConnectedCompositionAncestor,
	);

	for (let i = 0; i < timelineSequences.length; i++) {
		const sequence = timelineSequences[i];
		const timing = getTiming(sequence);
		const {
			cascadedStart,
			parentPlaybackRate,
			sequencePlaybackRate,
			visibleStart,
			visibleDuration,
		} = timing;
		const cascadedStartWithTrim =
			cascadedStart - (sequence.trimBefore ?? 0) / sequencePlaybackRate;
		let displayDuration = visibleDuration;
		if (
			sequence.autoDuration &&
			!timing.isFrozen &&
			timing.loopOwner === null
		) {
			// Keep runtime timings intact: capping the parent would change child
			// clocks and mounting. Only the container's displayed bar is shortened.
			let end = visibleStart;
			for (const child of childrenByParentId.get(sequence.id) ?? []) {
				end = Math.max(
					end,
					getTiming(child).cascadedStart +
						(child.unclippedDuration ?? child.duration) / sequencePlaybackRate,
				);
			}

			displayDuration = Math.min(visibleDuration, end - visibleStart);
		}

		let loopDisplay: TimelineLoopDisplay | undefined;
		if (
			sequence.loopDisplay ||
			sequence.type === 'audio' ||
			sequence.type === 'video'
		) {
			const owner = timing.loopOwner;
			if (owner?.loopDisplay) {
				const ownerTiming = getTiming(owner);
				const durationInFrames =
					owner.loopDisplay.durationInFrames / ownerTiming.parentPlaybackRate;
				const origin =
					timing.mediaIterationStart +
					owner.loopDisplay.startOffset / ownerTiming.parentPlaybackRate;
				let start = Math.max(0, origin);
				let end = origin + durationInFrames * owner.loopDisplay.numberOfTimes;
				if (owner.parent) {
					const parentTiming = getTiming(sequencesById.get(owner.parent)!);
					start = Math.max(start, parentTiming.visibleStart);
					end = Math.min(
						end,
						parentTiming.visibleStart + parentTiming.visibleDuration,
					);
				}

				loopDisplay = {
					durationInFrames,
					numberOfTimes: Math.max(0, end - start) / durationInFrames,
					startOffset: start - visibleStart,
					phaseOffsetInFrames: (start - origin) % durationInFrames,
					mediaOffsetInFrames: visibleStart - timing.mediaIterationStart,
				};
			}
		}

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
				duration: displayDuration,
				loopDisplay,
			},
			depth: timing.depth,
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
						sequenceSubscriptionKey: {
							...nodePath,
							videoConfigValues: sequence.controls?.videoConfigValues ?? null,
						},
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

	const tracksById = new Map(tracks.map((track) => [track.sequence.id, track]));
	const sortKeysById = new Map<string, string>();
	const getSortKey = (track: TimelineTrackWithOriginalTimings): string => {
		const cached = sortKeysById.get(track.sequence.id);
		if (cached !== undefined) {
			return cached;
		}

		const rank = sequenceRanks.get(track.sequence.id) ?? 0;
		const id = String(rank).padStart(6, '0');
		const parent = track.sequence.parent
			? tracksById.get(track.sequence.parent)
			: null;
		const key = parent ? `${getSortKey(parent)}-${id}` : id;
		sortKeysById.set(track.sequence.id, key);
		return key;
	};

	const sortedTracks: TimelineTrackData[] = tracks
		.map((track) => ({track, sortKey: getSortKey(track)}))
		.sort((a, b) => a.sortKey.localeCompare(b.sortKey))
		.map(({track}) => {
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
