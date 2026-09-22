import {afterEach, expect, test} from 'bun:test';
import {act, cleanup, render} from '@testing-library/react';
import type {ContextType, ReactNode} from 'react';
import {Internals, type SequencePropsSubscriptionKey} from 'remotion';
import {ExpandedTracksSetterContext} from '../components/ExpandedTracksProvider';
import {subscribeToSequencePropsRefresh} from '../components/Timeline/sequence-props-subscription-store';
import {SequencePropsObserver} from '../components/Timeline/SequencePropsObserver';
import {
	TimelineSelectionProvider,
	useTimelineSelection,
} from '../components/Timeline/TimelineSelection';
import {FastRefreshContext} from '../fast-refresh-context';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {queueSequenceNodePathMutation} from '../helpers/sequence-node-path-mutations';
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
					{oldNodePath: [...originalPath], newNodePath: [...originalPath]},
					{oldNodePath: [...insertedPath], newNodePath: [...shiftedPath]},
					{oldNodePath: null, newNodePath: [...insertedPath]},
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
				<SequencePropsObserver />
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

test('keeps the selected sequence selected after its node path changes', () => {
	const absolutePath = '/project/src/BarChart.tsx';
	const originalNodePath: SequencePropsSubscriptionKey = {
		absolutePath,
		effectKeys: [],
		nodePath: ['body', 0],
		sequenceKeys: ['hidden', 'name'],
		videoConfigValues: null,
	};
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
				overrideIdsGetter: {overrideIdToNodePathMappings: {}},
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
					<SequencePropsObserver />
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

	queueSequenceNodePathMutation({
		mutationId: 'reorder-selection-test',
		timelineSelection: null,
		files: [
			{
				absolutePath,
				remappings: [
					{oldNodePath: ['body', 0], newNodePath: ['body', 1]},
					{oldNodePath: ['body', 1], newNodePath: ['body', 0]},
				],
			},
		],
	});
	rendered.rerender(renderTree(1));

	expect(selectionRef.current?.selectedItems).toHaveLength(1);
	expect(
		selectionRef.current?.selectedItems[0]?.type === 'sequence'
			? selectionRef.current.selectedItems[0].nodePathInfo
					.sequenceSubscriptionKey.nodePath
			: null,
	).toEqual(['body', 1]);
});
