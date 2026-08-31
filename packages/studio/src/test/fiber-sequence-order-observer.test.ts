import {afterEach, expect, test} from 'bun:test';
import {Internals} from 'remotion';
import {
	collectSequenceOrderFromFiber,
	installFiberSequenceOrderObserver,
} from '../helpers/install-fiber-sequence-order-observer';

type TestFiber = {
	child: TestFiber | null;
	elementType: unknown;
	memoizedProps: unknown;
	sibling: TestFiber | null;
	type: unknown;
};

const makeFiber = ({
	type = null,
	props = {},
	children = [],
}: {
	type?: unknown;
	props?: unknown;
	children?: TestFiber[];
} = {}): TestFiber => {
	for (let i = 0; i < children.length - 1; i++) {
		children[i].sibling = children[i + 1];
	}

	return {
		child: children[0] ?? null,
		elementType: type,
		memoizedProps: props,
		sibling: null,
		type,
	};
};

const makeMarker = (marker: symbol) => {
	const Marker = () => null;
	Object.defineProperty(Marker, marker, {value: true});
	return Marker;
};

const originalHook = Reflect.get(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__');

afterEach(() => {
	if (originalHook === undefined) {
		Reflect.deleteProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__');
	} else {
		Reflect.set(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', originalHook);
	}
});

test('collects sequence IDs in committed Fiber sibling order per manager', () => {
	const ManagerMarker = makeMarker(
		Internals.SequenceOrderInternals.managerMarker,
	);
	const SequenceMarker = makeMarker(
		Internals.SequenceOrderInternals.sequenceMarker,
	);
	const root = {
		current: makeFiber({
			children: [
				makeFiber({
					type: ManagerMarker,
					props: {managerId: 'manager-a'},
					children: [
						makeFiber({
							children: [
								makeFiber({
									type: SequenceMarker,
									props: {sequenceId: 'left'},
								}),
								makeFiber({
									type: SequenceMarker,
									props: {sequenceId: 'right'},
								}),
							],
						}),
					],
				}),
			],
		}),
	};

	expect(collectSequenceOrderFromFiber(root)).toEqual([
		{managerId: 'manager-a', sequenceIds: ['left', 'right']},
	]);
});

test('chains the existing commit hook and emits the committed order once', () => {
	const ManagerMarker = makeMarker(
		Internals.SequenceOrderInternals.managerMarker,
	);
	const SequenceMarker = makeMarker(
		Internals.SequenceOrderInternals.sequenceMarker,
	);
	const root = {
		current: makeFiber({
			children: [
				makeFiber({
					type: ManagerMarker,
					props: {managerId: 'manager-a'},
					children: [
						makeFiber({
							type: SequenceMarker,
							props: {sequenceId: 'first'},
						}),
					],
				}),
			],
		}),
	};
	let previousHookCalls = 0;
	const hook = {
		supportsFiber: true,
		onCommitFiberRoot: (..._args: unknown[]) => {
			previousHookCalls++;
		},
	};
	Reflect.set(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', hook);

	const events: unknown[] = [];
	const onOrder = (event: Event) => {
		events.push((event as CustomEvent).detail);
	};

	window.addEventListener(Internals.SequenceOrderInternals.eventName, onOrder);

	try {
		expect(installFiberSequenceOrderObserver(window)).toBe(true);
		expect(installFiberSequenceOrderObserver(window)).toBe(true);
		hook.onCommitFiberRoot(1, root, null, false);
	} finally {
		window.removeEventListener(
			Internals.SequenceOrderInternals.eventName,
			onOrder,
		);
	}

	expect(previousHookCalls).toBe(1);
	expect(events).toEqual([[{managerId: 'manager-a', sequenceIds: ['first']}]]);
});
