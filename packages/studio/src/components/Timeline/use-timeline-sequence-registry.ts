import {CanvasInternals} from '@remotion/sdk';
import {useCallback, useContext, type ContextType} from 'react';
import type {TSequence} from 'remotion';
import {Internals} from 'remotion';
import {useSyncExternalStore} from '../../helpers/use-sync-external-store';
import {getTimelineSequenceNaturalDuration} from './get-timeline-sequence-natural-duration';
import {isCascadingSequence} from './TimelineSequenceRightEdgeDragHandle';

type SequenceRegistry = NonNullable<
	ContextType<typeof Internals.SequenceRegistryContext>
>;

type TimelineSequenceRegistryEntry = {
	readonly sequence: TSequence;
	readonly previousOverrideId: string | null;
	readonly nextOverrideId: string | null;
	readonly previousTouchingSequence: TSequence | null;
	readonly nextTouchingSequence: TSequence | null;
};

type SequenceAdjacency = {
	readonly previousId: string | null;
	readonly nextId: string | null;
};

type IndexedSequenceRegistry = {
	readonly sequences: TSequence[];
	readonly entries: Map<string, TimelineSequenceRegistryEntry>;
	readonly indexById: ReadonlyMap<string, number>;
	readonly adjacentById: ReadonlyMap<string, SequenceAdjacency>;
	readonly touchingAdjacentById: ReadonlyMap<string, SequenceAdjacency>;
	readonly normalTrackClipIds: ReadonlySet<string>;
};

const indexedRegistries = new WeakMap<
	SequenceRegistry,
	IndexedSequenceRegistry
>();
const subscribeToNoRegistry = () => () => undefined;

const updateRegistryEntries = ({
	index,
	previousEntries,
	sequenceIds,
}: {
	index: IndexedSequenceRegistry;
	previousEntries: ReadonlyMap<string, TimelineSequenceRegistryEntry> | null;
	sequenceIds: Iterable<string>;
}) => {
	for (const sequenceId of sequenceIds) {
		const sequence = index.sequences[index.indexById.get(sequenceId)!];
		const adjacent = index.adjacentById.get(sequenceId);
		const previousSequenceId = adjacent?.previousId ?? null;
		const previousOverrideId =
			previousSequenceId === null
				? null
				: (index.sequences[index.indexById.get(previousSequenceId)!].controls
						?.overrideId ?? null);
		const nextSequenceId = adjacent?.nextId ?? null;
		const nextOverrideId =
			nextSequenceId === null
				? null
				: (index.sequences[index.indexById.get(nextSequenceId)!].controls
						?.overrideId ?? null);
		const touchingAdjacent = index.touchingAdjacentById.get(sequenceId);
		const previousCandidateId = touchingAdjacent?.previousId ?? null;
		const nextCandidateId = touchingAdjacent?.nextId ?? null;
		const previousCandidate =
			previousCandidateId === null
				? null
				: index.sequences[index.indexById.get(previousCandidateId)!];
		const nextCandidate =
			nextCandidateId === null
				? null
				: index.sequences[index.indexById.get(nextCandidateId)!];
		const previousTouchingSequence =
			previousCandidate?.parent === sequence.parent &&
			Math.abs(
				previousCandidate.from + previousCandidate.duration - sequence.from,
			) < 0.000001
				? previousCandidate
				: null;
		const nextTouchingSequence =
			nextCandidate?.parent === sequence.parent &&
			Math.abs(sequence.from + sequence.duration - nextCandidate.from) <
				0.000001
				? nextCandidate
				: null;
		const previousEntry = previousEntries?.get(sequenceId);
		index.entries.set(
			sequenceId,
			previousEntry?.sequence === sequence &&
				previousEntry.previousOverrideId === previousOverrideId &&
				previousEntry.nextOverrideId === nextOverrideId &&
				previousEntry.previousTouchingSequence === previousTouchingSequence &&
				previousEntry.nextTouchingSequence === nextTouchingSequence
				? previousEntry
				: {
						sequence,
						previousOverrideId,
						nextOverrideId,
						previousTouchingSequence,
						nextTouchingSequence,
					},
		);
	}
};

export const useTimelineSequenceRegistry = (sequenceId: string) => {
	const registry = useContext(Internals.SequenceRegistryContext);
	const getSnapshot = useCallback(() => {
		if (registry === null) {
			return null;
		}

		const sequences = registry.getSnapshot();
		const previous = indexedRegistries.get(registry);
		if (previous?.sequences === sequences) {
			return previous.entries.get(sequenceId) ?? null;
		}

		// A trim changes registration objects but normally leaves sibling order and
		// track membership intact. Keep the structural index and update only entries
		// that can observe a changed sequence, including their touching neighbors.
		if (previous && previous.sequences.length === sequences.length) {
			let canReuseIndex = true;
			const changed = new Set<string>();
			for (let i = 0; i < sequences.length; i++) {
				const sequence = sequences[i];
				const old = previous.sequences[i];
				if (old === sequence) {
					continue;
				}

				if (
					sequence.id !== old.id ||
					sequence.parent !== old.parent ||
					sequence.timelineOrder !== old.timelineOrder ||
					sequence.controls?.componentIdentity !==
						old.controls?.componentIdentity ||
					sequence.timelineTrack?.id !== old.timelineTrack?.id ||
					sequence.timelineTrack?.role !== old.timelineTrack?.role ||
					sequence.type !== old.type ||
					sequence.showInTimeline !== old.showInTimeline ||
					sequence.duration <= 0 !== old.duration <= 0
				) {
					canReuseIndex = false;
					break;
				}

				changed.add(sequence.id);
			}

			if (canReuseIndex) {
				for (const id of changed) {
					if (!previous.normalTrackClipIds.has(id)) {
						continue;
					}

					const position = previous.indexById.get(id)!;
					const sequence = sequences[position];
					const adjacent = previous.touchingAdjacentById.get(id)!;
					// Track clips are sorted by from, with registry order breaking ties.
					// Check the new values on both sides, even when both clips changed.
					for (const [neighborId, isPrevious] of [
						[adjacent.previousId, true],
						[adjacent.nextId, false],
					] as const) {
						if (neighborId === null) {
							continue;
						}

						const neighborPosition = previous.indexById.get(neighborId)!;
						const neighbor = sequences[neighborPosition];
						const comparison =
							sequence.from - neighbor.from || position - neighborPosition;
						if (
							(isPrevious && comparison < 0) ||
							(!isPrevious && comparison > 0)
						) {
							canReuseIndex = false;
							break;
						}
					}

					if (!canReuseIndex) {
						break;
					}
				}
			}

			if (canReuseIndex) {
				const affected = new Set(changed);
				for (const id of changed) {
					for (const adjacency of [
						previous.adjacentById.get(id),
						previous.touchingAdjacentById.get(id),
					]) {
						if (adjacency && adjacency.previousId !== null) {
							affected.add(adjacency.previousId);
						}

						if (adjacency && adjacency.nextId !== null) {
							affected.add(adjacency.nextId);
						}
					}
				}

				const updatedIndex = {...previous, sequences};
				updateRegistryEntries({
					index: updatedIndex,
					previousEntries: previous.entries,
					sequenceIds: affected,
				});
				indexedRegistries.set(registry, updatedIndex);
				return updatedIndex.entries.get(sequenceId) ?? null;
			}
		}

		// Share the index across all clips, but keep registrations from different
		// preview roots isolated. Stable entries keep unrelated clips from rendering.
		const siblingsByParent = new Map<string | null, Map<string, TSequence[]>>();
		const indexById = new Map<string, number>();
		for (let i = 0; i < sequences.length; i++) {
			const sequence = sequences[i];
			indexById.set(sequence.id, i);
			const identity = sequence.controls?.componentIdentity;
			if (!identity || !isCascadingSequence(sequence)) {
				continue;
			}

			const byIdentity = siblingsByParent.get(sequence.parent) ?? new Map();
			const siblings = byIdentity.get(identity) ?? [];
			siblings.push(sequence);
			byIdentity.set(identity, siblings);
			siblingsByParent.set(sequence.parent, byIdentity);
		}

		const adjacentById = new Map<string, SequenceAdjacency>();
		for (const byIdentity of siblingsByParent.values()) {
			for (const siblings of byIdentity.values()) {
				const sorted = CanvasInternals.sortItemsByCommitOrder(
					siblings,
					(sequence) => sequence.timelineOrder,
				);
				for (let i = 0; i < sorted.length; i++) {
					adjacentById.set(sorted[i].id, {
						previousId: sorted[i - 1]?.id ?? null,
						nextId: sorted[i + 1]?.id ?? null,
					});
				}
			}
		}

		const touchingAdjacentById = new Map(adjacentById);
		const normalTrackIds = new Set(
			sequences
				.filter(
					(sequence) =>
						sequence.timelineTrack?.role === 'track' &&
						sequence.controls?.componentIdentity ===
							'dev.remotion.remotion.Track',
				)
				.map((sequence) => sequence.timelineTrack!.id),
		);
		const clipsByTrack = new Map<string, TSequence[]>();
		for (const sequence of sequences) {
			if (
				sequence.timelineTrack?.role !== 'clip' ||
				!normalTrackIds.has(sequence.timelineTrack.id) ||
				sequence.duration <= 0 ||
				(!sequence.showInTimeline && sequence.type === 'sequence')
			) {
				continue;
			}

			const clips = clipsByTrack.get(sequence.timelineTrack.id) ?? [];
			clips.push(sequence);
			clipsByTrack.set(sequence.timelineTrack.id, clips);
		}

		const normalTrackClipIds = new Set<string>();
		for (const clips of clipsByTrack.values()) {
			clips.sort((a, b) => a.from - b.from);
			for (let i = 0; i < clips.length; i++) {
				const clip = clips[i];
				normalTrackClipIds.add(clip.id);
				touchingAdjacentById.set(clip.id, {
					previousId: clips[i - 1]?.id ?? null,
					nextId: clips[i + 1]?.id ?? null,
				});
			}
		}

		const index: IndexedSequenceRegistry = {
			sequences,
			entries: new Map(),
			indexById,
			adjacentById,
			touchingAdjacentById,
			normalTrackClipIds,
		};
		updateRegistryEntries({
			index,
			previousEntries: previous?.entries ?? null,
			sequenceIds: indexById.keys(),
		});
		indexedRegistries.set(registry, index);
		return index.entries.get(sequenceId) ?? null;
	}, [registry, sequenceId]);

	return useSyncExternalStore(
		registry?.subscribe ?? subscribeToNoRegistry,
		getSnapshot,
		getSnapshot,
	);
};

export const useTimelineSequenceNaturalDuration = ({
	sequenceId,
	enabled,
}: {
	readonly sequenceId: string;
	readonly enabled: boolean;
}) => {
	const registry = useContext(Internals.SequenceRegistryContext);
	const getSnapshot = useCallback(() => {
		if (!enabled || registry === null) {
			return null;
		}

		const sequences = registry.getSnapshot();
		const sequence = sequences.find((candidate) => candidate.id === sequenceId);
		return sequence
			? getTimelineSequenceNaturalDuration({sequence, sequences})
			: null;
	}, [enabled, registry, sequenceId]);

	return useSyncExternalStore(
		enabled && registry !== null ? registry.subscribe : subscribeToNoRegistry,
		getSnapshot,
		getSnapshot,
	);
};
