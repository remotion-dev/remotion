import {afterEach, expect, test} from 'bun:test';
import {act, cleanup, render} from '@testing-library/react';
import {CanUseRemotionHooks} from '../CanUseRemotionHooks.js';
import {createEffect} from '../effects/create-effect.js';
import type {EffectDescriptor} from '../effects/effect-types.js';
import {useMemoizedEffects} from '../effects/use-memoized-effects.js';
import {OptimisticEffects} from '../optimistic-effects.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';
import {OverrideIdsToNodePathsGettersContext} from '../sequence-node-path.js';
import type {SequencePropsSubscriptionKey} from '../SequenceManager.js';

const nodePath: SequencePropsSubscriptionKey = {
	absolutePath: '/src/video.tsx',
	nodePath: ['body', 0],
	sequenceKeys: [],
	effectKeys: [['amount']],
	videoConfigValues: null,
};

const effect = createEffect<{amount: number}, null>({
	type: 'dev.remotion.test.optimistic',
	label: 'Optimistic',
	documentationLink: null,
	backend: '2d',
	calculateKey: (params) => String(params.amount),
	setup: () => null,
	apply: () => undefined,
	cleanup: () => undefined,
	schema: {},
	validateParams: () => undefined,
});
const descriptors = [effect({amount: 1}), effect({amount: 2})];
const definitions = descriptors.map((descriptor) => descriptor.definition);

const getIds = () =>
	OptimisticEffects.getItems(nodePath, null).map((item) => item.id);
const begin = (
	action: Parameters<typeof OptimisticEffects.begin>[0]['action'],
) => OptimisticEffects.begin({nodePath, definitions, action});
const amounts = (effects: readonly EffectDescriptor<unknown>[]) =>
	effects.map((descriptor) => (descriptor.params as {amount: number}).amount);
const staticAmount = (amount: number) => ({
	amount: {
		status: 'static' as const,
		codeValue: amount,
		keyframeDisplayOffsetAdjustment: null,
	},
});

afterEach(() => {
	cleanup();
	OptimisticEffects.clear();
});

test('chains edits immediately and settles only the installed source prefix', () => {
	const [first, second] = OptimisticEffects.getItems(nodePath, definitions);
	const duplicate = begin({type: 'duplicate', ids: [first.id]});
	const copy = duplicate.addedIds[0];
	const remove = begin({type: 'delete', ids: [first.id]});
	const duplicateCopy = begin({type: 'duplicate', ids: [copy]});
	const lastCopy = duplicateCopy.addedIds[0];
	const reorder = begin({type: 'reorder', id: second.id, beforeId: copy});
	expect(getIds()).toEqual([second.id, copy, lastCopy]);
	expect(
		amounts(
			OptimisticEffects.projectEffects(nodePath, descriptors, null).effects,
		),
	).toEqual([2, 1, 1]);
	expect(OptimisticEffects.resolveIndex(nodePath, copy)).toBeNull();
	OptimisticEffects.acknowledge(duplicate, 'duplicate');
	expect(OptimisticEffects.resolveIndex(nodePath, copy)).toBe(1);
	OptimisticEffects.acknowledge(remove, 'remove');
	expect(OptimisticEffects.resolveIndex(nodePath, copy)).toBe(0);
	OptimisticEffects.settle(['duplicate']);
	expect(duplicate.status).toBe('settled');
	expect(remove.status).toBe('acknowledged');
	expect(getIds()).toEqual([second.id, copy, lastCopy]);
	expect(
		amounts(
			OptimisticEffects.projectEffects(
				nodePath,
				[descriptors[0], descriptors[0], descriptors[1]],
				null,
			).effects,
		),
	).toEqual([2, 1, 1]);
	OptimisticEffects.acknowledge(duplicateCopy, 'duplicate-copy');
	OptimisticEffects.acknowledge(reorder, 'reorder');
	OptimisticEffects.settle(['reorder']);
	expect([remove.status, duplicateCopy.status, reorder.status]).toEqual([
		'settled',
		'settled',
		'settled',
	]);
	expect(getIds()).toEqual([second.id, copy, lastCopy]);
	expect(
		OptimisticEffects.get(nodePath)?.items.map((item) => item.sourceIndex),
	).toEqual([0, 1, 2]);
});

test('HMR can arrive before HTTP, including multiple intents from one source write', () => {
	const [first] = OptimisticEffects.getItems(nodePath, definitions);
	const remove = begin({type: 'delete', ids: [first.id]});
	const add = begin({
		type: 'add',
		definition: definitions[0],
		descriptor: effect({amount: 3}),
		index: null,
	});
	const expected = getIds();
	OptimisticEffects.settle(['paste']);
	OptimisticEffects.acknowledge(remove, 'paste');
	OptimisticEffects.acknowledge(add, 'paste');
	expect(remove.status).toBe('settled');
	expect(add.status).toBe('settled');
	expect(getIds()).toEqual(expected);
	expect(OptimisticEffects.get(nodePath)?.operations).toEqual([]);
});

test('a failed insert cancels its dependents and preserves independent later changes', () => {
	const [first, second] = OptimisticEffects.getItems(nodePath, definitions);
	const duplicate = begin({type: 'duplicate', ids: [first.id]});
	const descendant = begin({type: 'duplicate', ids: duplicate.addedIds});
	const removeDescendant = begin({type: 'delete', ids: descendant.addedIds});
	const independent = begin({type: 'delete', ids: [second.id]});
	OptimisticEffects.rollback(duplicate);
	expect(duplicate.status).toBe('failed');
	expect(descendant.status).toBe('cancelled');
	expect(removeDescendant.status).toBe('cancelled');
	expect(independent.status).toBe('queued');
	expect(getIds()).toEqual([first.id]);
	OptimisticEffects.acknowledge(independent, 'independent');
	OptimisticEffects.settle(['independent']);
	expect(
		OptimisticEffects.get(nodePath)?.compiledItems.map((item) => item.id),
	).toEqual([first.id]);
});

test('undo and redo preserve IDs and a descriptor loaded after the history snapshot', () => {
	const before = OptimisticEffects.getItems(nodePath, definitions);
	const add = begin({
		type: 'add',
		definition: definitions[0],
		descriptor: null,
		index: null,
	});
	const after = OptimisticEffects.getItems(nodePath, null);
	OptimisticEffects.setAddedDescriptor(add, effect({amount: 4}));
	const undo = begin({
		type: 'restore',
		movedIds: [],
		fromItems: after,
		items: before,
	});
	expect(getIds()).toEqual(before.map((item) => item.id));
	const redo = begin({
		type: 'restore',
		movedIds: [],
		fromItems: before,
		items: after,
	});
	expect(getIds()).toEqual(after.map((item) => item.id));
	expect(
		amounts(
			OptimisticEffects.projectEffects(nodePath, descriptors, null).effects,
		),
	).toEqual([1, 2, 4]);
	OptimisticEffects.acknowledge(add, 'add');
	OptimisticEffects.acknowledge(undo, 'undo');
	OptimisticEffects.acknowledge(redo, 'redo');
	OptimisticEffects.settle(['redo']);
	expect(getIds()).toEqual(after.map((item) => item.id));
});

test('restores removed runtime descriptors separately for each mounted instance', () => {
	const original = OptimisticEffects.getItems(nodePath, definitions);
	const firstHistory = new Map<string, EffectDescriptor<unknown>>();
	const secondHistory = new Map<string, EffectDescriptor<unknown>>();
	OptimisticEffects.projectEffects(nodePath, descriptors, firstHistory);
	OptimisticEffects.projectEffects(
		nodePath,
		[effect({amount: 10}), effect({amount: 20})],
		secondHistory,
	);
	const remove = begin({type: 'delete', ids: [original[0].id]});
	OptimisticEffects.acknowledge(remove, 'remove');
	OptimisticEffects.settle(['remove']);
	begin({
		type: 'restore',
		movedIds: [],
		fromItems: OptimisticEffects.getItems(nodePath, null),
		items: original,
	});
	expect(
		amounts(
			OptimisticEffects.projectEffects(nodePath, [descriptors[1]], firstHistory)
				.effects,
		),
	).toEqual([1, 2]);
	expect(
		amounts(
			OptimisticEffects.projectEffects(
				nodePath,
				[effect({amount: 20})],
				secondHistory,
			).effects,
		),
	).toEqual([10, 20]);
});

test('copies logical property overrides without making duplicate edits follow the original', () => {
	const [first] = OptimisticEffects.getItems(nodePath, definitions);
	OptimisticEffects.setPropStatuses(nodePath, first.id, staticAmount(3));
	const duplicate = begin({type: 'duplicate', ids: [first.id]});
	OptimisticEffects.setPropStatuses(nodePath, first.id, staticAmount(5));
	expect(
		OptimisticEffects.getPropStatuses(nodePath, duplicate.addedIds[0]),
	).toEqual(staticAmount(3));
	expect(OptimisticEffects.getPropStatuses(nodePath, first.id)).toEqual(
		staticAmount(5),
	);
});

test('moves colliding sibling source paths atomically and updates queued operation targets', () => {
	const nextNode = {...nodePath, nodePath: ['body', 1]};
	const lastNode = {...nodePath, nodePath: ['body', 2]};
	const [first] = OptimisticEffects.getItems(nodePath, definitions);
	const [second] = OptimisticEffects.getItems(nextNode, definitions);
	OptimisticEffects.setPropStatuses(nodePath, first.id, staticAmount(3));
	OptimisticEffects.setPropStatuses(nextNode, second.id, staticAmount(4));
	const duplicate = begin({type: 'duplicate', ids: [first.id]});
	OptimisticEffects.remap([
		{oldNodePath: nodePath, nodePath: nextNode},
		{oldNodePath: nextNode, nodePath: lastNode},
	]);
	expect(OptimisticEffects.getItems(nextNode, null)[0].id).toBe(first.id);
	expect(OptimisticEffects.getItems(lastNode, null)[0].id).toBe(second.id);
	expect(duplicate.nodePath).toBe(nextNode);
	OptimisticEffects.setPropStatuses(nodePath, first.id, staticAmount(5));
	expect(OptimisticEffects.getPropStatuses(nextNode, first.id)).toEqual(
		staticAmount(5),
	);
	expect(OptimisticEffects.getPropStatuses(lastNode, second.id)).toEqual(
		staticAmount(4),
	);
});

test('external invalidation cancels pending effects before accepting new source', () => {
	const [first, second] = OptimisticEffects.getItems(nodePath, definitions);
	const remove = begin({type: 'delete', ids: [first.id]});
	OptimisticEffects.invalidateFile(nodePath.absolutePath);
	expect(remove.status).toBe('cancelled');
	OptimisticEffects.acknowledge(remove, 'late-delete');
	OptimisticEffects.settle(['late-delete']);
	const external = OptimisticEffects.getItems(nodePath, [definitions[1]]);
	expect(external.map((item) => item.definition)).toEqual([definitions[1]]);
	expect(external[0].id).not.toBe(second.id);
});

test('runtime hook immediately follows chained insert, property edit, duplicate and delete', () => {
	const [first] = OptimisticEffects.getItems(nodePath, [definitions[0]]);
	const RenderEffects = () => {
		const projected = useMemoizedEffects({
			effects: [descriptors[0]],
			runtimeValues: null,
			overrideId: 'video',
			videoConfigValues: null,
		});
		return (
			<div data-testid="effects">
				{projected
					.map((item) => (item.params as {amount: number}).amount)
					.join(',')}
			</div>
		);
	};

	const view = render(
		<CanUseRemotionHooks value>
			<RemotionEnvironmentContext
				value={{
					isStudio: true,
					isRendering: false,
					isPlayer: false,
					isReadOnlyStudio: false,
					isClientSideRendering: false,
				}}
			>
				<OverrideIdsToNodePathsGettersContext
					value={{overrideIdToNodePathMappings: {video: nodePath}}}
				>
					<RenderEffects />
				</OverrideIdsToNodePathsGettersContext>
			</RemotionEnvironmentContext>
		</CanUseRemotionHooks>,
	);
	expect(view.getByTestId('effects').textContent).toBe('1');
	let duplicate!: ReturnType<typeof begin>;
	act(() => {
		duplicate = begin({type: 'duplicate', ids: [first.id]});
	});
	expect(view.getByTestId('effects').textContent).toBe('1,1');
	act(() => {
		OptimisticEffects.setPropStatuses(
			nodePath,
			duplicate.addedIds[0],
			staticAmount(3),
		);
	});
	expect(view.getByTestId('effects').textContent).toBe('1,3');
	act(() => {
		begin({type: 'duplicate', ids: duplicate.addedIds});
	});
	expect(view.getByTestId('effects').textContent).toBe('1,3,3');
	act(() => {
		begin({type: 'delete', ids: [first.id, duplicate.addedIds[0]]});
	});
	expect(view.getByTestId('effects').textContent).toBe('3');
});

test('HMR before HTTP keeps surviving effects and resumes live parameters with a queued tail', () => {
	const [first, second] = OptimisticEffects.getItems(nodePath, definitions);
	const history = new Map<string, EffectDescriptor<unknown>>();
	OptimisticEffects.projectEffects(nodePath, descriptors, history);
	const remove = begin({type: 'delete', ids: [first.id]});
	const duplicate = begin({type: 'duplicate', ids: [second.id]});
	OptimisticEffects.projectEffects(nodePath, descriptors, history);
	OptimisticEffects.startSourceMutation(1);
	OptimisticEffects.startRefresh();
	expect(
		amounts(
			OptimisticEffects.projectEffects(
				nodePath,
				[effect({amount: 20})],
				history,
			).effects,
		),
	).toEqual([2, 2]);
	OptimisticEffects.settle(['remove']);
	expect(
		amounts(
			OptimisticEffects.projectEffects(
				nodePath,
				[effect({amount: 21})],
				history,
			).effects,
		),
	).toEqual([2, 2]);
	OptimisticEffects.acknowledge(remove, 'remove');
	expect(duplicate.status).toBe('queued');
	expect(
		amounts(
			OptimisticEffects.projectEffects(
				nodePath,
				[effect({amount: 22})],
				history,
			).effects,
		),
	).toEqual([22, 22]);
	expect(
		amounts(
			OptimisticEffects.projectEffects(
				nodePath,
				[effect({amount: 23})],
				history,
			).effects,
		),
	).toEqual([23, 23]);
});

test('a non-effect receipt releases runtime refresh while effect writes remain queued', () => {
	const [first] = OptimisticEffects.getItems(nodePath, definitions);
	const history = new Map<string, EffectDescriptor<unknown>>();
	OptimisticEffects.projectEffects(nodePath, descriptors, history);
	begin({type: 'duplicate', ids: [first.id]});
	OptimisticEffects.startSourceMutation(1);
	OptimisticEffects.startRefresh();
	OptimisticEffects.settle(['non-effect-source-write']);
	expect(
		amounts(
			OptimisticEffects.projectEffects(
				nodePath,
				[effect({amount: 10}), descriptors[1]],
				history,
			).effects,
		),
	).toEqual([1, 1, 2]);
	OptimisticEffects.acknowledgeMutation('non-effect-source-write');
	expect(
		amounts(
			OptimisticEffects.projectEffects(
				nodePath,
				[effect({amount: 10}), descriptors[1]],
				history,
			).effects,
		),
	).toEqual([10, 10, 2]);
});

test('undo of an independent edit cannot restore a failed insertion or repeat a failed deletion', () => {
	for (const type of ['duplicate', 'delete'] as const) {
		OptimisticEffects.clear();
		const [first, second] = OptimisticEffects.getItems(nodePath, definitions);
		const failed = begin({type, ids: [first.id]});
		const beforeIndependent = OptimisticEffects.getItems(nodePath, null);
		begin({type: 'duplicate', ids: [second.id]});
		const afterIndependent = OptimisticEffects.getItems(nodePath, null);
		begin({
			type: 'restore',
			movedIds: [],
			fromItems: afterIndependent,
			items: beforeIndependent,
		});
		OptimisticEffects.rollback(failed);
		expect(getIds()).toEqual([first.id, second.id]);
	}
});

test('undo of reorder reverses only surviving logical effects', () => {
	const original = OptimisticEffects.getItems(nodePath, definitions);
	const reorder = begin({
		type: 'reorder',
		id: original[1].id,
		beforeId: original[0].id,
	});
	const reordered = OptimisticEffects.getItems(nodePath, null);
	begin({
		type: 'restore',
		movedIds: [original[1].id],
		fromItems: reordered,
		items: original,
	});
	expect(getIds()).toEqual(original.map((item) => item.id));
	OptimisticEffects.rollback(reorder);
	expect(getIds()).toEqual(original.map((item) => item.id));
});

test('one source response acknowledges all paste intents before notifying subscribers', () => {
	const [first] = OptimisticEffects.getItems(nodePath, definitions);
	const remove = begin({type: 'delete', ids: [first.id]});
	const add = begin({
		type: 'add',
		definition: definitions[0],
		descriptor: effect({amount: 4}),
		index: null,
	});
	OptimisticEffects.settle(['paste']);
	const observed: string[][] = [];
	const unsubscribe = OptimisticEffects.subscribe(() => {
		observed.push([remove.status, add.status]);
	});
	OptimisticEffects.acknowledgeOperations([remove, add], 'paste');
	unsubscribe();
	expect(observed).toEqual([['settled', 'settled']]);
});

test('another client refresh cannot leave runtime parameters frozen during later local edits', () => {
	const [first] = OptimisticEffects.getItems(nodePath, definitions);
	const history = new Map<string, EffectDescriptor<unknown>>();
	OptimisticEffects.projectEffects(nodePath, descriptors, history);
	begin({type: 'duplicate', ids: [first.id]});
	OptimisticEffects.startSourceMutation(1);
	OptimisticEffects.startRefresh();
	OptimisticEffects.settle(['another-client-mutation']);
	expect(
		amounts(
			OptimisticEffects.projectEffects(
				nodePath,
				[effect({amount: 5}), descriptors[1]],
				history,
			).effects,
		),
	).toEqual([1, 1, 2]);
	OptimisticEffects.finishSourceMutation(1);
	OptimisticEffects.startSourceMutation(2);
	expect(
		amounts(
			OptimisticEffects.projectEffects(
				nodePath,
				[effect({amount: 5}), descriptors[1]],
				history,
			).effects,
		),
	).toEqual([5, 5, 2]);
});

test('resolved add definitions propagate through duplicates queued before the factory loads', () => {
	const loaded = createEffect<{amount: number}, null>({
		type: 'loaded',
		label: 'Loaded',
		documentationLink: null,
		backend: '2d',
		calculateKey: (params) => String(params.amount),
		setup: () => null,
		apply: () => undefined,
		cleanup: () => undefined,
		schema: {},
		validateParams: () => undefined,
	})({amount: 4});
	OptimisticEffects.getItems(nodePath, definitions);
	const add = begin({
		type: 'add',
		definition: definitions[0],
		descriptor: null,
		index: null,
	});
	const copy = begin({type: 'duplicate', ids: add.addedIds});
	const nested = begin({type: 'duplicate', ids: copy.addedIds});
	OptimisticEffects.setAddedDescriptor(add, loaded);
	expect(
		OptimisticEffects.getItems(nodePath, null)
			.slice(2)
			.map((item) => item.definition),
	).toEqual([loaded.definition, loaded.definition, loaded.definition]);
	const ids = getIds();
	OptimisticEffects.acknowledgeOperations([add, copy, nested], 'all');
	OptimisticEffects.settle(['all']);
	OptimisticEffects.reconcile(nodePath, [
		...definitions,
		loaded.definition,
		loaded.definition,
		loaded.definition,
	]);
	expect(getIds()).toEqual(ids);
});

test('settled history operations keep following their source node when imports move it', () => {
	const before = OptimisticEffects.getItems(nodePath, definitions);
	const duplicate = begin({type: 'duplicate', ids: [before[0].id]});
	const after = OptimisticEffects.getItems(nodePath, null);
	OptimisticEffects.acknowledge(duplicate, 'duplicate');
	OptimisticEffects.settle(['duplicate']);
	const newPath = {...nodePath, nodePath: ['body', 1]};
	OptimisticEffects.remap([{oldNodePath: nodePath, nodePath: newPath}]);
	expect(duplicate.nodePath).toBe(newPath);
	OptimisticEffects.begin({
		nodePath: duplicate.nodePath,
		definitions,
		action: {type: 'restore', fromItems: after, items: before, movedIds: []},
	});
	expect(
		OptimisticEffects.getItems(newPath, null).map((item) => item.id),
	).toEqual(before.map((item) => item.id));
	expect(OptimisticEffects.get(nodePath)).toBeNull();
});

test('undo of a later reorder preserves the rollback of an earlier reorder', () => {
	const original = OptimisticEffects.getItems(nodePath, [
		...definitions,
		definitions[0],
	]);
	const failed = begin({type: 'reorder', id: original[0].id, beforeId: null});
	const before = OptimisticEffects.getItems(nodePath, null);
	begin({type: 'reorder', id: original[1].id, beforeId: null});
	const after = OptimisticEffects.getItems(nodePath, null);
	begin({
		type: 'restore',
		fromItems: after,
		items: before,
		movedIds: [original[1].id],
	});
	OptimisticEffects.rollback(failed);
	expect(getIds()).toEqual(original.map((item) => item.id));
});

test('compiled definitions replace preview definitions without changing settled effect identities', () => {
	const [original] = OptimisticEffects.getItems(nodePath, [definitions[0]]);
	const preview = {
		...descriptors[0],
		definition: {...definitions[0]},
		params: {amount: 4},
	};
	const add = begin({
		type: 'add',
		definition: preview.definition,
		descriptor: preview,
		index: 0,
	});
	const duplicate = begin({type: 'duplicate', ids: add.addedIds});
	const ids = getIds();
	expect(ids).toEqual([add.addedIds[0], duplicate.addedIds[0], original.id]);
	OptimisticEffects.setPropStatuses(nodePath, add.addedIds[0], staticAmount(4));
	OptimisticEffects.setPropStatuses(
		nodePath,
		duplicate.addedIds[0],
		staticAmount(5),
	);
	OptimisticEffects.acknowledgeOperations([add, duplicate], 'installed');
	OptimisticEffects.settle(['installed']);
	OptimisticEffects.reconcile(nodePath, [
		definitions[0],
		definitions[0],
		definitions[0],
	]);
	expect(getIds()).toEqual(ids);
	expect(
		OptimisticEffects.getItems(nodePath, null).map((item) => item.definition),
	).toEqual([definitions[0], definitions[0], definitions[0]]);
	expect(
		OptimisticEffects.getItems(nodePath, null).map((item) => item.propStatuses),
	).toEqual([staticAmount(4), staticAmount(5), null]);
});

test('recreated effect definitions update schemas while retaining each same-type slot', () => {
	const originals = OptimisticEffects.getItems(nodePath, definitions);
	const firstDefinition = {...definitions[0], label: 'Updated first schema'};
	const secondDefinition = {...definitions[1], label: 'Updated second schema'};
	OptimisticEffects.reconcile(nodePath, [firstDefinition, secondDefinition]);
	const reconciled = OptimisticEffects.getItems(nodePath, null);
	expect(reconciled.map((item) => item.id)).toEqual(
		originals.map((item) => item.id),
	);
	expect(reconciled.map((item) => item.definition)).toEqual([
		firstDefinition,
		secondDefinition,
	]);
});
