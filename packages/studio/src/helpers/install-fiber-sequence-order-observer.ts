import type {RefObject} from 'react';
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

const installationMarker = Symbol.for(
	'remotion.commit-order-observer-installed',
);

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

export const collectCommitOrderFromFiber = (root: FiberRoot) => {
	const outlineNodesByRef = new Map<
		RefObject<Element | null>,
		(Element | Text)[]
	>();
	const sequencesByManager = new Map<string, string[]>();
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
			sequencesByManager.set(sequenceManagerId, []);
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

		if (
			hasFiberMarker(fiber, Internals.CommitOrderInternals.sequenceMarker) &&
			sequenceManagerId !== null
		) {
			const sequenceId = getStringProp(fiber.memoizedProps, 'sequenceId');
			if (sequenceId !== null) {
				sequencesByManager.get(sequenceManagerId)?.push(sequenceId);
			}

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

	return {
		sequenceManagers: [...sequencesByManager].map(
			([managerId, sequenceIds]) => ({managerId, sequenceIds}),
		),
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
	hook.onCommitFiberRoot = function (...args) {
		try {
			const [, root] = args;
			const order = collectCommitOrderFromFiber(root);
			if (
				order.sequenceManagers.length > 0 ||
				order.compositionManagers.length > 0
			) {
				target.dispatchEvent(
					new CustomEvent(Internals.CommitOrderInternals.eventName, {
						detail: order,
					}),
				);
			}
		} catch {
			// Fiber is private React API. An unsupported shape must not break Studio.
		}

		return previousOnCommitFiberRoot?.apply(this, args);
	};

	hook[installationMarker] = true;
	return true;
};
