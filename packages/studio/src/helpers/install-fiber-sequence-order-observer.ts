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
	'remotion.sequence-order-observer-installed',
);

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

export const collectSequenceOrderFromFiber = (
	root: FiberRoot,
): readonly {
	readonly managerId: string;
	readonly sequenceIds: readonly string[];
}[] => {
	const orderByManager = new Map<string, string[]>();

	const visit = (fiber: Fiber, currentManagerId: string | null) => {
		const isManagerMarker =
			hasMarker(fiber.type, Internals.SequenceOrderInternals.managerMarker) ||
			hasMarker(
				fiber.elementType,
				Internals.SequenceOrderInternals.managerMarker,
			);
		const managerId = isManagerMarker
			? getStringProp(fiber.memoizedProps, 'managerId')
			: currentManagerId;

		if (
			isManagerMarker &&
			managerId !== null &&
			!orderByManager.has(managerId)
		) {
			orderByManager.set(managerId, []);
		}

		const isSequenceMarker =
			hasMarker(fiber.type, Internals.SequenceOrderInternals.sequenceMarker) ||
			hasMarker(
				fiber.elementType,
				Internals.SequenceOrderInternals.sequenceMarker,
			);
		if (isSequenceMarker && managerId !== null) {
			const sequenceId = getStringProp(fiber.memoizedProps, 'sequenceId');
			if (sequenceId !== null) {
				orderByManager.get(managerId)?.push(sequenceId);
			}
		}

		let {child} = fiber;
		while (child !== null) {
			visit(child, managerId);
			child = child.sibling;
		}
	};

	visit(root.current, null);
	return [...orderByManager].map(([managerId, sequenceIds]) => ({
		managerId,
		sequenceIds,
	}));
};

export const installFiberSequenceOrderObserver = (
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
			const order = collectSequenceOrderFromFiber(root);
			target.dispatchEvent(
				new CustomEvent(Internals.SequenceOrderInternals.eventName, {
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
