import {expect, test} from 'bun:test';
import {getRootCompositionMenuItems} from '../components/root-composition-menu-items';
import type {ModalState} from '../state/modals';

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
		},
		{type: 'new-folder', parentName: null, stack: null},
	]);
});

test('root creation menu is disabled in read-only Studio', () => {
	const items = getRootCompositionMenuItems({
		connectionStatus: 'connected',
		readOnlyStudio: true,
		setSelectedModal: () => undefined,
	});

	expect(
		items.every((item) => item.type === 'item' && item.disabled === true),
	).toBe(true);
});

test('root creation menu is disabled while the preview server is disconnected', () => {
	const items = getRootCompositionMenuItems({
		connectionStatus: 'disconnected',
		readOnlyStudio: false,
		setSelectedModal: () => undefined,
	});

	expect(
		items.every((item) => item.type === 'item' && item.disabled === true),
	).toBe(true);
});
