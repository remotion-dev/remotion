import {expect, test} from 'bun:test';
import type {ComboboxValue} from '../components/NewComposition/ComboBox';
import {getRootCompositionMenuItems} from '../components/root-composition-menu-items';
import type {CompositionSortOrder} from '../state/folders';
import type {ModalState} from '../state/modals';

const creationItems = (items: ComboboxValue[]) =>
	items.filter(
		(item) =>
			item.id === 'new-root-composition' || item.id === 'new-root-folder',
	);

test('root composition menu creates compositions and folders at the root', () => {
	const selectedModals: (ModalState | null)[] = [];
	const items = getRootCompositionMenuItems({
		connectionStatus: 'connected',
		readOnlyStudio: false,
		setSelectedModal: (modal) => {
			if (typeof modal === 'function') {
				selectedModals.push(modal(null));
				return;
			}

			selectedModals.push(modal);
		},
		compositionSortOrder: 'registration',
		setCompositionSortOrder: () => undefined,
	});

	const newComposition = items.find(
		(item) => item.id === 'new-root-composition',
	);
	const newFolder = items.find((item) => item.id === 'new-root-folder');

	if (newComposition?.type !== 'item' || newFolder?.type !== 'item') {
		throw new Error('Expected root creation menu items');
	}

	newComposition.onClick(newComposition.id, null);
	newFolder.onClick(newFolder.id, null);

	expect(selectedModals).toEqual([
		{
			type: 'new-comp',
			folderName: null,
			parentName: null,
			stack: null,
			canvasCapture: null,
		},
		{type: 'new-folder', parentName: null, stack: null},
	]);
});

test('root creation menu is disabled in read-only Studio', () => {
	const items = getRootCompositionMenuItems({
		connectionStatus: 'connected',
		readOnlyStudio: true,
		setSelectedModal: () => undefined,
		compositionSortOrder: 'registration',
		setCompositionSortOrder: () => undefined,
	});

	expect(
		creationItems(items).every(
			(item) => item.type === 'item' && item.disabled === true,
		),
	).toBe(true);
});

test('root creation menu is disabled while the preview server is disconnected', () => {
	const items = getRootCompositionMenuItems({
		connectionStatus: 'disconnected',
		readOnlyStudio: false,
		setSelectedModal: () => undefined,
		compositionSortOrder: 'registration',
		setCompositionSortOrder: () => undefined,
	});

	expect(
		creationItems(items).every(
			(item) => item.type === 'item' && item.disabled === true,
		),
	).toBe(true);
});

test('root composition menu switches the sort order and is usable read-only', () => {
	const sortOrders: CompositionSortOrder[] = [];
	const items = getRootCompositionMenuItems({
		connectionStatus: 'disconnected',
		readOnlyStudio: true,
		setSelectedModal: () => undefined,
		compositionSortOrder: 'registration',
		setCompositionSortOrder: (sortOrder) => sortOrders.push(sortOrder),
	});

	const sortBy = items.find((item) => item.id === 'sort-compositions');
	if (sortBy?.type !== 'item' || sortBy.subMenu === null) {
		throw new Error('Expected a sort submenu');
	}

	expect(sortBy.disabled).toBe(undefined);
	expect(sortBy.subMenu.preselectIndex).toBe(0);

	for (const item of sortBy.subMenu.items) {
		if (item.type !== 'item') {
			continue;
		}

		item.onClick(item.id, null);
	}

	expect(sortOrders).toEqual(['registration', 'alphabetical']);
});
