import {afterEach, expect, test} from 'bun:test';
import {
	makeMockCompositionManagerContext,
	makeTimelineContext,
} from '@remotion/test-utils';
import React, {useCallback, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {Internals, type SequenceControls} from 'remotion';
import {TransitionSeries} from '../TransitionSeries.js';

afterEach(() => {
	document.body.innerHTML = '';
});

type RegisteredSequence = {
	readonly displayName: string;
	readonly getStack: () => string | null;
	readonly controls: SequenceControls | null;
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
const visualModePropStatuses = {propStatuses: {}};
const visualModeDragOverrides = {
	getDragOverrides: () => ({}),
	getEffectDragOverrides: () => ({}),
};
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
}> = ({children, onRegisterSequence}) => {
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

	return (
		<Internals.RemotionEnvironmentContext value={remotionEnvironment}>
			<Internals.CanUseRemotionHooksProvider>
				<Internals.CompositionManager.Provider
					value={compositionManagerContext}
				>
					<Internals.TimelineContext.Provider value={timelineContext}>
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
				sequence.getStack() === childSequenceStack,
		),
	).toBe(true);
});
