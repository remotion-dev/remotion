import type {RefObject} from 'react';
import type {AnyComposition, TSequence} from 'remotion';
import {Internals} from 'remotion';

type Fiber = {
	readonly child: Fiber | null;
	readonly memoizedProps: unknown;
	readonly sibling: Fiber | null;
	readonly tag: number | null;
	readonly stateNode: unknown;
	readonly memoizedState: unknown;
};

type FiberRoot = {
	readonly current: Fiber;
};

type DevToolsHook = {
	readonly supportsFiber?: boolean;
	onCommitFiberRoot?: (
		this: DevToolsHook,
		rendererId: number,
		root: FiberRoot,
		priorityLevel: unknown,
		didError: boolean,
	) => unknown;
	[key: symbol]: unknown;
};

type HookTarget = Window &
	typeof globalThis & {
		__REACT_DEVTOOLS_GLOBAL_HOOK__?: DevToolsHook;
	};

const {installationMarker} = Internals.CommittedMetadataInternals;

type CommittedSequenceRegistration = {
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

type CommittedCompositionRegistration = {
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

export const collectCommitOrderFromFiber = (
	root: FiberRoot,
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
	const outlineNodesByRef = new Map<
		RefObject<Element | null>,
		(Element | Text)[]
	>();
	let outlineCollectionFailed = false;
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
		fiber: Fiber,
		currentSequenceManagerId: string | null,
		currentCompositionManagerId: string | null,
		outlineCollectors: readonly (Element | Text)[][] | null,
	) => {
		const metadata = Internals.CommittedMetadataInternals.getMetadata(
			fiber.memoizedProps,
		);
		const sequenceManagerId =
			metadata?.type === 'sequence-manager'
				? metadata.id
				: currentSequenceManagerId;
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

		const compositionManagerId =
			metadata?.type === 'composition-manager'
				? metadata.id
				: currentCompositionManagerId;
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

		let childOutlineCollectors = outlineCollectors;
		if (outlineCollectionFailed) {
			childOutlineCollectors = null;
		} else {
			try {
				// A portal ends the current DOM group, but can contain new sequences.
				// Hidden Offscreen trees must not contribute geometry, including new groups.
				const {tag} = fiber;
				const skipOutline =
					outlineCollectors === null ||
					(tag === 22 && fiber.memoizedState !== null);
				childOutlineCollectors = skipOutline
					? null
					: tag === 4
						? []
						: outlineCollectors;
				if (metadata?.type === 'sequence') {
					const outlineRef = metadata.outlineChildrenRef;
					if (outlineRef !== null) {
						const nodes: (Element | Text)[] = [];
						outlineNodesByRef.set(outlineRef, nodes);
						if (childOutlineCollectors !== null) {
							childOutlineCollectors = [...childOutlineCollectors, nodes];
						}
					}
				}

				if (
					childOutlineCollectors !== null &&
					childOutlineCollectors.length > 0 &&
					(tag === 5 || tag === 6) &&
					fiber.stateNode !== null
				) {
					for (const collector of childOutlineCollectors) {
						collector.push(fiber.stateNode as Element | Text);
					}

					// Only first-level DOM nodes belong to this group. Keep traversing
					// for sequence order and for new groups nested inside this element.
					childOutlineCollectors = [];
				}
			} catch {
				// Discard incomplete geometry for this commit without losing registrations.
				// The next commit retries outline collection with a fresh map.
				outlineCollectionFailed = true;
				outlineNodesByRef.clear();
				childOutlineCollectors = null;
			}
		}

		let {child} = fiber;
		while (child !== null) {
			visit(
				child,
				sequenceManagerId,
				compositionManagerId,
				childOutlineCollectors,
			);
			child = child.sibling;
		}
	};

	visit(root.current, null, null, []);
	for (const [ref, nodes] of outlineNodesByRef) {
		try {
			Internals.SequenceOutlineInternals.setNodes(ref, nodes);
		} catch {
			// A failed outline publication is retried on the next commit.
		}
	}

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
		outlineCount: outlineNodesByRef.size,
		sequenceManagers,
	};
};

export const installFiberCommitOrderObserver = (
	target: HookTarget,
): boolean => {
	const hook = target.__REACT_DEVTOOLS_GLOBAL_HOOK__;
	if (!hook?.supportsFiber) {
		return false;
	}

	if (hook[installationMarker] === true) {
		return true;
	}

	const previousOnCommitFiberRoot = hook.onCommitFiberRoot;
	const registrationsByRoot = new WeakMap<
		FiberRoot,
		Map<string, CommittedSequenceRegistration>
	>();
	const compositionRegistrationsByRoot = new WeakMap<
		FiberRoot,
		Map<string, CommittedCompositionRegistration>
	>();

	hook.onCommitFiberRoot = function (...args) {
		let order: ReturnType<typeof collectCommitOrderFromFiber> | null = null;
		try {
			const [, root] = args;
			const registrations = new Map<string, CommittedSequenceRegistration>();
			const previousRegistrations = registrationsByRoot.get(root);
			const compositionRegistrations = new Map<
				string,
				CommittedCompositionRegistration
			>();
			const previousCompositionRegistrations =
				compositionRegistrationsByRoot.get(root);
			order = collectCommitOrderFromFiber(
				root,
				registrations,
				previousRegistrations ?? null,
				{
					registrations: compositionRegistrations,
					previous: previousCompositionRegistrations ?? null,
				},
			);
			registrationsByRoot.set(root, registrations);
			compositionRegistrationsByRoot.set(root, compositionRegistrations);
			for (const [managerId, registration] of registrations) {
				if (registration !== previousRegistrations?.get(managerId)) {
					registration.onCommit(
						registration.sequences,
						registration.sequenceIds,
					);
				}
			}

			if (previousRegistrations) {
				for (const [managerId, registration] of previousRegistrations) {
					if (!registrations.has(managerId)) {
						registration.onCommit([], []);
					}
				}
			}

			for (const [managerId, registration] of compositionRegistrations) {
				if (registration !== previousCompositionRegistrations?.get(managerId)) {
					registration.onCommit(registration.snapshot);
				}
			}

			if (previousCompositionRegistrations) {
				for (const [
					managerId,
					registration,
				] of previousCompositionRegistrations) {
					if (!compositionRegistrations.has(managerId)) {
						registration.onCommit({
							compositions: [],
							folders: [],
							orderIds: [],
						});
					}
				}
			}
		} catch {
			// A registration collection or delivery failure permanently selects effect
			// fallback for this hook. Retrying registration would risk repeated teardown.
			hook[Internals.CommittedMetadataInternals.failureMarker] = true;
			order = null;
			try {
				target.dispatchEvent(
					new CustomEvent(
						Internals.CommittedMetadataInternals.registrationErrorEventName,
					),
				);
			} catch {
				// Notification failure must not prevent the previous hook from running.
			}
		}

		if (
			order !== null &&
			(order.outlineCount > 0 || order.sequenceManagers.length > 0)
		) {
			try {
				target.dispatchEvent(
					new CustomEvent(Internals.CommittedMetadataInternals.eventName, {
						detail: {
							sequenceManagers: order.sequenceManagers,
						},
					}),
				);
			} catch {
				// Order notifications are independent of registration and retry next commit.
			}
		}

		return previousOnCommitFiberRoot?.apply(this, args);
	};

	hook[installationMarker] = true;
	return true;
};
