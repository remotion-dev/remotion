import type {SetStateAction} from 'react';
import type {ResolvedStackLocation, _InternalTypes} from 'remotion';
import {openOriginalPositionInEditor} from '../helpers/open-in-editor';
import type {ModalState} from '../state/modals';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';

const truthy = <T>(value: T | null): value is T => value !== null;

export const getCompositionMenuItems = ({
	composition,
	connectionStatus,
	resolvedLocation,
	setSelectedModal,
	closeMenu,
}: {
	composition: _InternalTypes['AnyComposition'] | null;
	connectionStatus: string;
	resolvedLocation: ResolvedStackLocation | null;
	setSelectedModal: (value: SetStateAction<ModalState | null>) => void;
	closeMenu: () => void;
}): ComboboxValue[] => {
	const editorName = window.remotion_editorName;

	return [
		editorName
			? {
					id: 'show-in-editor',
					keyHint: null,
					label: `Show in ${editorName}`,
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
					quickSwitcherLabel: null,
					subMenu: null,
					type: 'item' as const,
					value: 'show-in-editor',
					disabled:
						!composition ||
						connectionStatus !== 'connected' ||
						!resolvedLocation,
				}
			: null,
		editorName
			? {
					type: 'divider' as const,
					id: 'show-in-editor-divider',
				}
			: null,
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
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item' as const,
			value: 'rename',
			disabled: !composition,
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
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item' as const,
			value: 'duplicate',
			disabled: !composition,
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
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item' as const,
			value: 'delete',
			disabled: !composition,
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
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item' as const,
			value: 'copy-id',
			disabled: !composition,
		},
	].filter(truthy);
};
