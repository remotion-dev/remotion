import {expect, test} from 'bun:test';
import type {Menu} from '../components/Menu/MenuItem';
import type {ComboboxValue} from '../components/NewComposition/ComboBox';
import {makeSearchResults} from '../helpers/use-menu-structure';

test('nested actions with the same item ID have unique search result keys', () => {
	const openInEditor: ComboboxValue = {
		id: 'open-in-editor',
		value: 'open-in-editor',
		label: 'Editor',
		quickSwitcherLabel: 'Editor',
		type: 'item',
		onClick: () => undefined,
		keyHint: null,
		leftItem: null,
		subMenu: null,
	};
	const menu: Menu = {
		id: 'composition',
		label: 'Composition',
		leaveLeftPadding: false,
		items: ['Open composition in...', 'Open component in...'].map(
			(label, index): ComboboxValue => ({
				id: index === 0 ? 'open-composition-in' : 'open-component-in',
				value: index === 0 ? 'open-composition-in' : 'open-component-in',
				label,
				quickSwitcherLabel: null,
				type: 'item',
				onClick: () => undefined,
				keyHint: null,
				leftItem: null,
				subMenu: {
					items: [openInEditor],
					leaveLeftSpace: true,
					preselectIndex: false,
				},
			}),
		),
	};

	const results = makeSearchResults([menu], () => undefined);
	expect(results.map((result) => result.title)).toEqual([
		'Open composition in...: Editor',
		'Open component in...: Editor',
	]);
	expect(new Set(results.map((result) => result.id)).size).toBe(results.length);
});
