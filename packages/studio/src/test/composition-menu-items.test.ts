import {afterEach, expect, test} from 'bun:test';
import type {_InternalTypes} from 'remotion';
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

test('composition context menus do not include New', () => {
	installTestWindow();

	const items = getCompositionContextMenuItems({
		...commonArgs,
		includeCompositionManagementItems: true,
	});

	expect(ids(items)).not.toContain('new');
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
		'copy-id-divider',
		'copy-id',
	]);
});

test('the main composition menu still includes New', () => {
	installTestWindow();

	const items = getCompositionMenuItems({
		...commonArgs,
		includeCompositionManagementItems: true,
		includeNewCompositionItem: true,
	});

	expect(ids(items)).toContain('new');
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
