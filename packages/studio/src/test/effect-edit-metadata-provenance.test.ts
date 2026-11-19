import {afterEach, expect, test} from 'bun:test';
import type {
	AddEffectRequest,
	AddEffectResponse,
	SaveEffectPropsRequest,
	SequencePropsSubscriptionUpdate,
} from '@remotion/studio-shared';
import {enqueueStudioSourceMutation} from '../helpers/enqueue-studio-source-mutation';
import {
	captureSourceRequest,
	markSourceRequestPaths,
} from '../helpers/rebase-source-request';
import {
	getPendingSequenceNodePathMutations,
	takePendingSequenceNodePathMutations,
} from '../helpers/sequence-node-path-mutations';

afterEach(() => {
	takePendingSequenceNodePathMutations();
});

test('metadata returned by an effect insertion supports the next edit before HMR', async () => {
	const fileName = '/project/EffectMetadataProvenance.tsx';
	const sequenceNodePath = {
		absolutePath: fileName,
		nodePath: ['program', 'body', 0],
		sequenceKeys: [],
		effectKeys: [],
		videoConfigValues: null,
	};
	const request: AddEffectRequest = {
		fileName,
		sequenceNodePath,
		effectName: 'scale',
		effectImportPath: '@remotion/effects',
		effectConfig: {},
		clientId: 'test',
	};
	const update: SequencePropsSubscriptionUpdate = {
		request: {
			subscription: {
				fileName,
				nodePath: sequenceNodePath,
				clientId: 'test',
				sequenceKeys: [],
				assetKeys: [],
				effectKeys: [],
			},
			effects: [['scale']],
		},
		result: {
			success: true,
			nodePath: {...sequenceNodePath, nodePath: [...sequenceNodePath.nodePath]},
			status: {
				canUpdate: true,
				props: {},
				effects: [],
				durationDependentKeyframes: null,
			},
		},
	};
	const response: AddEffectResponse = {
		success: true,
		nodePathMutation: {
			mutationId: 'effect-metadata-insert',
			files: [{absolutePath: fileName, remappings: []}],
			timelineSelection: null,
		},
		insertedEffect: {effectIndex: 0, nodePath: [...sequenceNodePath.nodePath]},
		sequenceProps: [update],
	};
	const original = JSON.stringify(response);
	const received = await enqueueStudioSourceMutation(
		'/api/add-effect',
		request,
		() => Promise.resolve(response),
	);
	expect(received).toBe(response);
	if (!update.result.success) throw new Error('Expected successful metadata');
	const save: SaveEffectPropsRequest = {
		fileName,
		sequenceNodePath: update.result.nodePath,
		effectIndex: 0,
		key: 'scale',
		type: 'value',
		value: '0.5',
		defaultValue: '1',
		schema: {},
		clientId: 'test',
	};
	const dispatched = await enqueueStudioSourceMutation(
		'/api/save-effect-props',
		save,
		(body) => Promise.resolve(body),
	);
	expect(dispatched).toEqual(save);
	expect(JSON.stringify(response)).toBe(original);

	const unmarked = {
		...save,
		sequenceNodePath: {
			...save.sequenceNodePath,
			nodePath: [...save.sequenceNodePath.nodePath],
		},
	};
	await enqueueStudioSourceMutation('/api/undo', {}, () =>
		Promise.resolve({
			success: true,
			sequenceProps: [
				{
					...update,
					result: {...update.result, nodePath: unmarked.sequenceNodePath},
				},
			],
		}),
	);
	expect(() =>
		captureSourceRequest(unmarked, getPendingSequenceNodePathMutations()),
	).toThrow('The source changed while this control was loading.');
	markSourceRequestPaths(unmarked, getPendingSequenceNodePathMutations(), true);
	expect(() =>
		captureSourceRequest(unmarked, getPendingSequenceNodePathMutations()),
	).toThrow('The source changed while this control was loading.');
});
