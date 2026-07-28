import {expect, test} from 'bun:test';
import {
	getAssetActionAvailability,
	getCanDragAsset,
	getAssetContextMenuItems,
} from '../components/AssetSelectorItem';

const noop = () => undefined;

const getItem = (
	items: ReturnType<typeof getAssetContextMenuItems>,
	id: string,
) => {
	const item = items.find((candidate) => candidate.id === id);
	if (!item || item.type !== 'item') {
		throw new Error(`Could not find menu item ${id}`);
	}

	return item;
};

test('keeps copy and open-in-new-window asset actions enabled in read-only Studio', () => {
	const availability = getAssetActionAvailability({
		browserStudioCanMutateAssets: null,
		readOnlyStudio: true,
		connectionStatus: 'init',
		publicFolderExists: '/project/public',
	});
	const items = getAssetContextMenuItems({
		relativePath: 'nested/video.mp4',
		fileManagerName: 'Finder',
		copyFileName: noop,
		copyStaticFilePath: noop,
		openAssetInExplorer: noop,
		renameAsset: noop,
		deleteAsset: noop,
		...availability,
	});

	expect(getItem(items, 'open-in-new-window').disabled).not.toBe(true);
	expect(getItem(items, 'copy-asset-file-name').disabled).not.toBe(true);
	expect(getItem(items, 'copy-asset-static-file-path').disabled).not.toBe(true);
	expect(getItem(items, 'open-asset-in-explorer').disabled).toBe(true);
	expect(getItem(items, 'rename-asset').disabled).toBe(true);
	expect(getItem(items, 'delete-asset').disabled).toBe(true);
});

test('only offers file-manager actions when a local public folder is available', () => {
	const availability = getAssetActionAvailability({
		browserStudioCanMutateAssets: null,
		readOnlyStudio: true,
		connectionStatus: 'init',
		publicFolderExists: null,
	});

	expect(availability.fileExplorerDisabled).toBe(true);
});

test('disables asset mutations while an editable Studio is disconnected', () => {
	const availability = getAssetActionAvailability({
		browserStudioCanMutateAssets: null,
		readOnlyStudio: false,
		connectionStatus: 'disconnected',
		publicFolderExists: '/project/public',
	});

	expect(availability).toEqual({
		fileExplorerDisabled: true,
		mutationsDisabled: true,
	});
});

test('enables supported Browser Studio asset mutations', () => {
	const availability = getAssetActionAvailability({
		browserStudioCanMutateAssets: true,
		readOnlyStudio: true,
		connectionStatus: 'connected',
		publicFolderExists: '/public',
	});

	expect(availability).toEqual({
		fileExplorerDisabled: true,
		mutationsDisabled: false,
	});
});

test('disables drag insertion in read-only Studio', () => {
	expect(
		getCanDragAsset({
			readOnlyStudio: true,
			relativePath: 'nested/video.mp4',
		}),
	).toBe(false);
	expect(
		getCanDragAsset({
			readOnlyStudio: false,
			relativePath: 'nested/video.mp4',
		}),
	).toBe(true);
});
