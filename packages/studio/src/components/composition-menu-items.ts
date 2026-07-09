import type {SetStateAction} from 'react';
import type {ResolvedStackLocation, _InternalTypes} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {formatFileLocation} from '../helpers/format-file-location';
import {
	openCompositionComponentInEditor,
	openOriginalPositionInEditor,
} from '../helpers/open-in-editor';
import type {PreviewServerConnectionState} from '../helpers/preview-server-events';
import type {ModalState} from '../state/modals';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';

export const getCompositionMenuItems = ({
	composition,
	connectionStatus,
	resolvedLocation,
	setSelectedModal,
	closeMenu,
	readOnlyStudio,
}: {
	composition: _InternalTypes['AnyComposition'] | null;
	connectionStatus: PreviewServerConnectionState['type'];
	resolvedLocation: ResolvedStackLocation | null;
	setSelectedModal: (value: SetStateAction<ModalState | null>) => void;
	closeMenu: () => void;
	readOnlyStudio: boolean;
}): ComboboxValue[] => {
	const editorName = window.remotion_editorName;
	const fileLocation = formatFileLocation({
		location: resolvedLocation,
		root: window.remotion_cwd,
	});
	const showInEditorDisabled =
		!composition || connectionStatus !== 'connected' || !resolvedLocation;
	const openComponentInEditorDisabled =
		showInEditorDisabled || !resolvedLocation?.source;
	const copyFileLocationDisabled = !composition || !fileLocation;

	return [
		editorName
			? {
					id: 'show-in-editor',
					keyHint: null,
					label: `Show composition in ${editorName}`,
					leftItem: null,
					onClick: async () => {
						closeMenu();
						if (!composition || !resolvedLocation) {
							return;
						}

						try {
							await openOriginalPositionInEditor(resolvedLocation);
						} catch (err) {
							showNotification((err as Error).message, 2000);
						}
					},
					quickSwitcherLabel: `Show composition in ${editorName}`,
					subMenu: null,
					type: 'item' as const,
					value: 'show-in-editor',
					disabled: showInEditorDisabled,
				}
			: null,
		{
			id: 'copy-file-location',
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
			quickSwitcherLabel: 'Copy composition file location',
			subMenu: null,
			type: 'item' as const,
			value: 'copy-file-location',
			disabled: copyFileLocationDisabled,
		},
		editorName
			? {
					id: 'open-component-in-editor',
					keyHint: null,
					label: `Show component in ${editorName}`,
					leftItem: null,
					onClick: async () => {
						closeMenu();
						if (!composition || !resolvedLocation?.source) {
							return;
						}

						try {
							await openCompositionComponentInEditor({
								compositionFile: resolvedLocation.source,
								compositionId: composition.id,
							});
						} catch (err) {
							showNotification((err as Error).message, 2000);
						}
					},
					quickSwitcherLabel: `Show composition component in ${editorName}`,
					subMenu: null,
					type: 'item' as const,
					value: 'open-component-in-editor',
					disabled: openComponentInEditorDisabled,
				}
			: null,
		editorName || fileLocation
			? {
					type: 'divider' as const,
					id: 'show-in-editor-divider',
				}
			: null,
		{
			id: 'new',
			keyHint: null,
			label: `New...`,
			leftItem: null,
			onClick: () => {
				closeMenu();
				setSelectedModal({
					type: 'new-comp',
					folderName: null,
					parentName: null,
					stack: null,
				});
			},
			quickSwitcherLabel: 'New composition...',
			subMenu: null,
			type: 'item' as const,
			value: 'new',
			disabled: readOnlyStudio,
		},
		{
			id: 'rename',
			keyHint: null,
			label: `Rename...`,
			leftItem: null,
			onClick: () => {
				if (!composition) {
					return;
				}

				closeMenu();
				setSelectedModal({
					type: 'rename-comp',
					compositionId: composition.id,
				});
			},
			quickSwitcherLabel: 'Rename composition...',
			subMenu: null,
			type: 'item' as const,
			value: 'rename',
			disabled: !composition || readOnlyStudio,
		},
		{
			id: 'duplicate',
			keyHint: null,
			label: `Duplicate...`,
			leftItem: null,
			onClick: () => {
				if (!composition) {
					return;
				}

				closeMenu();
				setSelectedModal({
					type: 'duplicate-comp',
					compositionId: composition.id,
					compositionType:
						composition.durationInFrames === 1 ? 'still' : 'composition',
				});
			},
			quickSwitcherLabel: 'Duplicate composition...',
			subMenu: null,
			type: 'item' as const,
			value: 'duplicate',
			disabled: !composition || readOnlyStudio,
		},
		{
			id: 'delete',
			keyHint: null,
			label: `Delete...`,
			leftItem: null,
			onClick: () => {
				if (!composition) {
					return;
				}

				closeMenu();
				setSelectedModal({
					type: 'delete-comp',
					compositionId: composition.id,
				});
			},
			quickSwitcherLabel: 'Delete composition...',
			subMenu: null,
			type: 'item' as const,
			value: 'delete',
			disabled: !composition || readOnlyStudio,
		},
		{
			type: 'divider' as const,
			id: 'copy-id-divider',
		},
		{
			id: 'copy-id',
			keyHint: null,
			label: `Copy ID`,
			leftItem: null,
			onClick: () => {
				if (!composition) {
					return;
				}

				closeMenu();
				navigator.clipboard
					.writeText(composition.id)
					.then(() => {
						showNotification('Copied to clipboard', 1000);
					})
					.catch((err) => {
						showNotification(
							`Could not copy to clipboard: ${err.message}`,
							1000,
						);
					});
			},
			quickSwitcherLabel: 'Copy composition ID',
			subMenu: null,
			type: 'item' as const,
			value: 'copy-id',
			disabled: !composition,
		},
	].filter(NoReactInternals.truthy);
};
