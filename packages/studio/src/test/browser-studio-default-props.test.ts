import {afterEach, expect, test} from 'bun:test';
import {
	subscribeToDefaultProps,
	unsubscribeFromDefaultProps,
} from '../components/default-props-api';
import {makeBrowserStudioOperations} from './make-browser-studio-operations';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'window',
);

afterEach(() => {
	if (originalWindowDescriptor) {
		Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
		return;
	}

	Reflect.deleteProperty(globalThis, 'window');
});

test('routes default prop subscriptions through Browser Studio operations', async () => {
	const calls: string[] = [];
	const operations = makeBrowserStudioOperations({
		subscribeToDefaultProps: ({clientId, compositionId}) => {
			calls.push(`subscribe:${clientId}:${compositionId}`);
			return Promise.resolve({
				canUpdate: true,
				currentDefaultProps: {title: 'Hello'},
			});
		},
		unsubscribeFromDefaultProps: ({clientId, compositionId}) => {
			calls.push(`unsubscribe:${clientId}:${compositionId}`);
			return Promise.resolve(undefined);
		},
	});

	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {remotion_browserStudio: operations},
	});

	expect(
		await subscribeToDefaultProps({
			clientId: 'browser-studio',
			compositionId: 'MyComp',
		}),
	).toEqual({canUpdate: true, currentDefaultProps: {title: 'Hello'}});
	await unsubscribeFromDefaultProps({
		clientId: 'browser-studio',
		compositionId: 'MyComp',
	});
	expect(calls).toEqual([
		'subscribe:browser-studio:MyComp',
		'unsubscribe:browser-studio:MyComp',
	]);
});
