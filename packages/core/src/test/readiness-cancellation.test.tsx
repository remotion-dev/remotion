import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import {useLayoutEffect} from 'react';
import type {DelayRenderScope} from '../delay-render.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';
import {DelayRenderContextType, useDelayRender} from '../use-delay-render.js';

type Controls = ReturnType<typeof useDelayRender>;
const scopes: DelayRenderScope[] = [];
const Capture = ({ready}: {readonly ready: (controls: Controls) => void}) => {
	const controls = useDelayRender();
	useLayoutEffect(() => ready(controls), [ready, controls]);
	return null;
};
const setup = () => {
	const scope: DelayRenderScope = {
		remotion_renderReady: true,
		remotion_delayRenderHandles: [],
		remotion_delayRenderTimeouts: {},
		remotion_puppeteerTimeout: 30000,
		remotion_attempt: 1,
	};
	scopes.push(scope);
	let controls!: Controls;
	render(
		<RemotionEnvironmentContext.Provider
			value={{
				isRendering: true,
				isPlayer: false,
				isStudio: false,
				isReadOnlyStudio: false,
				isClientSideRendering: false,
			}}
		>
			<DelayRenderContextType.Provider value={scope}>
				<Capture
					ready={(value) => {
						controls = value;
					}}
				/>
			</DelayRenderContextType.Provider>
		</RemotionEnvironmentContext.Provider>,
	);
	return {scope, controls};
};
afterEach(() => {
	cleanup();
	for (const scope of scopes.splice(0))
		for (const item of Object.values(scope.remotion_delayRenderTimeouts))
			clearTimeout(item.timeout);
});

test('releasing the final cancelled hold preserves the original fatal error and never marks success', () => {
	const {scope, controls} = setup();
	const handle = controls.delayRender('fatal hold');
	const failure = new Error('render failed', {
		cause: new Error('original cause'),
	});
	expect(() => controls.cancelRender(failure)).toThrow(failure);
	const stack = scope.remotion_cancelledError;
	controls.continueRender(handle);
	expect(scope.remotion_delayRenderHandles).toEqual([]);
	expect(scope.remotion_delayRenderTimeouts[handle]).toBeUndefined();
	expect(scope.remotion_cancelledErrorObject).toBe(failure);
	expect(scope.remotion_cancelledErrorObject?.cause).toBe(failure.cause);
	expect(scope.remotion_cancelledError).toBe(stack);
	expect(stack).toContain(failure.message);
	expect(scope.remotion_renderReady).toBe(false);
});
test('fatal cleanup releases only its own hold and leaves a sibling hold and timeout untouched', () => {
	const {scope, controls} = setup();
	const own = controls.delayRender('own');
	const sibling = controls.delayRender('sibling');
	const siblingTimeout = scope.remotion_delayRenderTimeouts[sibling];
	const failure = new Error('own failure');
	expect(() => controls.cancelRender(failure)).toThrow(failure);
	controls.continueRender(own);
	expect(scope.remotion_delayRenderHandles).toEqual([sibling]);
	expect(scope.remotion_delayRenderTimeouts[own]).toBeUndefined();
	expect(scope.remotion_delayRenderTimeouts[sibling]).toBe(siblingTimeout);
	expect(scope.remotion_renderReady).toBe(false);
	expect(scope.remotion_cancelledErrorObject).toBe(failure);
});
test('a defined empty cancellation stack is still fatal when the final hold is released', () => {
	const {scope, controls} = setup();
	const handle = controls.delayRender('legacy empty stack');
	scope.remotion_cancelledError = '';
	controls.continueRender(handle);
	expect(scope.remotion_delayRenderHandles).toEqual([]);
	expect(scope.remotion_renderReady).toBe(false);
});
test('ordinary successful releases still wait for the sibling and then become ready', () => {
	const {scope, controls} = setup();
	const first = controls.delayRender('first');
	const second = controls.delayRender('second');
	controls.continueRender(first);
	expect(scope.remotion_renderReady).toBe(false);
	controls.continueRender(second);
	expect(scope.remotion_renderReady).toBe(true);
	expect(scope.remotion_cancelledError).toBeUndefined();
	expect(scope.remotion_delayRenderHandles).toEqual([]);
});
