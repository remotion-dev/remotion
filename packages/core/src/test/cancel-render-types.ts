import type {cancelRender} from '../cancel-render.js';
import {useDelayRender} from '../use-delay-render.js';

// Compile-time regressions for the v4 public hook contract. Never invoke hooks
// outside React: the controls are supplied solely for TypeScript to check.
export const assertCancellationTypes = (
	controls: ReturnType<typeof useDelayRender>,
	data: {foo: string} | null,
) => {
	const cancel: typeof cancelRender = controls.cancelRender;
	const response: Promise<Response> = fetch('/data').catch(
		controls.cancelRender,
	);
	if (!data) controls.cancelRender(new Error('missing data'));
	// Keep property-form narrowing explicit: destructured callbacks have a separate TypeScript limitation.
	// eslint-disable-next-line prefer-destructuring
	const foo: string = data.foo;
	return {response, foo, cancel};
};

// TypeScript requires an explicitly annotated local callback for never-based
// narrowing; destructured bindings have an independent compiler limitation.
export const CancellationTypeFixture = ({
	data,
}: {
	data: {foo: string} | null;
}) => {
	const cancel: typeof cancelRender = useDelayRender().cancelRender;
	const response: Promise<Response> = fetch('/data').catch(cancel);
	if (!data) cancel(new Error('missing data'));
	// Keep property-form narrowing explicit: destructured callbacks have a separate TypeScript limitation.
	// eslint-disable-next-line prefer-destructuring
	const foo: string = data.foo;
	return {response, foo};
};
