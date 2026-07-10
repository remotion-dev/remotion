import {afterEach, expect, test} from 'bun:test';
import {cleanup, render, waitFor} from '@testing-library/react';
import React from 'react';
import type {AnyComposition} from '../CompositionManager.js';
import {
	CompositionSetters,
	type CompositionManagerSetters,
} from '../CompositionManagerContext.js';
import {Internals} from '../internals.js';
import {Still} from '../Still.js';

afterEach(cleanup);

const AnyComp: React.FC = () => null;

const makeCompositionSetters = (
	onRegisterComposition: (composition: AnyComposition) => void,
): CompositionManagerSetters => ({
	registerComposition: (composition) => {
		onRegisterComposition(composition as AnyComposition);
	},
	unregisterComposition: () => undefined,
	registerFolder: () => undefined,
	unregisterFolder: () => undefined,
	setCanvasContent: () => undefined,
	onlyRenderComposition: null,
});

test('Still gets automatic stack traces added', () => {
	expect(Internals.getComponentsToAddStacksTo()).toContain(Still);
});

test('Still forwards its stack to the registered composition', async () => {
	const stillStack = 'Error\n    at StillCallsite (Root.tsx:10:2)';
	const registeredCompositions: AnyComposition[] = [];

	render(
		<CompositionSetters.Provider
			value={makeCompositionSetters((composition) => {
				registeredCompositions.push(composition);
			})}
		>
			<Still
				id="still-stack-test"
				component={AnyComp}
				width={100}
				height={100}
				{...({stack: stillStack} as {readonly stack: string})}
			/>
		</CompositionSetters.Provider>,
	);

	await waitFor(() => {
		expect(registeredCompositions[0]?.stack).toBe(stillStack);
	});
});
