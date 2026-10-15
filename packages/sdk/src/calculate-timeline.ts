import type {_InternalTypes, OverrideIdToNodePaths, TSequence} from 'remotion';
import type {
	TimelineTrackData,
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
	trackClip: TSequence | null;
	hasCollapsedConnectedCompositionAncestor: boolean;
	isFrozen: boolean;
};

type TimelineCalculationInput = {
	sequences: readonly TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	compositions?: readonly _InternalTypes['AnyComposition'][];
	showConnectedCompositionChildren?: boolean;
};

type TimelineCalculation = {
	tracks: TimelineTrackData[];
	structure: {trackIndexById: ReadonlyMap<string, number>};
	// A full rebuild invalidates grouping and row membership in the consumer.
	changedSequenceIds: readonly string[] | null;
};

const EMPTY_COMPOSITIONS: readonly _InternalTypes['AnyComposition'][] = [];

const calculateTimelineState = ({
	sequences,
	overrideIdsToNodePaths,
	compositions = EMPTY_COMPOSITIONS,
	showConnectedCompositionChildren = false,
}: TimelineCalculationInput): {
	result: TimelineCalculation;
	update: (input: TimelineCalculationInput) => TimelineCalculation | null;
} => {
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
		// A series clip and its interactive component can represent the same
		// connected composition, with hidden transition wrappers between them.
		const trackClip =
			sequence.timelineTrack?.role === 'clip'
				? sequence
				: parentTiming?.trackClip &&
					  (!sequence.showInTimeline ||
							sequence.singleChildComponent ===
								parentTiming.trackClip.singleChildComponent)
					? parentTiming.trackClip
					: null;
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
			trackClip,
			hasCollapsedConnectedCompositionAncestor: parent
				? parentTiming!.hasCollapsedConnectedCompositionAncestor ||
					(connectedCompositionsBySequenceId.has(parent.id) &&
						!(
							showConnectedCompositionChildren &&
							(parent.timelineTrack?.role === 'track' ||
								parentTiming!.trackClip?.singleChildComponent ===
									parent.singleChildComponent)
						))
				: false,
			isFrozen:
				sequence.frozenFrame !== null || (parentTiming?.isFrozen ?? false),
		};
		timingsById.set(sequence.id, timing);
		return timing;
	};

	const timelineSequences = sortedSequences.filter(
		(sequence) => !getTiming(sequence).hasCollapsedConnectedCompositionAncestor,
	);

	const getTrack = (sequence: TSequence): TimelineTrackData => {
		const timing = getTiming(sequence);
		const parentTiming =
			sequence.parent === null
				? null
				: getTiming(sequencesById.get(sequence.parent)!);
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
					const loopParentTiming = getTiming(sequencesById.get(owner.parent)!);
					start = Math.max(start, loopParentTiming.visibleStart);
					end = Math.min(
						end,
						loopParentTiming.visibleStart + loopParentTiming.visibleDuration,
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

		return {
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
			parentVisibleStart: parentTiming?.visibleStart ?? 0,
			parentVisibleEnd: parentTiming
				? parentTiming.visibleStart + parentTiming.visibleDuration
				: null,
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
		};
	};

	const tracks = timelineSequences.map(getTrack);

	const sequenceRanks = new Map<string, number>();
	for (let i = 0; i < tracks.length; i++) {
		sequenceRanks.set(tracks[i].sequence.id, i);
	}

	const tracksById = new Map(tracks.map((track) => [track.sequence.id, track]));
	const sortKeysById = new Map<string, string>();
	const getSortKey = (track: TimelineTrackData): string => {
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
		.map(({track}) => track);

	const nodePathIndexCounters = new Map<string, number>();

	let currentTracks = sortedTracks
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

	const trackIndexById = new Map(
		currentTracks.map((track, index) => [track.sequence.id, index]),
	);
	const structure = {trackIndexById};
	let currentSequences = sequences;
	const update = (
		input: TimelineCalculationInput,
	): TimelineCalculation | null => {
		if (
			input.overrideIdsToNodePaths !== overrideIdsToNodePaths ||
			(input.compositions ?? EMPTY_COMPOSITIONS) !== compositions ||
			(input.showConnectedCompositionChildren ?? false) !==
				showConnectedCompositionChildren
		) {
			return null;
		}

		if (input.sequences === currentSequences) {
			return {tracks: currentTracks, structure, changedSequenceIds: []};
		}

		if (
			input.sequences.length !== currentSequences.length ||
			sequencesById.size !== currentSequences.length
		) {
			return null;
		}

		const changed: TSequence[] = [];
		for (let i = 0; i < input.sequences.length; i++) {
			const sequence = input.sequences[i];
			const previous = currentSequences[i];
			if (sequence === previous) {
				continue;
			}

			// Retain ordering and node-path indexes only for ordinary media leaves.
			// Changes to registrations, controls or hierarchy need a full rebuild.
			if (
				sequence.id !== previous.id ||
				(sequence.type !== 'audio' && sequence.type !== 'video') ||
				sequence.frozenMediaFrame !== null ||
				sequence.autoDuration ||
				sequence.isInsideSeries ||
				sequence.timelineTrack !== undefined ||
				childrenByParentId.has(sequence.id) ||
				!trackIndexById.has(sequence.id)
			) {
				return null;
			}

			const keys = Object.keys(sequence);
			if (keys.length !== Object.keys(previous).length) {
				return null;
			}

			for (const key of keys) {
				if (!Object.hasOwn(previous, key)) {
					return null;
				}

				if (
					key === 'from' ||
					key === 'duration' ||
					key === 'trimBefore' ||
					key === 'startMediaFrom' ||
					key === 'mediaFrameAtSequenceZero'
				) {
					continue;
				}

				if (
					sequence[key as keyof TSequence] !== previous[key as keyof TSequence]
				) {
					return null;
				}
			}

			const timing = timingsById.get(sequence.id)!;
			if (timing.loopOwner !== null || timing.isFrozen) {
				return null;
			}

			// Only an immediate child's duration contributes to an inferred bar.
			// A fixed Series.Sequence insulates its Series from a nested media trim.
			if (
				sequence.parent !== null &&
				sequencesById.get(sequence.parent)!.autoDuration
			) {
				return null;
			}

			changed.push(sequence);
		}

		if (changed.length > 0) {
			const nextTracks = currentTracks.slice();
			for (const sequence of changed) {
				const index = trackIndexById.get(sequence.id)!;
				const previousTrack = currentTracks[index];
				sequencesById.set(sequence.id, sequence);
				timingsById.delete(sequence.id);
				const track = getTrack(sequence);
				if (
					track.sequence.duration > 0 !==
					previousTrack.sequence.duration > 0
				) {
					return null;
				}

				nextTracks[index] = {
					...track,
					nodePathInfo: previousTrack.nodePathInfo,
				};
			}

			currentTracks = nextTracks;
		}

		currentSequences = input.sequences;
		return {
			tracks: currentTracks,
			structure,
			changedSequenceIds: changed.map((sequence) => sequence.id),
		};
	};

	return {
		result: {tracks: currentTracks, structure, changedSequenceIds: null},
		update,
	};
};

export const calculateTimeline = (
	input: TimelineCalculationInput,
): TimelineTrackData[] => {
	return calculateTimelineState(input).result.tracks;
};

// One instance belongs to one timeline consumer. Compatible commits reuse the
// hierarchy, timing cache, sort order and node-path indexes from its last rebuild.
export const createTimelineCalculator = () => {
	let state: ReturnType<typeof calculateTimelineState> | null = null;
	return (input: TimelineCalculationInput): TimelineCalculation => {
		const updated = state?.update(input) ?? null;
		if (updated !== null) {
			return updated;
		}

		state = calculateTimelineState(input);
		return state.result;
	};
};
