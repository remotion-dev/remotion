import {afterEach, expect, test} from 'bun:test';
import {CanvasInternals} from '@remotion/sdk';
import {Internals} from 'remotion';

const {collectCommitOrderFromFiber, installFiberCommitOrderObserver} =
	CanvasInternals;

type TestFiber = {
	alternate: TestFiber | null;
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
		alternate: null,
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
							onCommit: () => undefined,
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

	const compositionRegistrations: NonNullable<
		Parameters<typeof collectCommitOrderFromFiber>[3]
	>['registrations'] = new Map();
	expect(
		collectCommitOrderFromFiber(root, null, null, {
			registrations: compositionRegistrations,
			previous: null,
		}),
	).toEqual({
		outlineCount: 0,
		sequenceManagers: [
			{managerId: 'sequences', sequenceIds: ['left', 'right']},
		],
	});
	const snapshot = compositionRegistrations.get('compositions')?.snapshot;
	expect(snapshot?.compositions.map(({id}) => id)).toEqual([
		'inside',
		'outside',
	]);
	expect(snapshot?.folders).toEqual([
		{name: 'group', parent: null, order: null, stack: null},
	]);
	expect(snapshot?.orderIds).toEqual([
		'folder:group',
		'composition:inside',
		'composition:outside',
	]);
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
		},
	]);
});

test('reuses retained subtrees on one root and refreshes reordered and removed metadata', () => {
	const outlineRef = Internals.SequenceOutlineInternals.createRef();
	const node = document.createElement('div');
	let retainedReads = 0;
	const host = makeFiber();
	host.tag = 5;
	host.stateNode = node;
	Object.defineProperty(host, 'memoizedProps', {
		get: () => {
			retainedReads++;
			return {};
		},
	});
	const first = makeFiber({
		props: {
			_remotionCommitMetadata: {
				type: 'sequence',
				id: 'first',
				value: null,
				outlineChildrenRef: outlineRef,
			},
		},
		children: [host],
	});
	const second = makeFiber({
		props: {
			_remotionCommitMetadata: {
				type: 'sequence',
				id: 'second',
				value: null,
				outlineChildrenRef: null,
			},
		},
	});
	const composition = makeFiber({
		props: {
			_remotionCommitMetadata: {
				type: 'composition',
				id: 'video',
				value: {id: 'video', durationInFrames: 100},
			},
		},
	});
	const snapshots: unknown[] = [];
	const compositionManager = makeFiber({
		props: {
			_remotionCommitMetadata: {
				type: 'composition-manager',
				id: 'compositions',
				onCommit: (snapshot: unknown) => snapshots.push(snapshot),
			},
		},
		children: [composition],
	});
	const manager = makeFiber({
		props: {
			_remotionCommitMetadata: {
				type: 'sequence-manager',
				id: 'sequences',
				onCommit: null,
			},
		},
		children: [first, second, compositionManager],
	});
	const root = {current: makeFiber({children: [manager]})};
	const hook = {
		supportsFiber: true,
		onCommitFiberRoot: (..._args: unknown[]) => undefined,
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
	const commitAndCompare = (sequenceIds: string[], expectedReads: number) => {
		const before = retainedReads;
		hook.onCommitFiberRoot(1, root, null, false);
		expect(retainedReads - before).toBe(expectedReads);
		const cachedNodes = Internals.SequenceOutlineInternals.getNodes(outlineRef);
		const registrations: NonNullable<
			Parameters<typeof collectCommitOrderFromFiber>[3]
		>['registrations'] = new Map();
		const fresh = collectCommitOrderFromFiber(root, null, null, {
			registrations,
			previous: null,
		});
		expect(events.at(-1)).toEqual({sequenceManagers: fresh.sequenceManagers});
		expect(fresh.sequenceManagers).toEqual([
			{managerId: 'sequences', sequenceIds},
		]);
		expect(fresh.outlineCount).toBe(1);
		expect(cachedNodes).toEqual([node]);
		expect(Internals.SequenceOutlineInternals.getNodes(outlineRef)).toEqual(
			cachedNodes,
		);
		expect(snapshots.at(-1)).toEqual(
			registrations.get('compositions')?.snapshot,
		);
	};

	try {
		expect(installFiberCommitOrderObserver(window)).toBe(true);
		commitAndCompare(['first', 'second'], 1);
		// A new root Fiber with the exact retained child list must skip descendants.
		root.current = {...root.current, alternate: root.current};
		commitAndCompare(['first', 'second'], 0);
		expect(snapshots).toHaveLength(1);

		// React uses alternate Fibers for changed/reordered children. The first
		// sequence retains its host child, while composition metadata changes.
		const nextFirst = {...first, alternate: first, sibling: null};
		const nextSecond = {...second, alternate: second, sibling: null};
		const nextComposition = {
			...composition,
			alternate: composition,
			memoizedProps: {
				_remotionCommitMetadata: {
					type: 'composition',
					id: 'video',
					value: {id: 'video', durationInFrames: 200},
				},
			},
		};
		const nextCompositionManager = makeFiber({
			props: compositionManager.memoizedProps,
			children: [nextComposition],
		});
		nextCompositionManager.alternate = compositionManager;
		const nextManager = makeFiber({
			props: manager.memoizedProps,
			children: [nextSecond, nextFirst, nextCompositionManager],
		});
		nextManager.alternate = manager;
		root.current = {
			...makeFiber({children: [nextManager]}),
			alternate: root.current,
		};
		commitAndCompare(['second', 'first'], 0);
		expect(snapshots).toHaveLength(2);
		expect(snapshots.at(-1)).toEqual({
			compositions: [{id: 'video', durationInFrames: 200}],
			folders: [],
			orderIds: ['composition:video'],
		});

		const remainingFirst = {...first, alternate: nextFirst, sibling: null};
		const remainingManager = makeFiber({
			props: manager.memoizedProps,
			children: [remainingFirst, nextCompositionManager],
		});
		remainingManager.alternate = nextManager;
		root.current = {
			...makeFiber({children: [remainingManager]}),
			alternate: root.current,
		};
		commitAndCompare(['first'], 0);
		expect(events).toHaveLength(4);
	} finally {
		window.removeEventListener(
			Internals.CommittedMetadataInternals.eventName,
			onOrder,
		);
	}
});
