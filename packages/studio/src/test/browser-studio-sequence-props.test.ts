import {afterEach, expect, test} from 'bun:test';
import {
	subscribeToSequenceProps,
	unsubscribeFromSequenceProps,
} from '../components/sequence-props-api';
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

test('routes sequence prop subscriptions through Browser Studio operations', async () => {
	const calls: string[] = [];
	const nodePath = {
		absolutePath: '/project/src/Composition.tsx',
		nodePath: ['program', 'body', 1],
		sequenceKeys: ['from'],
		effectKeys: [],
		videoConfigValues: {
			durationInFrames: 60,
			fps: 30,
			height: 720,
			width: 1280,
		},
	};
	const operations = makeBrowserStudioOperations({
		subscribeToSequenceProps: (request) => {
			calls.push(`subscribe:${request.clientId}:${request.fileName}`);
			return Promise.resolve({
				success: true,
				nodePath,
				status: {
					canUpdate: true,
					props: {from: {status: 'static', codeValue: 10}},
					effects: [],
				},
			});
		},
		unsubscribeFromSequenceProps: (request) => {
			calls.push(`unsubscribe:${request.clientId}:${request.fileName}`);
			return Promise.resolve(undefined);
		},
	});

	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {remotion_browserStudio: operations},
	});

	const subscription = await subscribeToSequenceProps({
		fileName: 'src/Composition.tsx',
		line: 2,
		column: 0,
		nodePath: null,
		componentIdentity: 'dev.remotion.remotion.Sequence',
		keys: ['from'],
		assetKeys: [],
		effects: [],
		clientId: 'browser-studio',
		videoConfigValues: nodePath.videoConfigValues,
	});
	expect(subscription.success).toBe(true);
	await unsubscribeFromSequenceProps({
		fileName: 'src/Composition.tsx',
		nodePath,
		clientId: 'browser-studio',
		sequenceKeys: ['from'],
		assetKeys: [],
		effectKeys: [],
	});
	expect(calls).toEqual([
		'subscribe:browser-studio:src/Composition.tsx',
		'unsubscribe:browser-studio:src/Composition.tsx',
	]);
});
