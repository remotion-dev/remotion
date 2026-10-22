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
		id: 'nested-folder',
		label: null,
		value: 'new-composition-folder-SocialMediaAnnouncements/webmcp',
		onClick: () => undefined,
		keyHint: null,
		leftItem: null,
		subMenu: null,
		quickSwitcherLabel: 'webmcp',
	},
	{
		type: 'item',
		id: 'root-folder',
		label: null,
		value: 'new-composition-root-folder',
		onClick: () => undefined,
		keyHint: null,
		leftItem: null,
		subMenu: null,
		quickSwitcherLabel: 'None',
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

test('uses the visible string label, falling back for non-string labels', () => {
	expect(findTypeaheadMenuItem({query: 'web', values})).toBe('nested-folder');
	expect(findTypeaheadMenuItem({query: 'social', values})).toBe(null);
	expect(findTypeaheadMenuItem({query: 'n', values})).toBe('root-folder');
	expect(findTypeaheadMenuItem({query: 'diff', values})).toBe(null);
	expect(findTypeaheadMenuItem({query: 'vis', values})).toBe('label-vs-value');
});

test('returns null when the query is empty after trim or nothing matches', () => {
	expect(findTypeaheadMenuItem({query: ' ', values})).toBe(null);
	expect(findTypeaheadMenuItem({query: 'zzz', values})).toBe(null);
});
