import type {SetStateAction} from 'react';
import type {PreviewServerConnectionState} from '../helpers/preview-server-events';
import type {ModalState} from '../state/modals';
import type {ComboboxValue} from './NewComposition/ComboBox';

export const getRootCompositionMenuItems = ({
	connectionStatus,
	readOnlyStudio,
	setSelectedModal,
}: {
	connectionStatus: PreviewServerConnectionState['type'];
	readOnlyStudio: boolean;
	setSelectedModal: (value: SetStateAction<ModalState | null>) => void;
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
	];
};
