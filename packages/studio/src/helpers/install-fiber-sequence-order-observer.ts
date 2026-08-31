import {Internals} from 'remotion';

type Fiber = {
	readonly child: Fiber | null;
	readonly elementType: unknown;
	readonly memoizedProps: unknown;
	readonly sibling: Fiber | null;
	readonly type: unknown;
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
	const sequencesByManager = new Map<string, string[]>();
	const compositionsAndFoldersByManager = new Map<
		string,
		CompositionAndFolderOrderItem[]
	>();

	const visit = (
		fiber: Fiber,
		currentSequenceManagerId: string | null,
		currentCompositionManagerId: string | null,
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

		let {child} = fiber;
		while (child !== null) {
			visit(child, sequenceManagerId, compositionManagerId);
			child = child.sibling;
		}
	};

	visit(root.current, null, null);
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
			target.dispatchEvent(
				new CustomEvent(Internals.CommitOrderInternals.eventName, {
					detail: order,
				}),
			);
		} catch {
			// Fiber is private React API. An unsupported shape must not break Studio.
		}

		return previousOnCommitFiberRoot?.apply(this, args);
	};

	hook[installationMarker] = true;
	return true;
};
