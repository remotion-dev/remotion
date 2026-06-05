import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import React, {useCallback, useMemo, useState} from 'react';
import {AnimatedImage} from '../animated-image/index.js';
import type {TSequence} from '../CompositionManager.js';
import {Img} from '../Img.js';
import {Internals} from '../internals.js';
import {Sequence} from '../Sequence.js';
import type {SequenceManagerContext} from '../SequenceManager.js';
import {
	SequenceManager,
	VisualModeCodeValuesContext,
	VisualModeDragOverridesContext,
	VisualModeSettersContext,
} from '../SequenceManager.js';
import {Series} from '../series/index.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(cleanup);

const SequenceTestWrapper: React.FC<{
	readonly children: React.ReactNode;
	readonly onRegisterSequence: (sequence: TSequence) => void;
	readonly rerenderOnRegister?: boolean;
}> = ({children, onRegisterSequence, rerenderOnRegister = false}) => {
	const [, setTick] = useState(0);

	const registerSequence = useCallback(
		(sequence: TSequence) => {
			onRegisterSequence(sequence);
			if (rerenderOnRegister) {
				setTick((t) => t + 1);
			}
		},
		[onRegisterSequence, rerenderOnRegister],
	);

	const unregisterSequence = useCallback(() => undefined, []);

	const ctx: SequenceManagerContext = useMemo(
		() => ({registerSequence, unregisterSequence, sequences: []}),
		[registerSequence, unregisterSequence],
	);

	const visualCodeValues = useMemo(
		() => ({
			codeValues: {},
		}),
		[],
	);

	const visualDragOverrides = useMemo(
		() => ({
			getDragOverrides: () => {
				throw new Error('VisualModeDragOverridesContext not initialized');
			},
			getEffectDragOverrides: () => {
				throw new Error('VisualModeDragOverridesContext not initialized');
			},
		}),
		[],
	);

	const visualSetters = useMemo(
		() => ({
			setDragOverrides: () => undefined,
			clearDragOverrides: () => undefined,
			setEffectDragOverrides: () => undefined,
			clearEffectDragOverrides: () => undefined,
			setCodeValues: () => undefined,
		}),
		[],
	);

	return (
		<WrapSequenceContext>
			<Internals.RemotionEnvironmentContext
				value={{
					isRendering: false,
					isClientSideRendering: false,
					isPlayer: false,
					isStudio: true,
					isReadOnlyStudio: false,
				}}
			>
				<SequenceManager.Provider value={ctx}>
					<VisualModeCodeValuesContext.Provider value={visualCodeValues}>
						<VisualModeDragOverridesContext.Provider
							value={visualDragOverrides}
						>
							<VisualModeSettersContext.Provider value={visualSetters}>
								{children}
							</VisualModeSettersContext.Provider>
						</VisualModeDragOverridesContext.Provider>
					</VisualModeCodeValuesContext.Provider>
				</SequenceManager.Provider>
			</Internals.RemotionEnvironmentContext>
		</WrapSequenceContext>
	);
};

test('Sequence calls registerSequence exactly once on mount', () => {
	let registerCalls = 0;

	render(
		<SequenceTestWrapper
			rerenderOnRegister
			onRegisterSequence={() => {
				registerCalls++;
			}}
		>
			<Sequence>hi</Sequence>
		</SequenceTestWrapper>,
	);

	expect(registerCalls).toBe(1);
});

test('Sequence registers its documentation link', () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Sequence _remotionInternalDocumentationLink="https://www.remotion.dev/docs/img">
				hi
			</Sequence>
		</SequenceTestWrapper>,
	);

	expect(registeredSequences[0]?.documentationLink).toBe(
		'https://www.remotion.dev/docs/img',
	);
});

test('Series.Sequence registers without visual controls', () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Series>
				<Series.Sequence durationInFrames={10} premountFor={30}>
					First
				</Series.Sequence>
				<Series.Sequence durationInFrames={20}>Second</Series.Sequence>
			</Series>
		</SequenceTestWrapper>,
	);

	const seriesSequences = registeredSequences.filter(
		(sequence) => sequence.displayName === '<Series.Sequence>',
	);

	expect(seriesSequences).toHaveLength(2);
	for (const sequence of seriesSequences) {
		expect(sequence.controls).toBe(null);
	}
});

test('Img registers its documentation link for default labels', () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Img src="test.png" />
		</SequenceTestWrapper>,
	);

	expect(registeredSequences[0]?.documentationLink).toBe(
		'https://www.remotion.dev/docs/img',
	);
});

test('Named Img components do not receive the default documentation link', () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Img src="test.png" name="Intro" />
		</SequenceTestWrapper>,
	);

	expect(registeredSequences[0]?.documentationLink).toBe(null);
});

test('AnimatedImage registers its canvas ref for the Studio outline', () => {
	const registeredSequences: TSequence[] = [];
	const ref = React.createRef<HTMLCanvasElement>();

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<AnimatedImage ref={ref} onError={() => undefined} src="test.gif" />
		</SequenceTestWrapper>,
	);

	const refForOutline = registeredSequences[0]
		?.refForOutline as React.RefObject<HTMLCanvasElement | null>;

	expect(refForOutline.current).toBeInstanceOf(HTMLCanvasElement);
	expect(ref.current).toBe(refForOutline.current);
});

test('Img registers a refForOutline pointing to the rendered image element', () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Img src="test.png" />
		</SequenceTestWrapper>,
	);

	expect(registeredSequences[0]?.refForOutline?.current?.tagName).toBe('IMG');
});
