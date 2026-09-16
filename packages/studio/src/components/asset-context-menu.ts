import {useCallback, useContext} from 'react';
import {NoReactInternals} from 'remotion/no-react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {copyText} from '../helpers/copy-text';
import {getFileManagerName} from '../helpers/get-file-manager-name';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import {openInRemotionConvert} from '../helpers/open-in-remotion-convert';
import {SetSelectedModalContext} from '../state/modals';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {getOpenInNewWindowMenuItem} from './open-in-new-window';
import {openInFileExplorer} from './RenderQueue/actions';
import {useDeleteAsset} from './use-delete-asset';

export const getAssetActionAvailability = ({
	browserStudioCanMutateAssets,
	readOnlyStudio,
	connectionStatus,
	publicFolderExists,
}: {
	browserStudioCanMutateAssets: boolean | null;
	readOnlyStudio: boolean;
	connectionStatus: 'init' | 'connected' | 'disconnected';
	publicFolderExists: string | null;
}) => {
	return {
		mutationsDisabled:
			browserStudioCanMutateAssets !== true &&
			(readOnlyStudio || connectionStatus !== 'connected'),
		fileExplorerDisabled:
			browserStudioCanMutateAssets !== null ||
			publicFolderExists === null ||
			readOnlyStudio ||
			connectionStatus !== 'connected',
	};
};

export const getAssetContextMenuItems = ({
	relativePath,
	fileManagerName,
	copyFileName,
	copyStaticFilePath,
	copyAbsolutePath,
	openAssetInConvert,
	openAssetInExplorer,
	renameAsset,
	deleteAsset,
	fileExplorerAvailable,
	fileExplorerDisabled,
	mutationsDisabled,
}: {
	relativePath: string;
	fileManagerName: string;
	copyFileName: () => void;
	copyStaticFilePath: () => void;
	copyAbsolutePath: (() => void) | null;
	openAssetInConvert: () => void;
	openAssetInExplorer: () => void;
	renameAsset: () => void;
	deleteAsset: () => void;
	fileExplorerAvailable: boolean;
	fileExplorerDisabled: boolean;
	mutationsDisabled: boolean;
}): ComboboxValue[] => {
	const previewFileType = getPreviewFileType(relativePath);
	const canOpenInConvert =
		previewFileType === 'audio' || previewFileType === 'video';
	const items: (ComboboxValue | null)[] = [
		getOpenInNewWindowMenuItem(`/assets/${relativePath}`),
		canOpenInConvert
			? {
					id: 'open-asset-in-convert',
					keyHint: null,
					label: 'Open in Remotion Convert',
					leftItem: null,
					onClick: openAssetInConvert,
					quickSwitcherLabel: 'Open asset in Remotion Convert',
					subMenu: null,
					type: 'item',
					value: 'open-asset-in-convert',
				}
			: null,
		{
			type: 'divider',
			id: 'open-in-new-window-divider',
		},
		{
			id: 'copy-asset-file-name',
			keyHint: null,
			label: 'Copy file name',
			leftItem: null,
			onClick: copyFileName,
			quickSwitcherLabel: 'Copy asset file name',
			subMenu: null,
			type: 'item',
			value: 'copy-asset-file-name',
		},
		{
			id: 'copy-asset-static-file-path',
			keyHint: null,
			label: 'Copy staticFile() path',
			leftItem: null,
			onClick: copyStaticFilePath,
			quickSwitcherLabel: 'Copy staticFile() path',
			subMenu: null,
			type: 'item',
			value: 'copy-asset-static-file-path',
		},
		copyAbsolutePath
			? {
					id: 'copy-asset-absolute-path',
					keyHint: null,
					label: 'Copy absolute path',
					leftItem: null,
					onClick: copyAbsolutePath,
					quickSwitcherLabel: 'Copy asset absolute path',
					subMenu: null,
					type: 'item',
					value: 'copy-asset-absolute-path',
				}
			: null,
		{
			type: 'divider',
			id: 'asset-file-actions-divider',
		},
		fileExplorerAvailable
			? {
					id: 'open-asset-in-explorer',
					keyHint: null,
					label: `Show in ${fileManagerName}`,
					leftItem: null,
					onClick: openAssetInExplorer,
					quickSwitcherLabel: `Show asset in ${fileManagerName}`,
					subMenu: null,
					type: 'item',
					value: 'open-asset-in-explorer',
					disabled: fileExplorerDisabled,
				}
			: null,
		{
			id: 'rename-asset',
			keyHint: null,
			label: 'Rename...',
			leftItem: null,
			onClick: renameAsset,
			quickSwitcherLabel: 'Rename asset...',
			subMenu: null,
			type: 'item',
			value: 'rename-asset',
			disabled: mutationsDisabled,
		},
		{
			id: 'delete-asset',
			keyHint: null,
			label: 'Delete...',
			leftItem: null,
			onClick: deleteAsset,
			quickSwitcherLabel: 'Delete asset...',
			subMenu: null,
			type: 'item',
			value: 'delete-asset',
			disabled: mutationsDisabled,
		},
	];

	return items.filter(NoReactInternals.truthy);
};

export const useAssetContextMenuItems = ({
	relativePath,
	readOnlyStudio,
}: {
	relativePath: string | null;
	readOnlyStudio: boolean;
}) => {
	const fileManagerName = getFileManagerName(
		window.remotion_fileSystemPlatform,
	);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const fileName = relativePath?.split('/').pop() ?? null;

	const copyFileName = useCallback(() => {
		if (fileName === null) {
			return;
		}

		copyText(fileName)
			.then(() => {
				showNotification(`Copied '${fileName}' to clipboard`, 1000);
			})
			.catch((err) => {
				showNotification(`Could not copy: ${err.message}`, 2000);
			});
	}, [fileName]);

	const copyStaticFilePath = useCallback(() => {
		if (relativePath === null) {
			return;
		}

		const content = `staticFile("${relativePath}")`;
		copyText(content)
			.then(() => {
				showNotification(`Copied '${content}' to clipboard`, 1000);
			})
			.catch((err) => {
				showNotification(`Could not copy: ${err.message}`, 2000);
			});
	}, [relativePath]);

	const copyAbsolutePath = useCallback(() => {
		if (relativePath === null || window.remotion_publicFolderExists === null) {
			return;
		}

		const content = `${window.remotion_publicFolderExists}/${relativePath}`;
		copyText(content)
			.then(() => {
				showNotification(`Copied '${content}' to clipboard`, 1000);
			})
			.catch((err) => {
				showNotification(`Could not copy: ${err.message}`, 2000);
			});
	}, [relativePath]);

	const openAssetInConvert = useCallback(() => {
		if (relativePath === null) {
			return;
		}

		openInRemotionConvert({relativePath});
	}, [relativePath]);

	const openAssetInExplorer = useCallback(() => {
		if (relativePath === null || !window.remotion_publicFolderExists) {
			showNotification('Could not find the public folder', 2000);
			return;
		}

		openInFileExplorer({
			directory: window.remotion_publicFolderExists + '/' + relativePath,
		}).catch((err) => {
			showNotification(`Could not open file: ${err.message}`, 2000);
		});
	}, [relativePath]);

	const {mutationsDisabled, fileExplorerDisabled} = getAssetActionAvailability({
		browserStudioCanMutateAssets:
			getBrowserStudioOperations() === null ? null : true,
		readOnlyStudio,
		connectionStatus,
		publicFolderExists: window.remotion_publicFolderExists,
	});

	const deleteAsset = useDeleteAsset(relativePath);

	const renameAsset = useCallback(() => {
		if (relativePath === null) {
			return;
		}

		setSelectedModal({
			type: 'rename-static-file',
			relativePath,
		});
	}, [relativePath, setSelectedModal]);

	const getContextMenuItems = useCallback((): ComboboxValue[] => {
		if (relativePath === null) {
			return [];
		}

		return getAssetContextMenuItems({
			relativePath,
			fileManagerName,
			copyFileName,
			copyStaticFilePath,
			copyAbsolutePath:
				window.remotion_publicFolderExists === null ? null : copyAbsolutePath,
			openAssetInConvert,
			openAssetInExplorer,
			renameAsset,
			deleteAsset,
			fileExplorerAvailable: getBrowserStudioOperations() === null,
			fileExplorerDisabled,
			mutationsDisabled,
		});
	}, [
		copyFileName,
		copyStaticFilePath,
		copyAbsolutePath,
		deleteAsset,
		fileExplorerDisabled,
		fileManagerName,
		mutationsDisabled,
		openAssetInConvert,
		openAssetInExplorer,
		renameAsset,
		relativePath,
	]);

	return {fileExplorerDisabled, fileManagerName, getContextMenuItems};
};
