import {afterEach, expect, test} from 'bun:test';
import {CanvasInternals} from '@remotion/sdk';
import {Internals} from 'remotion';

const {collectCommitOrderFromFiber, installFiberCommitOrderObserver} =
	CanvasInternals;

type TestFiber = {
	child: TestFiber | null;
	memoizedProps: unknown;
	sibling: TestFiber | null;
	tag: number | null;
	stateNode: unknown;
	memoizedState: unknown;
};

const makeFiber = ({
	props = {},
	children = [],
}: {
	props?: unknown;
	children?: TestFiber[];
} = {}): TestFiber => {
	for (let i = 0; i < children.length - 1; i++) {
		children[i].sibling = children[i + 1];
	}

	return {
		child: children[0] ?? null,
		memoizedProps: props,
		sibling: null,
		tag: null,
		stateNode: null,
		memoizedState: null,
	};
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
	const root = {
		current: makeFiber({
			children: [
				makeFiber({
					props: {
						_remotionCommitMetadata: {
							type: 'composition-manager',
							id: 'compositions',
							onCommit: null,
						},
					},
					children: [
						makeFiber({
							props: {
								_remotionCommitMetadata: {
									type: 'sequence-manager',
									id: 'sequences',
									onCommit: null,
								},
							},
							children: [
								makeFiber({
									props: {
										_remotionCommitMetadata: {
											type: 'folder',
											id: 'group',
											value: {
												name: 'group',
												parent: null,
												order: null,
												stack: null,
											},
										},
									},
									children: [
										makeFiber({
											props: {
												_remotionCommitMetadata: {
													type: 'composition',
													id: 'inside',
													value: {id: 'inside'},
												},
											},
										}),
									],
								}),
								makeFiber({
									props: {
										_remotionCommitMetadata: {
											type: 'composition',
											id: 'outside',
											value: {id: 'outside'},
										},
									},
								}),
								makeFiber({
									props: {
										_remotionCommitMetadata: {
											type: 'sequence',
											id: 'left',
											value: null,
											outlineChildrenRef: null,
										},
									},
								}),
								makeFiber({
									props: {
										_remotionCommitMetadata: {
											type: 'sequence',
											id: 'right',
											value: null,
											outlineChildrenRef: null,
										},
									},
								}),
							],
						}),
					],
				}),
			],
		}),
	};

	expect(collectCommitOrderFromFiber(root)).toEqual({
		outlineCount: 0,
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
	const root = {
		current: makeFiber({
			children: [
				makeFiber({
					props: {
						_remotionCommitMetadata: {
							type: 'sequence-manager',
							id: 'manager-a',
							onCommit: null,
						},
					},
					children: [
						makeFiber({
							props: {
								_remotionCommitMetadata: {
									type: 'sequence',
									id: 'first',
									value: null,
									outlineChildrenRef: null,
								},
							},
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

	window.addEventListener(
		Internals.CommittedMetadataInternals.eventName,
		onOrder,
	);

	try {
		expect(installFiberCommitOrderObserver(window)).toBe(true);
		expect(installFiberCommitOrderObserver(window)).toBe(true);
		hook.onCommitFiberRoot(1, {current: makeFiber()}, null, false);
		hook.onCommitFiberRoot(1, root, null, false);
	} finally {
		window.removeEventListener(
			Internals.CommittedMetadataInternals.eventName,
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
