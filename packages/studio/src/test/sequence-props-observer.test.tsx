import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import {Internals, type SequencePropsSubscriptionKey} from 'remotion';
import {ExpandedTracksSetterContext} from '../components/ExpandedTracksProvider';
import {subscribeToSequencePropsRefresh} from '../components/Timeline/sequence-props-subscription-store';
import {SequencePropsObserver} from '../components/Timeline/SequencePropsObserver';
import {FastRefreshContext} from '../fast-refresh-context';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {queueSequenceNodePathMutation} from '../helpers/sequence-node-path-mutations';

afterEach(cleanup);

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
			<StudioServerConnectionCtx.Provider
				value={
					{
						previewServerState: {type: 'connected', clientId: 'client'},
						configFileChangeRevision: 0,
						subscribeToEvent: () => () => undefined,
					} as never
				}
			>
				<FastRefreshContext.Provider
					value={{
						fastRefreshes: 1,
						manualRefreshes: 0,
						increaseManualRefreshes: () => undefined,
					}}
				>
					<ExpandedTracksSetterContext.Provider
						value={
							{
								expandParentTracks: () => undefined,
								toggleTrack: () => undefined,
								migrateExpandedTracksForSubscriptionKey: (
									oldKey: SequencePropsSubscriptionKey,
									newKey: SequencePropsSubscriptionKey,
								) => migrationCalls.push([oldKey, newKey]),
							} as never
						}
					>
						<Internals.OverrideIdsToNodePathsGettersContext.Provider
							value={{
								overrideIdToNodePathMappings: {
									'original-override': originalNodePath,
									'inserted-override': insertedNodePath,
								},
							}}
						>
							<Internals.OverrideIdsToNodePathsSettersContext.Provider
								value={{
									setOverrideIdToNodePath: (overrideId, nodePath) =>
										setOverrideCalls.push({overrideId, nodePath}),
								}}
							>
								<Internals.VisualModePropStatusesRefContext.Provider
									value={{current: {}}}
								>
									<Internals.VisualModeSettersContext.Provider
										value={
											{
												remapPropStatuses: (remappings: unknown) =>
													statusRemappingCalls.push(remappings),
												setPropStatuses: () => undefined,
											} as never
										}
									>
										<SequencePropsObserver />
									</Internals.VisualModeSettersContext.Provider>
								</Internals.VisualModePropStatusesRefContext.Provider>
							</Internals.OverrideIdsToNodePathsSettersContext.Provider>
						</Internals.OverrideIdsToNodePathsGettersContext.Provider>
					</ExpandedTracksSetterContext.Provider>
				</FastRefreshContext.Provider>
			</StudioServerConnectionCtx.Provider>,
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
