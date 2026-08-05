import {expect, test} from 'bun:test';
import type {ComboboxValue} from '../components/NewComposition/ComboBox';
import {findTypeaheadMenuItem} from '../components/NewComposition/menu-typeahead';

const values: ComboboxValue[] = [
	{type: 'divider', id: 'divider-1'},
	{type: 'section-header', id: 'fruit-header', label: 'Fruit'},
	{
		type: 'item',
		id: 'apple',
		label: 'Apple',
		value: 'apple',
		onClick: () => undefined,
		keyHint: null,
		leftItem: null,
		subMenu: null,
		quickSwitcherLabel: null,
	},
	{
		type: 'item',
		id: 'banana-disabled',
		label: 'Banana',
		value: 'banana',
		onClick: () => undefined,
		keyHint: null,
		leftItem: null,
		subMenu: null,
		quickSwitcherLabel: null,
		disabled: true,
	},
	{
		type: 'item',
		id: 'custom',
		label: 'Not used',
		value: 'fallback',
		onClick: () => undefined,
		keyHint: null,
		leftItem: null,
		subMenu: null,
		quickSwitcherLabel: 'Custom Label',
	},
	{
		type: 'item',
		id: 'label-vs-value',
		label: 'VisibleText',
		value: 'DifferentValue',
		onClick: () => undefined,
		keyHint: null,
		leftItem: null,
		subMenu: null,
		quickSwitcherLabel: null,
	},
];

test('matches string label prefix (case-insensitive)', () => {
	expect(findTypeaheadMenuItem({query: 'ap', values})).toBe('apple');
	expect(findTypeaheadMenuItem({query: 'AP', values})).toBe('apple');
});

test('skips dividers, section headers, and disabled items', () => {
	expect(findTypeaheadMenuItem({query: 'fruit', values})).toBe(null);
	expect(findTypeaheadMenuItem({query: 'ban', values})).toBe(null);
});

test('matches only the visible string label (not value or quickSwitcherLabel)', () => {
	expect(findTypeaheadMenuItem({query: 'custom', values})).toBe(null);
	expect(findTypeaheadMenuItem({query: 'not', values})).toBe('custom');
	expect(findTypeaheadMenuItem({query: 'diff', values})).toBe(null);
	expect(findTypeaheadMenuItem({query: 'vis', values})).toBe('label-vs-value');
});

test('returns null when the query is empty after trim or nothing matches', () => {
	expect(findTypeaheadMenuItem({query: ' ', values})).toBe(null);
	expect(findTypeaheadMenuItem({query: 'zzz', values})).toBe(null);
});
