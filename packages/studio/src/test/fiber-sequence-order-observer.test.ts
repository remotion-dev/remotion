import {afterEach, expect, test} from 'bun:test';
import {Internals} from 'remotion';
import {
	collectCommitOrderFromFiber,
	installFiberCommitOrderObserver,
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

test('collects sequence, composition, and folder order per manager', () => {
	const SequenceManagerMarker = makeMarker(
		Internals.CommitOrderInternals.sequenceManagerMarker,
	);
	const CompositionManagerMarker = makeMarker(
		Internals.CommitOrderInternals.compositionManagerMarker,
	);
	const SequenceMarker = makeMarker(
		Internals.CommitOrderInternals.sequenceMarker,
	);
	const CompositionMarker = makeMarker(
		Internals.CommitOrderInternals.compositionMarker,
	);
	const FolderMarker = makeMarker(Internals.CommitOrderInternals.folderMarker);
	const root = {
		current: makeFiber({
			children: [
				makeFiber({
					type: CompositionManagerMarker,
					props: {managerId: 'compositions'},
					children: [
						makeFiber({
							type: SequenceManagerMarker,
							props: {managerId: 'sequences'},
							children: [
								makeFiber({
									type: FolderMarker,
									props: {folderId: 'group'},
									children: [
										makeFiber({
											type: CompositionMarker,
											props: {compositionId: 'inside'},
										}),
									],
								}),
								makeFiber({
									type: CompositionMarker,
									props: {compositionId: 'outside'},
								}),
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

	expect(collectCommitOrderFromFiber(root)).toEqual({
		sequenceManagers: [
			{managerId: 'sequences', sequenceIds: ['left', 'right']},
		],
		compositionManagers: [
			{
				managerId: 'compositions',
				compositionAndFolderOrder: [
					{type: 'folder', id: 'group'},
					{type: 'composition', id: 'inside'},
					{type: 'composition', id: 'outside'},
				],
			},
		],
	});
});

test('chains the existing commit hook and emits the committed order once', () => {
	const ManagerMarker = makeMarker(
		Internals.CommitOrderInternals.sequenceManagerMarker,
	);
	const SequenceMarker = makeMarker(
		Internals.CommitOrderInternals.sequenceMarker,
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

	window.addEventListener(Internals.CommitOrderInternals.eventName, onOrder);

	try {
		expect(installFiberCommitOrderObserver(window)).toBe(true);
		expect(installFiberCommitOrderObserver(window)).toBe(true);
		hook.onCommitFiberRoot(1, {current: makeFiber()}, null, false);
		hook.onCommitFiberRoot(1, root, null, false);
	} finally {
		window.removeEventListener(
			Internals.CommitOrderInternals.eventName,
			onOrder,
		);
	}

	expect(previousHookCalls).toBe(2);
	expect(events).toEqual([
		{
			sequenceManagers: [{managerId: 'manager-a', sequenceIds: ['first']}],
			compositionManagers: [],
		},
	]);
});
