import './enable-visual-mode-env.js';
import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import React, {useCallback, useMemo, useState} from 'react';
import {Internals} from '../internals.js';
import {Sequence} from '../Sequence.js';
import type {SequenceManagerContext} from '../SequenceManager.js';
import {
	SequenceManager,
	VisualModeGettersContext,
	VisualModeSettersContext,
} from '../SequenceManager.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(cleanup);

test('Sequence calls registerSequence exactly once on mount', () => {
	let registerCalls = 0;

	const Wrapper: React.FC<{readonly children: React.ReactNode}> = ({
		children,
	}) => {
		// Mirror the real SequenceManagerProvider: registering produces a
		// state update, which re-renders consumers. That re-render is what
		// previously triggered the wrap-in-schema bug to re-fire the effect.
		const [, setTick] = useState(0);

		const registerSequence = useCallback(() => {
			registerCalls++;
			setTick((t) => t + 1);
		}, []);

		const unregisterSequence = useCallback(() => undefined, []);

		const ctx: SequenceManagerContext = useMemo(
			() => ({registerSequence, unregisterSequence, sequences: []}),
			[registerSequence, unregisterSequence],
		);

		const visualGetters = useMemo(
			() => ({
				visualModeEnabled: true,
				getDragOverrides: () => {
					throw new Error('VisualModeGettersContext not initialized');
				},
				getCodeValues: () => {
					throw new Error('VisualModeGettersContext not initialized');
				},
			}),
			[],
		);

		const visualSetters = useMemo(
			() => ({
				setDragOverrides: () => undefined,
				clearDragOverrides: () => undefined,
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
						<VisualModeGettersContext.Provider value={visualGetters}>
							<VisualModeSettersContext.Provider value={visualSetters}>
								{children}
							</VisualModeSettersContext.Provider>
						</VisualModeGettersContext.Provider>
					</SequenceManager.Provider>
				</Internals.RemotionEnvironmentContext>
			</WrapSequenceContext>
		);
	};

	render(
		<Wrapper>
			<Sequence>hi</Sequence>
		</Wrapper>,
	);

	expect(registerCalls).toBe(1);
});
