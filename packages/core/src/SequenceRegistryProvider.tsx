import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import {
	COMMIT_ORDER_EVENT,
	COMMIT_REGISTRATION_ERROR_EVENT,
	isCommitRegistrationObserverInstalled,
	withCommittedMetadata,
	type CommittedMetadata,
	type CommitOrderEventDetail,
	type CommittedSequenceSnapshot,
} from './committed-metadata.js';
import type {TSequence} from './CompositionManager.js';
import {
	areRegistryEntriesEqual,
	createRegistryStore,
	reconcileRegistryEntries,
} from './registry-store.js';
import {
	SequenceManagerRefContext,
	SequenceManagerActionsContext,
	SequenceRegistryScopeContext,
	SequenceRegistryContext,
	SequenceCommitRegistrationContext,
	SequenceRegistrationContext,
	type SequenceManagerRef,
	type SequenceManagerActions,
} from './sequence-registry-context.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
const useIsomorphicLayoutEffect =
	typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
const SequenceManagerRefProvider = withCommittedMetadata(
	SequenceManagerRefContext.Provider,
);

export const SequenceRegistryProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {isStudio} = useRemotionEnvironment();
	const sequenceRegistrationEnabled = useContext(SequenceRegistrationContext);
	const shouldObserveCommits = isStudio || sequenceRegistrationEnabled;
	const [sequenceManagerId] = useState(() => String(Math.random()));
	const [commitRegistrationEnabled, setCommitRegistrationEnabled] = useState(
		() => shouldObserveCommits && isCommitRegistrationObserverInstalled(),
	);
	const observedCommitRef = useRef(false);
	const rootObservationFailedRef = useRef(false);
	const committedRegistrationIdsRef = useRef<ReadonlySet<string>>(new Set());
	const committedDescriptorsRef = useRef<ReadonlyMap<string, TSequence>>(
		new Map(),
	);
	const pendingCommittedSequencesRef = useRef(
		new Map<string, CommittedSequenceSnapshot>(),
	);
	const committedScopesRef = useRef(
		new Map<string, CommittedSequenceSnapshot>([
			[sequenceManagerId, {sequences: [], sequenceIds: []}],
		]),
	);
	const registrationObserverFailedRef = useRef(false);
	const registrationUnmountedRef = useRef(false);
	const committedOrderRef = useRef<ReadonlyMap<string, number> | null>(null);
	const committedOrderIdsRef = useRef<readonly string[] | null>(null);
	const [registry] = useState(() => createRegistryStore<TSequence[]>([]));
	const setSequences = registry.setSnapshot;
	const sequencesRef = useMemo<SequenceManagerRef>(
		() => ({
			get current() {
				return registry.getSnapshot();
			},
		}),
		[registry],
	);
	const onCommitSequences = useCallback(
		(
			scopeId: string,
			snapshot: readonly TSequence[],
			sequenceIds: readonly string[],
		) => {
			if (
				registrationObserverFailedRef.current ||
				registrationUnmountedRef.current
			) {
				return;
			}

			const previousSnapshot =
				pendingCommittedSequencesRef.current.get(scopeId) ??
				committedScopesRef.current.get(scopeId);
			if (
				previousSnapshot?.sequences === snapshot &&
				previousSnapshot.sequenceIds === sequenceIds
			) {
				return;
			}

			const alreadyPending = pendingCommittedSequencesRef.current.size > 0;
			pendingCommittedSequencesRef.current.set(scopeId, {
				sequences: snapshot,
				sequenceIds,
			});
			if (alreadyPending) {
				return;
			}

			// Publish after React finishes committing, and coalesce successive snapshots.
			queueMicrotask(() => {
				const pending = pendingCommittedSequencesRef.current;
				pendingCommittedSequencesRef.current = new Map();
				if (
					pending.size === 0 ||
					registrationObserverFailedRef.current ||
					registrationUnmountedRef.current
				) {
					return;
				}

				const previousIds = committedRegistrationIdsRef.current;
				const previousDescriptors = committedDescriptorsRef.current;
				for (const [id, scope] of pending) {
					if (id !== sequenceManagerId && scope.sequenceIds.length === 0) {
						committedScopesRef.current.delete(id);
					} else {
						committedScopesRef.current.set(id, scope);
					}
				}

				// A forwarded renderer owns only its fragment. Publishing or removing it
				// must never replace the descriptors committed by the other roots.
				const scopes = [...committedScopesRef.current.values()];
				const sequences = scopes.flatMap((scope) => scope.sequences);
				const ids = scopes.flatMap((scope) => scope.sequenceIds);
				committedDescriptorsRef.current = new Map(
					sequences.map((sequence) => [sequence.id, sequence]),
				);
				const nextIds = new Set(sequences.map((sequence) => sequence.id));
				const order = new Map(ids.map((id, index) => [id, index]));
				committedOrderIdsRef.current = ids;
				committedOrderRef.current = order;
				committedRegistrationIdsRef.current = nextIds;
				setSequences((current) =>
					reconcileRegistryEntries({
						current,
						entries: sequences,
						previousDescriptors,
						previousKeys: previousIds,
						nextKeys: nextIds,
						getKey: (sequence) => sequence.id,
						order,
						orderProperty: 'timelineOrder',
					}),
				);
			});
		},
		[sequenceManagerId, setSequences],
	);
	const onCommitRootSequences = useCallback(
		(sequences: readonly TSequence[], sequenceIds: readonly string[]) => {
			if (!rootObservationFailedRef.current) {
				observedCommitRef.current = true;
				onCommitSequences(sequenceManagerId, sequences, sequenceIds);
			}
		},
		[onCommitSequences, sequenceManagerId],
	);
	const registryScope = useMemo(
		() => ({
			onCommitSequences,
			commitRegistrationRequested: shouldObserveCommits,
		}),
		[onCommitSequences, shouldObserveCommits],
	);

	useIsomorphicLayoutEffect(() => {
		if (!shouldObserveCommits) {
			return;
		}

		let unmounted = false;
		registrationUnmountedRef.current = false;
		const onRegistrationError = () => {
			if (registrationObserverFailedRef.current) {
				return;
			}

			registrationObserverFailedRef.current = true;
			pendingCommittedSequencesRef.current.clear();
			queueMicrotask(() => {
				if (registrationUnmountedRef.current) {
					return;
				}

				const previousIds = committedRegistrationIdsRef.current;
				committedRegistrationIdsRef.current = new Set();
				committedScopesRef.current.clear();
				setSequences((current) =>
					current.filter((sequence) => !previousIds.has(sequence.id)),
				);
				setCommitRegistrationEnabled(false);
			});
		};

		const onCommitOrder = (event: Event) => {
			const {detail} = event as CustomEvent<CommitOrderEventDetail>;
			const managerOrder = detail.sequenceManagers.find(
				(item) => item.managerId === sequenceManagerId,
			);
			if (!managerOrder) {
				return;
			}

			if (commitRegistrationEnabled) {
				return;
			}

			const previousOrder = committedOrderIdsRef.current;
			if (
				previousOrder === managerOrder.sequenceIds ||
				(previousOrder !== null &&
					previousOrder.length === managerOrder.sequenceIds.length &&
					previousOrder.every(
						(sequenceId, index) =>
							sequenceId === managerOrder.sequenceIds[index],
					))
			) {
				return;
			}

			const order = new Map(
				managerOrder.sequenceIds.map((sequenceId, index) => [
					sequenceId,
					index,
				]),
			);
			committedOrderIdsRef.current = managerOrder.sequenceIds;
			committedOrderRef.current = order;
			queueMicrotask(() => {
				if (unmounted) {
					return;
				}

				setSequences((currentSequences) => {
					let changed = false;
					const nextSequences = currentSequences.map((sequence) => {
						const timelineOrder = order.get(sequence.id) ?? null;
						if (sequence.timelineOrder === timelineOrder) {
							return sequence;
						}

						changed = true;
						return {...sequence, timelineOrder};
					});

					return changed ? nextSequences : currentSequences;
				});
			});
		};

		window.addEventListener(COMMIT_ORDER_EVENT, onCommitOrder);
		window.addEventListener(
			COMMIT_REGISTRATION_ERROR_EVENT,
			onRegistrationError,
		);
		if (commitRegistrationEnabled) {
			// React invokes its commit hook after layout effects. Installation alone
			// does not prove this renderer connected to the hook during initialization.
			queueMicrotask(() => {
				if (
					unmounted ||
					observedCommitRef.current ||
					registrationObserverFailedRef.current
				) {
					return;
				}

				rootObservationFailedRef.current = true;
				onCommitSequences(sequenceManagerId, [], []);
				setCommitRegistrationEnabled(false);
			});
		}

		return () => {
			unmounted = true;
			registrationUnmountedRef.current = true;
			// Effect replay must not discard a snapshot already collected by React.
			window.removeEventListener(COMMIT_ORDER_EVENT, onCommitOrder);
			window.removeEventListener(
				COMMIT_REGISTRATION_ERROR_EVENT,
				onRegistrationError,
			);
		};
	}, [
		shouldObserveCommits,
		sequenceManagerId,
		setSequences,
		commitRegistrationEnabled,
		onCommitSequences,
	]);

	const registerSequence = useCallback(
		(seq: TSequence) => {
			setSequences((seqs) => {
				return [
					...seqs,
					{
						...seq,
						timelineOrder: committedOrderRef.current?.get(seq.id) ?? null,
					},
				];
			});
		},
		[setSequences],
	);
	const updateSequence = useCallback(
		(seq: TSequence) => {
			setSequences((seqs) => {
				const index = seqs.findIndex((item) => item.id === seq.id);
				if (index === -1) {
					return seqs;
				}

				const updatedSequence = {
					...seq,
					timelineOrder: committedOrderRef.current?.get(seq.id) ?? null,
				};
				if (areRegistryEntriesEqual(seqs[index], updatedSequence)) {
					return seqs;
				}

				const next = [...seqs];
				next[index] = updatedSequence;
				return next;
			});
		},
		[setSequences],
	);

	const unregisterSequence = useCallback(
		(seq: string) => {
			setSequences((seqs) => seqs.filter((s) => s.id !== seq));
		},
		[setSequences],
	);

	const actions = useMemo<SequenceManagerActions>(() => {
		return {
			registerSequence,
			updateSequence,
			unregisterSequence,
		};
	}, [registerSequence, unregisterSequence, updateSequence]);
	const metadata = useMemo<CommittedMetadata | null>(
		() =>
			shouldObserveCommits
				? {
						type: 'sequence-manager',
						id: sequenceManagerId,
						onCommit: commitRegistrationEnabled ? onCommitRootSequences : null,
					}
				: null,
		[
			commitRegistrationEnabled,
			onCommitRootSequences,
			sequenceManagerId,
			shouldObserveCommits,
		],
	);
	return (
		<SequenceManagerRefProvider
			value={sequencesRef}
			_remotionCommitMetadata={metadata}
		>
			<SequenceRegistryScopeContext.Provider value={registryScope}>
				<SequenceManagerActionsContext.Provider value={actions}>
					<SequenceRegistryContext.Provider value={registry}>
						<SequenceCommitRegistrationContext.Provider
							value={commitRegistrationEnabled}
						>
							{children}
						</SequenceCommitRegistrationContext.Provider>
					</SequenceRegistryContext.Provider>
				</SequenceManagerActionsContext.Provider>
			</SequenceRegistryScopeContext.Provider>
		</SequenceManagerRefProvider>
	);
};
