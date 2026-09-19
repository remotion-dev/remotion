import {afterEach, expect, test} from 'bun:test';
import {act, cleanup, render} from '@testing-library/react';
import {type ContextType, useContext} from 'react';
import {Internals, type SequencePropsSubscriptionKey} from 'remotion';
import {
	OverrideIdToNodePathMappingsRefContext,
	SequencePropsSubscriptionProvider,
} from '../components/SequencePropsSubscriptionProvider';

afterEach(cleanup);

test('updates the imperative node path mappings without rerendering consumers', () => {
	let refConsumerRenders = 0;
	let reactiveConsumerRenders = 0;
	let mappingsRef: ContextType<typeof OverrideIdToNodePathMappingsRefContext> =
		{current: {}};
	let setOverrideIdToNodePath: ContextType<
		typeof Internals.OverrideIdsToNodePathsSettersContext
	>['setOverrideIdToNodePath'] = () => {
		throw new Error('Node path setter was not initialized');
	};

	const RefConsumer = () => {
		refConsumerRenders++;
		mappingsRef = useContext(OverrideIdToNodePathMappingsRefContext);
		return null;
	};

	const ReactiveConsumer = () => {
		reactiveConsumerRenders++;
		useContext(Internals.OverrideIdsToNodePathsGettersContext);
		return null;
	};

	const Setter = () => {
		setOverrideIdToNodePath = useContext(
			Internals.OverrideIdsToNodePathsSettersContext,
		).setOverrideIdToNodePath;
		return null;
	};

	render(
		<Internals.SequenceManager.Provider
			value={{
				registerSequence: () => undefined,
				sequences: [],
				unregisterSequence: () => undefined,
				updateSequence: null,
			}}
		>
			<SequencePropsSubscriptionProvider>
				<RefConsumer />
				<ReactiveConsumer />
				<Setter />
			</SequencePropsSubscriptionProvider>
		</Internals.SequenceManager.Provider>,
	);

	const nodePath: SequencePropsSubscriptionKey = {
		absolutePath: '/project/src/Composition.tsx',
		effectKeys: [],
		nodePath: ['body', 0],
		sequenceKeys: ['from', 'durationInFrames'],
		videoConfigValues: null,
	};
	act(() => setOverrideIdToNodePath('clip', nodePath));

	expect(reactiveConsumerRenders).toBe(2);
	expect(refConsumerRenders).toBe(1);
	expect(mappingsRef.current).toEqual({clip: nodePath});
});
