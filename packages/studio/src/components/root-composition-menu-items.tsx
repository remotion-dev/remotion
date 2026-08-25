import type {SetStateAction} from 'react';
import type {PreviewServerConnectionState} from '../helpers/preview-server-events';
import {Checkmark} from '../icons/Checkmark';
import type {CompositionSortOrder} from '../state/folders';
import type {ModalState} from '../state/modals';
import type {ComboboxValue} from './NewComposition/ComboBox';

export const getRootCompositionMenuItems = ({
	connectionStatus,
	readOnlyStudio,
	setSelectedModal,
	compositionSortOrder,
	setCompositionSortOrder,
}: {
	connectionStatus: PreviewServerConnectionState['type'];
	readOnlyStudio: boolean;
	setSelectedModal: (value: SetStateAction<ModalState | null>) => void;
	compositionSortOrder: CompositionSortOrder;
	setCompositionSortOrder: (sortOrder: CompositionSortOrder) => void;
}): ComboboxValue[] => {
	return [
		{
			id: 'new-root-composition',
			keyHint: null,
			label: 'New composition...',
			leftItem: null,
			onClick: () => {
				setSelectedModal({
					type: 'new-comp',
					folderName: null,
					parentName: null,
					stack: null,
					canvasCapture: null,
				});
			},
			quickSwitcherLabel: 'New composition...',
			subMenu: null,
			type: 'item',
			value: 'new-root-composition',
			disabled: readOnlyStudio || connectionStatus !== 'connected',
		},
		{
			id: 'new-root-folder',
			keyHint: null,
			label: 'New folder...',
			leftItem: null,
			onClick: () => {
				setSelectedModal({
					type: 'new-folder',
					parentName: null,
					stack: null,
				});
			},
			quickSwitcherLabel: 'New folder...',
			subMenu: null,
			type: 'item',
			value: 'new-root-folder',
			disabled: readOnlyStudio || connectionStatus !== 'connected',
		},
		{
			id: 'sort-compositions-divider',
			type: 'divider',
		},
		{
			id: 'sort-compositions',
			keyHint: null,
			label: 'Sort by',
			leftItem: null,
			onClick: () => undefined,
			quickSwitcherLabel: null,
			type: 'item',
			value: 'sort-compositions',
			subMenu: {
				leaveLeftSpace: true,
				preselectIndex: compositionSortOrder === 'alphabetical' ? 1 : 0,
				items: getCompositionSortOrderMenuItems({
					compositionSortOrder,
					setCompositionSortOrder,
					onSelected: () => undefined,
				}),
			},
		},
	];
};

export const getCompositionSortOrderMenuItems = ({
	compositionSortOrder,
	setCompositionSortOrder,
	onSelected,
}: {
	compositionSortOrder: CompositionSortOrder;
	setCompositionSortOrder: (sortOrder: CompositionSortOrder) => void;
	onSelected: () => void;
}): ComboboxValue[] => {
	return [
		{
			id: 'sort-compositions-registration',
			keyHint: null,
			label: 'Order in root file',
			leftItem: compositionSortOrder === 'registration' ? <Checkmark /> : null,
			onClick: () => {
				onSelected();
				setCompositionSortOrder('registration');
			},
			quickSwitcherLabel: 'Sort compositions by order in root file',
			subMenu: null,
			type: 'item',
			value: 'registration' as CompositionSortOrder,
		},
		{
			id: 'sort-compositions-alphabetical',
			keyHint: null,
			label: 'Name',
			leftItem: compositionSortOrder === 'alphabetical' ? <Checkmark /> : null,
			onClick: () => {
				onSelected();
				setCompositionSortOrder('alphabetical');
			},
			quickSwitcherLabel: 'Sort compositions by name',
			subMenu: null,
			type: 'item',
			value: 'alphabetical' as CompositionSortOrder,
		},
	];
};
