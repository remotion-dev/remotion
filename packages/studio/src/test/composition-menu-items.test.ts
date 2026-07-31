import {afterEach, expect, test} from 'bun:test';
import type {_InternalTypes} from 'remotion';
import type {ResolvedStackLocation} from 'remotion';
import {
	getCompositionContextMenuItems,
	getCompositionMenuItems,
} from '../components/composition-menu-items';

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

const installTestWindow = () => {
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			remotion_cwd: '/project',
			remotion_editorName: null,
		},
	});
};

const installTestWindowWithEditor = () => {
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			remotion_cwd: '/project',
			remotion_editorName: 'VS Code',
		},
	});
};

const composition = {
	id: 'ConnectedComposition',
	durationInFrames: 100,
} as _InternalTypes['AnyComposition'];

const resolvedLocation: ResolvedStackLocation = {
	column: 1,
	line: 10,
	source: '/project/src/Composition.tsx',
};

const commonArgs = {
	closeMenu: () => undefined,
	composition,
	connectionStatus: 'connected' as const,
	readOnlyStudio: false,
	resolvedLocation: null,
	setSelectedModal: () => undefined,
};

const ids = (items: ReturnType<typeof getCompositionMenuItems>) =>
	items.map((item) => item.id);

test('composition menus exclude creation and include management actions', () => {
	installTestWindow();

	const menuItems = getCompositionMenuItems({
		...commonArgs,
		includeCompositionManagementItems: true,
	});
	const items = getCompositionContextMenuItems({
		...commonArgs,
		includeCompositionManagementItems: true,
	});

	expect(ids(menuItems)).not.toContain('new');
	expect(ids(items)).toContain('rename');
	expect(ids(items)).toContain('duplicate');
	expect(ids(items)).toContain('delete');
});

test('connected composition context menus omit management actions', () => {
	installTestWindow();

	const items = getCompositionContextMenuItems({
		...commonArgs,
		includeCompositionManagementItems: false,
	});

	expect(ids(items)).toEqual([
		'open-in-new-window',
		'open-in-new-window-divider',
		'copy-file-location',
		'copy-id',
	]);
});

test('copy actions are adjacent', () => {
	installTestWindow();

	const items = getCompositionMenuItems({
		...commonArgs,
		includeCompositionManagementItems: true,
	});
	const copyFileLocationIndex = items.findIndex(
		(item) => item.id === 'copy-file-location',
	);
	const copyIdIndex = items.findIndex((item) => item.id === 'copy-id');

	expect(copyIdIndex).toBe(copyFileLocationIndex + 1);
});

test('editor actions use Open labels and are adjacent', () => {
	installTestWindowWithEditor();

	const items = getCompositionContextMenuItems({
		...commonArgs,
		includeCompositionManagementItems: false,
	});
	const compositionIndex = items.findIndex(
		(item) => item.id === 'show-in-editor',
	);
	const componentIndex = items.findIndex(
		(item) => item.id === 'open-component-in-editor',
	);

	expect(componentIndex).toBe(compositionIndex + 1);
	const compositionItem = items[compositionIndex];
	const componentItem = items[componentIndex];
	if (compositionItem.type !== 'item' || componentItem.type !== 'item') {
		throw new Error('Expected editor actions');
	}

	expect(compositionItem.label).toBe('Open composition in VS Code');
	expect(componentItem.label).toBe('Open component in VS Code');
});

test('read-only composition menus keep navigation and copy actions enabled', () => {
	installTestWindowWithEditor();

	const items = getCompositionContextMenuItems({
		...commonArgs,
		includeCompositionManagementItems: true,
		readOnlyStudio: true,
		resolvedLocation,
	});
	const itemById = (id: string) => {
		const item = items.find((candidate) => candidate.id === id);
		if (item?.type !== 'item') {
			throw new Error(`Expected ${id} to be a menu item`);
		}

		return item;
	};

	expect(itemById('open-in-new-window').disabled).not.toBe(true);
	expect(itemById('show-in-editor').disabled).toBe(false);
	expect(itemById('open-component-in-editor').disabled).toBe(false);
	expect(itemById('copy-file-location').disabled).toBe(false);
	expect(itemById('copy-id').disabled).toBe(false);
	expect(itemById('rename').disabled).toBe(true);
	expect(itemById('duplicate').disabled).toBe(true);
	expect(itemById('delete').disabled).toBe(true);
});
