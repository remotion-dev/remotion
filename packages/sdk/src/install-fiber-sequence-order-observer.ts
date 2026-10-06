import type {RefObject} from 'react';
import type {TSequence} from 'remotion';
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
) => {
	const outlineNodesByRef = new Map<
		RefObject<Element | null>,
		(Element | Text)[]
	>();
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
		CompositionAndFolderOrderItem[]
	>();

	const visit = (
		fiber: Fiber,
		currentSequenceManagerId: string | null,
		currentCompositionManagerId: string | null,
		outlineCollectors: readonly (Element | Text)[][] | null,
	) => {
		// A portal ends the current DOM group, but can contain new sequences:
		// Studio itself renders the composition through a portal. Hidden
		// Offscreen trees must not contribute geometry, including new groups.
		const skipOutline =
			outlineCollectors === null ||
			(fiber.tag === 22 && fiber.memoizedState !== null);
		let childOutlineCollectors = skipOutline
			? null
			: fiber.tag === 4
				? []
				: outlineCollectors;
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
			compositionsAndFoldersByManager.set(compositionManagerId, []);
		}

		if (hasFiberMarker(fiber, Internals.CommitOrderInternals.sequenceMarker)) {
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
			hasFiberMarker(fiber, Internals.CommitOrderInternals.compositionMarker) &&
			compositionManagerId !== null
		) {
			const id = getStringProp(fiber.memoizedProps, 'compositionId');
			if (id !== null) {
				compositionsAndFoldersByManager
					.get(compositionManagerId)
					?.push({type: 'composition', id});
			}
		}

		if (
			hasFiberMarker(fiber, Internals.CommitOrderInternals.folderMarker) &&
			compositionManagerId !== null
		) {
			const id = getStringProp(fiber.memoizedProps, 'folderId');
			if (id !== null) {
				compositionsAndFoldersByManager
					.get(compositionManagerId)
					?.push({type: 'folder', id});
			}
		}

		if (
			childOutlineCollectors !== null &&
			childOutlineCollectors.length > 0 &&
			(fiber.tag === 5 || fiber.tag === 6) &&
			fiber.stateNode !== null
		) {
			for (const collector of childOutlineCollectors) {
				collector.push(fiber.stateNode as Element | Text);
			}

			// Only first-level DOM nodes belong to this group. Keep traversing
			// for sequence order and for new groups nested inside this element.
			childOutlineCollectors = [];
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
		Internals.SequenceOutlineInternals.setNodes(ref, nodes);
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

	return {
		outlineCount: outlineNodesByRef.size,
		sequenceManagers,
		compositionManagers: [...compositionsAndFoldersByManager].map(
			([managerId, compositionAndFolderOrder]) => ({
				managerId,
				compositionAndFolderOrder,
			}),
		),
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

	hook.onCommitFiberRoot = function (...args) {
		try {
			const [, root] = args;
			const registrations = new Map<string, CommittedSequenceRegistration>();
			const previousRegistrations = registrationsByRoot.get(root);
			const order = collectCommitOrderFromFiber(
				root,
				registrations,
				previousRegistrations ?? null,
			);
			registrationsByRoot.set(root, registrations);
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

			if (
				order.outlineCount > 0 ||
				order.sequenceManagers.length > 0 ||
				order.compositionManagers.length > 0
			) {
				target.dispatchEvent(
					new CustomEvent(Internals.CommitOrderInternals.eventName, {
						detail: {
							sequenceManagers: order.sequenceManagers,
							compositionManagers: order.compositionManagers,
						},
					}),
				);
			}
		} catch {
			// Fiber is private React API. An unsupported shape must not break the host.
			hook[Internals.CommitOrderInternals.failureMarker] = true;
			target.dispatchEvent(
				new CustomEvent(
					Internals.CommitOrderInternals.registrationErrorEventName,
				),
			);
		}

		return previousOnCommitFiberRoot?.apply(this, args);
	};

	hook[installationMarker] = true;
	return true;
};
