import {afterEach, expect, test} from 'bun:test';
import type {ResolvedStackLocation, _InternalTypes} from 'remotion';
import {getFolderMenuItems} from '../components/folder-menu-items';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'window',
);

afterEach(() => {
	if (originalWindowDescriptor) {
		Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
	} else {
		Reflect.deleteProperty(globalThis, 'window');
	}
});

test('read-only folder menus keep navigation and copy actions enabled', () => {
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			remotion_cwd: '/project',
			remotion_editorName: 'VS Code',
		},
	});
	const folder = {
		name: 'Nested',
		parent: null,
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
	expect(itemById('copy-folder-file-location').disabled).toBe(false);
	expect(itemById('copy-folder-id').disabled).toBe(false);
	expect(itemById('new-composition-in-folder').disabled).toBe(true);
	expect(itemById('rename-folder').disabled).toBe(true);
	expect(itemById('delete-folder').disabled).toBe(true);
});
