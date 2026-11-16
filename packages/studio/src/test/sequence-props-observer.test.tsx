import {afterEach, expect, test} from 'bun:test';
import {
	REACT_REFRESH_FINISHED_EVENT,
	REACT_REFRESH_STARTED_EVENT,
} from '@remotion/studio-shared';
import {act, cleanup, render} from '@testing-library/react';
import type {ContextType, ReactNode} from 'react';
import {
	createEffect,
	Internals,
	type EffectDescriptor,
	type SequencePropsSubscriptionKey,
} from 'remotion';
import {ExpandedTracksSetterContext} from '../components/ExpandedTracksProvider';
import {subscribeToSequencePropsRefresh} from '../components/Timeline/sequence-props-subscription-store';
import {SequencePropsObserver} from '../components/Timeline/SequencePropsObserver';
import {
	TimelineSelectionProvider,
	useTimelineSelection,
} from '../components/Timeline/TimelineSelection';
import {FastRefreshContext} from '../fast-refresh-context';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {remapOptimisticEffects} from '../helpers/remap-optimistic-effects';
import {
	queueSequenceNodePathMutation,
	recordSequenceNodePathMutationBuild,
} from '../helpers/sequence-node-path-mutations';
import {KeybindingContextProvider} from '../state/keybindings';

afterEach(cleanup);

const studioServerConnectionContext = {
	previewServerState: {type: 'connected', clientId: 'client'},
	configFileChangeRevision: 0,
	subscribeToEvent: () => () => undefined,
} as never;

const ObserverTestProviders = ({
	children,
	values,
}: {
	readonly children: ReactNode;
	readonly values: {
		readonly expandedTracksSetter: ContextType<
			typeof ExpandedTracksSetterContext
		>;
		readonly fastRefresh: ContextType<typeof FastRefreshContext>;
		readonly overrideIdsGetter: ContextType<
			typeof Internals.OverrideIdsToNodePathsGettersContext
		>;
		readonly overrideIdsSetter: ContextType<
			typeof Internals.OverrideIdsToNodePathsSettersContext
		>;
		readonly propStatusesRef: ContextType<
			typeof Internals.VisualModePropStatusesRefContext
		>;
		readonly visualModeSetters: ContextType<
			typeof Internals.VisualModeSettersContext
		>;
	};
}) => (
	<StudioServerConnectionCtx.Provider value={studioServerConnectionContext}>
		<FastRefreshContext.Provider value={values.fastRefresh}>
			<ExpandedTracksSetterContext.Provider value={values.expandedTracksSetter}>
				<Internals.OverrideIdsToNodePathsGettersContext.Provider
					value={values.overrideIdsGetter}
				>
					<Internals.OverrideIdsToNodePathsSettersContext.Provider
						value={values.overrideIdsSetter}
					>
						<Internals.VisualModePropStatusesRefContext.Provider
							value={values.propStatusesRef}
						>
							<Internals.VisualModeSettersContext.Provider
								value={values.visualModeSetters}
							>
								{children}
							</Internals.VisualModeSettersContext.Provider>
						</Internals.VisualModePropStatusesRefContext.Provider>
					</Internals.OverrideIdsToNodePathsSettersContext.Provider>
				</Internals.OverrideIdsToNodePathsGettersContext.Provider>
			</ExpandedTracksSetterContext.Provider>
		</FastRefreshContext.Provider>
	</StudioServerConnectionCtx.Provider>
);

test('refreshes prop statuses for inserted and in-place updated nodes', () => {
	const absolutePath = '/project/src/BarChart.tsx';
	const originalPath = ['body', 0] as const;
	const insertedPath = ['body', 1] as const;
	const shiftedPath = ['body', 2] as const;
	const originalNodePath: SequencePropsSubscriptionKey = {
		absolutePath,
		effectKeys: [],
		nodePath: [...originalPath],
		sequenceKeys: ['hidden', 'name'],
		videoConfigValues: null,
	};
	const insertedNodePath: SequencePropsSubscriptionKey = {
		absolutePath,
		effectKeys: [],
		nodePath: [...insertedPath],
		sequenceKeys: ['hidden', 'name'],
		videoConfigValues: null,
	};
	const refreshedOverrideIds: string[] = [];
	const setOverrideCalls: Array<{
		overrideId: string;
		nodePath: SequencePropsSubscriptionKey | null;
	}> = [];
	const statusRemappingCalls: unknown[] = [];
	const migrationCalls: unknown[] = [];
	const unsubscribeOriginalRefresh = subscribeToSequencePropsRefresh(
		'original-override',
		() => refreshedOverrideIds.push('original-override'),
	);
	const unsubscribeInsertedRefresh = subscribeToSequencePropsRefresh(
		'inserted-override',
		() => refreshedOverrideIds.push('inserted-override'),
	);

	queueSequenceNodePathMutation({
		mutationId: 'inserted-runtime-path-test',
		timelineSelection: null,
		files: [
			{
				absolutePath,
				remappings: [
					{
						oldNodePath: [...originalPath],
						newNodePath: [...originalPath],
						oldJsxName: 'Card',
						newJsxName: 'Card',
					},
					{
						oldNodePath: [...insertedPath],
						newNodePath: [...shiftedPath],
						oldJsxName: 'Card',
						newJsxName: 'Card',
					},
					{
						oldNodePath: null,
						newNodePath: [...insertedPath],
						oldJsxName: null,
						newJsxName: 'Card',
					},
				],
			},
		],
	});

	try {
		render(
			<ObserverTestProviders
				values={{
					fastRefresh: {
						fastRefreshes: 1,
						manualRefreshes: 0,
						increaseManualRefreshes: () => undefined,
					},
					expandedTracksSetter: {
						expandParentTracks: () => undefined,
						toggleTrack: () => undefined,
						migrateExpandedTracksForSubscriptionKey: (
							oldKey: SequencePropsSubscriptionKey,
							newKey: SequencePropsSubscriptionKey,
						) => migrationCalls.push([oldKey, newKey]),
					} as never,
					overrideIdsGetter: {
						overrideIdToNodePathMappings: {
							'original-override': originalNodePath,
							'inserted-override': insertedNodePath,
						},
					},
					overrideIdsSetter: {
						setOverrideIdToNodePath: (overrideId, nodePath) =>
							setOverrideCalls.push({overrideId, nodePath}),
					},
					propStatusesRef: {current: {}},
					visualModeSetters: {
						remapPropStatuses: (remappings: unknown) =>
							statusRemappingCalls.push(remappings),
						setPropStatuses: () => undefined,
					} as never,
				}}
			>
				<SequencePropsObserver remapCollapsedLayers={() => undefined} />
			</ObserverTestProviders>,
		);

		expect(refreshedOverrideIds).toEqual([
			'original-override',
			'inserted-override',
		]);
		expect(setOverrideCalls).toEqual([
			{overrideId: 'original-override', nodePath: originalNodePath},
			{overrideId: 'inserted-override', nodePath: insertedNodePath},
		]);
		expect(statusRemappingCalls).toHaveLength(1);
		expect(migrationCalls).toHaveLength(2);
	} finally {
		unsubscribeOriginalRefresh();
		unsubscribeInsertedRefresh();
	}
});

test('moves an override when a different JSX component takes over its old path', () => {
	const absolutePath = '/project/src/Composition.tsx';
	const originalCaptionsPath = ['body', 3] as const;
	const movedCaptionsPath = ['body', 5] as const;
	const originalNodePath: SequencePropsSubscriptionKey = {
		absolutePath,
		effectKeys: [],
		nodePath: [...originalCaptionsPath],
		sequenceKeys: ['captions', 'from', 'durationInFrames', 'trimBefore'],
		videoConfigValues: null,
	};
	const movedNodePath: SequencePropsSubscriptionKey = {
		...originalNodePath,
		nodePath: [...movedCaptionsPath],
	};
	const refreshedOverrideIds: string[] = [];
	const setOverrideCalls: Array<{
		overrideId: string;
		nodePath: SequencePropsSubscriptionKey | null;
	}> = [];
	const unsubscribeRefresh = subscribeToSequencePropsRefresh(
		'captions-override',
		() => refreshedOverrideIds.push('captions-override'),
	);

	queueSequenceNodePathMutation({
		mutationId: 'different-component-at-old-path-test',
		timelineSelection: null,
		files: [
			{
				absolutePath,
				remappings: [
					{
						oldNodePath: [...originalCaptionsPath],
						newNodePath: [...movedCaptionsPath],
						oldJsxName: 'BasicCaptions',
						newJsxName: 'BasicCaptions',
					},
					{
						oldNodePath: null,
						newNodePath: [...originalCaptionsPath],
						oldJsxName: null,
						newJsxName: 'Video',
					},
				],
			},
		],
	});

	try {
		render(
			<ObserverTestProviders
				values={{
					fastRefresh: {
						fastRefreshes: 1,
						manualRefreshes: 0,
						increaseManualRefreshes: () => undefined,
					},
					expandedTracksSetter: {
						expandParentTracks: () => undefined,
						toggleTrack: () => undefined,
						migrateExpandedTracksForSubscriptionKey: () => undefined,
					} as never,
					overrideIdsGetter: {
						overrideIdToNodePathMappings: {
							'captions-override': originalNodePath,
						},
					},
					overrideIdsSetter: {
						setOverrideIdToNodePath: (overrideId, nodePath) =>
							setOverrideCalls.push({overrideId, nodePath}),
					},
					propStatusesRef: {current: {}},
					visualModeSetters: {
						remapPropStatuses: () => undefined,
						setPropStatuses: () => undefined,
					} as never,
				}}
			>
				<SequencePropsObserver remapCollapsedLayers={() => undefined} />
			</ObserverTestProviders>,
		);

		expect(setOverrideCalls).toEqual([
			{overrideId: 'captions-override', nodePath: movedNodePath},
		]);
		expect(refreshedOverrideIds).toEqual(['captions-override']);
	} finally {
		unsubscribeRefresh();
	}
});

test('remaps selection and refreshes the subscription after a JSX node path changes', () => {
	const absolutePath = '/project/src/BarChart.tsx';
	const originalNodePath: SequencePropsSubscriptionKey = {
		absolutePath,
		effectKeys: [],
		nodePath: ['body', 0],
		sequenceKeys: ['hidden', 'name'],
		videoConfigValues: null,
	};
	const refreshedOverrideIds: string[] = [];
	const unsubscribeRefresh = subscribeToSequencePropsRefresh('card', () =>
		refreshedOverrideIds.push('card'),
	);
	const selectionRef: {
		current: ReturnType<typeof useTimelineSelection> | null;
	} = {current: null};
	const CaptureSelection = () => {
		selectionRef.current = useTimelineSelection();
		return null;
	};

	const renderTree = (fastRefreshes: number) => (
		<ObserverTestProviders
			values={{
				fastRefresh: {
					fastRefreshes,
					manualRefreshes: 0,
					increaseManualRefreshes: () => undefined,
				},
				expandedTracksSetter: {
					expandParentTracks: () => undefined,
					toggleTrack: () => undefined,
					migrateExpandedTracksForSubscriptionKey: () => undefined,
				} as never,
				overrideIdsGetter: {
					overrideIdToNodePathMappings: {card: originalNodePath},
				},
				overrideIdsSetter: {setOverrideIdToNodePath: () => undefined},
				propStatusesRef: {current: {}},
				visualModeSetters: {
					remapPropStatuses: () => undefined,
					setPropStatuses: () => undefined,
				} as never,
			}}
		>
			<KeybindingContextProvider>
				<TimelineSelectionProvider>
					<CaptureSelection />
					<SequencePropsObserver remapCollapsedLayers={() => undefined} />
				</TimelineSelectionProvider>
			</KeybindingContextProvider>
		</ObserverTestProviders>
	);
	const rendered = render(renderTree(0));

	act(() => {
		selectionRef.current?.selectItems([
			{
				type: 'sequence',
				nodePathInfo: {
					sequenceSubscriptionKey: originalNodePath,
					auxiliaryKeys: [],
					index: 0,
					numberOfSequencesWithThisNodePath: 1,
					supportsEffects: true,
				},
			},
		]);
	});

	act(() => {
		queueSequenceNodePathMutation({
			mutationId: 'reorder-selection-test',
			timelineSelection: null,
			files: [
				{
					absolutePath,
					remappings: [{oldNodePath: ['body', 0], newNodePath: ['body', 1]}],
				},
			],
		});
	});
	rendered.rerender(renderTree(1));

	expect(selectionRef.current?.selectedItems).toHaveLength(1);
	expect(
		selectionRef.current?.selectedItems[0]?.type === 'sequence'
			? selectionRef.current.selectedItems[0].nodePathInfo
					.sequenceSubscriptionKey.nodePath
			: null,
	).toEqual(['body', 1]);
	expect(refreshedOverrideIds).toEqual(['card']);
	unsubscribeRefresh();
});

const refreshEffect = createEffect<{amount: number}, null>({
	type: 'dev.remotion.test.refresh-receipt',
	label: 'Refresh receipt',
	documentationLink: null,
	backend: '2d',
	calculateKey: ({amount}) => String(amount),
	setup: () => null,
	apply: () => undefined,
	cleanup: () => undefined,
	schema: {},
	validateParams: () => undefined,
});

test('keeps optimistic effects through React refresh and accepts a receipt after its build is installed', () => {
	const nodePath: SequencePropsSubscriptionKey = {
		absolutePath: '/project/src/EffectRefresh.tsx',
		nodePath: ['body', 0],
		sequenceKeys: [],
		effectKeys: [['amount']],
		videoConfigValues: null,
	};
	const initialEffects = [
		refreshEffect({amount: 1}),
		refreshEffect({amount: 2}),
	];
	const definitions = initialEffects.map(({definition}) => definition);
	const history = new Map<string, EffectDescriptor<unknown>>();
	const [first] = Internals.OptimisticEffects.getItems(nodePath, definitions);
	const Projection = ({
		effects,
	}: {
		readonly effects: readonly EffectDescriptor<unknown>[];
	}) => {
		Internals.useOptimisticEffects(nodePath);
		const projected = Internals.OptimisticEffects.projectEffects(
			nodePath,
			effects,
			history,
		);
		return (
			<output aria-label="Effect amounts">
				{projected.effects
					.map(({params}) => (params as {amount: number}).amount)
					.join(',')}
			</output>
		);
	};

	const renderTree = (effects: readonly EffectDescriptor<unknown>[]) => (
		<ObserverTestProviders
			values={{
				fastRefresh: {
					fastRefreshes: 0,
					manualRefreshes: 0,
					increaseManualRefreshes: () => undefined,
				},
				expandedTracksSetter: {
					expandParentTracks: () => undefined,
					toggleTrack: () => undefined,
					migrateExpandedTracksForSubscriptionKey: () => undefined,
				} as never,
				overrideIdsGetter: {overrideIdToNodePathMappings: {video: nodePath}},
				overrideIdsSetter: {setOverrideIdToNodePath: () => undefined},
				propStatusesRef: {current: {}},
				visualModeSetters: {
					remapPropStatuses: () => undefined,
					setPropStatuses: () => undefined,
				} as never,
			}}
		>
			<SequencePropsObserver remapCollapsedLayers={() => undefined} />
			<Projection effects={effects} />
		</ObserverTestProviders>
	);
	const previousHash = Object.getOwnPropertyDescriptor(
		globalThis,
		'__webpack_hash__',
	);
	Object.defineProperty(globalThis, '__webpack_hash__', {
		configurable: true,
		writable: true,
		value: 'before-effects-refresh',
	});
	try {
		const rendered = render(renderTree(initialEffects));
		let duplicate: ReturnType<typeof Internals.OptimisticEffects.begin>;
		act(() => {
			duplicate = Internals.OptimisticEffects.begin({
				nodePath,
				definitions,
				action: {type: 'duplicate', ids: [first.id]},
			});
			Internals.OptimisticEffects.acknowledge(duplicate, 'observer-duplicate');
			recordSequenceNodePathMutationBuild(
				'effects-refreshed',
				'observer-duplicate',
			);
			queueSequenceNodePathMutation({
				mutationId: 'observer-duplicate',
				timelineSelection: null,
				files: [
					{
						absolutePath: nodePath.absolutePath,
						remappings: [
							{oldNodePath: nodePath.nodePath, newNodePath: nodePath.nodePath},
						],
					},
				],
			});
		});
		expect(rendered.getByLabelText('Effect amounts').textContent).toBe('1,1,2');
		act(() => {
			Object.defineProperty(globalThis, '__webpack_hash__', {
				configurable: true,
				writable: true,
				value: 'effects-refreshed',
			});
			window.dispatchEvent(new Event(REACT_REFRESH_STARTED_EVENT));
		});
		expect(duplicate!.status).toBe('acknowledged');
		expect(rendered.getByLabelText('Effect amounts').textContent).toBe('1,1,2');
		const duplicatedEffects = [
			initialEffects[0],
			initialEffects[0],
			initialEffects[1],
		];
		rendered.rerender(renderTree(duplicatedEffects));
		expect(rendered.getByLabelText('Effect amounts').textContent).toBe('1,1,2');
		act(() => window.dispatchEvent(new Event(REACT_REFRESH_FINISHED_EVENT)));
		expect(duplicate!.status).toBe('settled');
		expect(rendered.getByLabelText('Effect amounts').textContent).toBe('1,1,2');

		const last = Internals.OptimisticEffects.getItems(nodePath, null)[2];
		let lateDuplicate: ReturnType<typeof Internals.OptimisticEffects.begin>;
		act(() => {
			lateDuplicate = Internals.OptimisticEffects.begin({
				nodePath,
				definitions: duplicatedEffects.map(({definition}) => definition),
				action: {type: 'duplicate', ids: [last.id]},
			});
			recordSequenceNodePathMutationBuild(
				'effects-late-receipt',
				'observer-late-duplicate',
			);
			Object.defineProperty(globalThis, '__webpack_hash__', {
				configurable: true,
				writable: true,
				value: 'effects-late-receipt',
			});
			window.dispatchEvent(new Event(REACT_REFRESH_STARTED_EVENT));
		});
		rendered.rerender(renderTree([...duplicatedEffects, initialEffects[1]]));
		act(() => window.dispatchEvent(new Event(REACT_REFRESH_FINISHED_EVENT)));
		expect(lateDuplicate!.status).toBe('queued');
		expect(rendered.getByLabelText('Effect amounts').textContent).toBe(
			'1,1,2,2',
		);
		act(() => {
			queueSequenceNodePathMutation({
				mutationId: 'observer-late-duplicate',
				timelineSelection: null,
				files: [
					{
						absolutePath: nodePath.absolutePath,
						remappings: [
							{oldNodePath: nodePath.nodePath, newNodePath: nodePath.nodePath},
						],
					},
				],
			});
			Internals.OptimisticEffects.acknowledge(
				lateDuplicate!,
				'observer-late-duplicate',
			);
		});
		expect(lateDuplicate!.status).toBe('settled');
		expect(rendered.getByLabelText('Effect amounts').textContent).toBe(
			'1,1,2,2',
		);
	} finally {
		cleanup();
		Internals.OptimisticEffects.clear();
		recordSequenceNodePathMutationBuild(undefined, undefined);
		if (previousHash)
			Object.defineProperty(globalThis, '__webpack_hash__', previousHash);
		else Reflect.deleteProperty(globalThis, '__webpack_hash__');
	}
});

test('remaps optimistic effects for colliding sibling paths as one batch', () => {
	const firstPath: SequencePropsSubscriptionKey = {
		absolutePath: '/project/src/EffectSiblings.tsx',
		nodePath: ['body', 0],
		sequenceKeys: [],
		effectKeys: [['amount']],
		videoConfigValues: null,
	};
	const secondPath = {...firstPath, nodePath: ['body', 1]};
	const thirdPath = {...firstPath, nodePath: ['body', 2]};
	const {definition} = refreshEffect({amount: 1});
	try {
		const first = Internals.OptimisticEffects.getItems(firstPath, [
			definition,
		])[0];
		const second = Internals.OptimisticEffects.getItems(secondPath, [
			definition,
		])[0];
		const firstDuplicate = Internals.OptimisticEffects.begin({
			nodePath: firstPath,
			definitions: [definition],
			action: {type: 'duplicate', ids: [first.id]},
		});
		const secondDuplicate = Internals.OptimisticEffects.begin({
			nodePath: secondPath,
			definitions: [definition],
			action: {type: 'duplicate', ids: [second.id]},
		});
		const firstProps = {
			amount: {
				status: 'static' as const,
				codeValue: 10,
				keyframeDisplayOffsetAdjustment: null,
			},
		};
		const secondProps = {
			amount: {
				status: 'static' as const,
				codeValue: 20,
				keyframeDisplayOffsetAdjustment: null,
			},
		};
		Internals.OptimisticEffects.setPropStatuses(
			firstPath,
			firstDuplicate.addedIds[0],
			firstProps,
		);
		Internals.OptimisticEffects.setPropStatuses(
			secondPath,
			secondDuplicate.addedIds[0],
			secondProps,
		);
		remapOptimisticEffects({
			mutationId: 'observer-shift-sibling-effects',
			timelineSelection: null,
			files: [
				{
					absolutePath: firstPath.absolutePath,
					remappings: [
						{oldNodePath: firstPath.nodePath, newNodePath: secondPath.nodePath},
						{oldNodePath: secondPath.nodePath, newNodePath: thirdPath.nodePath},
					],
				},
			],
		});
		expect(Internals.OptimisticEffects.get(firstPath)).toBeNull();
		expect(
			Internals.OptimisticEffects.getItems(secondPath, null).map(({id}) => id),
		).toEqual([first.id, firstDuplicate.addedIds[0]]);
		expect(
			Internals.OptimisticEffects.getItems(thirdPath, null).map(({id}) => id),
		).toEqual([second.id, secondDuplicate.addedIds[0]]);
		expect(firstDuplicate.nodePath).toEqual(secondPath);
		expect(secondDuplicate.nodePath).toEqual(thirdPath);
		expect(
			Internals.OptimisticEffects.getPropStatuses(
				secondPath,
				firstDuplicate.addedIds[0],
			),
		).toEqual(firstProps);
		expect(
			Internals.OptimisticEffects.getPropStatuses(
				thirdPath,
				secondDuplicate.addedIds[0],
			),
		).toEqual(secondProps);
	} finally {
		Internals.OptimisticEffects.clear();
	}
});
