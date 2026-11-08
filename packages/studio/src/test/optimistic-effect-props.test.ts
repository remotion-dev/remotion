import {afterEach, expect, test} from 'bun:test';
import {
	optimisticAddEffectKeyframe,
	optimisticUpdateForEffectPropStatuses,
} from '@remotion/studio-shared';
import {
	Internals,
	type CanUpdateEffectPropsResponse,
	type CanUpdateSequencePropsResponse,
	type InteractivitySchema,
	type PropStatuses,
	type SequencePropsSubscriptionKey,
} from 'remotion';
import {getProjectedEffectPropStatuses} from '../helpers/optimistic-effect-projection';
import {
	clearIdleOptimisticEffectPropStatuses,
	createOptimisticEffectPropUpdate,
	reconcileOptimisticEffectPropStatuses,
	snapshotOptimisticEffectProps,
} from '../helpers/optimistic-effect-props';

const nodePath: SequencePropsSubscriptionKey = {
	absolutePath: '/project/src/Comp.tsx',
	nodePath: ['body', 0],
	sequenceKeys: [],
	effectKeys: [],
	videoConfigValues: null,
};
const schema = {
	stops: {type: 'number', default: 0, hiddenFromList: false},
	disabled: {type: 'boolean', default: false},
} satisfies InteractivitySchema;
const definition = {
	type: 'test/exposure',
	label: 'Exposure',
	backend: '2d' as const,
	documentationLink: null,
	schema,
	calculateKey: JSON.stringify,
	setup: () => null,
	apply: () => undefined,
	cleanup: () => undefined,
	validateParams: () => undefined,
};
const effectStatus = (
	effectIndex: number,
	value: number,
): CanUpdateEffectPropsResponse => ({
	canUpdate: true,
	effectIndex,
	callee: 'exposure',
	importPath: '@remotion/effects/exposure',
	props: {
		stops: {
			status: 'static',
			codeValue: value,
			keyframeDisplayOffsetAdjustment: null,
		},
	},
});
const statuses = (...values: number[]): CanUpdateSequencePropsResponse => ({
	canUpdate: true,
	props: {},
	durationDependentKeyframes: null,
	effects: values.map((value, index) => effectStatus(index, value)),
});
const createUpdate = (effectIndex: number, value: number) =>
	createOptimisticEffectPropUpdate({
		nodePath,
		effectIndex,
		fieldKey: 'stops',
		schema,
		applyOptimistic: (previous) =>
			optimisticUpdateForEffectPropStatuses({
				previous,
				effectIndex,
				fieldKey: 'stops',
				value,
				schema,
			}),
	});

afterEach(() => Internals.OptimisticEffects.clear());

test('edits a pending duplicate without changing the original or its next sibling', () => {
	const items = Internals.OptimisticEffects.getItems(nodePath, [
		definition,
		definition,
	]);
	const duplicate = Internals.OptimisticEffects.begin({
		nodePath,
		definitions: [definition, definition],
		action: {type: 'duplicate', ids: [items[0].id]},
	});
	const previous = statuses(0.75, 2);
	const update = createUpdate(1, 0.5);
	expect(update.applyOptimistic(previous)).toBe(previous);
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, items[0].id),
	).toBe(null);
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, items[1].id),
	).toBe(null);
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, duplicate.addedIds[0])
			?.stops,
	).toMatchObject({codeValue: 0.5});
	const secondDuplicate = Internals.OptimisticEffects.begin({
		nodePath,
		definitions: [definition, definition],
		action: {type: 'duplicate', ids: duplicate.addedIds},
	});
	expect(
		Internals.OptimisticEffects.getPropStatuses(
			nodePath,
			secondDuplicate.addedIds[0],
		)?.stops,
	).toMatchObject({codeValue: 0.5});
	update.applyResponse(previous, effectStatus(8, 0.5));
	expect(previous).toEqual(statuses(0.75, 2));
});

test('a late response cannot overwrite a newer edit', () => {
	const [item] = Internals.OptimisticEffects.getItems(nodePath, [definition]);
	const previous = statuses(0.75);
	const first = createUpdate(0, 0.5);
	first.applyOptimistic(previous);
	const second = createUpdate(0, 0.25);
	second.applyOptimistic(previous);
	first.applyResponse(previous, effectStatus(0, 0.5));
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)?.stops,
	).toMatchObject({codeValue: 0.25});
	second.rollback();
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)?.stops,
	).toMatchObject({codeValue: 0.5});
});

test('undo and redo remain immediate while a property save is pending', () => {
	const [item] = Internals.OptimisticEffects.getItems(nodePath, [definition]);
	const previous = statuses(0.75);
	const update = createUpdate(0, 0.5);
	update.applyOptimistic(previous);
	const undo = update.restore('undo');
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)?.stops,
	).toMatchObject({codeValue: 0.75});
	update.applyResponse(previous, effectStatus(0, 0.5));
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)?.stops,
	).toMatchObject({codeValue: 0.75});
	undo.acknowledge();
	const redo = update.restore('redo');
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)?.stops,
	).toMatchObject({codeValue: 0.5});
	redo.rollback();
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)?.stops,
	).toMatchObject({codeValue: 0.75});
});

test('retires an overlay only when source status catches up after its write completes', () => {
	const [item] = Internals.OptimisticEffects.getItems(nodePath, [definition]);
	const update = createUpdate(0, 0.5);
	update.applyOptimistic(statuses(0.75));
	reconcileOptimisticEffectPropStatuses(nodePath, statuses(0.5));
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, item.id),
	).not.toBe(null);
	update.acknowledge();
	expect(Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)).toBe(
		null,
	);
});

test('an unattributed refresh clears completed overlays and preserves pending changes', () => {
	const items = Internals.OptimisticEffects.getItems(nodePath, [
		definition,
		definition,
	]);
	const previous = statuses(0.75, 2);
	const first = createUpdate(0, 0.5);
	first.applyOptimistic(previous);
	first.acknowledge();
	const second = createUpdate(1, 0.25);
	second.applyOptimistic(previous);
	clearIdleOptimisticEffectPropStatuses();
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, items[0].id),
	).toBe(null);
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, items[1].id)?.stops,
	).toMatchObject({codeValue: 0.25});
});

test('responses and rollback follow stable IDs through source path remapping', () => {
	const [item] = Internals.OptimisticEffects.getItems(nodePath, [definition]);
	const previous = statuses(0.75);
	const update = createUpdate(0, 0.5);
	update.applyOptimistic(previous);
	const movedNodePath = {...nodePath, nodePath: ['body', 2]};
	Internals.OptimisticEffects.remap([
		{oldNodePath: nodePath, nodePath: movedNodePath},
	]);
	update.applyResponse(previous, effectStatus(0, 0.5));
	expect(
		Internals.OptimisticEffects.getPropStatuses(movedNodePath, item.id)?.stops,
	).toMatchObject({codeValue: 0.5});
	update.rollback();
	expect(
		Internals.OptimisticEffects.getPropStatuses(movedNodePath, item.id),
	).toBe(null);
});

test('keeps duplicate property rows aligned while HMR replaces their source statuses', () => {
	const items = Internals.OptimisticEffects.getItems(nodePath, [
		definition,
		definition,
	]);
	const key = Internals.makeSequencePropsSubscriptionKey(nodePath);
	const sourceStatuses: PropStatuses = {[key]: statuses(0.75, 2)};
	const duplicate = Internals.OptimisticEffects.begin({
		nodePath,
		definitions: [definition, definition],
		action: {type: 'duplicate', ids: [items[0].id]},
	});
	const readValues = (propStatuses: typeof sourceStatuses) =>
		[0, 1, 2].map((effectIndex) => {
			const effect = getProjectedEffectPropStatuses({
				propStatuses,
				nodePath,
				effectIndex,
			});
			return effect.type === 'can-update-effect' ? effect.props.stops : effect;
		});
	const expected = [0.75, 0.75, 2].map((codeValue) => ({
		status: 'static' as const,
		codeValue,
		keyframeDisplayOffsetAdjustment: null,
	}));
	expect(readValues(sourceStatuses)).toEqual(expected);
	Internals.OptimisticEffects.acknowledge(duplicate, 'duplicate-1');
	Internals.OptimisticEffects.settle(['duplicate-1']);
	expect(readValues({})).toEqual(expected);
	expect(readValues(sourceStatuses)).toEqual(expected);
	expect(readValues({[key]: statuses(0.75, 0.25, 2)})).toEqual([
		expected[0],
		{...expected[1], codeValue: 0.25},
		expected[2],
	]);
});

test('a duplicate snapshots existing properties before its original is edited', () => {
	const [item] = Internals.OptimisticEffects.getItems(nodePath, [definition]);
	const previous = statuses(0.75);
	reconcileOptimisticEffectPropStatuses(nodePath, previous);
	snapshotOptimisticEffectProps(nodePath, [item.id]);
	const duplicate = Internals.OptimisticEffects.begin({
		nodePath,
		definitions: [definition],
		action: {type: 'duplicate', ids: [item.id]},
	});
	const update = createUpdate(0, 0.5);
	update.applyOptimistic(previous);
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, duplicate.addedIds[0])
			?.stops,
	).toMatchObject({codeValue: 0.75});
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)?.stops,
	).toMatchObject({codeValue: 0.5});
});

test('keyframing a pending duplicate preserves the original static property', () => {
	const [item] = Internals.OptimisticEffects.getItems(nodePath, [definition]);
	const duplicate = Internals.OptimisticEffects.begin({
		nodePath,
		definitions: [definition],
		action: {type: 'duplicate', ids: [item.id]},
	});
	const previous = statuses(0.75);
	const update = createOptimisticEffectPropUpdate({
		nodePath,
		effectIndex: 1,
		fieldKey: 'stops',
		schema,
		applyOptimistic: (source) =>
			optimisticAddEffectKeyframe({
				previous: source,
				videoConfigValues: null,
				effectIndex: 1,
				fieldKey: 'stops',
				frame: 30,
				value: 0.5,
				schema,
			}),
	});
	expect(update.applyOptimistic(previous)).toBe(previous);
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, duplicate.addedIds[0])
			?.stops,
	).toMatchObject({status: 'keyframed', keyframes: [{frame: 30, value: 0.5}]});
	expect(Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)).toBe(
		null,
	);
	update.restore('undo');
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, duplicate.addedIds[0])
			?.stops,
	).toMatchObject({status: 'static', codeValue: 0.75});
});

test('a source rejection rolls back its own optimistic field', () => {
	const [item] = Internals.OptimisticEffects.getItems(nodePath, [definition]);
	const previous = statuses(0.75);
	const update = createUpdate(0, 0.5);
	update.applyOptimistic(previous);
	update.applyResponse(previous, {
		canUpdate: false,
		effectIndex: 0,
		reason: 'not-found',
	});
	expect(Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)).toBe(
		null,
	);
});

test('consecutive failed saves roll back to the last valid source value', () => {
	const [item] = Internals.OptimisticEffects.getItems(nodePath, [definition]);
	const previous = statuses(0.75);
	const first = createUpdate(0, 0.5);
	first.applyOptimistic(previous);
	const second = createUpdate(0, 0.25);
	second.applyOptimistic(previous);
	first.rollback();
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)?.stops,
	).toMatchObject({codeValue: 0.25});
	second.rollback();
	expect(Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)).toBe(
		null,
	);
});

test('replaces placeholder defaults with loaded parameters before the HMR handoff', () => {
	const add = Internals.OptimisticEffects.begin({
		nodePath,
		definitions: [],
		action: {
			type: 'add',
			definition: {...definition, schema: {}},
			descriptor: null,
			index: null,
		},
	});
	const propStatuses = {
		[Internals.makeSequencePropsSubscriptionKey(nodePath)]: statuses(),
	};
	const read = () =>
		getProjectedEffectPropStatuses({propStatuses, nodePath, effectIndex: 0});
	expect(read()).toMatchObject({type: 'can-update-effect', props: {}});
	Internals.OptimisticEffects.setAddedDescriptor(add, {
		definition,
		params: {stops: 0.25},
		effectKey: '0.25',
		memoized: false,
	});
	expect(read()).toMatchObject({
		type: 'can-update-effect',
		props: {stops: {status: 'static', codeValue: 0.25}},
	});
	Internals.OptimisticEffects.acknowledge(add, 'loaded-effect');
	Internals.OptimisticEffects.settle(['loaded-effect']);
	expect(read()).toMatchObject({
		type: 'can-update-effect',
		props: {stops: {status: 'static', codeValue: 0.25}},
	});
});

test('failed saves retire inherited duplicate values but preserve explicit child edits', () => {
	const [original] = Internals.OptimisticEffects.getItems(nodePath, [
		definition,
	]);
	const previous = statuses(0.75);
	reconcileOptimisticEffectPropStatuses(nodePath, previous);
	const update = createUpdate(0, 0.5);
	update.applyOptimistic(previous);
	snapshotOptimisticEffectProps(nodePath, [original.id]);
	const duplicate = Internals.OptimisticEffects.begin({
		nodePath,
		definitions: [],
		action: {type: 'duplicate', ids: [original.id]},
	});
	const grandchild = Internals.OptimisticEffects.begin({
		nodePath,
		definitions: [],
		action: {type: 'duplicate', ids: duplicate.addedIds},
	});
	const explicit = createUpdate(2, 0.25);
	explicit.applyOptimistic(previous);
	update.rollback();
	expect(
		Internals.OptimisticEffects.getPropStatuses(nodePath, duplicate.addedIds[0])
			?.stops,
	).toBeUndefined();
	expect(
		Internals.OptimisticEffects.getPropStatuses(
			nodePath,
			grandchild.addedIds[0],
		)?.stops,
	).toMatchObject({codeValue: 0.25});
	explicit.rollback();
	expect(
		Internals.OptimisticEffects.getPropStatuses(
			nodePath,
			grandchild.addedIds[0],
		)?.stops,
	).toBeUndefined();
	Internals.OptimisticEffects.acknowledge(duplicate, 'inherited-duplicate');
	Internals.OptimisticEffects.acknowledge(grandchild, 'inherited-grandchild');
	Internals.OptimisticEffects.settle([
		'inherited-duplicate',
		'inherited-grandchild',
	]);
	reconcileOptimisticEffectPropStatuses(nodePath, statuses(0.75, 0.75, 0.75));
	for (const item of Internals.OptimisticEffects.getItems(nodePath, null)) {
		expect(
			Internals.OptimisticEffects.getPropStatuses(nodePath, item.id)?.stops,
		).toBeUndefined();
	}
});
