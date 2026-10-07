import type {RefObject} from 'react';
import type {AnyComposition, TSequence} from 'remotion';
import {Internals} from 'remotion';

type Fiber = {
	readonly child: Fiber | null;
	readonly elementType: unknown;
	readonly memoizedProps: unknown;
	readonly sibling: Fiber | null;
	readonly type: unknown;
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

const {installationMarker} = Internals.CommitOrderInternals;

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

type CompositionAndFolderOrderItem =
	| {readonly type: 'composition'; readonly id: string}
	| {readonly type: 'folder'; readonly id: string};

const hasMarker = (candidate: unknown, marker: symbol): boolean => {
	return (
		(typeof candidate === 'function' ||
			(typeof candidate === 'object' && candidate !== null)) &&
		Reflect.get(candidate, marker) === true
	);
};

const getStringProp = (props: unknown, key: string): string | null => {
	if (typeof props !== 'object' || props === null) {
		return null;
	}

	const value = Reflect.get(props, key);
	return typeof value === 'string' ? value : null;
};

const hasFiberMarker = (fiber: Fiber, marker: symbol) =>
	hasMarker(fiber.type, marker) || hasMarker(fiber.elementType, marker);

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
			readonly order: CompositionAndFolderOrderItem[];
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
		const isSequenceManagerMarker = hasFiberMarker(
			fiber,
			Internals.CommitOrderInternals.sequenceManagerMarker,
		);
		const sequenceManagerId = isSequenceManagerMarker
			? getStringProp(fiber.memoizedProps, 'managerId')
			: currentSequenceManagerId;

		if (
			isSequenceManagerMarker &&
			sequenceManagerId !== null &&
			!sequencesByManager.has(sequenceManagerId)
		) {
			const previous = previousRegistrations?.get(sequenceManagerId) ?? null;
			const props = fiber.memoizedProps;
			const onCommit =
				typeof props === 'object' && props !== null
					? Reflect.get(props, 'onCommitSequences')
					: null;
			sequencesByManager.set(sequenceManagerId, {
				sequenceIds: createCommitSnapshotCollector(
					previous?.sequenceIds ?? null,
				),
				registration:
					registrations !== null && typeof onCommit === 'function'
						? {
								onCommit: onCommit as CommittedSequenceRegistration['onCommit'],
								sequences: createCommitSnapshotCollector(
									previous?.sequences ?? null,
								),
								previous,
							}
						: null,
			});
		}

		const isCompositionManagerMarker = hasFiberMarker(
			fiber,
			Internals.CommitOrderInternals.compositionManagerMarker,
		);
		const compositionManagerId = isCompositionManagerMarker
			? getStringProp(fiber.memoizedProps, 'managerId')
			: currentCompositionManagerId;
		if (
			isCompositionManagerMarker &&
			compositionManagerId !== null &&
			!compositionsAndFoldersByManager.has(compositionManagerId)
		) {
			const previous =
				previousCompositionRegistrations?.get(compositionManagerId) ?? null;
			const props = fiber.memoizedProps;
			const onCommit =
				typeof props === 'object' && props !== null
					? Reflect.get(props, 'onCommitRegistrations')
					: null;
			compositionsAndFoldersByManager.set(compositionManagerId, {
				order: [],
				registration:
					compositionRegistrations !== null && typeof onCommit === 'function'
						? {
								onCommit:
									onCommit as CommittedCompositionRegistration['onCommit'],
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

		const isSequenceMarker = hasFiberMarker(
			fiber,
			Internals.CommitOrderInternals.sequenceMarker,
		);
		if (isSequenceMarker) {
			const props = fiber.memoizedProps;
			if (sequenceManagerId !== null) {
				const sequenceId = getStringProp(fiber.memoizedProps, 'sequenceId');
				if (sequenceId !== null) {
					const manager = sequencesByManager.get(sequenceManagerId);
					manager?.sequenceIds.push(sequenceId);
					const registration =
						typeof props === 'object' && props !== null
							? (Reflect.get(props, 'registration') as
									| TSequence
									| null
									| undefined)
							: null;
					if (registration) {
						manager?.registration?.sequences.push(registration);
					}
				}
			}
		}

		if (
			hasFiberMarker(fiber, Internals.CommitOrderInternals.compositionMarker) &&
			compositionManagerId !== null
		) {
			const id = getStringProp(fiber.memoizedProps, 'compositionId');
			if (id !== null) {
				const manager =
					compositionsAndFoldersByManager.get(compositionManagerId);
				manager?.order.push({type: 'composition', id});
				manager?.registration?.orderIds.push(`composition:${id}`);
				const registration =
					typeof fiber.memoizedProps === 'object' &&
					fiber.memoizedProps !== null
						? (Reflect.get(
								fiber.memoizedProps,
								'registration',
							) as AnyComposition | null)
						: null;
				if (registration) {
					manager?.registration?.compositions.push(registration);
				}
			}
		}

		if (
			hasFiberMarker(fiber, Internals.CommitOrderInternals.folderMarker) &&
			compositionManagerId !== null
		) {
			const id = getStringProp(fiber.memoizedProps, 'folderId');
			if (id !== null) {
				const manager =
					compositionsAndFoldersByManager.get(compositionManagerId);
				manager?.order.push({type: 'folder', id});
				manager?.registration?.orderIds.push(`folder:${id}`);
				const registration =
					typeof fiber.memoizedProps === 'object' &&
					fiber.memoizedProps !== null
						? (Reflect.get(
								fiber.memoizedProps,
								'registration',
							) as FolderRegistration | null)
						: null;
				if (registration) {
					manager?.registration?.folders.push(registration);
				}
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
				if (isSequenceMarker) {
					const props = fiber.memoizedProps;
					const outlineRef =
						typeof props === 'object' && props !== null
							? (Reflect.get(props, 'outlineChildrenRef') as
									| RefObject<Element | null>
									| null
									| undefined)
							: null;
					if (outlineRef) {
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

	const compositionManagers = [...compositionsAndFoldersByManager].map(
		([managerId, manager]) => {
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

			return {managerId, compositionAndFolderOrder: manager.order};
		},
	);

	return {
		outlineCount: outlineNodesByRef.size,
		sequenceManagers,
		compositionManagers,
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
			hook[Internals.CommitOrderInternals.failureMarker] = true;
			order = null;
			try {
				target.dispatchEvent(
					new CustomEvent(
						Internals.CommitOrderInternals.registrationErrorEventName,
					),
				);
			} catch {
				// Notification failure must not prevent the previous hook from running.
			}
		}

		if (
			order !== null &&
			(order.outlineCount > 0 ||
				order.sequenceManagers.length > 0 ||
				order.compositionManagers.length > 0)
		) {
			try {
				target.dispatchEvent(
					new CustomEvent(Internals.CommitOrderInternals.eventName, {
						detail: {
							sequenceManagers: order.sequenceManagers,
							compositionManagers: order.compositionManagers,
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
