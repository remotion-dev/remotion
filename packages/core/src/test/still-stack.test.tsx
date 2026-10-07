import {afterEach, expect, test} from 'bun:test';
import {cleanup, render, waitFor} from '@testing-library/react';
import React from 'react';
import type {AnyComposition} from '../CompositionManager.js';
import {CompositionRegistryProvider} from '../CompositionRegistryProvider.js';
import {setComponentIdentityResolver} from '../enable-sequence-stack-traces.js';
import {Internals} from '../internals.js';
import {Still} from '../Still.js';

afterEach(() => {
	cleanup();
	setComponentIdentityResolver(null);
});

const AnyComp: React.FC = () => null;

test('Still gets automatic stack traces added', () => {
	expect(Internals.getComponentsToAddStacksTo()).toContain(Still);
});

test('Still forwards its stack to the registered composition', async () => {
	const stillStack = 'Error\n    at StillCallsite (Root.tsx:10:2)';
	let registeredCompositions: readonly AnyComposition[] = [];

	render(
		<CompositionRegistryProvider
			onSnapshot={(snapshot) => {
				registeredCompositions = snapshot.compositions;
			}}
		>
			<Still
				id="still-stack-test"
				component={AnyComp}
				width={100}
				height={100}
				{...({
					_remotionInternalStack: stillStack,
				} as {readonly _remotionInternalStack: string})}
			/>
		</CompositionRegistryProvider>,
	);

	await waitFor(() => {
		expect(registeredCompositions[0]?.stack).toBe(stillStack);
	});
});

test('Still registers the stable component identity', async () => {
	const family = {};
	let registeredCompositions: readonly AnyComposition[] = [];
	setComponentIdentityResolver((component) => {
		return component === AnyComp ? family : component;
	});

	render(
		<CompositionRegistryProvider
			onSnapshot={(snapshot) => {
				registeredCompositions = snapshot.compositions;
			}}
		>
			<Still
				id="still-component-identity-test"
				component={AnyComp}
				width={100}
				height={100}
			/>
		</CompositionRegistryProvider>,
	);

	await waitFor(() => {
		expect(registeredCompositions[0]?.componentFromProps).toBe(family);
	});
});
