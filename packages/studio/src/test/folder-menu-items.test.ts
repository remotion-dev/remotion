import {afterEach, expect, test} from 'bun:test';
import type {ResolvedStackLocation, _InternalTypes} from 'remotion';
import {getFolderMenuItems} from '../components/folder-menu-items';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'window',
);
const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'navigator',
);

afterEach(() => {
	if (originalWindowDescriptor) {
		Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
	} else {
		Reflect.deleteProperty(globalThis, 'window');
	}

	if (originalNavigatorDescriptor) {
		Object.defineProperty(globalThis, 'navigator', originalNavigatorDescriptor);
	} else {
		Reflect.deleteProperty(globalThis, 'navigator');
	}
});

test('read-only folder menus keep navigation and copy actions enabled', () => {
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			remotion_cwd: '/project',
			remotion_editorName: 'Code',
		},
	});
	const copiedTexts: string[] = [];
	Object.defineProperty(globalThis, 'navigator', {
		configurable: true,
		value: {
			clipboard: {
				writeText: (text: string) => {
					copiedTexts.push(text);
					return Promise.resolve();
				},
			},
		},
	});
	const folder = {
		name: 'Nested',
		parent: 'Parent',
		stack: 'stack',
	} as _InternalTypes['TFolder'];
	const resolvedLocation: ResolvedStackLocation = {
		column: 1,
		line: 10,
		source: '/project/src/Root.tsx',
	};
	const items = getFolderMenuItems({
		closeMenu: () => undefined,
		connectionStatus: 'connected',
		editorId: 'vscode',
		editorName: 'Code',
		folder,
		readOnlyStudio: true,
		resolvedLocation,
		setSelectedModal: () => undefined,
	});
	const itemById = (id: string) => {
		const item = items.find((candidate) => candidate.id === id);
		if (item?.type !== 'item') {
			throw new Error(`Expected ${id} to be a menu item`);
		}

		return item;
	};

	expect(itemById('show-folder-in-editor').disabled).toBe(false);
	const copyContextItem = itemById('copy-context-for-agents');
	expect(copyContextItem.disabled).toBe(false);
	copyContextItem.onClick('copy-context-for-agents', null);
	expect(copiedTexts).toEqual(['Parent/Nested in src/Root.tsx:10']);
	expect(itemById('copy-folder-file-location').disabled).toBe(false);
	expect(itemById('copy-folder-id').disabled).toBe(false);
	expect(itemById('new-composition-in-folder').disabled).toBe(true);
	expect(itemById('rename-folder').disabled).toBe(true);
	expect(itemById('delete-folder').disabled).toBe(true);
});
