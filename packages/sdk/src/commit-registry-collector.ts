import type {AnyComposition, TSequence} from 'remotion';
import type {CommittedMetadata} from './react-commit-types';
export type CommittedSequenceRegistration = {
	readonly onCommit: (
		sequences: readonly TSequence[],
		sequenceIds: readonly string[],
	) => void;
	readonly sequences: readonly TSequence[];
	readonly sequenceIds: readonly string[];
};

type FolderRegistration = {
	readonly name: string;
	readonly parent: string | null;
	readonly order: number | null;
	readonly stack: string | null;
};

type CommittedCompositionSnapshot = {
	readonly compositions: readonly AnyComposition[];
	readonly folders: readonly FolderRegistration[];
	readonly orderIds: readonly string[];
};

export type CommittedCompositionRegistration = {
	readonly onCommit: (snapshot: CommittedCompositionSnapshot) => void;
	readonly snapshot: CommittedCompositionSnapshot;
};

// Compare while traversing, and allocate only after the first changed entry.
const createCommitSnapshotCollector = <T>(previous: readonly T[] | null) => {
	let count = 0;
	let values: T[] | null = null;
	return {
		push: (value: T) => {
			if (values !== null) {
				values.push(value);
			} else if (previous?.[count] !== value) {
				values = previous?.slice(0, count) ?? [];
				values.push(value);
			}

			count++;
		},
		getSnapshot: (): readonly T[] =>
			values ??
			(previous?.length === count
				? previous
				: (previous?.slice(0, count) ?? [])),
	};
};

export const createCommitRegistryCollector = (
	registrations: Map<string, CommittedSequenceRegistration> | null = null,
	previousRegistrations: ReadonlyMap<
		string,
		CommittedSequenceRegistration
	> | null = null,
	compositionRegistry: {
		readonly registrations: Map<string, CommittedCompositionRegistration>;
		readonly previous: ReadonlyMap<
			string,
			CommittedCompositionRegistration
		> | null;
	} | null = null,
) => {
	const compositionRegistrations = compositionRegistry?.registrations ?? null;
	const previousCompositionRegistrations =
		compositionRegistry?.previous ?? null;
	const sequencesByManager = new Map<
		string,
		{
			readonly sequenceIds: ReturnType<
				typeof createCommitSnapshotCollector<string>
			>;
			readonly registration: {
				readonly onCommit: CommittedSequenceRegistration['onCommit'];
				readonly sequences: ReturnType<
					typeof createCommitSnapshotCollector<TSequence>
				>;
				readonly previous: CommittedSequenceRegistration | null;
			} | null;
		}
	>();
	const compositionsAndFoldersByManager = new Map<
		string,
		{
			readonly registration: {
				readonly onCommit: CommittedCompositionRegistration['onCommit'];
				readonly previous: CommittedCompositionRegistration | null;
				readonly compositions: ReturnType<
					typeof createCommitSnapshotCollector<AnyComposition>
				>;
				readonly folders: ReturnType<
					typeof createCommitSnapshotCollector<FolderRegistration>
				>;
				readonly orderIds: ReturnType<
					typeof createCommitSnapshotCollector<string>
				>;
			} | null;
		}
	>();

	const visit = (
		metadata: CommittedMetadata | null,
		sequenceManagerId: string | null,
		compositionManagerId: string | null,
	) => {
		if (
			metadata?.type === 'sequence-manager' &&
			!sequencesByManager.has(metadata.id)
		) {
			const previous = previousRegistrations?.get(metadata.id) ?? null;
			const {onCommit} = metadata;
			sequencesByManager.set(metadata.id, {
				sequenceIds: createCommitSnapshotCollector(
					previous?.sequenceIds ?? null,
				),
				registration:
					registrations !== null && onCommit !== null
						? {
								onCommit,
								sequences: createCommitSnapshotCollector(
									previous?.sequences ?? null,
								),
								previous,
							}
						: null,
			});
		}

		if (
			metadata?.type === 'composition-manager' &&
			!compositionsAndFoldersByManager.has(metadata.id)
		) {
			const previous =
				previousCompositionRegistrations?.get(metadata.id) ?? null;
			const {onCommit} = metadata;
			compositionsAndFoldersByManager.set(metadata.id, {
				registration:
					compositionRegistrations !== null && onCommit !== null
						? {
								onCommit,
								previous,
								compositions: createCommitSnapshotCollector(
									previous?.snapshot.compositions ?? null,
								),
								folders: createCommitSnapshotCollector(
									previous?.snapshot.folders ?? null,
								),
								orderIds: createCommitSnapshotCollector(
									previous?.snapshot.orderIds ?? null,
								),
							}
						: null,
			});
		}

		if (metadata?.type === 'sequence' && sequenceManagerId !== null) {
			const manager = sequencesByManager.get(sequenceManagerId);
			manager?.sequenceIds.push(metadata.id);
			if (metadata.value !== null) {
				manager?.registration?.sequences.push(metadata.value);
			}
		}

		if (
			(metadata?.type === 'composition' || metadata?.type === 'folder') &&
			compositionManagerId !== null
		) {
			const manager = compositionsAndFoldersByManager.get(compositionManagerId);
			manager?.registration?.orderIds.push(`${metadata.type}:${metadata.id}`);
			if (metadata.type === 'composition') {
				manager?.registration?.compositions.push(metadata.value);
			} else {
				manager?.registration?.folders.push(metadata.value);
			}
		}
	};

	return {
		visit,
		getSnapshot: () => {
			const sequenceManagers = [...sequencesByManager].map(
				([managerId, manager]) => {
					const sequenceIds = manager.sequenceIds.getSnapshot();
					const {registration} = manager;
					if (registration !== null && registrations !== null) {
						const sequences = registration.sequences.getSnapshot();
						const {previous} = registration;
						registrations.set(
							managerId,
							previous !== null &&
								previous.onCommit === registration.onCommit &&
								previous.sequences === sequences &&
								previous.sequenceIds === sequenceIds
								? previous
								: {onCommit: registration.onCommit, sequences, sequenceIds},
						);
					}

					return {managerId, sequenceIds};
				},
			);

			for (const [managerId, manager] of compositionsAndFoldersByManager) {
				const {registration} = manager;
				if (registration !== null && compositionRegistrations !== null) {
					const compositions = registration.compositions.getSnapshot();
					const folders = registration.folders.getSnapshot();
					const orderIds = registration.orderIds.getSnapshot();
					const {previous} = registration;
					compositionRegistrations.set(
						managerId,
						previous !== null &&
							previous.onCommit === registration.onCommit &&
							previous.snapshot.compositions === compositions &&
							previous.snapshot.folders === folders &&
							previous.snapshot.orderIds === orderIds
							? previous
							: {
									onCommit: registration.onCommit,
									snapshot: {compositions, folders, orderIds},
								},
					);
				}
			}

			return {
				sequenceManagers,
			};
		},
	};
};
