import type {SetStateAction} from 'react';
import type {ResolvedStackLocation, _InternalTypes} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {formatFileLocation} from '../helpers/format-file-location';
import {getFolderId} from '../helpers/get-folder-id';
import {openOriginalPositionInEditor} from '../helpers/open-in-editor';
import type {PreviewServerConnectionState} from '../helpers/preview-server-events';
import type {ModalState} from '../state/modals';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';

export const getFolderMenuItems = ({
	closeMenu,
	connectionStatus,
	folder,
	readOnlyStudio,
	resolvedLocation,
	setSelectedModal,
}: {
	closeMenu: () => void;
	connectionStatus: PreviewServerConnectionState['type'];
	folder: _InternalTypes['TFolder'];
	readOnlyStudio: boolean;
	resolvedLocation: ResolvedStackLocation | null;
	setSelectedModal: (value: SetStateAction<ModalState | null>) => void;
}): ComboboxValue[] => {
	const editorName = window.remotion_editorName;
	const folderId = getFolderId({
		folderName: folder.name,
		parentName: folder.parent,
	});
	const fileLocation = formatFileLocation({
		location: resolvedLocation,
		root: window.remotion_cwd,
	});
	const showInEditorDisabled =
		connectionStatus !== 'connected' || !resolvedLocation;
	const copyFileLocationDisabled = !fileLocation;
	const codemodDisabled = readOnlyStudio || !folder.stack;

	return [
		editorName
			? {
					id: 'show-folder-in-editor',
					keyHint: null,
					label: `Show folder in ${editorName}`,
					leftItem: null,
					onClick: async () => {
						closeMenu();
						if (!resolvedLocation) {
							return;
						}

						try {
							await openOriginalPositionInEditor(resolvedLocation);
						} catch (err) {
							showNotification((err as Error).message, 2000);
						}
					},
					quickSwitcherLabel: `Show folder in ${editorName}`,
					subMenu: null,
					type: 'item' as const,
					value: 'show-folder-in-editor',
					disabled: showInEditorDisabled,
				}
			: null,
		{
			id: 'copy-folder-file-location',
			keyHint: null,
			label: `Copy file location`,
			leftItem: null,
			onClick: () => {
				closeMenu();
				if (!fileLocation) {
					return;
				}

				navigator.clipboard
					.writeText(fileLocation)
					.then(() => {
						showNotification('Copied file location to clipboard', 1000);
					})
					.catch((err) => {
						showNotification(
							`Could not copy to clipboard: ${(err as Error).message}`,
							1000,
						);
					});
			},
			quickSwitcherLabel: 'Copy folder file location',
			subMenu: null,
			type: 'item' as const,
			value: 'copy-folder-file-location',
			disabled: copyFileLocationDisabled,
		},
		editorName || fileLocation
			? {
					type: 'divider' as const,
					id: 'show-folder-in-editor-divider',
				}
			: null,
		{
			id: 'new-composition-in-folder',
			keyHint: null,
			label: `New composition...`,
			leftItem: null,
			onClick: () => {
				closeMenu();
				setSelectedModal({
					type: 'new-comp',
					folderName: folder.name,
					parentName: folder.parent,
					stack: folder.stack,
				});
			},
			quickSwitcherLabel: 'New composition in folder...',
			subMenu: null,
			type: 'item' as const,
			value: 'new-composition-in-folder',
			disabled: codemodDisabled,
		},
		{
			id: 'rename-folder',
			keyHint: null,
			label: `Rename...`,
			leftItem: null,
			onClick: () => {
				closeMenu();
				setSelectedModal({
					type: 'rename-folder',
					folderName: folder.name,
					parentName: folder.parent,
					stack: folder.stack,
				});
			},
			quickSwitcherLabel: 'Rename folder...',
			subMenu: null,
			type: 'item' as const,
			value: 'rename-folder',
			disabled: codemodDisabled,
		},
		{
			id: 'delete-folder',
			keyHint: null,
			label: `Delete...`,
			leftItem: null,
			onClick: () => {
				closeMenu();
				setSelectedModal({
					type: 'delete-folder',
					folderName: folder.name,
					parentName: folder.parent,
					stack: folder.stack,
				});
			},
			quickSwitcherLabel: 'Delete folder...',
			subMenu: null,
			type: 'item' as const,
			value: 'delete-folder',
			disabled: codemodDisabled,
		},
		{
			type: 'divider' as const,
			id: 'copy-folder-id-divider',
		},
		{
			id: 'copy-folder-id',
			keyHint: null,
			label: `Copy ID`,
			leftItem: null,
			onClick: () => {
				closeMenu();
				navigator.clipboard
					.writeText(folderId)
					.then(() => {
						showNotification('Copied to clipboard', 1000);
					})
					.catch((err) => {
						showNotification(
							`Could not copy to clipboard: ${(err as Error).message}`,
							1000,
						);
					});
			},
			quickSwitcherLabel: 'Copy folder ID',
			subMenu: null,
			type: 'item' as const,
			value: 'copy-folder-id',
			disabled: false,
		},
	].filter(NoReactInternals.truthy);
};
