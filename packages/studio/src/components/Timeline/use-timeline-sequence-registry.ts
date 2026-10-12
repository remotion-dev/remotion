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
	readonly previousSequenceId: string | null;
	readonly previousOverrideId: string | null;
	readonly nextOverrideId: string | null;
};

const indexedRegistries = new WeakMap<
	SequenceRegistry,
	{
		readonly sequences: TSequence[];
		readonly entries: ReadonlyMap<string, TimelineSequenceRegistryEntry>;
	}
>();
const subscribeToNoRegistry = () => () => undefined;

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

		// Share the index across all clips, but keep registrations from different
		// preview roots isolated. Stable entries keep unrelated clips from rendering.
		const siblingsByParent = new Map<string | null, Map<string, TSequence[]>>();
		for (const sequence of sequences) {
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

		const adjacentById = new Map<
			string,
			{readonly previous: TSequence | null; readonly next: TSequence | null}
		>();
		for (const byIdentity of siblingsByParent.values()) {
			for (const siblings of byIdentity.values()) {
				const sorted = CanvasInternals.sortItemsByCommitOrder(
					siblings,
					(sequence) => sequence.timelineOrder,
				);
				for (let i = 0; i < sorted.length; i++) {
					adjacentById.set(sorted[i].id, {
						previous: sorted[i - 1] ?? null,
						next: sorted[i + 1] ?? null,
					});
				}
			}
		}

		const entries = new Map<string, TimelineSequenceRegistryEntry>();
		for (const sequence of sequences) {
			const adjacent = adjacentById.get(sequence.id);
			const previousSequenceId = adjacent?.previous?.id ?? null;
			const previousOverrideId =
				adjacent?.previous?.controls?.overrideId ?? null;
			const nextOverrideId = adjacent?.next?.controls?.overrideId ?? null;
			const previousEntry = previous?.entries.get(sequence.id);
			entries.set(
				sequence.id,
				previousEntry?.sequence === sequence &&
					previousEntry.previousSequenceId === previousSequenceId &&
					previousEntry.previousOverrideId === previousOverrideId &&
					previousEntry.nextOverrideId === nextOverrideId
					? previousEntry
					: {sequence, previousSequenceId, previousOverrideId, nextOverrideId},
			);
		}

		indexedRegistries.set(registry, {sequences, entries});
		return entries.get(sequenceId) ?? null;
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
