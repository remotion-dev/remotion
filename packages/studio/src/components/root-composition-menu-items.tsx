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
			id: 'sort-compositions-header',
			label: 'Sort',
			type: 'section-header',
		},
		{
			id: 'sort-compositions-registration',
			keyHint: null,
			label: 'As registered',
			leftItem: compositionSortOrder === 'registration' ? <Checkmark /> : null,
			onClick: () => {
				setCompositionSortOrder('registration');
			},
			quickSwitcherLabel: 'Sort compositions as registered',
			subMenu: null,
			type: 'item',
			value: 'registration' as CompositionSortOrder,
		},
		{
			id: 'sort-compositions-alphabetical',
			keyHint: null,
			label: 'Alphabetically',
			leftItem: compositionSortOrder === 'alphabetical' ? <Checkmark /> : null,
			onClick: () => {
				setCompositionSortOrder('alphabetical');
			},
			quickSwitcherLabel: 'Sort compositions alphabetically',
			subMenu: null,
			type: 'item',
			value: 'alphabetical' as CompositionSortOrder,
		},
	];
};
