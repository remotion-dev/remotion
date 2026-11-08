import {afterEach, expect, test} from 'bun:test';
import type {
	DeleteEffectRequest,
	DuplicateEffectRequest,
	SaveEffectPropsRequest,
} from '@remotion/studio-shared';
import {optimisticUpdateForEffectPropStatuses} from '@remotion/studio-shared';
import type {
	CanUpdateEffectPropsResponse,
	CanUpdateSequencePropsResponse,
	EffectDefinition,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import {enqueueStudioSourceMutation} from '../helpers/enqueue-studio-source-mutation';
import {
	clearOptimisticEffectHistory,
	getOptimisticEffectHistorySnapshot,
} from '../helpers/optimistic-effect-mutations';
import {
	attachOptimisticEffectPropHistory,
	createOptimisticEffectPropUpdate,
} from '../helpers/optimistic-effect-props';
import {waitForSourceMutationQueue} from '../helpers/source-mutation-queue';

const nodePath: SequencePropsSubscriptionKey = {
	absolutePath: '/project/Video.tsx',
	nodePath: ['program', 'body', 0],
	sequenceKeys: [],
	effectKeys: [],
	videoConfigValues: null,
};
const definition = (name: string): EffectDefinition<unknown> => ({
	type: name,
	label: name,
	documentationLink: null,
	backend: '2d',
	calculateKey: () => name,
	setup: () => null,
	apply: () => undefined,
	cleanup: () => undefined,
	schema: {},
	validateParams: () => undefined,
});
const success = (mutationId: string) => ({
	success: true,
	nodePathMutation: {mutationId, files: [], timelineSelection: null},
});
const duplicate = (effectIndex: number): DuplicateEffectRequest => [
	{
		fileName: nodePath.absolutePath,
		sequenceNodePath: nodePath,
		effectIndex,
	},
];

afterEach(async () => {
	await waitForSourceMutationQueue();
	clearOptimisticEffectHistory();
	Internals.OptimisticEffects.clear();
});

test('serializes effect identities through deletion, duplication, property edits and undo before HMR', async () => {
	Internals.OptimisticEffects.getItems(nodePath, [
		definition('exposure'),
		definition('duotone'),
	]);
	let release = () => {};
	const held = new Promise<void>((resolve) => {
		release = resolve;
	});
	const calls: string[] = [];
	const deletion = enqueueStudioSourceMutation(
		'/api/delete-effect',
		[
			{
				fileName: nodePath.absolutePath,
				sequenceNodePath: nodePath,
				type: 'single-effect',
				effectIndex: 0,
			},
		],
		async (body) => {
			await held;
			calls.push(
				`delete:${(body as DeleteEffectRequest)[0].type === 'single-effect' ? (body as {effectIndex: number}[])[0].effectIndex : 'all'}`,
			);
			return success('queue-delete');
		},
	);
	const duplication = enqueueStudioSourceMutation(
		'/api/duplicate-effect',
		duplicate(0),
		async (body) => {
			calls.push(
				`duplicate:${(body as DuplicateEffectRequest)[0].effectIndex}`,
			);
			return success('queue-duplicate');
		},
	);
	const property = enqueueStudioSourceMutation(
		'/api/save-effect-props',
		{
			fileName: nodePath.absolutePath,
			sequenceNodePath: nodePath,
			effectIndex: 1,
			key: 'amount',
			type: 'value',
			value: '0.5',
			defaultValue: '1',
			schema: {},
			clientId: 'test',
		} satisfies SaveEffectPropsRequest,
		async (body) => {
			calls.push(`save:${(body as SaveEffectPropsRequest).effectIndex}`);
			return {canUpdate: true};
		},
	);
	const undoProperty = enqueueStudioSourceMutation(
		'/api/undo',
		{},
		async () => {
			calls.push('undo-property');
			return {success: true, nodePathMutation: null};
		},
	);
	expect(
		Internals.OptimisticEffects.getItems(nodePath, null).map(
			(item) => item.definition.label,
		),
	).toEqual(['duotone', 'duotone']);
	const undoDuplicate = enqueueStudioSourceMutation(
		'/api/undo',
		{},
		async () => {
			calls.push('undo-duplicate');
			return success('queue-undo');
		},
	);
	expect(
		Internals.OptimisticEffects.getItems(nodePath, null).map(
			(item) => item.definition.label,
		),
	).toEqual(['duotone']);
	const redoDuplicate = enqueueStudioSourceMutation(
		'/api/redo',
		{},
		async () => {
			calls.push('redo-duplicate');
			return success('queue-redo');
		},
	);
	expect(
		Internals.OptimisticEffects.getItems(nodePath, null).map(
			(item) => item.definition.label,
		),
	).toEqual(['duotone', 'duotone']);
	expect(calls).toEqual([]);
	release();
	await Promise.all([
		deletion,
		duplication,
		property,
		undoProperty,
		undoDuplicate,
		redoDuplicate,
	]);
	expect(calls).toEqual([
		'delete:0',
		'duplicate:0',
		'save:1',
		'undo-property',
		'undo-duplicate',
		'redo-duplicate',
	]);
	expect(
		Internals.OptimisticEffects.get(nodePath)?.persistedItems.map(
			(item) => item.definition.label,
		),
	).toEqual(['duotone', 'duotone']);
	Internals.OptimisticEffects.settle([
		'queue-delete',
		'queue-duplicate',
		'queue-undo',
		'queue-redo',
	]);
	expect(
		Internals.OptimisticEffects.get(nodePath)?.compiledItems.map(
			(item) => item.definition.label,
		),
	).toEqual(['duotone', 'duotone']);
});

test('failed inserts cancel dependent edits and undo without cancelling independent later intent', async () => {
	Internals.OptimisticEffects.getItems(nodePath, [
		definition('exposure'),
		definition('duotone'),
	]);
	let reject = (_error: Error) => {};
	const held = new Promise<never>((_resolve, rejectPromise) => {
		reject = rejectPromise;
	});
	const calls: number[] = [];
	const first = enqueueStudioSourceMutation(
		'/api/duplicate-effect',
		duplicate(0),
		() => held,
	);
	const dependent = enqueueStudioSourceMutation(
		'/api/duplicate-effect',
		duplicate(1),
		async () => {
			throw new Error('Dependent request must not reach the server');
		},
	);
	const undoDependent = enqueueStudioSourceMutation(
		'/api/undo',
		{},
		async () => {
			throw new Error('Undo must not target an older successful server edit');
		},
	);
	const redoDependent = enqueueStudioSourceMutation(
		'/api/redo',
		{},
		async () => {
			throw new Error('Redo must not target an unrelated server edit');
		},
	);
	const independent = enqueueStudioSourceMutation(
		'/api/duplicate-effect',
		duplicate(3),
		async (body) => {
			calls.push((body as DuplicateEffectRequest)[0].effectIndex);
			return success('independent-duplicate');
		},
	);
	const results = Promise.allSettled([
		first,
		dependent,
		undoDependent,
		redoDependent,
		independent,
	]);
	reject(new Error('Injected write failure'));
	expect((await results).map((result) => result.status)).toEqual([
		'rejected',
		'rejected',
		'rejected',
		'rejected',
		'fulfilled',
	]);
	expect(calls).toEqual([1]);
	expect(
		Internals.OptimisticEffects.getItems(nodePath, null).map(
			(item) => item.definition.label,
		),
	).toEqual(['exposure', 'duotone', 'duotone']);
	expect(getOptimisticEffectHistorySnapshot().canUndo).toBe(true);
});

test('no-op effect responses do not add a local undo entry', async () => {
	Internals.OptimisticEffects.getItems(nodePath, [definition('exposure')]);
	await enqueueStudioSourceMutation(
		'/api/reorder-effect',
		{
			fileName: nodePath.absolutePath,
			sequenceNodePath: nodePath,
			fromIndex: 0,
			toIndex: 0,
			clientId: 'test',
		},
		async () => ({success: true, nodePathMutation: null}),
	);
	expect(getOptimisticEffectHistorySnapshot().canUndo).toBe(null);
	expect(getOptimisticEffectHistorySnapshot().canRedo).toBe(null);
	expect(
		Internals.OptimisticEffects.getItems(nodePath, null).map(
			(item) => item.definition.label,
		),
	).toEqual(['exposure']);
});

test('undoing independent edits rebases over earlier failed insertions and deletions', async () => {
	for (const failedAction of ['duplicate', 'delete'] as const) {
		Internals.OptimisticEffects.getItems(nodePath, [
			definition('exposure'),
			definition('duotone'),
		]);
		let reject = (_error: Error) => {};
		const held = new Promise<never>((_resolve, rejectPromise) => {
			reject = rejectPromise;
		});
		const first = enqueueStudioSourceMutation(
			failedAction === 'duplicate'
				? '/api/duplicate-effect'
				: '/api/delete-effect',
			failedAction === 'duplicate'
				? duplicate(0)
				: [{...duplicate(0)[0], type: 'single-effect'}],
			() => held,
		);
		const independent = enqueueStudioSourceMutation(
			'/api/duplicate-effect',
			duplicate(failedAction === 'duplicate' ? 2 : 0),
			async (body) => {
				expect((body as DuplicateEffectRequest)[0].effectIndex).toBe(1);
				return success(`independent-${failedAction}`);
			},
		);
		const undoIndependent = enqueueStudioSourceMutation(
			'/api/undo',
			{},
			async () => success(`independent-undo-${failedAction}`),
		);
		const results = Promise.allSettled([first, independent, undoIndependent]);
		reject(new Error('Injected write failure'));
		expect((await results).map((result) => result.status)).toEqual([
			'rejected',
			'fulfilled',
			'fulfilled',
		]);
		expect(
			Internals.OptimisticEffects.getItems(nodePath, null).map(
				(item) => item.definition.label,
			),
		).toEqual(['exposure', 'duotone']);
		clearOptimisticEffectHistory();
		Internals.OptimisticEffects.clear();
	}
});

test('queued property undo stays visible when the earlier save response arrives', async () => {
	const [item] = Internals.OptimisticEffects.getItems(nodePath, [
		definition('exposure'),
	]);
	const schema = {
		amount: {type: 'number' as const, default: 1, hiddenFromList: false},
	};
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		durationDependentKeyframes: null,
		effects: [
			{
				canUpdate: true,
				effectIndex: 0,
				callee: 'exposure',
				importPath: null,
				props: {
					amount: {
						status: 'static',
						codeValue: 1,
						keyframeDisplayOffsetAdjustment: null,
					},
				},
			},
		],
	};
	const update = createOptimisticEffectPropUpdate({
		nodePath,
		effectIndex: 0,
		fieldKey: 'amount',
		schema,
		applyOptimistic: (status) =>
			optimisticUpdateForEffectPropStatuses({
				previous: status,
				effectIndex: 0,
				fieldKey: 'amount',
				value: 0.5,
				schema,
			}),
	});
	update.applyOptimistic(previous);
	let release = () => {};
	const held = new Promise<void>((resolve) => {
		release = resolve;
	});
	const request = attachOptimisticEffectPropHistory(
		{
			fileName: nodePath.absolutePath,
			sequenceNodePath: nodePath,
			effectIndex: 0,
			key: 'amount',
			type: 'value',
			value: '0.5',
			defaultValue: '1',
			schema,
			clientId: 'test',
		},
		[update],
	);
	const saved = enqueueStudioSourceMutation(
		'/api/save-effect-props',
		request,
		async (): Promise<CanUpdateEffectPropsResponse> => {
			await held;
			return {
				canUpdate: true,
				effectIndex: 0,
				callee: 'exposure',
				importPath: null,
				props: {
					amount: {
						status: 'static',
						codeValue: 0.5,
						keyframeDisplayOffsetAdjustment: null,
					},
				},
			};
		},
	).then((response) => update.applyResponse(previous, response));
	const undone = enqueueStudioSourceMutation('/api/undo', {}, async () => ({
		success: true,
		nodePathMutation: null,
	}));
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)?.amount,
	).toMatchObject({status: 'static', codeValue: 1});
	release();
	await Promise.all([saved, undone]);
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)?.amount,
	).toMatchObject({status: 'static', codeValue: 1});
	const redone = enqueueStudioSourceMutation('/api/redo', {}, async () => ({
		success: true,
		nodePathMutation: null,
	}));
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)?.amount,
	).toMatchObject({status: 'static', codeValue: 0.5});
	await redone;
});

test('undo rebases a reorder without replaying an earlier failed move', async () => {
	Internals.OptimisticEffects.getItems(nodePath, [
		definition('exposure'),
		definition('duotone'),
		definition('brightness'),
	]);
	let reject = (_error: Error) => {};
	const held = new Promise<never>((_resolve, rejectPromise) => {
		reject = rejectPromise;
	});
	const request = {
		fileName: nodePath.absolutePath,
		sequenceNodePath: nodePath,
		fromIndex: 0,
		toIndex: 2,
		clientId: 'test',
	};
	const failed = enqueueStudioSourceMutation(
		'/api/reorder-effect',
		request,
		() => held,
	);
	const independent = enqueueStudioSourceMutation(
		'/api/reorder-effect',
		request,
		async (body) => {
			expect(body).toMatchObject({fromIndex: 1, toIndex: 2});
			return success('independent-reorder');
		},
	);
	const undone = enqueueStudioSourceMutation('/api/undo', {}, async () =>
		success('independent-undo-reorder'),
	);
	const results = Promise.allSettled([failed, independent, undone]);
	reject(new Error('Injected write failure'));
	expect((await results).map((result) => result.status)).toEqual([
		'rejected',
		'fulfilled',
		'fulfilled',
	]);
	expect(
		Internals.OptimisticEffects.getItems(nodePath, null).map(
			(item) => item.definition.label,
		),
	).toEqual(['exposure', 'duotone', 'brightness']);
});

test('external edits cancel only the affected file, including queued undo and late replies', async () => {
	const {recordExternalSourceChange, setExternalSourceSession} =
		await import('../helpers/external-source-changes');
	setExternalSourceSession('external-edit-test');
	const otherNode = {...nodePath, absolutePath: '/project/Other.tsx'};
	Internals.OptimisticEffects.getItems(nodePath, [definition('exposure')]);
	Internals.OptimisticEffects.getItems(otherNode, [definition('blur')]);
	let release = () => {};
	let entered = () => {};
	const held = new Promise<void>((resolve) => {
		release = resolve;
	});
	const dispatched = new Promise<void>((resolve) => {
		entered = resolve;
	});
	const calls: string[] = [];
	try {
		const first = enqueueStudioSourceMutation(
			'/api/duplicate-effect',
			duplicate(0),
			async () => {
				entered();
				await held;
				return success('late-external-duplicate');
			},
		);
		const firstResult = first.catch((error: Error) => error.message);
		await dispatched;
		const dependent = enqueueStudioSourceMutation(
			'/api/duplicate-effect',
			duplicate(1),
			() => {
				calls.push('stale');
				return Promise.resolve(success('must-not-run'));
			},
		);
		const dependentResult = dependent.catch((error: Error) => error.message);
		const undo = enqueueStudioSourceMutation('/api/undo', {}, () => {
			calls.push('stale-undo');
			return Promise.resolve(success('must-not-undo'));
		});
		const undoResult = undo.catch((error: Error) => error.message);
		const independent = enqueueStudioSourceMutation(
			'/api/duplicate-effect',
			[
				{
					fileName: otherNode.absolutePath,
					sequenceNodePath: otherNode,
					effectIndex: 0,
				},
			],
			() => {
				calls.push('other');
				return Promise.resolve(success('other-file-duplicate'));
			},
		);
		expect(Internals.OptimisticEffects.getItems(otherNode, null)).toHaveLength(
			2,
		);
		recordExternalSourceChange(
			nodePath.absolutePath,
			{
				sessionId: 'external-edit-test',
				revision: 1,
			},
			false,
		);
		const external = Internals.OptimisticEffects.getItems(nodePath, [
			definition('contrast'),
		]);
		expect(external.map((item) => item.definition.label)).toEqual(['contrast']);
		expect(Internals.OptimisticEffects.getItems(otherNode, null)).toHaveLength(
			2,
		);
		release();
		for (const result of await Promise.all([
			firstResult,
			dependentResult,
			undoResult,
		]))
			expect(result).toContain('edited outside Studio');
		await independent;
		expect(calls).toEqual(['other']);
		expect(
			Internals.OptimisticEffects.getItems(nodePath, null).map(
				(item) => item.definition.label,
			),
		).toEqual(['contrast']);
		expect(
			Internals.OptimisticEffects.get(otherNode)?.persistedItems,
		).toHaveLength(2);
		const undone = enqueueStudioSourceMutation('/api/undo', {}, () =>
			Promise.resolve(success('other-file-undo')),
		);
		expect(Internals.OptimisticEffects.getItems(otherNode, null)).toHaveLength(
			1,
		);
		await undone;
		await enqueueStudioSourceMutation('/api/redo', {}, () =>
			Promise.resolve(success('other-file-redo')),
		);
		await enqueueStudioSourceMutation(
			'/api/duplicate-effect',
			duplicate(0),
			() => Promise.resolve(success('new-primary-duplicate')),
		);
		await enqueueStudioSourceMutation('/api/undo', {}, () =>
			Promise.resolve(success('undo-primary-duplicate')),
		);
		await enqueueStudioSourceMutation('/api/undo', {}, () =>
			Promise.resolve(success('undo-other-duplicate')),
		);
		expect(Internals.OptimisticEffects.getItems(otherNode, null)).toHaveLength(
			1,
		);
		recordExternalSourceChange(
			nodePath.absolutePath,
			{
				sessionId: 'external-edit-test',
				revision: 2,
			},
			false,
		);
		expect(Internals.OptimisticEffects.getItems(otherNode, null)).toHaveLength(
			1,
		);
		const redoOther = enqueueStudioSourceMutation('/api/redo', {}, () =>
			Promise.resolve(success('redo-unaffected-file')),
		);
		expect(Internals.OptimisticEffects.getItems(otherNode, null)).toHaveLength(
			2,
		);
		await redoOther;
	} finally {
		release();
		await waitForSourceMutationQueue();
		setExternalSourceSession(null);
	}
});

test('animated paste and duplication preserve keyframes through settlement', async () => {
	const {captureOptimisticEffectMutation} =
		await import('../helpers/optimistic-effect-mutations');
	Internals.OptimisticEffects.getItems(nodePath, []);
	const param = {
		type: 'keyframed' as const,
		interpolationFunction: 'interpolate' as const,
		keyframes: [
			{frame: 0, value: 0},
			{frame: 30, value: 1},
		],
		easing: [{type: 'linear' as const}],
		clamping: {left: 'clamp' as const, right: 'clamp' as const},
		output: 'linear' as const,
		posterize: 2,
	};
	const pasted = captureOptimisticEffectMutation('/api/paste-effects', {
		type: 'effects-additive',
		targetSequenceNodePath: nodePath,
		effects: [
			{
				callee: 'brightness',
				importPath: '@remotion/effects/brightness',
				params: {amount: param},
			},
		],
		insertAtIndices: null,
	});
	const copied = captureOptimisticEffectMutation(
		'/api/duplicate-effect',
		duplicate(0),
	);
	await pasted.prepare();
	const expected = {
		status: 'keyframed' as const,
		interpolationFunction: param.interpolationFunction,
		keyframes: param.keyframes,
		easing: param.easing,
		clamping: param.clamping,
		output: param.output,
		posterize: param.posterize,
		keyframeDisplayOffsetAdjustment: null,
	};
	for (const item of Internals.OptimisticEffects.getItems(nodePath, null)) {
		expect(item.propStatuses?.amount).toEqual(expected);
	}

	const {reconcileOptimisticEffectPropStatuses} =
		await import('../helpers/optimistic-effect-props');
	const {getProjectedEffectPropStatuses} =
		await import('../helpers/optimistic-effect-projection');
	let source: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		durationDependentKeyframes: null,
		effects: [0, 1].map((effectIndex) => ({
			canUpdate: true,
			effectIndex,
			callee: 'brightness',
			importPath: '@remotion/effects/brightness',
			props: {amount: expected},
		})),
	};
	const read = (effectIndex: number) =>
		getProjectedEffectPropStatuses({
			nodePath,
			effectIndex,
			propStatuses: {
				[Internals.makeSequencePropsSubscriptionKey(nodePath)]: source,
			},
		});
	for (const index of [0, 1])
		expect(read(index)).toMatchObject({props: {amount: expected}});
	expect(
		Internals.interpolateKeyframedStatus({
			status: expected,
			frame: 15,
			forceSpringAllowTail: null,
		}),
	).toBeCloseTo(14 / 30);
	pasted.acknowledge('animated-paste');
	copied.acknowledge('animated-duplicate');
	Internals.OptimisticEffects.settle(['animated-paste', 'animated-duplicate']);
	source = {...source, effects: [...source.effects]};
	reconcileOptimisticEffectPropStatuses(nodePath, source);
	for (const index of [0, 1])
		expect(read(index)).toMatchObject({props: {amount: expected}});
	for (const item of Internals.OptimisticEffects.getItems(nodePath, null))
		expect(item.propStatuses?.amount).toBeUndefined();
});
