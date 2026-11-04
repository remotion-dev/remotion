import {afterEach, expect, test} from 'bun:test';
import type {SubscribeToDefaultPropsRequest} from '@remotion/studio-shared';
import {cleanup, render, waitFor} from '@testing-library/react';
import {Internals} from 'remotion';
import {ObserveDefaultProps} from '../components/ObserveDefaultPropsContext';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {makeBrowserStudioOperations} from './make-browser-studio-operations';

afterEach(() => {
	cleanup();
	Reflect.deleteProperty(window, 'remotion_browserStudio');
});

test('subscribes with the root file fallback when the stack resolves to nothing', async () => {
	const requests: SubscribeToDefaultPropsRequest[] = [];
	window.remotion_browserStudio = makeBrowserStudioOperations({
		subscribeToDefaultProps: (request) => {
			requests.push(request);
			return Promise.resolve({canUpdate: false, reason: 'not found'});
		},
		unsubscribeFromDefaultProps: () => Promise.resolve(undefined),
	});

	render(
		<StudioServerConnectionCtx.Provider
			value={
				{
					previewServerState: {type: 'connected', clientId: 'client'},
					subscribeToEvent: () => () => undefined,
				} as never
			}
		>
			<Internals.CompositionManager.Provider
				value={
					{compositions: [{id: 'Comp', stack: 'not a stack trace'}]} as never
				}
			>
				<Internals.EditorPropsContext.Provider
					value={{updateProps: () => undefined} as never}
				>
					<ObserveDefaultProps compositionId="Comp" readOnlyStudio={false}>
						{null}
					</ObserveDefaultProps>
				</Internals.EditorPropsContext.Provider>
			</Internals.CompositionManager.Provider>
		</StudioServerConnectionCtx.Provider>,
	);

	await waitFor(() => {
		expect(requests.length).toBeGreaterThan(0);
	});
	// Let any re-subscription settle, there must be exactly one request
	await new Promise((resolve) => {
		setTimeout(resolve, 50);
	});
	expect(requests).toEqual([
		{compositionId: 'Comp', clientId: 'client', symbolicatedStack: null},
	]);
});
