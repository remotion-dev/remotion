import {afterEach, expect, test} from 'bun:test';
import {
	saveSequenceProps,
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

test('routes sequence prop operations through Browser Studio', async () => {
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
		saveSequenceProps: (request) => {
			calls.push(`save:${request.clientId}:${request.edits[0]?.fileName}`);
			return Promise.resolve({
				canUpdate: true,
				props: {from: {status: 'static', codeValue: 15}},
				results: [
					{
						fileName: 'src/Composition.tsx',
						nodePath,
						props: {from: {status: 'static', codeValue: 15}},
					},
				],
			});
		},
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
	await saveSequenceProps({
		edits: [
			{
				fileName: 'src/Composition.tsx',
				nodePath,
				key: 'from',
				value: {type: 'json', serialized: '15'},
				defaultValue: '0',
				schema: {
					from: {
						type: 'number',
						default: 0,
						hiddenFromList: false,
					},
				},
				sourceEdit: null,
			},
		],
		addedKeyframes: null,
		movedKeyframes: null,
		clientId: 'browser-studio',
		undoLabel: 'Update from',
		redoLabel: 'Update from again',
	});
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
		'save:browser-studio:src/Composition.tsx',
		'unsubscribe:browser-studio:src/Composition.tsx',
	]);
});
