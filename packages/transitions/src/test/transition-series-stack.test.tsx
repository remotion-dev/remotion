import {afterEach, expect, test} from 'bun:test';
import {
	makeMockCompositionManagerContext,
	makeTimelineContext,
} from '@remotion/test-utils';
import React, {useCallback, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {
	Internals,
	type DragOverrides,
	type OverrideIdToNodePaths,
	type PropStatuses,
	type SequenceControls,
} from 'remotion';
import {linearTiming} from '../timings/linear-timing.js';
import {TransitionSeries} from '../TransitionSeries.js';

afterEach(() => {
	document.body.innerHTML = '';
});

type RegisteredSequence = {
	readonly displayName: string;
	readonly getStack: () => string | null;
	readonly controls: SequenceControls | null;
	readonly duration: number;
	readonly from: number;
};

const remotionEnvironment = {
	isRendering: false,
	isClientSideRendering: false,
	isPlayer: false,
	isStudio: true,
	isReadOnlyStudio: false,
};

const compositionManagerContext = makeMockCompositionManagerContext();
const timelineContext = makeTimelineContext(0);
const visualModeSetters = {
	setDragOverrides: () => undefined,
	clearDragOverrides: () => undefined,
	setEffectDragOverrides: () => undefined,
	clearEffectDragOverrides: () => undefined,
	setPropStatuses: () => undefined,
};

const SequenceTestWrapper: React.FC<{
	readonly children: React.ReactNode;
	readonly onRegisterSequence: (sequence: RegisteredSequence) => void;
	readonly overrideIdToNodePathMappings: OverrideIdToNodePaths;
	readonly propStatuses: PropStatuses;
	readonly dragOverrides: DragOverrides;
}> = ({
	children,
	onRegisterSequence,
	overrideIdToNodePathMappings,
	propStatuses,
	dragOverrides,
}) => {
	const registerSequence = useCallback(
		(sequence: RegisteredSequence) => {
			onRegisterSequence(sequence);
		},
		[onRegisterSequence],
	);

	const sequenceContext = useMemo(
		() => ({
			registerSequence,
			unregisterSequence: () => undefined,
			sequences: [],
		}),
		[registerSequence],
	);
	const visualModePropStatuses = useMemo(
		() => ({propStatuses}),
		[propStatuses],
	);
	const visualModeDragOverrides = useMemo(
		() => ({
			getDragOverrides: (
				nodePath: Parameters<
					typeof Internals.makeSequencePropsSubscriptionKey
				>[0],
			) =>
				dragOverrides[Internals.makeSequencePropsSubscriptionKey(nodePath)] ??
				{},
			getEffectDragOverrides: () => ({}),
		}),
		[dragOverrides],
	);
	const overrideIdToNodePathContext = useMemo(
		() => ({overrideIdToNodePathMappings}),
		[overrideIdToNodePathMappings],
	);

	return (
		<Internals.RemotionEnvironmentContext value={remotionEnvironment}>
			<Internals.CanUseRemotionHooksProvider>
				<Internals.CompositionManager.Provider
					value={compositionManagerContext}
				>
					<Internals.TimelineContext.Provider value={timelineContext}>
						<Internals.OverrideIdsToNodePathsGettersContext.Provider
							value={overrideIdToNodePathContext}
						>
							<Internals.SequenceManager.Provider value={sequenceContext}>
								<Internals.VisualModePropStatusesContext.Provider
									value={visualModePropStatuses}
								>
									<Internals.VisualModeDragOverridesContext.Provider
										value={visualModeDragOverrides}
									>
										<Internals.VisualModeSettersContext.Provider
											value={visualModeSetters}
										>
											{children}
										</Internals.VisualModeSettersContext.Provider>
									</Internals.VisualModeDragOverridesContext.Provider>
								</Internals.VisualModePropStatusesContext.Provider>
							</Internals.SequenceManager.Provider>
						</Internals.OverrideIdsToNodePathsGettersContext.Provider>
					</Internals.TimelineContext.Provider>
				</Internals.CompositionManager.Provider>
			</Internals.CanUseRemotionHooksProvider>
		</Internals.RemotionEnvironmentContext>
	);
};

test('TransitionSeries registers with its own visual mode identity', async () => {
	const registeredSequences: RegisteredSequence[] = [];
	const div = document.createElement('div');
	const root = createRoot(div);
	const transitionSeriesStack = 'Error\n    at UserAuthoredTransitionSeries';
	const childSequenceStack =
		'Error\n    at UserAuthoredTransitionSeriesSequence';

	root.render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
			overrideIdToNodePathMappings={{}}
			propStatuses={{}}
			dragOverrides={{}}
		>
			<TransitionSeries
				{...({stack: transitionSeriesStack} as {readonly stack: string})}
			>
				<TransitionSeries.Sequence
					durationInFrames={10}
					{...({stack: childSequenceStack} as {readonly stack: string})}
				>
					First
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</SequenceTestWrapper>,
	);

	await new Promise((resolve) => setTimeout(resolve, 0));

	root.unmount();

	expect(
		registeredSequences.some(
			(sequence) =>
				sequence.displayName === '<TransitionSeries>' &&
				sequence.getStack() === transitionSeriesStack &&
				sequence.controls?.componentIdentity ===
					'dev.remotion.transitions.TransitionSeries',
		),
	).toBe(true);
	expect(
		registeredSequences.some(
			(sequence) =>
				sequence.getStack() === transitionSeriesStack &&
				sequence.controls?.componentIdentity ===
					'dev.remotion.remotion.Sequence',
		),
	).toBe(false);
	expect(
		registeredSequences.some(
			(sequence) =>
				sequence.displayName === '<TS.Sequence>' &&
				sequence.getStack() === childSequenceStack &&
				sequence.controls?.componentIdentity ===
					'dev.remotion.transitions.TransitionSeries.Sequence' &&
				sequence.controls.currentRuntimeValueDotNotation.durationInFrames ===
					10,
		),
	).toBe(true);
});

test('TransitionSeries.Sequence duration overrides cascade to later sequences', async () => {
	const registeredSequences: RegisteredSequence[] = [];
	const div = document.createElement('div');
	const root = createRoot(div);
	const firstStack = 'Error\n    at FirstTransitionSeriesSequence';
	const secondStack = 'Error\n    at SecondTransitionSeriesSequence';
	const onRegisterSequence = (sequence: RegisteredSequence) => {
		registeredSequences.push(sequence);
	};

	const renderTransitionSeries = ({
		overrideIdToNodePathMappings,
		propStatuses,
		dragOverrides,
	}: {
		overrideIdToNodePathMappings: OverrideIdToNodePaths;
		propStatuses: PropStatuses;
		dragOverrides: DragOverrides;
	}) => {
		root.render(
			<SequenceTestWrapper
				onRegisterSequence={onRegisterSequence}
				overrideIdToNodePathMappings={overrideIdToNodePathMappings}
				propStatuses={propStatuses}
				dragOverrides={dragOverrides}
			>
				<TransitionSeries>
					<TransitionSeries.Sequence
						durationInFrames={10}
						{...({stack: firstStack} as {readonly stack: string})}
					>
						First
					</TransitionSeries.Sequence>
					<TransitionSeries.Transition
						timing={linearTiming({durationInFrames: 5})}
					/>
					<TransitionSeries.Sequence
						durationInFrames={20}
						{...({stack: secondStack} as {readonly stack: string})}
					>
						Second
					</TransitionSeries.Sequence>
				</TransitionSeries>
			</SequenceTestWrapper>,
		);
	};

	renderTransitionSeries({
		overrideIdToNodePathMappings: {},
		propStatuses: {},
		dragOverrides: {},
	});
	await new Promise((resolve) => setTimeout(resolve, 10));

	const firstSequence = registeredSequences.find(
		(sequence) => sequence.getStack() === firstStack,
	);
	if (!firstSequence?.controls) {
		throw new Error('Expected the first sequence to be interactive');
	}

	const firstSequenceControls = firstSequence.controls;

	const nodePath = {
		absolutePath: '/src/Composition.tsx',
		nodePath: ['body', 0],
		sequenceKeys: [],
		effectKeys: [],
	};
	const subscriptionKey = Internals.makeSequencePropsSubscriptionKey(nodePath);
	const makeDurationOverride = (durationInFrames: number) => ({
		overrideIdToNodePathMappings: {
			[firstSequenceControls.overrideId]: nodePath,
		},
		propStatuses: {
			[subscriptionKey]: {
				canUpdate: true as const,
				props: {
					durationInFrames: {status: 'static' as const, codeValue: 10},
				},
				effects: [],
			},
		},
		dragOverrides: {
			[subscriptionKey]: {
				durationInFrames: Internals.makeStaticDragOverride(durationInFrames),
			},
		},
	});

	registeredSequences.length = 0;
	renderTransitionSeries(makeDurationOverride(15));
	await new Promise((resolve) => setTimeout(resolve, 10));

	const updatedFirstSequence = registeredSequences.find(
		(sequence) => sequence.getStack() === firstStack,
	);
	const updatedSecondSequence = registeredSequences.find(
		(sequence) => sequence.getStack() === secondStack,
	);

	expect(updatedFirstSequence?.duration).toBe(15);
	expect(updatedFirstSequence?.from).toBe(0);
	expect(updatedSecondSequence?.duration).toBe(20);
	expect(updatedSecondSequence?.from).toBe(10);

	registeredSequences.length = 0;
	renderTransitionSeries(makeDurationOverride(18));
	await new Promise((resolve) => setTimeout(resolve, 10));

	const repeatedlyUpdatedFirstSequence = registeredSequences.find(
		(sequence) => sequence.getStack() === firstStack,
	);
	const repeatedlyUpdatedSecondSequence = registeredSequences.find(
		(sequence) => sequence.getStack() === secondStack,
	);
	expect(repeatedlyUpdatedFirstSequence?.duration).toBe(18);
	expect(repeatedlyUpdatedSecondSequence?.from).toBe(13);

	root.unmount();
});
