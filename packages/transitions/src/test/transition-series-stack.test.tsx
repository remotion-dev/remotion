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
	type SequenceRegistrationControls,
} from 'remotion';
import {linearTiming} from '../timings/linear-timing.js';
import {TransitionSeries} from '../TransitionSeries.js';

afterEach(() => {
	document.body.innerHTML = '';
});

type RegisteredSequence = {
	readonly displayName: string;
	readonly getStack: () => string | null;
	readonly controls: SequenceRegistrationControls | null;
	readonly duration: number;
	readonly from: number;
	readonly trimBefore: number | null;
	readonly singleChildComponent?: unknown;
};

const remotionEnvironment = {
	isRendering: false,
	isClientSideRendering: false,
	isPlayer: false,
	isStudio: true,
	isReadOnlyStudio: false,
};

const compositionManagerContext = makeMockCompositionManagerContext();
const visualModeSetters = {
	setDragOverrides: () => undefined,
	clearDragOverrides: () => undefined,
	setEffectDragOverrides: () => undefined,
	clearEffectDragOverrides: () => undefined,
	setPropStatuses: () => undefined,
};

const SequenceTestWrapper: React.FC<{
	readonly children: React.ReactNode;
	readonly frame?: number;
	readonly onRegisterSequence: (sequence: RegisteredSequence) => void;
	readonly overrideIdToNodePathMappings: OverrideIdToNodePaths;
	readonly propStatuses: PropStatuses;
	readonly dragOverrides: DragOverrides;
}> = ({
	children,
	frame = 0,
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
					<Internals.TimelineContext.Provider
						value={makeTimelineContext(frame)}
					>
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
	const ConnectedComposition: React.FC = () => null;

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
				{...({
					_remotionInternalStack: transitionSeriesStack,
				} as {readonly _remotionInternalStack: string})}
			>
				<TransitionSeries.Sequence
					durationInFrames={10}
					trimBefore={4}
					{...({
						_remotionInternalStack: childSequenceStack,
					} as {readonly _remotionInternalStack: string})}
				>
					<ConnectedComposition />
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
				sequence.controls.runtimeValues.getSnapshot().durationInFrames === 10 &&
				sequence.controls.runtimeValues.getSnapshot().trimBefore === 4 &&
				sequence.trimBefore === 4,
		),
	).toBe(true);
	expect(
		registeredSequences.some(
			(sequence) =>
				sequence.displayName === '<TS.Sequence>' &&
				sequence.singleChildComponent === ConnectedComposition,
		),
	).toBe(true);
});

test('TransitionSeries.Transition and Overlay register at their rendered timeline ranges', async () => {
	const registeredSequences: RegisteredSequence[] = [];
	const div = document.createElement('div');
	const root = createRoot(div);
	const transitionStack = 'Error\n    at UserAuthoredTransition';
	const overlayStack = 'Error\n    at UserAuthoredOverlay';
	const pendingRegistrationStacks = new Set([transitionStack, overlayStack]);
	let resolveRegistrations: () => void = () => undefined;
	const registrations = new Promise<void>((resolve) => {
		resolveRegistrations = resolve;
	});

	root.render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
				pendingRegistrationStacks.delete(sequence.getStack() ?? '');
				if (pendingRegistrationStacks.size === 0) {
					resolveRegistrations();
				}
			}}
			overrideIdToNodePathMappings={{}}
			propStatuses={{}}
			dragOverrides={{}}
		>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={40}>
					First
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					timing={linearTiming({durationInFrames: 10})}
					{...({
						_remotionInternalStack: transitionStack,
					} as {readonly _remotionInternalStack: string})}
				/>
				<TransitionSeries.Sequence durationInFrames={30}>
					Second
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay
					durationInFrames={12}
					offset={2}
					{...({
						_remotionInternalStack: overlayStack,
					} as {readonly _remotionInternalStack: string})}
				>
					Overlay
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence durationInFrames={50}>
					Third
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</SequenceTestWrapper>,
	);

	await registrations;

	const transition = registeredSequences.find(
		(sequence) => sequence.getStack() === transitionStack,
	);
	const overlay = registeredSequences.find(
		(sequence) => sequence.getStack() === overlayStack,
	);

	root.unmount();

	expect(transition?.displayName).toBe('<TS.Transition>');
	expect(transition?.controls?.componentIdentity).toBe(
		'dev.remotion.transitions.TransitionSeries.Transition',
	);
	expect(transition?.from).toBe(30);
	expect(transition?.duration).toBe(10);
	expect((transition?.from ?? 0) + (transition?.duration ?? 0)).toBe(40);

	expect(overlay?.displayName).toBe('<TS.Overlay>');
	expect(overlay?.controls?.componentIdentity).toBe(
		'dev.remotion.transitions.TransitionSeries.Overlay',
	);
	// The cut is at frame 60 after subtracting the 10-frame transition.
	// A 12-frame overlay shifted by 2 frames therefore spans frames 56-68.
	expect(overlay?.from).toBe(56);
	expect(overlay?.duration).toBe(12);
	expect((overlay?.from ?? 0) + (overlay?.duration ?? 0)).toBe(68);
});

test('TransitionSeries.Sequence timing overrides cascade to later sequences', async () => {
	const registeredSequences: RegisteredSequence[] = [];
	const div = document.createElement('div');
	const root = createRoot(div);
	const firstStack = 'Error\n    at FirstTransitionSeriesSequence';
	const secondStack = 'Error\n    at SecondTransitionSeriesSequence';
	const transitionStack = 'Error\n    at TransitionBetweenSequences';
	let pendingRegistrationStacks = new Set<string>();
	let resolveRegistrations: () => void = () => undefined;
	const onRegisterSequence = (sequence: RegisteredSequence) => {
		registeredSequences.push(sequence);
		pendingRegistrationStacks.delete(sequence.getStack() ?? '');
		if (pendingRegistrationStacks.size === 0) {
			resolveRegistrations();
		}
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
		pendingRegistrationStacks = new Set([
			firstStack,
			secondStack,
			transitionStack,
		]);
		const registrations = new Promise<void>((resolve) => {
			resolveRegistrations = resolve;
		});
		root.render(
			<SequenceTestWrapper
				frame={7}
				onRegisterSequence={onRegisterSequence}
				overrideIdToNodePathMappings={overrideIdToNodePathMappings}
				propStatuses={propStatuses}
				dragOverrides={dragOverrides}
			>
				<TransitionSeries>
					<TransitionSeries.Sequence
						durationInFrames={10}
						trimBefore={2}
						{...({
							_remotionInternalStack: firstStack,
						} as {readonly _remotionInternalStack: string})}
					>
						First
					</TransitionSeries.Sequence>
					<TransitionSeries.Transition
						timing={linearTiming({durationInFrames: 5})}
						{...({
							_remotionInternalStack: transitionStack,
						} as {readonly _remotionInternalStack: string})}
					/>
					<TransitionSeries.Sequence
						durationInFrames={20}
						{...({
							_remotionInternalStack: secondStack,
						} as {readonly _remotionInternalStack: string})}
					>
						Second
					</TransitionSeries.Sequence>
				</TransitionSeries>
			</SequenceTestWrapper>,
		);
		return registrations;
	};

	await renderTransitionSeries({
		overrideIdToNodePathMappings: {},
		propStatuses: {},
		dragOverrides: {},
	});

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
		videoConfigValues: null,
	};
	const subscriptionKey = Internals.makeSequencePropsSubscriptionKey(nodePath);
	const makeTimingOverride = ({
		durationInFrames,
		trimBefore,
	}: {
		durationInFrames: number;
		trimBefore: number;
	}) => ({
		overrideIdToNodePathMappings: {
			[firstSequenceControls.overrideId]: nodePath,
		},
		propStatuses: {
			[subscriptionKey]: {
				canUpdate: true as const,
				props: {
					durationInFrames: {status: 'static' as const, codeValue: 10},
					trimBefore: {status: 'static' as const, codeValue: 2},
				},
				effects: [],
			},
		},
		dragOverrides: {
			[subscriptionKey]: {
				durationInFrames: Internals.makeStaticDragOverride(durationInFrames),
				trimBefore: Internals.makeStaticDragOverride(trimBefore),
			},
		},
	});

	await renderTransitionSeries(
		makeTimingOverride({durationInFrames: 7, trimBefore: 5}),
	);

	const updatedFirstSequence = registeredSequences.findLast(
		(sequence) => sequence.getStack() === firstStack,
	);
	const updatedSecondSequence = registeredSequences.findLast(
		(sequence) => sequence.getStack() === secondStack,
	);
	const updatedTransition = registeredSequences.findLast(
		(sequence) => sequence.getStack() === transitionStack,
	);

	expect(updatedFirstSequence?.duration).toBe(7);
	expect(updatedFirstSequence?.trimBefore).toBe(5);
	expect(updatedFirstSequence?.from).toBe(0);
	expect(updatedTransition?.from).toBe(2);
	expect(updatedTransition?.duration).toBe(5);
	expect(updatedSecondSequence?.duration).toBe(20);
	expect(updatedSecondSequence?.from).toBe(2);

	registeredSequences.length = 0;
	await renderTransitionSeries(
		makeTimingOverride({durationInFrames: 18, trimBefore: 7}),
	);

	const repeatedlyUpdatedFirstSequence = registeredSequences.find(
		(sequence) => sequence.getStack() === firstStack,
	);
	const repeatedlyUpdatedSecondSequence = registeredSequences.find(
		(sequence) => sequence.getStack() === secondStack,
	);
	const repeatedlyUpdatedTransition = registeredSequences.find(
		(sequence) => sequence.getStack() === transitionStack,
	);
	expect(repeatedlyUpdatedFirstSequence?.duration).toBe(18);
	expect(repeatedlyUpdatedFirstSequence?.trimBefore).toBe(7);
	expect(repeatedlyUpdatedTransition?.from).toBe(13);
	expect(repeatedlyUpdatedSecondSequence?.from).toBe(13);

	root.unmount();
});
