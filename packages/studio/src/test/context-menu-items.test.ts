import {describe, expect, test} from 'bun:test';
import {
	resolveContextMenuItems,
	type ContextMenuItemsFactory,
} from '../components/ContextMenu';
import type {ComboboxValue} from '../components/NewComposition/ComboBox';

const item: ComboboxValue = {
	type: 'item',
	id: 'item',
	keyHint: null,
	label: 'Item',
	leftItem: null,
	disabled: false,
	onClick: () => undefined,
	quickSwitcherLabel: null,
	subMenu: null,
	value: 'item',
};

describe('resolveContextMenuItems()', () => {
	test('calculates synchronous items only when invoked', async () => {
		let calls = 0;
		const getItems: ContextMenuItemsFactory = () => {
			calls++;
			return [item];
		};

		expect(calls).toBe(0);
		expect(await resolveContextMenuItems(getItems, {} as MouseEvent)).toEqual([
			item,
		]);
		expect(calls).toBe(1);
	});

	test('awaits asynchronous items', async () => {
		const getItems: ContextMenuItemsFactory = async () => {
			await Promise.resolve();

			return [item];
		};

		expect(await resolveContextMenuItems(getItems, {} as MouseEvent)).toEqual([
			item,
		]);
	});

	test('preserves cancellation and empty-menu behavior', async () => {
		expect(
			await resolveContextMenuItems(() => false, {} as MouseEvent),
		).toBeNull();
		expect(
			await resolveContextMenuItems(() => [], {} as MouseEvent),
		).toBeNull();
	});

	test('uses eligibility from invocation time', async () => {
		let currentFrame = 5;
		const getItems: ContextMenuItemsFactory = () => [
			{
				...item,
				disabled: currentFrame < 10,
			},
		];

		currentFrame = 10;
		const result = await resolveContextMenuItems(getItems, {} as MouseEvent);
		expect(result?.[0]?.type).toBe('item');
		if (result?.[0]?.type !== 'item') {
			throw new Error('Expected a context menu item');
		}

		expect(result[0].disabled).toBe(false);
	});
});
