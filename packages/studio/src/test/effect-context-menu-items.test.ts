import {describe, expect, test} from 'bun:test';
import {
	getMultiEffectContextMenuItems,
	getMultiSelectedEffects,
} from '../components/Timeline/get-effect-context-menu-items';
import type {TimelineSelection} from '../components/Timeline/TimelineSelection';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';

const nodePathInfo = {} as SequenceNodePathInfo;
const effect = (i: number) =>
	({
		type: 'sequence-effect',
		nodePathInfo,
		i,
	}) as const;

describe('getMultiSelectedEffects()', () => {
	test('returns the effects when several effects are selected', () => {
		const selection = [effect(0), effect(2)];
		expect(getMultiSelectedEffects(selection)).toEqual(selection);
	});

	test('returns null for a single effect', () => {
		expect(getMultiSelectedEffects([effect(0)])).toBeNull();
	});

	test('returns null when the selection mixes effects with other items', () => {
		expect(
			getMultiSelectedEffects([
				effect(0),
				{type: 'sequence', nodePathInfo} satisfies TimelineSelection,
			]),
		).toBeNull();
	});
});

describe('getMultiEffectContextMenuItems()', () => {
	test('offers copy context, duplicate and delete for all selected effects', () => {
		const calls: string[] = [];
		const items = getMultiEffectContextMenuItems({
			selectedEffectCount: 3,
			getContextForAgents: () => Promise.resolve(null),
			disabled: false,
			onDuplicateSelectedEffects: () => calls.push('duplicate'),
			onDeleteSelectedEffects: () => calls.push('delete'),
		});

		const menuItems = items.filter((item) => item.type === 'item');
		expect(menuItems.map((item) => item.label)).toEqual([
			'Copy context for agents',
			'Duplicate selected',
			'Delete 3 effects',
		]);

		menuItems[1].onClick('duplicate-selected-effects', null);
		menuItems[2].onClick('delete-selected-effects', null);
		expect(calls).toEqual(['duplicate', 'delete']);
	});

	test('disables duplicate and delete when effects cannot be edited', () => {
		const items = getMultiEffectContextMenuItems({
			selectedEffectCount: 2,
			getContextForAgents: () => Promise.resolve(null),
			disabled: true,
			onDuplicateSelectedEffects: () => undefined,
			onDeleteSelectedEffects: () => undefined,
		});

		expect(
			items.flatMap((item) =>
				item.type === 'item' && item.id !== 'copy-context-for-agents'
					? [item.disabled]
					: [],
			),
		).toEqual([true, true]);
	});
});
