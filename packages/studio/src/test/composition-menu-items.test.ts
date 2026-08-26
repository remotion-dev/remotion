import {afterEach, expect, mock, test} from 'bun:test';
import type {_InternalTypes, ResolvedStackLocation} from 'remotion';
import {
	getCompositionContextMenuItems,
	getCompositionMenuItems,
} from '../components/composition-menu-items';

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
			remotion_editorName: 'Code',
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
	editorId: 'vscode' as const,
	editorName: 'Code',
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
		editorId: null,
		editorName: null,
		includeCompositionManagementItems: false,
	});

	expect(ids(items)).toEqual([
		'open-in-new-window',
		'open-in-new-window-divider',
		'copy-context-for-agents',
		'copy-file-location',
		'copy-id',
	]);
	const copyContext = items.find(
		(item) => item.id === 'copy-context-for-agents',
	);
	if (copyContext?.type !== 'item') {
		throw new Error('Expected copy context to be a menu item');
	}

	expect(copyContext.disabled).toBe(true);
});

test('copy actions are adjacent', () => {
	installTestWindow();

	const items = getCompositionMenuItems({
		...commonArgs,
		includeCompositionManagementItems: true,
	});
	const copyContextIndex = items.findIndex(
		(item) => item.id === 'copy-context-for-agents',
	);
	const copyFileLocationIndex = items.findIndex(
		(item) => item.id === 'copy-file-location',
	);
	const copyIdIndex = items.findIndex((item) => item.id === 'copy-id');

	expect(copyFileLocationIndex).toBe(copyContextIndex + 1);
	expect(copyIdIndex).toBe(copyFileLocationIndex + 1);
});

test('copies composition context for agents', async () => {
	installTestWindow();
	const writeText = mock(() => Promise.resolve());
	Object.defineProperty(globalThis, 'navigator', {
		configurable: true,
		value: {clipboard: {writeText}},
	});

	const items = getCompositionMenuItems({
		...commonArgs,
		includeCompositionManagementItems: false,
		resolvedLocation,
	});
	const copyContext = items.find(
		(item) => item.id === 'copy-context-for-agents',
	);
	if (copyContext?.type !== 'item') {
		throw new Error('Expected copy context to be a menu item');
	}

	copyContext.onClick(copyContext.id, null);
	await Promise.resolve();
	expect(writeText).toHaveBeenCalledWith(
		'ConnectedComposition in src/Composition.tsx:10',
	);
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

	expect(compositionItem.label).toBe('Open composition in Code');
	expect(componentItem.label).toBe('Open component in Code');
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
	expect(itemById('copy-context-for-agents').disabled).toBe(false);
	expect(itemById('copy-file-location').disabled).toBe(false);
	expect(itemById('copy-id').disabled).toBe(false);
	expect(itemById('rename').disabled).toBe(true);
	expect(itemById('duplicate').disabled).toBe(true);
	expect(itemById('delete').disabled).toBe(true);
});
